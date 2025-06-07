import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { Picker } from '@react-native-picker/picker'
import { apiGetComContexto } from '../utils/api'
import { Ionicons } from '@expo/vector-icons'

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
  { label: 'Todas', value: null },
  { label: 'Normal', value: 1 },
  { label: 'Alerta', value: 2 },
  { label: 'Urgente', value: 3 },
]

const prioridadeColors = {
  1: '#17a2b8',
  2: '#ffc107',
  3: '#dc3545',
}

const getStatusText = (status) => {
  const found = STATUS_OPTIONS.find((opt) => opt.value === status)
  return found ? found.label : '-'
}

const PainelAcompanhamento = ({ navigation }) => {
  const [os, setOs] = useState([])
  const [loading, setLoading] = useState(false)
  const [filtroStatus, setFiltroStatus] = useState(null)
  const [filtroPrioridade, setFiltroPrioridade] = useState(null)
  const [contadores, setContadores] = useState({
    abertas: 0,
    atrasadas: 0,
    concluidas: 0,
    total: 0,
  })
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const calcularContadores = (osData) => {
    const abertas = osData.filter((o) => o.os_stat_os === 0).length
    const concluidas = osData.filter((o) => o.os_stat_os === 4).length
    const atrasadas = osData.filter((o) => o.os_stat_os === 2).length
    return { abertas, atrasadas, concluidas, total: osData.length }
  }

  const fetchOs = async (pageNumber = 1) => {
    if (pageNumber === 1) setLoading(true)
    try {
      const params = {
        page: pageNumber,
        page_size: 20,
      }
      if (filtroStatus !== null) params.os_stat_os = filtroStatus
      if (filtroPrioridade !== null) params.os_prio = filtroPrioridade

      const response = await apiGetComContexto('Os/ordens/', { params })
      const newData = Array.isArray(response)
        ? response
        : response.results || []

      if (pageNumber === 1) {
        setOs(newData)
        setContadores(calcularContadores(newData))
      } else {
        setOs((prev) => [...prev, ...newData])
      }

      setHasMore(!!response.next)
    } catch (error) {
      Alert.alert('Erro', 'Erro ao carregar ordens de serviço')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    setPage(1)
    fetchOs(1)
  }, [filtroStatus, filtroPrioridade])

  const onRefresh = () => {
    setRefreshing(true)
    setPage(1)
    fetchOs(1)
  }

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchOs(nextPage)
    }
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: statusColors[item.os_stat_os] || '#eee',
          borderLeftColor: prioridadeColors[item.os_prio] || '#aaa',
        },
      ]}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('OsDetalhe', { os: item })}>
      <View style={styles.cardHeader}>
        <View style={styles.numeroContainer}>
          <Text style={styles.numeroLabel}>OS</Text>
          <Text style={styles.numero}>#{item.os_os}</Text>
        </View>
        <View
          style={[
            styles.prioridadeContainer,
            { backgroundColor: prioridadeColors[item.os_prio] || '#999' },
          ]}>
          <Text style={styles.prioridade}>
            {item.os_prio === 1
              ? 'Normal'
              : item.os_prio === 2
              ? 'Alerta'
              : item.os_prio === 3
              ? 'Urgente'
              : '-'}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.clienteNome} numberOfLines={1}>
          {item.cliente_nome || 'Cliente não informado'}
        </Text>
        <View style={styles.infoRow}>
          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Status:</Text>
            <Text style={styles.status}>{getStatusText(item.os_stat_os)}</Text>
          </View>
          <Text style={styles.data}>{item.os_data_aber || '-'}</Text>
        </View>
        <Text style={styles.problema} numberOfLines={2}>
          {item.os_prob || 'Sem descrição do problema'}
        </Text>
      </View>
    </TouchableOpacity>
  )

  const renderIndicador = (label, valor, cor) => (
    <View style={[styles.indicador, { backgroundColor: cor }]}>
      <Text style={styles.indicadorLabel}>{label}</Text>
      <Text style={styles.indicadorValor}>{valor}</Text>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.indicadores}>
        <TouchableOpacity
          style={styles.botaoCriar}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('OrdemCriacao')}>
          <Ionicons name="add-circle" size={20} color="#fff" />
          <Text style={styles.botaoCriarTexto}>Nova O.S.</Text>
        </TouchableOpacity>
        {renderIndicador('Abertas', contadores.abertas, '#d1ecf1')}
        {renderIndicador('Atrasadas', contadores.atrasadas, '#f8d7da')}
        {renderIndicador('Concluídas', contadores.concluidas, '#d4edda')}
        {renderIndicador('Total', contadores.total, '#eee')}
      </View>

      <View style={styles.filtros}>
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Status</Text>
          <Picker selectedValue={filtroStatus} onValueChange={setFiltroStatus}>
            {STATUS_OPTIONS.map(({ label, value }) => (
              <Picker.Item key={label} label={label} value={value} />
            ))}
          </Picker>
        </View>
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Prioridade</Text>
          <Picker
            selectedValue={filtroPrioridade}
            onValueChange={setFiltroPrioridade}>
            {PRIORIDADE_OPTIONS.map(({ label, value }) => (
              <Picker.Item key={label} label={label} value={value} />
            ))}
          </Picker>
        </View>
      </View>

      {loading && page === 1 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#284665" />
          <Text style={styles.loadingText}>Carregando ordens...</Text>
        </View>
      ) : (
        <FlatList
          data={os}
          renderItem={renderItem}
          keyExtractor={(item) =>
            `${item.os_os}_${item.os_empr}_${item.os_fili}`
          }
          onRefresh={onRefresh}
          refreshing={refreshing}
          onEndReached={loadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={
            loading && hasMore ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : null
          }
          numColumns={2}
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
    elevation: 2,
  },
  indicadorLabel: {
    fontWeight: 'bold',
    fontSize: 10,
    marginBottom: 4,
    opacity: 0.7,
  },
  indicadorValor: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  filtros: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    elevation: 2,
  },
  pickerContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  pickerLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  botaoCriar: {
    backgroundColor: '#284665',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  botaoCriarTexto: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  card: {
    flex: 1,
    margin: 5,
    padding: 14,
    borderRadius: 8,
    borderLeftWidth: 6,
    elevation: 3,
    maxWidth: '48%',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  numeroContainer: { flexDirection: 'row', alignItems: 'center' },
  numeroLabel: { fontSize: 12, color: '#666', marginRight: 4 },
  numero: { fontWeight: 'bold', fontSize: 16 },
  prioridadeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  prioridade: {
    fontSize: 11,
    color: '#fff',
    fontWeight: 'bold',
  },
  cardBody: {},
  clienteNome: { fontWeight: 'bold', marginBottom: 6 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusContainer: { flexDirection: 'row' },
  statusLabel: { fontWeight: 'bold', marginRight: 4 },
  status: {},
  data: { fontSize: 12, color: '#666' },
  problema: { fontSize: 12, color: '#555' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#284665', fontSize: 16 },
})

export default PainelAcompanhamento
