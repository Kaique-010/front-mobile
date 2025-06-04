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

  const getStatusText = (status) => {
    const option = STATUS_OPTIONS.find((opt) => opt.value === status)
    return option ? option.label : '-'
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: statusColors[item.orde_stat_orde] || '#eee',
          borderLeftColor: prioridadeColors[item.orde_prio] || '#aaa',
        },
      ]}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('OrdemDetalhe', { ordem: item })}>
      <View style={styles.cardHeader}>
        <View style={styles.numeroContainer}>
          <Text style={styles.numeroLabel}>OS</Text>
          <Text style={styles.numero}>#{item.orde_nume}</Text>
        </View>
        <View
          style={[
            styles.prioridadeContainer,
            { backgroundColor: prioridadeColors[item.orde_prio] },
          ]}>
          <Text style={styles.prioridade}>
            {item.orde_prio === 1
              ? 'Normal'
              : item.orde_prio === 2
              ? 'Alerta'
              : item.orde_prio === 3
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
            <Text style={styles.status}>
              {getStatusText(item.orde_stat_orde)}
            </Text>
          </View>
          <Text style={styles.data}>{item.orde_data_aber || '-'}</Text>
        </View>

        <Text style={styles.problema} numberOfLines={2}>
          {item.orde_prob || 'Sem descrição do problema'}
        </Text>
      </View>
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
        <TouchableOpacity
          style={styles.botaoCriar}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('OsCriacao')}>
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
          <Picker
            selectedValue={filtroStatus}
            onValueChange={setFiltroStatus}
            style={styles.picker}>
            {STATUS_OPTIONS.map(({ label, value }) => (
              <Picker.Item key={label} label={label} value={value} />
            ))}
          </Picker>
        </View>

        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Prioridade</Text>
          <Picker
            selectedValue={filtroPrioridade}
            onValueChange={setFiltroPrioridade}
            style={styles.picker}>
            {PRIORIDADE_OPTIONS.map(({ label, value }) => (
              <Picker.Item key={label} label={label} value={value} />
            ))}
          </Picker>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#284665" />
          <Text style={styles.loadingText}>Carregando ordens...</Text>
        </View>
      ) : (
        <FlatList
          data={ordens}
          keyExtractor={(item) => item.orde_nume.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={48} color="#666" />
              <Text style={styles.emptyText}>Nenhuma OS encontrada</Text>
              <Text style={styles.emptySubtext}>
                Ajuste os filtros ou crie uma nova O.S.
              </Text>
            </View>
          }
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f7f7f7',
  },
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
  picker: {
    backgroundColor: '#fff',
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
  numeroContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  numeroLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 4,
  },
  numero: {
    fontWeight: 'bold',
    fontSize: 16,
  },
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
  cardBody: {
    gap: 8,
  },
  clienteNome: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusLabel: {
    fontSize: 12,
    color: '#666',
  },
  status: {
    fontSize: 12,
    fontWeight: '500',
  },
  data: {
    fontSize: 11,
    color: '#666',
  },
  problema: {
    fontSize: 12,
    color: '#555',
    fontStyle: 'italic',
  },
  botaoCriar: {
    backgroundColor: '#284665',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    gap: 6,
    elevation: 2,
  },
  botaoCriarTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  listContainer: {
    paddingBottom: 30,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
})

export default PainelAcompanhamento
