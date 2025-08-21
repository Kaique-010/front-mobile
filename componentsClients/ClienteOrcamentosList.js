import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { fetchClienteOrcamentos } from '../services/clienteService'
import { formatCurrency, formatDate } from '../utils/formatters'

const ClienteOrcamentosList = ({ navigation }) => {
  const [orcamentos, setOrcamentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    carregarOrcamentos()
  }, [])

  const carregarOrcamentos = async () => {
    try {
      setLoading(true)
      const data = await fetchClienteOrcamentos({ ordering: '-data_orcamento' })
      setOrcamentos(data || [])
    } catch (error) {
      console.error('Erro ao carregar orçamentos:', error)
      Alert.alert('Erro', 'Não foi possível carregar seus orçamentos')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    carregarOrcamentos()
  }

  const renderItem = ({ item }) => {
    const statusColor = getStatusColor(item.status || item.pedi_stat)

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate('ClienteOrcamentosDetalhes', {
            orcamentoId: item.id,
          })
        }>
        <View style={styles.cardHeader}>
          <Text style={styles.orcamentoNumero}>
            Orçamento #{item.pedi_nume || item.id}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{formatStatus(item.pedi_stat || item.status)}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>DATA</Text>
            <Text style={styles.infoValue}>{formatDate(item.pedi_data)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>VALOR TOTAL</Text>
            <Text style={styles.infoValue}>
              {formatCurrency(item.pedi_tota)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>VALIDADE</Text>
            <Text style={styles.infoValue}>
              {formatDate(item.data_validade)}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Ionicons name="chevron-forward" size={20} color="#00D4FF" />
        </View>
        
        <View style={[styles.cardGlow, { backgroundColor: `${statusColor}08` }]} />
      </TouchableOpacity>
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendente':
      case 'P':
        return '#FFD700'
      case 'aprovado':
      case 'A':
        return '#00FF88'
      case 'recusado':
      case 'R':
        return '#FF4757'
      case 'vencido':
      case 'V':
        return '#8B8BA7'
      default:
        return '#8B8BA7'
    }
  }

  const formatStatus = (status) => {
    switch (status) {
      case 'pendente':
      case 'P':
        return 'Pendente'
      case 'aprovado':
      case 'A':
        return 'Aprovado'
      case 'recusado':
      case 'R':
        return 'Recusado'
      case 'vencido':
      case 'V':
        return 'Vencido'
      default:
        return status
          ? status.charAt(0).toUpperCase() + status.slice(1)
          : 'Desconhecido'
    }
  }

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#00D4FF" />
          <Text style={styles.loadingText}>Carregando orçamentos...</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orcamentos}
        renderItem={renderItem}
        keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={onRefresh}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={60} color="#8B8BA7" />
            <Text style={styles.emptyText}>Você não possui orçamentos</Text>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  listContent: {
    padding: 20,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F0F23',
  },
  loadingContent: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '500',
    color: '#8B8BA7',
  },
  card: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    borderWidth: 0.8,
    borderColor: '#2D2D44',
    marginBottom: 16,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  cardGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    zIndex: 1,
  },
  orcamentoNumero: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  cardBody: {
    marginBottom: 12,
    zIndex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D44',
  },
  infoLabel: {
    fontSize: 10,
    color: '#8B8BA7',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  cardFooter: {
    alignItems: 'flex-end',
    zIndex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8B8BA7',
    textAlign: 'center',
    fontWeight: '500',
  },
})

export default ClienteOrcamentosList
