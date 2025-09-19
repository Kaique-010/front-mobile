//Ordem de Serviço da Eltrocometa

import React, { useEffect, useState, useMemo } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native'
import { apiGetComContextoos } from '../utils/api'
import { Ionicons } from '@expo/vector-icons'

const STATUS_OPTIONS = [
  { label: 'Todas', value: null },
  { label: 'Aberta', value: 0 },
  { label: 'Orçamento gerado', value: 1 },
  { label: 'Aguardando Liberação', value: 2 },
  { label: 'Liberada', value: 3 },
  { label: 'Finalizada', value: 4 },
  { label: 'Reprovada', value: 5 },
  { label: 'Faturada parcial', value: 20 },
  { label: 'Em atraso', value: 21 },
]

const statusColors = {
  0: '#d1ecf1',
  1: '#fff3cd',
  21: '#f5c6cb',
  3: '#d1ecf1',
  4: '#d4edda',
  5: '#f5c6cb',
  20: '#bee5eb',
}

const PRIORIDADE_OPTIONS = [
  { label: 'Todas', value: null },
  { label: 'Normal', value: 'normal' },
  { label: 'Alerta', value: 'alerta' },
  { label: 'Urgente', value: 'urgente' },
]

const prioridadeColors = {
  normal: '#d1ecf1',
  alerta: '#ffc107',
  urgente: '#dc3545',
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
    const atrasadas = ordensData.filter((o) => o.orde_stat_orde === 21).length

    return { abertas, atrasadas, concluidas, total: ordensData.length }
  }

  const fetchOrdens = async () => {
    setLoading(true)
    try {
      const response = await apiGetComContextoos('ordemdeservico/ordens/')

      const ordensData = Array.isArray(response)
        ? response
        : response.results || []

      console.log('Dados retornados pela API:', ordensData.length, 'registros')

      setOrdens(ordensData)
      setContadores(calcularContadores(ordensData))
    } catch (error) {
      console.error('Erro ao buscar ordens:', error.message)
      setOrdens([])
    } finally {
      setLoading(false)
    }
  }

  const ordensFiltradasLocalmente = useMemo(() => {
    let ordensFiltradasLocalmente = [...ordens]

    // Filtro por status - converter string para number se necessário
    if (filtroStatus !== null && filtroStatus !== 'Todas') {
      const statusNumerico =
        typeof filtroStatus === 'string'
          ? parseInt(filtroStatus, 10)
          : filtroStatus
      ordensFiltradasLocalmente = ordensFiltradasLocalmente.filter(
        (ordem) => ordem.orde_stat_orde === statusNumerico
      )
    }

    // Filtro por prioridade - manter como string
    if (filtroPrioridade !== null) {
      ordensFiltradasLocalmente = ordensFiltradasLocalmente.filter(
        (ordem) => ordem.orde_prio === filtroPrioridade
      )
    }

    return ordensFiltradasLocalmente
  }, [ordens, filtroStatus, filtroPrioridade])

  useEffect(() => {
    fetchOrdens()
  }, [])

  useEffect(() => {
    // Contadores sempre mostram dados totais, não filtrados
    setContadores(calcularContadores(ordens))
  }, [ordens])

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
            { backgroundColor: prioridadeColors[item.orde_prio] || '#aaa' },
          ]}>
          <Text style={styles.prioridade}>
            {item.orde_prio === 'normal'
              ? 'Normal'
              : item.orde_prio === 'alerta'
              ? 'Alerta'
              : item.orde_prio === 'urgente'
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

        <View style={styles.setorRow}>
          <Text style={styles.setorLabel}>Setor: </Text>
          <Text style={styles.setor} numberOfLines={1}>
            {item.setor_nome || item.orde_seto || '-'}
          </Text>
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
      {/* Header com Logo e Refresh */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}></Text>
        <View style={styles.headerRight}>
          <Image source={require('../assets/eletro.png')} style={styles.logo} />
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={fetchOrdens}
            activeOpacity={0.7}>
            <Ionicons name="refresh" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

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
        <View style={styles.filtroSection}>
          <Text style={styles.filtroLabel}>Status</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtroScroll}>
            {STATUS_OPTIONS.map(({ label, value }) => (
              <TouchableOpacity
                key={label}
                style={[
                  styles.filtroButton,
                  {
                    backgroundColor:
                      value !== null
                        ? statusColors[value] || '#f0f0f0'
                        : '#f0f0f0',
                    borderColor:
                      filtroStatus === value ? '#284665' : 'transparent',
                    borderWidth: filtroStatus === value ? 3 : 1,
                  },
                ]}
                onPress={() => setFiltroStatus(value)}
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.filtroButtonText,
                    { fontWeight: filtroStatus === value ? 'bold' : 'normal' },
                  ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.filtroSection}>
          <Text style={styles.filtroLabel}>Prioridade</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtroScroll}>
            {PRIORIDADE_OPTIONS.map(({ label, value }) => (
              <TouchableOpacity
                key={label}
                style={[
                  styles.filtroButton,
                  {
                    backgroundColor:
                      value !== null
                        ? prioridadeColors[value] || '#f0f0f0'
                        : '#f0f0f0',
                    borderColor:
                      filtroPrioridade === value ? '#284665' : 'transparent',
                    borderWidth: filtroPrioridade === value ? 3 : 1,
                  },
                ]}
                onPress={() => setFiltroPrioridade(value)}
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.filtroButtonText,
                    {
                      fontWeight:
                        filtroPrioridade === value ? 'bold' : 'normal',
                      color: value === 'urgente' ? '#fff' : '#333',
                    },
                  ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#284665" />
          <Text style={styles.loadingText}>Carregando ordens...</Text>
        </View>
      ) : (
        <FlatList
          data={ordensFiltradasLocalmente}
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
    padding: 30,
    backgroundColor: '#232935',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  refreshButton: {
    backgroundColor: '#284665',
    padding: 8,
    borderRadius: 20,
    elevation: 4,
  },
  indicadores: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
    paddingVertical: 10,
  },
  indicador: {
    flex: 1,
    marginHorizontal: 4,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 4,
  },
  indicadorLabel: {
    fontWeight: 'bold',
    fontSize: 10,
    marginBottom: 4,
    opacity: 0.7,
  },
  indicadorValor: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  filtros: {
    marginBottom: 5,
    backgroundColor: '#000',
    padding: 30,
    borderRadius: 10,
    elevation: 4,
  },
  filtroSection: {
    marginBottom: 5,
  },
  filtroLabel: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  filtroScroll: {
    flexDirection: 'row',
  },
  filtroButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 10,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filtroButtonText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
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
  setorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  setorLabel: {
    fontSize: 12,
    color: '#666',
  },
  setor: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    flex: 1,
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
