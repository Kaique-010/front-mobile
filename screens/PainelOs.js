import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import { Picker } from '@react-native-picker/picker'
import { apiGetComContextoos } from '../utils/api'

const STATUS_OPTIONS = [
  { label: 'Todas', value: null },
  { label: 'Aberta', value: 0 },
  { label: 'Em Orçamento gerado', value: 1 },
  { label: 'Aguardando Liberação', value: 2 },
  { label: 'Liberada', value: 3 },
  { label: 'Finalizada', value: 4 },
  { label: 'Reprovada', value: 5 },
  { label: 'Faturada parcial', value: 20 },
]

const statusColors = {
  0: '#d1ecf1',
  1: '#fff3cd',
  2: '#f5c6cb',
  3: '#d1ecf1',
  4: '#d4edda',
  5: '#f5c6cb',
  20: '#bee5eb',
}

const PRIORIDADE_OPTIONS = [
  { label: 'Todas', value: '' },
  { label: 'Normal', value: 1 },
  { label: 'Alerta', value: 2 },
  { label: 'Urgente', value: 3 },
]

const prioridadeColors = {
  1: '#d1ecf1',
  2: '#ffc107',
  3: '#dc3545',
}

const PainelAcompanhamento = ({ navigation }) => {
  const [ordens, setOrdens] = useState([])
  const [loading, setLoading] = useState(false)
  const [filtroStatus, setFiltroStatus] = useState(null)
  const [filtroPrioridade, setFiltroPrioridade] = useState(null)
  const [contadores, setContadores] = useState({
    abertas: 0,
    atrasadas: 0,
    concluidas: 0,
    total: 0,
  })

  const calcularContadores = (ordensData) => {
    const hoje = new Date()

    const abertas = ordensData.filter((o) => o.orde_stat_orde === 0).length
    const concluidas = ordensData.filter((o) => o.orde_stat_orde === 4).length
    const atrasadas = ordensData.filter((o) => o.orde_stat_orde === 2).length

    return { abertas, atrasadas, concluidas, total: ordensData.length }
  }

  const fetchOrdens = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filtroStatus !== null) params.orde_stat_orde = filtroStatus
      if (filtroPrioridade !== null) params.orde_prio = filtroPrioridade

      const response = await apiGetComContextoos('ordemdeservico/ordens/', {
        params,
      })

      const ordensData = Array.isArray(response)
        ? response
        : response.results || []

      setOrdens(ordensData)
      setContadores(calcularContadores(ordensData))
    } catch (error) {
      console.error('Erro ao buscar ordens:', error.message)
      setOrdens([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrdens()
  }, [filtroStatus, filtroPrioridade])

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: statusColors[item.orde_stat_orde] || '#eee',
          borderLeftColor: prioridadeColors[item.orde_prio] || '#aaa',
        },
      ]}
      onPress={() => navigation.navigate('OrdemDetalhe', { ordem: item })}>
      <View style={styles.cardHeader}>
        <Text style={styles.numero}>OS #{item.orde_nume}</Text>
        <Text style={styles.prioridade}>
          {item.orde_prio?.toUpperCase?.() || '-'}
        </Text>
      </View>
      <Text style={styles.status}>Status: {item.orde_stat_orde || '-'}</Text>
      <Text style={styles.tipo}>Tipo: {item.orde_tipo || '-'}</Text>
      <Text style={styles.problema} numberOfLines={1}>
        Problema: {item.orde_prob || '-'}
      </Text>
      <Text style={styles.data}>Abertura: {item.orde_data_aber || '-'}</Text>
    </TouchableOpacity>
  )

  const renderIndicador = (label, valor, bgColor) => (
    <View style={[styles.indicador, { backgroundColor: bgColor }]}>
      <Text style={styles.indicadorLabel}>{label}</Text>
      <Text style={styles.indicadorValor}>{valor}</Text>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.indicadores}>
        {renderIndicador('Abertas', contadores.abertas, '#d1ecf1')}
        {renderIndicador('Atrasadas', contadores.atrasadas, '#f8d7da')}
        {renderIndicador('Concluídas', contadores.concluidas, '#d4edda')}
        {renderIndicador('Total', contadores.total, '#eee')}
      </View>

      <View style={styles.filtros}>
        <Picker
          selectedValue={filtroStatus}
          onValueChange={setFiltroStatus}
          style={styles.picker}>
          {STATUS_OPTIONS.map(({ label, value }) => (
            <Picker.Item key={label} label={label} value={value} />
          ))}
        </Picker>
        <Picker
          selectedValue={filtroPrioridade}
          onValueChange={setFiltroPrioridade}
          style={styles.picker}>
          {PRIORIDADE_OPTIONS.map(({ label, value }) => (
            <Picker.Item key={label} label={label} value={value} />
          ))}
        </Picker>
      </View>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={ordens}
          keyExtractor={(item) => item.orde_nume.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 30 }}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 20 }}>
              Nenhuma OS encontrada
            </Text>
          }
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#f7f7f7' },
  indicadores: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
    paddingVertical: 8,
  },
  indicador: {
    flex: 1,
    marginHorizontal: 4,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  indicadorLabel: { fontWeight: 'bold', fontSize: 10, marginBottom: 4 },
  indicadorValor: { fontSize: 20, fontWeight: 'bold' },
  filtros: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  picker: { flex: 1, backgroundColor: '#fff', marginHorizontal: 5 },
  card: {
    flex: 1,
    margin: 5,
    padding: 14,
    borderRadius: 8,
    borderLeftWidth: 6,
    elevation: 3,
    maxWidth: '45%',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  numero: { fontWeight: 'bold', fontSize: 16 },
  prioridade: { fontWeight: 'bold', fontSize: 14, color: '#333' },
  status: { fontSize: 14, marginBottom: 2 },
  tipo: { fontSize: 14, marginBottom: 2 },
  problema: { fontSize: 14, fontStyle: 'italic', color: '#555' },
  data: { fontSize: 12, color: '#666' },
})

export default PainelAcompanhamento
