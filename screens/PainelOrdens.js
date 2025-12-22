//OS normal
import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { apiGetComContexto } from '../utils/api'
import { Ionicons } from '@expo/vector-icons'
import styles from '../styles/osPadraoStyle'
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
  0: '#85b9c2ff',
  1: '#fff3cd',
  2: '#f5c6cb',
  3: '#d1ecf1',
  4: '#40ceaaff',
  5: '#d3626eff',
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
  const [filtroOs, setFiltroOs] = useState(null)
  const [filtroCliente, setFiltroCliente] = useState(null)
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
      if (filtroOs !== null) params.os_os = filtroOs
      if (filtroCliente !== null) params.cliente_nome = filtroCliente

      const response = await apiGetComContexto('Os/ordens/', params)
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
  }, [filtroOs, filtroCliente])

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
          {item.os_prob_rela || 'Sem descrição do problema'}
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
        {renderIndicador('Abertas', contadores.abertas, '#85b9c2ff')}
        {renderIndicador('Atrasadas', contadores.atrasadas, '#f8d7da')}
        {renderIndicador('Concluídas', contadores.concluidas, '#40ceaaff')}
        {renderIndicador('Total', contadores.total, '#eee')}
      </View>

      <View style={styles.filtros}>
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Número da OS</Text>
          <TextInput
            style={styles.pickerInput}
            value={filtroOs}
            onChangeText={setFiltroOs}
            placeholder="Digite o número da OS"
            keyboardType="numeric"
            returnKeyType="done"
            color="#ffffffff"
          />
        </View>
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Cliente</Text>
          <TextInput
            style={styles.pickerInput}
            value={filtroCliente}
            onChangeText={setFiltroCliente}
            placeholder="Digite o nome do cliente"
            returnKeyType="done"
            color="#ffffffff"
          />
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

export default PainelAcompanhamento
