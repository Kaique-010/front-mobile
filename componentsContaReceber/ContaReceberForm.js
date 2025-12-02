import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useNavigation } from '@react-navigation/native'
import { Picker } from '@react-native-picker/picker'
import useContextoApp from '../hooks/useContextoApp'
import BuscaClienteInput from '../components/BuscaClienteInput'
import { apiPutComContexto, request } from '../utils/api'
import Toast from 'react-native-toast-message'

export default function ContaReceberForm({ route }) {
  const { empresaId, filialId } = useContextoApp()
  const navigation = useNavigation()
  const [showPicker, setShowPicker] = useState({ tipo: null })
  const [isLoading, setIsLoading] = useState(false)
  const [modoEdicao, setModoEdicao] = useState(false)

  const [conta, setConta] = useState({
    titu_empr: empresaId,
    titu_fili: filialId,
    titu_clie: '',
    titu_titu: '',
    titu_valo: 0,
    titu_parc: 0,
    titu_emis: new Date(),
    titu_venc: new Date(),
    titu_seri: 0,
    titu_hist: '',
    titu_form_reci: '54',
  })

  useEffect(() => {
    if (route?.params?.contaExistente) {
      const contaEdit = route.params.contaExistente
      setConta({
        ...contaEdit,
        titu_emis: contaEdit.titu_emis
          ? new Date(contaEdit.titu_emis)
          : new Date(),
        titu_venc: contaEdit.titu_venc
          ? new Date(contaEdit.titu_venc)
          : new Date(),
      })
      setModoEdicao(true)
    }
  }, [route])

  useEffect(() => {
    if (empresaId && filialId) {
      setConta((prev) => ({
        ...prev,
        titu_empr: empresaId,
        titu_fili: filialId,
      }))
    }
  }, [empresaId, filialId])

  const FORMAS_RECEBIMENTO = [
    { codigo: '00', descricao: 'DUPLICATA' },
    { codigo: '01', descricao: 'CHEQUE' },
    { codigo: '02', descricao: 'PROMISSÓRIA' },
    { codigo: '03', descricao: 'RECIBO' },
    { codigo: '50', descricao: 'CHEQUE PRÉ' },
    { codigo: '51', descricao: 'CARTÃO DE CRÉDITO' },
    { codigo: '52', descricao: 'CARTÃO DE DÉBITO' },
    { codigo: '53', descricao: 'BOLETO BANCÁRIO' },
    { codigo: '54', descricao: 'DINHEIRO' },
    { codigo: '55', descricao: 'DEPÓSITO EM CONTA' },
    { codigo: '56', descricao: 'VENDA À VISTA' },
    { codigo: '60', descricao: 'PIX' },
  ]

  const handleSelectCliente = (cliente) => {
    setConta((prev) => ({
      ...prev,
      titu_clie: cliente.enti_clie,
    }))
  }

  const formatarData = (data) => {
    if (!data) return null
    const ano = data.getFullYear()
    const mes = String(data.getMonth() + 1).padStart(2, '0')
    const dia = String(data.getDate()).padStart(2, '0')
    return `${ano}-${mes}-${dia}`
  }

  const salvarConta = async () => {
    setIsLoading(true)
    try {
      if (!conta.titu_titu || conta.titu_titu.trim() === '') {
        Toast.show({ type: 'error', text1: 'Informe o número do título!' })
        return
      }

      const dadosFormatados = {
        ...conta,
        titu_empr: empresaId,
        titu_fili: filialId,
        titu_emis: formatarData(conta.titu_emis),
        titu_venc: formatarData(conta.titu_venc),
      }

      if (modoEdicao) {
        const url = `contas_a_receber/titulos-receber/${conta.titu_empr}/${conta.titu_fili}/${conta.titu_clie}/${conta.titu_titu}/${conta.titu_seri}/${conta.titu_parc}/`
        await apiPutComContexto(url, dadosFormatados)
        Toast.show({ type: 'success', text1: 'Conta atualizada com sucesso!' })
        navigation.goBack()
      } else {
        await request({
          method: 'post',
          endpoint: 'contas_a_receber/titulos-receber/',
          data: dadosFormatados,
          params: { empresa_id: empresaId, filial_id: filialId },
        })
        Toast.show({ type: 'success', text1: 'Conta criada com sucesso!' })
        navigation.goBack()
      }
    } catch (error) {
      console.error(error)
      Toast.show({ type: 'error', text1: 'Erro ao salvar conta!' })
    } finally {
      setIsLoading(false)
    }
  }

  const renderDatePicker = () => {
    if (!showPicker.tipo) return null
    return (
      <DateTimePicker
        value={conta[showPicker.tipo] || new Date()}
        mode="date"
        display="default"
        onChange={(event, selectedDate) => {
          setShowPicker({ tipo: null })
          if (selectedDate) {
            setConta({ ...conta, [showPicker.tipo]: selectedDate })
          }
        }}
      />
    )
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#121212' }}>
      <View style={styles.container}>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Emissão:</Text>
            <TouchableOpacity
              onPress={() => setShowPicker({ tipo: 'titu_emis' })}>
              <Text style={styles.input}>
                {conta.titu_emis?.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Vencimento:</Text>
            <TouchableOpacity
              onPress={() => setShowPicker({ tipo: 'titu_venc' })}>
              <Text style={styles.input}>
                {conta.titu_venc?.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.label}>Cliente:</Text>
        <BuscaClienteInput
          placeholder="Buscar cliente"
          value={conta.titu_clie}
          onSelect={handleSelectCliente}
        />

        <Text style={styles.label}>Título:</Text>
        <TextInput
          style={styles.input}
          value={conta.titu_titu}
          onChangeText={(text) => setConta({ ...conta, titu_titu: text })}
        />

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Série:</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={conta.titu_seri.toString()}
              onChangeText={(text) =>
                setConta({ ...conta, titu_seri: parseInt(text) || 0 })
              }
            />
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Parcela:</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={conta.titu_parc.toString()}
              onChangeText={(text) =>
                setConta({ ...conta, titu_parc: parseInt(text) || 0 })
              }
            />
          </View>
        </View>

        <View style={styles.roww}>
          <View style={styles.coll}>
            <Text style={styles.label}>Valor:</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={conta.titu_valo.toString()}
              onChangeText={(text) =>
                setConta({ ...conta, titu_valo: parseFloat(text) || 0 })
              }
            />
          </View>
          <View style={styles.coll}>
            <Text style={styles.label}>Forma a ser Recebido:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={conta.titu_form_reci}
                onValueChange={(value) =>
                  setConta({ ...conta, titu_form_reci: value })
                }
                style={styles.picker}
                dropdownIconColor="#000">
                {FORMAS_RECEBIMENTO.map((forma) => (
                  <Picker.Item
                    key={forma.codigo}
                    label={forma.descricao}
                    value={forma.codigo}
                    style={styles.pickerItem}
                  />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        <Text style={styles.label}>Histórico:</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          multiline
          value={conta.titu_hist}
          onChangeText={(text) => setConta({ ...conta, titu_hist: text })}
        />

        <TouchableOpacity onPress={salvarConta} style={styles.button}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Salvar</Text>
          )}
        </TouchableOpacity>

        {renderDatePicker()}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#1a2f3d',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    marginTop: 25,
  },
  col: {
    flex: 1,
    marginRight: 8,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
    backgroundColor: '#283541',
    color: '#fff',
  },
  button: {
    backgroundColor: '#114b86',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 35,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#283541',
  },
  picker: {
    color: '#fff',
  },
})
