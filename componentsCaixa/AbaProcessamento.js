import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { Picker } from '@react-native-picker/picker'
import { TextInput } from 'react-native-paper'
import Toast from 'react-native-toast-message'
import { apiPostComContexto } from '../utils/api'

const FORMAS_RECEBIMENTO = [
  { codigo: '51', descricao: 'CARTÃO DE CRÉDITO' },
  { codigo: '52', descricao: 'CARTÃO DE DÉBITO' },
  { codigo: '54', descricao: 'DINHEIRO' },
  { codigo: '60', descricao: 'PIX' },
]

export default function AbaProcessamento({ venda, onFinalizarVenda }) {
  const [loading, setLoading] = useState(false)
  const [formaPagamento, setFormaPagamento] = useState('54') // Dinheiro como padrão
  const [valorPago, setValorPago] = useState('')
  const [parcelas, setParcelas] = useState('1')

  const processarPagamento = async () => {
    if (!valorPago || parseFloat(valorPago) < parseFloat(venda.total)) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Valor pago deve ser maior ou igual ao total da venda'
      })
      return
    }

    try {
      setLoading(true)
      await apiPostComContexto('caixa/movicaixa/finalizar_venda/', {
        movi_nume_vend: venda.movi_nume_vend,
        movi_empr: venda.movi_empr,
        movi_fili: venda.movi_fili,
        valor_total: venda.total,
        valor_pago: parseFloat(valorPago),
        forma_pagamento: formaPagamento,
        parcelas: parseInt(parcelas)
      })

      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Venda finalizada com sucesso'
      })

      onFinalizarVenda()
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: error.response?.data?.detail || 'Erro ao finalizar venda'
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
