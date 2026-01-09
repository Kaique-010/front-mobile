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
import { fetchClienteOrdensServicoEmEstoque } from '../services/clienteService'
import { formatCurrency, formatDate } from '../utils/formatters'

const ClienteOrdensServicoList = ({ navigation }) => {
  const [ordens, setOrdens] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    carregarOrdens()
  }, [])

  const carregarOrdens = async () => {
    try {
      setLoading(true)
      const data = await fetchClienteOrdensServicoEmEstoque({
        ordering: '-data_abertura',
      })
      setOrdens(data || [])
    } catch (error) {
      console.error('Erro ao carregar ordens de serviço:', error)
      Alert.alert('Erro', 'Não foi possível carregar suas ordens de serviço')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    carregarOrdens()
  }

  const renderItem = ({ item }) => {
    const statusColor = getStatusColor(item.status)

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate('ClienteOrdensServicoDetalhes', {
            ordemId: item.id,
          })
        }>
        <View style={styles.cardHeader}>
          <Text style={styles.ordemNumero}>
            OS #{item.orde_nume || item.id}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>
              {formatStatus(item.orde_stat_orde)}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>DATA ABERTURA</Text>
            <Text style={styles.infoValue}>
              {formatDate(item.orde_data_aber)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>DATA FECHAMENTO</Text>
            <Text style={styles.infoValue}>
              {formatDate(item.orde_data_fech)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>VALOR TOTAL</Text>
            <Text style={styles.infoValue}>
              {formatCurrency(item.orde_tota)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>TÉCNICO</Text>
            <Text style={styles.infoValue}>
              {item.tecnico || 'Não atribuído'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>DEFEITO</Text>
            <Text style={styles.infoValue}>
              {item.orde_obse || 'Não atribuído'}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Ionicons name="chevron-forward" size={20} color="#00D4FF" />
        </View>

        <View
          style={[styles.cardGlow, { backgroundColor: `${statusColor}08` }]}
        />
      </TouchableOpacity>
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'aberta':
      case 'A':
        return '#FFD700'
      case 'em_andamento':
      case 'E':
        return '#00D4FF'
      case 'concluida':
      case 'C':
        return '#00FF88'
      case 'cancelada':
      case 'X':
        return '#FF4757'
      default:
        return '#8B8BA7'
    }
  }

  const formatStatus = (status) => {
    switch (status) {
      case 'aberta':
      case 'A':
        return 'Aberta'
      case 'em_andamento':
      case 'E':
        return 'Em Andamento'
      case 'concluida':
      case 'C':
        return 'Concluída'
      case 'cancelada':
      case 'X':
        return 'Cancelada'
      default:
        return status
          ? status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')
          : 'Desconhecido'
    }
  }

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#00D4FF" />
          <Text style={styles.loadingText}>
            Carregando ordens de serviço...
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={ordens}
        renderItem={renderItem}
        keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={onRefresh}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="construct-outline" size={60} color="#8B8BA7" />
            <Text style={styles.emptyText}>
              Você não possui ordens de serviço
            </Text>
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
  ordemNumero: {
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

export default ClienteOrdensServicoList
