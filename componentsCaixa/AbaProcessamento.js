import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { Picker } from '@react-native-picker/picker'
import { TextInput } from 'react-native-paper'
import Toast from 'react-native-toast-message'
import { apiPostComContexto } from '../utils/api'

import useContextApp from '../hooks/useContextoApp'

const FORMAS_RECEBIMENTO = [
  { codigo: '51', descricao: 'CARTÃO DE CRÉDITO' },
  { codigo: '52', descricao: 'CARTÃO DE DÉBITO' },
  { codigo: '54', descricao: 'DINHEIRO' },
  { codigo: '60', descricao: 'PIX' },
]

export default function AbaProcessamento({ venda, onFinalizarVenda }) {
  const [loading, setLoading] = useState(false)
  const [formaPagamento, setFormaPagamento] = useState('54')
  const [valorPago, setValorPago] = useState('')
  const [parcelas, setParcelas] = useState('1')
  const [troco, setTroco] = useState('0.00')
  const { empresaId, filialId } = useContextApp()

  useEffect(() => {
    const calcularTroco = () => {
      const valorPagoFloat = parseFloat(valorPago)
      const troco = valorPagoFloat - parseFloat(venda.total)
      setTroco(troco.toFixed(2))
    }

    if (valorPago) {
      calcularTroco()
    }
  })

  const processarPagamento = async () => {
    if (!valorPago || parseFloat(valorPago) < parseFloat(venda.total)) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Valor pago deve ser maior ou igual ao total da venda',
      })
      return
    }

    try {
      setLoading(true)
      await apiPostComContexto('caixadiario/movicaixa/processar_pagamento/', {
        numero_venda: venda.movi_nume_vend,
        movi_empr: empresaId,
        movi_fili: filialId,
        valor: venda.total,
        valor_pago: parseFloat(valorPago),
        forma_pagamento: formaPagamento,
        parcelas: parseInt(parcelas),
      })

      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Venda finalizada com sucesso',
      })

      onFinalizarVenda()
    } catch (error) {
      let mensagemErro = 'Erro ao finalizar venda'
      if (error.response?.data?.detail?.includes('Licença')) {
        mensagemErro = 'Erro de licença. Por favor, verifique suas credenciais.'
      } else if (error.response?.data?.detail) {
        mensagemErro = error.response.data.detail
      }

      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: mensagemErro,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.totalContainer}>
        <Text style={styles.label}>Total da Venda:</Text>
        <Text style={styles.totalValue}>
          R$ {venda?.total ? venda.total.toFixed(2) : '0,00'}
        </Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Forma de Pagamento:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formaPagamento}
            onValueChange={setFormaPagamento}
            style={styles.picker}
            dropdownIconColor="#fff">
            {FORMAS_RECEBIMENTO.map((forma) => (
              <Picker.Item
                key={forma.codigo}
                label={forma.descricao}
                value={forma.codigo}
              />
            ))}
          </Picker>
        </View>

        {formaPagamento === '51' && (
          <TextInput
            label="Número de Parcelas"
            value={parcelas}
            onChangeText={setParcelas}
            keyboardType="numeric"
            style={styles.input}
          />
        )}

        <TextInput
          label="Valor Pago"
          value={valorPago}
          onChangeText={setValorPago}
          keyboardType="numeric"
          style={styles.input}
        />

        {parseFloat(troco) > 0 && (
          <View style={styles.trocoContainer}>
            <Text style={styles.label}>Troco:</Text>
            <Text style={styles.trocoValue}>R$ {troco}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={processarPagamento}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Finalizar Venda</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  totalContainer: {
    backgroundColor: '#1a2f3d',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  formContainer: {
    backgroundColor: '#1a2f3d',
    padding: 20,
    borderRadius: 8,
  },
  pickerContainer: {
    backgroundColor: '#232935',
    borderRadius: 8,
    marginBottom: 15,
  },
  picker: {
    color: '#fff',
    height: 50,
  },
  input: {
    backgroundColor: '#232935',
    marginBottom: 15,
  },
  label: {
    color: '#999',
    fontSize: 16,
    marginBottom: 8,
  },
  totalValue: {
    color: '#10a2a7',
    fontSize: 24,
    fontWeight: 'bold',
  },
  trocoContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#232935',
    borderRadius: 8,
  },
  trocoValue: {
    color: '#4CAF50',
    fontSize: 20,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#10a2a7',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
})
