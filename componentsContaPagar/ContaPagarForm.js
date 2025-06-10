import React, { useState } from 'react'
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
import { Picker } from '@react-native-picker/picker'
import useContextoApp from '../hooks/useContextoApp'
import BuscaClienteInput from '../components/BuscaClienteInput'
import { apiPutComContexto } from '../utils/api'
import Toast from 'react-native-toast-message'

export default function ContaPagarForm() {
  const { empresaId, FilialId } = useContextoApp()
  const [showPicker, setShowPicker] = useState({ tipo: null })
  const [isLoading, setIsLoading] = useState(false)

  const [conta, setConta] = useState({
    titu_empr: empresaId,
    titu_fili: FilialId,
    titu_forn: '',
    titu_titu: '',
    titu_valo: 0,
    titu_parc: 0,
    titu_emis: new Date(),
    titu_venc: new Date(),
    titu_paga: new Date(),
    titu_seri: 0,
    titu_hist: '',
    titu_form_paga: '54',
  })

  const FORMAS_PAGAMENTO = [
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

  const salvarConta = async () => {
    setIsLoading(true)
    try {
      if (conta.titu_titu) {
        await apiPutComContexto(
          `contas_a_pagar/titulos-pagar/${conta.titu_titu}/`,
          conta,
          'PUT'
        )
        Toast.show({
          type: 'success',
          text1: 'Conta atualizada com sucesso!',
        })
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao salvar a conta!',
      })
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
        <Text style={styles.label}>Fornecedor:</Text>
        <BuscaClienteInput
          placeholder="Buscar fornecedor"
          value={conta.titu_forn}
          onChangeText={(text) => setConta({ ...conta, titu_forn: text })}
        />

        <Text style={styles.label}>Título:</Text>
        <TextInput
          style={styles.input}
          value={conta.titu_titu}
          onChangeText={(text) => setConta({ ...conta, titu_titu: text })}
        />

        <Text style={styles.label}>Série:</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={conta.titu_seri.toString()}
          onChangeText={(text) =>
            setConta({ ...conta, titu_seri: parseInt(text) || 0 })
          }
        />

        <Text style={styles.label}>Valor:</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={conta.titu_valo.toString()}
          onChangeText={(text) =>
            setConta({ ...conta, titu_valo: parseFloat(text) || 0 })
          }
        />

        <Text style={styles.label}>Emissão:</Text>
        <TouchableOpacity onPress={() => setShowPicker({ tipo: 'titu_emis' })}>
          <Text style={styles.input}>
            {conta.titu_emis?.toLocaleDateString()}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Vencimento:</Text>
        <TouchableOpacity onPress={() => setShowPicker({ tipo: 'titu_venc' })}>
          <Text style={styles.input}>
            {conta.titu_venc?.toLocaleDateString()}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Pagamento:</Text>
        <TouchableOpacity onPress={() => setShowPicker({ tipo: 'titu_paga' })}>
          <Text style={styles.input}>
            {conta.titu_paga?.toLocaleDateString()}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Parcela:</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={conta.titu_parc.toString()}
          onChangeText={(text) =>
            setConta({ ...conta, titu_parc: parseInt(text) || 0 })
          }
        />

        <Text style={styles.label}>Histórico:</Text>
        <TextInput
          style={styles.input}
          multiline
          value={conta.titu_hist}
          onChangeText={(text) => setConta({ ...conta, titu_hist: text })}
        />
        <View style={styles.formContainer}>
          <Text style={styles.pickerLabel}>Forma de Pagamento</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={conta.titu_form_paga}
              onValueChange={(value) =>
                setConta({ ...conta, titu_form_paga: value })
              }
              style={styles.picker}
              dropdownIconColor="#fff">
              {FORMAS_PAGAMENTO.map((forma) => (
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
    flex: 1,
    padding: 16,
    backgroundColor: '#1a2f3d',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
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
  },
  button: {
    backgroundColor: '#007bff',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  picker: {
    color: '#000',
  },
  pickerLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 4,
  },
})
