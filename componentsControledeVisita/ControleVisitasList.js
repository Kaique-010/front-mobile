import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  StyleSheet,
  TextInput,
} from 'react-native'
import { MaterialIcons, Feather } from '@expo/vector-icons'
import { apiGetComContexto, apiDeleteComContexto } from '../utils/api'
import ControleVisitaCard from './ControleVisitaCard'
import ControleVisitaFilters from './ControleVisitaFilters'

export default function ControleVisitasList({ navigation }) {
  const [visitas, setVisitas] = useState([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    etapa: '',
    vendedor: '',
    data_inicio: '',
    data_fim: '',
    cliente_nome: '',
  })
  const [stats, setStats] = useState({
    total: 0,
    prospeccao: 0,
    qualificacao: 0,
    proposta: 0,
    negociacao: 0,
    fechamento: 0,
  })

  const etapas = [
    { value: 1, label: 'Prospecção', color: '#3498db' },
    { value: 2, label: 'Qualificação', color: '#f39c12' },
    { value: 3, label: 'Proposta', color: '#9b59b6' },
    { value: 4, label: 'Negociação', color: '#e74c3c' },
    { value: 5, label: 'Fechamento', color: '#2ecc71' },
  ]

  const carregarVisitas = useCallback(async () => {
    try {
      setLoading(true)
      const params = {
        ...filters,
        search: searchText,
        ordering: '-ctrl_data',
      }

      // Carregar visitas com tratamento de erro melhorado
      const response = await apiGetComContexto(
        'controledevisitas/controle-visitas/',
        params
      )

      // Garantir que sempre temos um array
      const visitasData = Array.isArray(response)
        ? response
        : Array.isArray(response?.results)
        ? response.results
        : []

      console.log('Visitas carregadas na lista:', visitasData.length)
      setVisitas(visitasData)

      // Calcular estatísticas
      const novasStats = {
        total: visitasData.length,
        prospeccao: visitasData.filter((v) => v.ctrl_etapa === 1).length,
        qualificacao: visitasData.filter((v) => v.ctrl_etapa === 2).length,
        proposta: visitasData.filter((v) => v.ctrl_etapa === 3).length,
        negociacao: visitasData.filter((v) => v.ctrl_etapa === 4).length,
        fechamento: visitasData.filter((v) => v.ctrl_etapa === 5).length,
      }
      setStats(novasStats)
    } catch (error) {
      console.error('Erro listar:', error)
      Alert.alert('Erro', 'Não foi possível carregar as visitas')
      setVisitas([]) // Garantir que visitas seja um array vazio em caso de erro
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [filters, searchText])

  useEffect(() => {
    carregarVisitas()
  }, [carregarVisitas])

  const onRefresh = () => {
    setRefreshing(true)
    carregarVisitas()
  }

  const handleEdit = (visita) => {
    navigation.navigate('ControleVisitaForm', {
      visitaId: visita.ctrl_id,
      mode: 'edit',
    })
  }

  const handleDelete = async (visita) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir a visita ${visita.ctrl_numero}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              // CORRIGIDO: endpoint duplicado
              await apiDeleteComContexto(
                `controledevisitas/controle-visitas/${visita.ctrl_id}/`
              )
              Alert.alert('Sucesso', 'Visita excluída com sucesso')
              carregarVisitas()
            } catch (error) {
              console.error('Erro ao excluir visita:', error)
              Alert.alert('Erro', 'Não foi possível excluir a visita')
            }
          },
        },
      ]
    )
  }

  const handleView = (visita) => {
    navigation.navigate('ControleVisitaDetalhes', { visitaId: visita.ctrl_id })
  }

  const applyFilters = (newFilters) => {
    setFilters(newFilters)
    setShowFilters(false)
  }

  const clearFilters = () => {
    setFilters({
      etapa: '',
      vendedor: '',
      data_inicio: '',
      data_fim: '',
      cliente_nome: '',
    })
    setSearchText('')
  }

  const renderStatsCard = () => (
    <View style={styles.statsContainer}>
      <Text style={styles.statsTitle}>Funil de Vendas</Text>
      <View style={styles.statsGrid}>
        {etapas.map((etapa) => {
          const count =
            stats[etapa.label.toLowerCase().replace('ção', 'cao')] || 0
          const percentage =
            stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : 0

          return (
            <TouchableOpacity
              key={etapa.value}
              style={[styles.statCard, { borderLeftColor: etapa.color }]}
              onPress={() => setFilters({ ...filters, etapa: etapa.value })}>
              <Text style={styles.statNumber}>{count}</Text>
              <Text style={styles.statLabel}>{etapa.label}</Text>
              <Text style={styles.statPercentage}>{percentage}%</Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.searchContainer}>
        <Feather
          name="search"
          size={20}
          color="#666"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por cliente, vendedor..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#666"
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}>
          <Feather name="filter" size={20} color="#2ecc71" />
        </TouchableOpacity>
      </View>

      {renderStatsCard()}

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            navigation.navigate('ControleVisitaForm', { mode: 'create' })
          }>
          <MaterialIcons name="add" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Nova Visita</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dashboardButton}
          onPress={() => navigation.navigate('ControleVisitaDashboard')}>
          // Linha 219 - TROCAR:
          <MaterialIcons name="dashboard" size={24} color="#fff" />
          // POR:
          <MaterialIcons name="view-dashboard" size={24} color="#fff" />
          <Text style={styles.dashboardButtonText}>Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderVisita = ({ item }) => (
    <ControleVisitaCard
      visita={item}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onView={handleView}
      etapas={etapas}
    />
  )

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="business-center" size={64} color="#666" />
      <Text style={styles.emptyTitle}>Nenhuma visita encontrada</Text>
      <Text style={styles.emptySubtitle}>
        {searchText || Object.values(filters).some((f) => f)
          ? 'Tente ajustar os filtros de busca'
          : 'Comece criando sua primeira visita'}
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() =>
          navigation.navigate('ControleVisitaForm', { mode: 'create' })
        }>
        <Text style={styles.emptyButtonText}>Criar Primeira Visita</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <View style={styles.container}>
      <FlatList
        data={visitas}
        renderItem={renderVisita}
        keyExtractor={(item) => item.ctrl_id.toString()}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!loading ? renderEmpty : null}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2ecc71']}
            tintColor="#2ecc71"
          />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet">
        <ControleVisitaFilters
          filters={filters}
          onApply={applyFilters}
          onClear={clearFilters}
          onClose={() => setShowFilters(false)}
          etapas={etapas}
        />
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1421',
  },
  listContainer: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a252f',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a3441',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    color: '#fff',
    fontSize: 16,
  },
  filterButton: {
    padding: 8,
  },
  statsContainer: {
    backgroundColor: '#1a252f',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a3441',
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#0d1421',
    borderRadius: 8,
    padding: 12,
    width: '48%',
    marginBottom: 8,
    borderLeftWidth: 4,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statPercentage: {
    fontSize: 10,
    color: '#2ecc71',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  addButton: {
    flex: 1,
    backgroundColor: '#2ecc71',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  dashboardButton: {
    flex: 1,
    backgroundColor: '#3498db',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashboardButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  emptyButton: {
    backgroundColor: '#2ecc71',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
})
