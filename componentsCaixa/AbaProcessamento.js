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

const TIPO_MOVIMENTO = {
  1: 'DINHEIRO',
  2: 'CHEQUE',
  3: 'CARTÃO DE CRÉDITO',
  4: 'CARTÃO DE DÉBITO',
  5: 'CREDIÁRIO',
  6: 'PIX',
}

export default function AbaProcessamento({ venda, onFinalizarVenda }) {
  const [loading, setLoading] = useState(false)
  const [formaPagamento, setFormaPagamento] = useState('54')
  const [movi_tipo, setmovi_tipo] = useState('1')
  const [valorPago, setValorPago] = useState('')
  const [parcelas, setParcelas] = useState('1')
  const [troco, setTroco] = useState('0.00')
  const [pagamentoProcessado, setPagamentoProcessado] = useState(false)
  const { empresaId, filialId, usuarioId } = useContextApp()

  useEffect(() => {
    console.log('🔍 DEBUG AbaProcessamento:', {
      venda: venda,
      total: venda?.total,
      typeof_total: typeof venda?.total,
      valorPago,
      formaPagamento,
      movi_tipo,
      movi_tipo_descricao: TIPO_MOVIMENTO[movi_tipo],
      operador: usuarioId,
    })

    if (
      venda?.movi_nume_vend !== undefined &&
      pagamentoProcessado &&
      venda?.total === 0
    ) {
      setPagamentoProcessado(false)
      setValorPago('')
    }
  }, [
    venda?.total,
    valorPago,
    formaPagamento,
    venda?.movi_nume_vend,
    pagamentoProcessado,
  ])

  useEffect(() => {
    const calcularTroco = () => {
      const valorPagoFloat = parseFloat(valorPago)
      const troco = valorPagoFloat - parseFloat(venda.total)
      setTroco(troco.toFixed(2))
    }

    if (valorPago) {
      calcularTroco()
    }
  }, [valorPago, venda?.total])

  // Adicionar useEffect para sincronizar forma de pagamento com tipo de movimento
  useEffect(() => {
    // Mapear forma de pagamento para tipo de movimento (igual ao backend)
    const mapearFormaPagamento = {
      51: '3', // CARTÃO DE CRÉDITO
      52: '4', // CARTÃO DE DÉBITO
      54: '1', // DINHEIRO
      60: '6', // PIX
    }

    setmovi_tipo(mapearFormaPagamento[formaPagamento] || '1')
  }, [formaPagamento])

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
      const response = await apiPostComContexto(
        'caixadiario/movicaixa/processar_pagamento/',
        {
          numero_venda: venda.movi_nume_vend,
          movi_empr: empresaId,
          movi_fili: filialId,
          movi_oper: usuarioId || venda?.movi_oper || '1', // Usar usuarioId
          valor: venda.total,
          cliente: venda.movi_clie,
          vendedor: venda.movi_vend,
          valor_total: venda.total,
          valor_pago: parseFloat(valorPago),
          forma_pagamento: formaPagamento, // Códigos 51,52,54,60
          parcelas: parseInt(parcelas),
          movi_tipo: movi_tipo, // Códigos 1-6 (string)
          operador: usuarioId,
        }
      )

      console.log('🎉 DEBUG Pagamento processado com sucesso:', response)

      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Pagamento processado com sucesso',
      })

      setPagamentoProcessado(true)
      console.log('💰 Pagamento processado - aguardando finalização manual')
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

  const finalizarVenda = async () => {
    console.log('🏁 Finalizando venda manualmente')

    const dadosVenda = {
      empr: venda?.movi_empr,
      fili: venda?.movi_fili,
      usua: usuarioId || venda?.movi_oper || '1', // Usar usuarioId
      numero_venda: venda?.movi_nume_vend,
      cliente: venda?.movi_clie,
      vendedor: venda?.movi_vend,
      valor_total: venda?.total,
      valor_pago: parseFloat(valorPago),
      forma_pagamento: formaPagamento,
      parcelas: parseInt(parcelas),
      movi_tipo: movi_tipo,
      operador: usuarioId,
    }

    console.log('📋 Dados da venda para finalização:', dadosVenda)

    try {
      setLoading(true)
      const response = await apiPostComContexto(
        'caixadiario/movicaixa/finalizar_venda/',
        dadosVenda
      )

      console.log('✅ Venda finalizada com sucesso:', response)

      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Venda finalizada com sucesso',
      })

      // Agora sim limpar os dados
      onFinalizarVenda()
    } catch (error) {
      console.log('❌ Erro ao finalizar venda:', error)

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

        {!pagamentoProcessado ? (
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={processarPagamento}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Processar Pagamento</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.buttonSuccess]}
            onPress={finalizarVenda}>
            <Text style={styles.buttonText}>Finalizar Venda</Text>
          </TouchableOpacity>
        )}
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
  buttonSuccess: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
})
