import React, { useEffect, useState, useCallback } from 'react'
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import {
  getDashboardEstoque,
  getDashboardVendas,
} from '../services/dashboardService'
import DashboardEstoqueTopProdutos from './DashboardEstoqueTopProdutos'
import DashboardVendasStatusPedidos from './DashboardVendasStatusPedidos'

export default function Dashboard() {
  const [estoqueDados, setEstoqueDados] = useState(null)
  const [vendasDados, setVendasDados] = useState(null)

  const [dataIni, setDataIni] = useState(() => {
    const hoje = new Date()
    return new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  })
  const [dataFim, setDataFim] = useState(() => new Date())

  const [showIniPicker, setShowIniPicker] = useState(false)
  const [showFimPicker, setShowFimPicker] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const formatDate = (date) => date.toISOString().slice(0, 10)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const estoque = await getDashboardEstoque(
        formatDate(dataIni),
        formatDate(dataFim)
      )
      const vendas = await getDashboardVendas(
        formatDate(dataIni),
        formatDate(dataFim)
      )
      setEstoqueDados(estoque)
      setVendasDados(vendas)
    } catch (err) {
      setError('Erro ao carregar dados')
      setEstoqueDados(null)
      setVendasDados(null)
    } finally {
      setLoading(false)
    }
  }, [dataIni, dataFim])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const onChangeIni = (event, selectedDate) => {
    setShowIniPicker(false)
    if (selectedDate) {
      setDataIni(selectedDate)
    }
  }

  const onChangeFim = (event, selectedDate) => {
    setShowFimPicker(false)
    if (selectedDate) {
      setDataFim(selectedDate)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.datePickerRow}>
        <View style={styles.datePickerWrapper}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowIniPicker(true)}>
            <Text style={styles.dateButtonText}>
              {`Data Início: ${formatDate(dataIni)}`}
            </Text>
          </TouchableOpacity>
          {showIniPicker && (
            <DateTimePicker
              value={dataIni}
              mode="date"
              display="default"
              onChange={onChangeIni}
              maximumDate={dataFim}
            />
          )}
        </View>

        <View style={styles.datePickerWrapper}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowFimPicker(true)}>
            <Text style={styles.dateButtonText}>
              {`Data Fim: ${formatDate(dataFim)}`}
            </Text>
          </TouchableOpacity>
          {showFimPicker && (
            <DateTimePicker
              value={dataFim}
              mode="date"
              display="default"
              onChange={onChangeFim}
              minimumDate={dataIni}
              maximumDate={new Date()}
            />
          )}
        </View>

        <View style={styles.updateButtonWrapper}>
          <TouchableOpacity style={styles.updateButton} onPress={fetchData}>
            <Text style={styles.updateButtonText}>Atualizar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#fff"
          style={{ marginTop: 30 }}
        />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : !estoqueDados || !vendasDados ? (
        <Text style={styles.loadingText}>Nenhum dado disponível.</Text>
      ) : (
        <>
          <Text style={styles.title}>Top Produtos Saída Estoque</Text>
          <DashboardEstoqueTopProdutos
            dados={estoqueDados.top_produtos_saida}
          />

          <Text style={[styles.title, { marginTop: 32 }]}>
            Resumo de Pedidos
          </Text>
          <DashboardVendasStatusPedidos
            totalPedidos={vendasDados.total_pedidos}
            totalFaturado={vendasDados.total_faturado}
            ticketMedio={vendasDados.ticket_medio}
          />
        </>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  datePickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  datePickerWrapper: {
    flex: 1,
    marginRight: 8,
  },
  dateButton: {
    backgroundColor: '#1f1f1f',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  dateButtonText: {
    color: '#ddd',
    fontWeight: '600',
    textAlign: 'center',
  },
  updateButtonWrapper: {
    justifyContent: 'center',
  },
  updateButton: {
    backgroundColor: '#2979ff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  updateButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
    color: '#ffffff',
    marginVertical: 16,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 30,
  },
  loadingText: {
    color: '#ccc',
    textAlign: 'center',
    marginTop: 30,
  },
})
