import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  Image,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import useClienteAuth from '../hooks/useClienteAuth'
import {
  fetchClientePedidos,
  fetchClienteOrcamentos,
  fetchClienteOrdensServico,
  fetchClienteDashboard,
} from '../services/clienteService'

const { width } = Dimensions.get('window')

const HomeCliente = () => {
  const navigation = useNavigation()
  const { cliente, logout } = useClienteAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [pedidos, setPedidos] = useState([])
  const [orcamentos, setOrcamentos] = useState([])
  const [ordensServico, setOrdensServico] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadClienteData()
  }, [])

  const loadClienteData = async () => {
    try {
      setLoading(true)

      // Carrega dados do dashboard
      const [dashData, pedidosData, orcamentosData, ordensData] =
        await Promise.all([
          fetchClienteDashboard(),
          fetchClientePedidos({ ordering: '-data_pedido' }),
          fetchClienteOrcamentos({ ordering: '-data_orcamento' }),
          fetchClienteOrdensServico({ ordering: '-data_abertura' }),
        ])

      setDashboardData(dashData)
      setPedidos(pedidosData || [])
      setOrcamentos(orcamentosData || [])
      setOrdensServico(ordensData || [])
    } catch (error) {
      console.error('Erro ao carregar dados do cliente:', error)
      Alert.alert('Erro', 'Falha ao carregar dados do cliente')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const DashboardCard = ({ title, value, subtitle, onPress, color }) => (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: color }]}
      onPress={onPress}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={[styles.cardValue, { color }]}>{value}</Text>
      </View>
      {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
      <View style={[styles.cardGlow, { backgroundColor: `${color}08` }]} />
    </TouchableOpacity>
  )

  const QuickActionButton = ({ title, onPress, color }) => (
    <TouchableOpacity
      style={[styles.quickActionButton, { borderColor: `${color}30` }]}
      onPress={onPress}>
      <View style={styles.quickActionContent}>
        <Text style={styles.quickActionText}>{title}</Text>
        <Text style={[styles.quickActionArrow, { color }]}>→</Text>
      </View>
      <View
        style={[styles.actionButtonGlow, { backgroundColor: `${color}05` }]}
      />
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#00D4FF" />
          <Text style={styles.loadingText}>Carregando</Text>
        </View>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Minimalista */}

      <View style={styles.header}>
        <View style={styles.logo}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.logoImage}
          />
        </View>
        <View style={styles.headerContent}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Bem-vindo</Text>
            <Text style={styles.clienteName}>
              {cliente?.cliente_nome || 'Cliente'}
            </Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Informações do Cliente */}
      <View style={styles.clienteInfoCard}>
        <View style={styles.clienteInfoHeader}>
          <Text style={styles.clienteInfoTitle}>Informações</Text>
        </View>
        <View style={styles.clienteInfoContent}>
          <View style={styles.infoItem}>
            <View style={styles.infoDetails}>
              <Text style={styles.infoLabel}>DOCUMENTO</Text>
              <Text style={styles.infoValue}>
                {cliente?.documento || 'N/A'}
              </Text>
            </View>
          </View>

          {cliente?.email && (
            <View style={styles.infoItem}>
              <View style={styles.infoDetails}>
                <Text style={styles.infoLabel}>EMAIL</Text>
                <Text style={styles.infoValue}>{cliente.email}</Text>
              </View>
            </View>
          )}

          {cliente?.telefone && (
            <View style={styles.infoItem}>
              <View style={styles.infoDetails}>
                <Text style={styles.infoLabel}>TELEFONE</Text>
                <Text style={styles.infoValue}>{cliente.telefone}</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Dashboard Cards */}
      <View style={styles.dashboardSection}>
        <Text style={styles.sectionTitle}>Resumo</Text>
        <View style={styles.cardsContainer}>
          <DashboardCard
            title="Pedidos"
            value={pedidos.length.toString()}
            color="#00D4FF"
            onPress={() => navigation.navigate('ClientePedidosList')}
          />
          <DashboardCard
            title="Orçamentos"
            value={orcamentos.length.toString()}
            color="#FFD700"
            onPress={() => navigation.navigate('ClienteOrcamentosList')}
          />
          <DashboardCard
            title="Ordens de Serviço"
            value={ordensServico.length.toString()}
            color="#00FF88"
            onPress={() => navigation.navigate('ClienteOrdensServicoList')}
          />
        </View>
      </View>

      {/* Ações Rápidas */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>Ações</Text>
        <View style={styles.quickActionsGrid}>
          <QuickActionButton
            title="Meus Pedidos"
            color="#00D4FF"
            onPress={() => navigation.navigate('ClientePedidosList')}
          />
          <QuickActionButton
            title="Orçamentos"
            color="#FFD700"
            onPress={() => navigation.navigate('ClienteOrcamentosList')}
          />
          <QuickActionButton
            title="Ordens de Serviço"
            color="#00FF88"
            onPress={() => navigation.navigate('ClienteOrdensServicoList')}
          />
        </View>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  logo: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 1,
    marginBottom: 10,
    marginTop: 50,
    marginVertical: 50,
  },
  logoImage: {
    width: 50,
    height: 50,
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
  header: {
    height: 180,
    backgroundColor: '#16213E',
    justifyContent: 'flex-end',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 50,
    paddingBottom: 32,
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 13,
    color: '#8B8BA7',
    fontWeight: '400',
    marginBottom: 4,
  },
  clienteName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2Df',
  },
  logoutButton: {
    backgroundColor: '#1A1A2E',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF475750',
  },
  logoutText: {
    color: '#FF4757',
    fontSize: 14,
    fontWeight: '600',
  },
  clienteInfoCard: {
    backgroundColor: '#1A1A2E',
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 12,
    borderWidth: 0.8,
    borderColor: '#2Df',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  clienteInfoHeader: {
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D44',
  },
  clienteInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  clienteInfoContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  infoItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D44',
  },
  infoDetails: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    color: '#8B8BA7',
    fontWeight: '500',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  dashboardSection: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#1A1A2E',
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderWidth: 0.8,
    borderColor: '#2Df',
    elevation: 2,
    shadowColor: '#fff',
    shadowOffset: { width: 10, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
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
    marginBottom: 8,
    zIndex: 1,
  },
  cardTitle: {
    fontSize: 12,
    color: '#8B8BA7',
    fontWeight: '500',
  },
  cardValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#8B8BA7',
    zIndex: 1,
  },
  quickActionsSection: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  quickActionsGrid: {
    gap: 20,
  },
  quickActionButton: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    borderWidth: 0.8,
    borderColor: '#2Df',
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  actionButtonGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    borderWidth: 0.8,
    borderColor: '#2Df',
  },
  quickActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  quickActionArrow: {
    fontSize: 16,
    fontWeight: '400',
  },
  bottomSpacing: {
    height: 32,
  },
})

export default HomeCliente
