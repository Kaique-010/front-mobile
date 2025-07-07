import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  RefreshControl,
  FlatList,
} from 'react-native'
import { Card, Searchbar, Chip, FAB } from 'react-native-paper'
import { useContextoApp } from '../hooks/useContextoApp'
import { apiGetComContexto } from '../utils/api'
import Icon from 'react-native-vector-icons/MaterialIcons'

const ListagemOrdensProducao = ({ navigation }) => {
  const [ordens, setOrdens] = useState([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')

  const tiposOrdem = [
    { value: '1', label: 'Confecção', color: '#4CAF50' },
    { value: '2', label: 'Conserto', color: '#FF9800' },
    { value: '3', label: 'Orçamento', color: '#2196F3' },
    { value: '4', label: 'Conserto Relógio', color: '#9C27B0' },
  ]

  const statusOrdem = [
    { value: 1, label: 'Aberta', color: '#4CAF50' },
    { value: 2, label: 'Em Produção', color: '#FF9800' },
    { value: 3, label: 'Finalizada', color: '#2196F3' },
    { value: 4, label: 'Cancelada', color: '#F44336' },
  ]

  const carregarOrdens = async () => {
    try {
      setLoading(true)

      const params = {
        search: searchQuery,
        orpr_tipo: filtroTipo,
        orpr_stat: filtroStatus,
        ordering: '-orpr_codi',
      }

      const response = await apiGetComContexto('ordemproducao/ordens/', params)
      setOrdens(response.results || response)
    } catch (error) {
      console.error('Erro ao carregar ordens:', error)
      Alert.alert('Erro', 'Falha ao carregar ordens de produção')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    carregarOrdens()
  }, [searchQuery, filtroTipo, filtroStatus])

  const onRefresh = () => {
    setRefreshing(true)
    carregarOrdens()
  }

  const getTipoInfo = (tipo) => {
    return (
      tiposOrdem.find((t) => t.value === tipo) || {
        label: tipo,
        color: '#757575',
      }
    )
  }

  const getStatusInfo = (status) => {
    return (
      statusOrdem.find((s) => s.value === status) || {
        label: 'Desconhecido',
        color: '#757575',
      }
    )
  }

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR')
  }

  const formatarValor = (valor) => {
    return valor
      ? `R$ ${parseFloat(valor).toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : 'N/A'
  }

  const renderFilterChip = ({ item, index }) => {
    if (index === 0) {
      return (
        <TouchableOpacity
          style={[styles.filterChip, !filtroTipo && styles.filterChipActive]}
          onPress={() => setFiltroTipo('')}>
          <Text
            style={[
              styles.filterText,
              !filtroTipo && styles.filterTextActive,
            ]}>
            Todos
          </Text>
        </TouchableOpacity>
      )
    }
    
    const tipo = item
    return (
      <TouchableOpacity
        style={[
          styles.filterChip,
          filtroTipo === tipo.value && styles.filterChipActive,
        ]}
        onPress={() =>
          setFiltroTipo(filtroTipo === tipo.value ? '' : tipo.value)
        }>
        <Text
          style={[
            styles.filterText,
            filtroTipo === tipo.value && styles.filterTextActive,
          ]}>
          {tipo.label}
        </Text>
      </TouchableOpacity>
    )
  }

  const renderOrdem = ({ item: ordem }) => {
    const tipoInfo = getTipoInfo(ordem.orpr_tipo)
    const statusInfo = getStatusInfo(ordem.orpr_stat)

    return (
      <Card key={ordem.orpr_codi} style={styles.card}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('DetalhesOrdemProducao', { ordem })
          }>
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.numeroOrdem}>#{ordem.orpr_codi}</Text>
              <Text style={styles.numeroControle}>{ordem.orpr_nuca}</Text>
            </View>
            <View style={styles.headerRight}>
              <Chip
                style={[styles.chip, { backgroundColor: tipoInfo.color }]}
                textStyle={styles.chipText}>
                {tipoInfo.label}
              </Chip>
            </View>
          </View>

          <View style={styles.cardContent}>
            <View style={styles.infoRow}>
              <Icon name="person" size={16} color="#666" />
              <Text style={styles.infoText}>
                Cliente: {ordem.cliente_nome || `Código: ${ordem.orpr_clie}`}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Icon name="event" size={16} color="#666" />
              <Text style={styles.infoText}>
                Entrada: {formatarData(ordem.orpr_entr)}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Icon name="schedule" size={16} color="#666" />
              <Text style={styles.infoText}>
                Previsão: {formatarData(ordem.orpr_prev)}
              </Text>
            </View>

            {ordem.orpr_valo && (
              <View style={styles.infoRow}>
                <Icon name="attach-money" size={16} color="#666" />
                <Text style={styles.valorText}>
                  {formatarValor(ordem.orpr_valo)}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.cardFooter}>
            <Chip
              style={[styles.statusChip, { backgroundColor: statusInfo.color }]}
              textStyle={styles.chipText}>
              {statusInfo.label}
            </Chip>

            <View style={styles.footerIcons}>
              {ordem.fotos && ordem.fotos.length > 0 && (
                <Icon
                  name="photo-camera"
                  size={20}
                  color="#4CAF50"
                  style={styles.icon}
                />
              )}
              {ordem.materiais && ordem.materiais.length > 0 && (
                <Icon
                  name="build"
                  size={20}
                  color="#FF9800"
                  style={styles.icon}
                />
              )}
              {ordem.etapas && ordem.etapas.length > 0 && (
                <Icon
                  name="timeline"
                  size={20}
                  color="#2196F3"
                  style={styles.icon}
                />
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Card>
    )
  }

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Carregando ordens de produção...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Buscar por número, cliente..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[null, ...tiposOrdem]}
          renderItem={renderFilterChip}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.filtersList}
        />
      </View>

      <FlatList
        style={styles.scrollView}
        data={ordens}
        renderItem={renderOrdem}
        keyExtractor={(item) => item.orpr_codi.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="work-off" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Nenhuma ordem encontrada</Text>
          </View>
        }
      />

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('FormOrdemProducao')}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  searchContainer: {
    padding: 15,
    backgroundColor: '#fff',
    elevation: 2,
  },
  searchbar: {
    elevation: 0,
    backgroundColor: '#f5f5f5',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  filterChipActive: {
    backgroundColor: '#007bff',
  },
  filterText: {
    color: '#666',
    fontSize: 14,
  },
  filterTextActive: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: 15,
    marginBottom: 10,
    borderRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    paddingBottom: 10,
  },
  headerLeft: {
    flex: 1,
  },
  numeroOrdem: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  numeroControle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  chip: {
    borderRadius: 12,
  },
  chipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardContent: {
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  valorText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statusChip: {
    borderRadius: 12,
  },
  footerIcons: {
    flexDirection: 'row',
  },
  icon: {
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#007bff',
  },
})

export default ListagemOrdensProducao
