import React, { useState } from 'react'
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native'
import { Picker } from '@react-native-picker/picker'
import { apiPostComContexto } from '../utils/api'
import Toast from 'react-native-toast-message'

const iniciarPagamentoNaMaquininha = async ({ valor, tipo, parcelas }) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const sucesso = Math.random() > 0.2 // 80% de chance de sucesso
      if (sucesso) {
        resolve({
          status: 'aprovado',
          mensagem: 'Pagamento aprovado!',
          autorizacao: 'XYZ123456', // código fake
        })
      } else {
        resolve({
          status: 'recusado',
          mensagem: 'Cartão recusado pela operadora.',
        })
      }
    }, 2000) // simula tempo de resposta da maquininha
  })
}

export default function RecebimentoModal({
  visivel,
  onFechar,
  pedido,
  totalPedido,
}) {
  const [form, setForm] = useState({
    tipo: 'pix',
    valor: totalPedido?.toString() || '',
    parcelas: '1',
  })
  const [processando, setProcessando] = useState(false)

  const tiposRecebimento = [
    { label: 'PIX', value: 'pix' },
    { label: 'Cartão de Débito', value: 'debito' },
    { label: 'Cartão de Crédito', value: 'credito' },
  ]

  const processarRecebimento = async () => {
    if (!form.valor || parseFloat(form.valor) <= 0) {
      Alert.alert('Erro', 'Valor deve ser maior que zero')
      return
    }

    if (
      form.tipo === 'credito' &&
      (!form.parcelas || parseInt(form.parcelas) < 1)
    ) {
      Alert.alert('Erro', 'Número de parcelas deve ser maior que zero')
      return
    }

    if (!pedido.pedi_nume) {
      Alert.alert(
        'Erro',
        'Pedido deve ser salvo antes de processar o recebimento'
      )
      return
    }

    setProcessando(true)

    try {
      if (form.tipo === 'credito' || form.tipo === 'debito') {
        const resultado = await iniciarPagamentoNaMaquininha({
          valor: form.valor,
          tipo: form.tipo,
          parcelas: form.parcelas,
        })

        if (resultado.status !== 'aprovado') {
          Alert.alert('Erro', resultado.mensagem || 'Transação não aprovada')
          setProcessando(false)
          return
        }
      }

      const dadosRecebimento = {
        sdk_empr: pedido.pedi_empr,
        sdk_fili: pedido.pedi_fili,
        sdk_pedi: pedido.pedi_nume,
        sdk_tipo: form.tipo,
        sdk_valo: parseFloat(form.valor),
        sdk_parc: form.tipo === 'credito' ? parseInt(form.parcelas) : 1,
        sdk_stat: 'pendente',
      }

      await apiPostComContexto('Sdk_recebimentos/registrar/', dadosRecebimento)

      Toast.show({
        type: 'success',
        text1: 'Recebimento processado!',
        text2: `${form.tipo.toUpperCase()} - R$ ${parseFloat(
          form.valor
        ).toFixed(2)}`,
        position: 'bottom',
        visibilityTime: 3000,
      })

      onFechar()
    } catch (error) {
      console.error('Erro ao processar recebimento:', error)
      Alert.alert('Erro', 'Falha ao processar o recebimento')
    } finally {
      setProcessando(false)
    }
  }

  return (
    <Modal visible={visivel} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.titulo}>Processar Recebimento</Text>

          <Text style={styles.totalPedido}>
            Total do Pedido: R$ {(totalPedido || 0).toFixed(2)}
          </Text>

          <Text style={styles.label}>Tipo de Recebimento:</Text>
          <Picker
            selectedValue={form.tipo}
            onValueChange={(value) =>
              setForm((prev) => ({ ...prev, tipo: value }))
            }
            style={styles.picker}>
            {tiposRecebimento.map((tipo) => (
              <Picker.Item
                key={tipo.value}
                label={tipo.label}
                value={tipo.value}
              />
            ))}
          </Picker>

          <Text style={styles.label}>Valor:</Text>
          <TextInput
            style={styles.input}
            value={form.valor}
            onChangeText={(value) =>
              setForm((prev) => ({ ...prev, valor: value }))
            }
            keyboardType="numeric"
            placeholder="0.00"
            placeholderTextColor="#999"
          />

          {form.tipo === 'credito' && (
            <>
              <Text style={styles.label}>Número de Parcelas:</Text>
              <TextInput
                style={styles.input}
                value={form.parcelas}
                onChangeText={(value) =>
                  setForm((prev) => ({ ...prev, parcelas: value }))
                }
                keyboardType="numeric"
                placeholder="1"
                placeholderTextColor="#999"
              />
              <Text style={styles.infoParcelamento}>
                Valor por parcela: R${' '}
                {(
                  parseFloat(form.valor || 0) / parseInt(form.parcelas || 1)
                ).toFixed(2)}
              </Text>
            </>
          )}

          <View style={styles.botoesContainer}>
            <TouchableOpacity
              style={[styles.botao, styles.botaoCancelar]}
              onPress={onFechar}
              disabled={processando}>
              <Text style={styles.textoBotao}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.botao,
                styles.botaoProcessar,
                processando && { opacity: 0.5 },
              ]}
              onPress={processarRecebimento}
              disabled={processando}>
              <Text style={styles.textoBotao}>
                {processando ? 'Processando...' : 'Processar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#1a2f3d',
    margin: 20,
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  titulo: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  totalPedido: {
    color: '#58D58D',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    color: 'white',
    fontSize: 16,
    marginTop: 15,
    marginBottom: 5,
  },
  picker: {
    backgroundColor: '#232935',
    color: 'white',
    borderRadius: 8,
  },
  input: {
    backgroundColor: '#232935',
    color: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  infoParcelamento: {
    color: '#ccc',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
  botoesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  botao: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  botaoCancelar: {
    backgroundColor: '#a80909',
    marginRight: 10,
  },
  botaoProcessar: {
    backgroundColor: '#109ea3',
    marginLeft: 10,
  },
  textoBotao: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
})
