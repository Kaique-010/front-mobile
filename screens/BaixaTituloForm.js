import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Platform } from 'react-native'
import { apiPostComContexto } from '../utils/api'
import styles from '../styles/formBaixaStyles'

const formatarMoeda = (valor) => {
  if (!valor) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

const formatarDataParaInput = (data = new Date()) => {
  return data.toISOString().split('T')[0]
}

export default function BaixaTituloForm({ route, navigation }) {
  const { titulo, tipo } = route.params
  // Usar a parcela diretamente do título
  const titu_parc = titulo.titu_parc
  
  const [loading, setLoading] = useState(false)

  // Estados do formulário
  const [dataPagamento, setDataPagamento] = useState(formatarDataParaInput())

  const [valorPago, setValorPago] = useState(
    titulo.titu_valo?.toString() || '0'
  )
  const [valorJuros, setValorJuros] = useState('0')
  const [valorMulta, setValorMulta] = useState('0')
  const [valorDesconto, setValorDesconto] = useState('0')
  const [historico, setHistorico] = useState('')
  const [banco, setBanco] = useState('')
  const [cheque, setCheque] = useState('')
  const [tipoBaixa, setTipoBaixa] = useState('T')
  const [showDatePicker, setShowDatePicker] = useState(false)

  // Cálculos automáticos
  const valorTotalCalculado = () => {
    const pago = parseFloat(valorPago) || 0
    const juros = parseFloat(valorJuros) || 0
    const multa = parseFloat(valorMulta) || 0
    const desconto = parseFloat(valorDesconto) || 0
    return pago + juros + multa - desconto
  }

  const calcularJurosAutomatico = () => {
    // Implementar cálculo baseado na data de vencimento
    const hoje = new Date()
    const vencimento = new Date(titulo.titu_venc)
    const diasAtraso = Math.max(
      0,
      Math.floor((hoje - vencimento) / (1000 * 60 * 60 * 24))
    )

    if (diasAtraso > 0) {
      const valorTitulo = parseFloat(titulo.titu_valo) || 0
      const jurosDiarios = 0.033 // 1% ao mês = 0.033% ao dia
      const jurosCalculado = (valorTitulo * jurosDiarios * diasAtraso) / 100
      setValorJuros(jurosCalculado.toFixed(2))
    }
  }

  useEffect(() => {
    calcularJurosAutomatico()
  }, [])

  const handleBaixarTitulo = async () => {
    if (!dataPagamento || !valorPago) {
      Alert.alert('Erro', 'Preencha os campos obrigatórios')
      return
    }

    // Adicionar verificação dos parâmetros necessários
    if (!titulo.titu_emis || !titulo.titu_venc || !titulo.titu_parc) {
      Alert.alert('Erro', 'Dados do título incompletos')
      return
    }

    setLoading(true)

    try {
      const formatDate = (date) => {
        if (!date) return ''
        const d = new Date(date)
        return d.toISOString().split('T')[0]
      }
      const endpoint =
        tipo === 'pagar'
          ? `contas_a_pagar/titulos-pagar/${titulo.titu_empr}/${titulo.titu_fili}/${titulo.titu_forn}/${titulo.titu_titu}/${titulo.titu_seri}/${titulo.titu_parc}/${formatDate(titulo.titu_emis)}/${formatDate(titulo.titu_venc)}/baixar/`
          : `contas_a_receber/titulos-receber/${titulo.titu_empr}/${titulo.titu_fili}/${titulo.titu_clie}/${titulo.titu_titu}/${titulo.titu_seri}/${titulo.titu_parc}/${formatDate(titulo.titu_emis)}/${formatDate(titulo.titu_venc)}/baixar/`

      const payload = {
        [tipo === 'pagar' ? 'data_pagamento' : 'data_recebimento']:
          dataPagamento,
        [tipo === 'pagar' ? 'valor_pago' : 'valor_recebido']:
          parseFloat(valorPago),
        valor_juros: parseFloat(valorJuros) || 0,
        valor_multa: parseFloat(valorMulta) || 0,
        valor_desconto: parseFloat(valorDesconto) || 0,
        historico: historico || `Baixa do título ${titulo.titu_titu}`,
        banco: banco ? parseInt(banco) : null,
        cheque: cheque ? parseInt(cheque) : null,
        tipo_baixa: tipoBaixa,
      }

      const response = await apiPostComContexto(endpoint, payload)

      Alert.alert(
        'Sucesso',
        `Título ${
          tipo === 'pagar' ? 'pago' : 'recebido'
        } com sucesso!\nValor: ${formatarMoeda(valorTotalCalculado())}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      )
    } catch (error) {
      console.error('Erro ao baixar título:', error)
      Alert.alert('Erro', error.message || 'Erro ao processar baixa')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {tipo === 'pagar' ? 'Pagar Título' : 'Receber Título'}
        </Text>
        <Text style={styles.subtitle}>Título: {titulo.titu_titu}</Text>
        <Text style={styles.subtitle}>
          Valor Original: {formatarMoeda(titulo.titu_valo)}
        </Text>
        <Text style={styles.subtitle}>
          Parcela: {titu_parc} de {titulo.titu_seri}
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>
          Data do {tipo === 'pagar' ? 'Pagamento' : 'Recebimento'} *
        </Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <View pointerEvents="none">
            <TextInput
              style={styles.input}
              value={dataPagamento}
              editable={false}
              placeholder="Selecione a data"
            />
          </View>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={new Date(dataPagamento)}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowDatePicker(Platform.OS === 'ios') // iOS mantém o picker aberto
              if (selectedDate) {
                const isoString = selectedDate.toISOString().split('T')[0]
                setDataPagamento(isoString)
              }
            }}
          />
        )}

        <Text style={styles.label}>
          Valor {tipo === 'pagar' ? 'Pago' : 'Recebido'} *
        </Text>
        <TextInput
          style={styles.input}
          value={valorPago}
          onChangeText={setValorPago}
          placeholder="0.00"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Valor Juros</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={valorJuros}
            onChangeText={setValorJuros}
            placeholder="0.00"
            keyboardType="numeric"
          />
          <TouchableOpacity
            style={styles.calcButton}
            onPress={calcularJurosAutomatico}>
            <Text style={styles.calcButtonText}>Calc</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Valor Multa</Text>
        <TextInput
          style={styles.input}
          value={valorMulta}
          onChangeText={setValorMulta}
          placeholder="0.00"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Valor Desconto</Text>
        <TextInput
          style={styles.input}
          value={valorDesconto}
          onChangeText={setValorDesconto}
          placeholder="0.00"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Histórico</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={historico}
          onChangeText={setHistorico}
          placeholder="Observações sobre o pagamento..."
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>Banco</Text>
        <TextInput
          style={styles.input}
          value={banco}
          onChangeText={setBanco}
          placeholder="Código do banco"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Cheque</Text>
        <TextInput
          style={styles.input}
          value={cheque}
          onChangeText={setCheque}
          placeholder="Número do cheque"
          keyboardType="numeric"
        />

        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Valor Total:</Text>
          <Text style={styles.totalValue}>
            {formatarMoeda(valorTotalCalculado())}
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => navigation.goBack()}>
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.confirmButton]}
            onPress={handleBaixarTitulo}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>
                {tipo === 'pagar'
                  ? 'Confirmar Pagamento'
                  : 'Confirmar Recebimento'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}
