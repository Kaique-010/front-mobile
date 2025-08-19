import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation } from '@react-navigation/native'
import {
  fetchClientePedidos,
  fetchClienteOrcamentos,
  fetchClienteOrdensServico,
  fetchClienteDashboard,
} from '../services/apiService'

const HomeCliente = () => {
  const navigation = useNavigation()
  const [cliente, setCliente] = useState(null)
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

      // Carrega dados do cliente do AsyncStorage - usar os campos corretos
      const cliente_nome = await AsyncStorage.getItem('cliente_nome')
      const documento = await AsyncStorage.getItem('documento')
      const cliente_id = await AsyncStorage.getItem('cliente_id')
      const usuario_cliente = await AsyncStorage.getItem('usuario_cliente')
      const usuario_id = await AsyncStorage.getItem('usuario_id')
      const accessToken = await AsyncStorage.getItem('accessToken')
      const refreshToken = await AsyncStorage.getItem('refreshToken')

      if (cliente_nome) {
        setCliente({
          cliente_nome,
          documento,
          cliente_id: cliente_id ? parseInt(cliente_id, 10) : null,
          usuario_cliente,
          usuario_id: usuario_id ? parseInt(usuario_id, 10) : null,
          accessToken,
          refreshToken,
        })
      }

      // Carrega dados do dashboard
      const [dashData, pedidosData, orcamentosData, ordensData] =
        await Promise.all([
          fetchClienteDashboard(),
          fetchClientePedidos(),
          fetchClienteOrcamentos(),
          fetchClienteOrdensServico(),
        ])

      setDashboardData(dashData)
      setPedidos(pedidosData)
      setOrcamentos(orcamentosData)
      setOrdensServico(ordensData)
    } catch (error) {
      console.error('Erro ao carregar dados do cliente:', error)
      Alert.alert('Erro', 'Falha ao carregar dados do cliente')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['clienteData', 'userToken', 'userType'])
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      })
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const DashboardCard = ({ title, value, subtitle, onPress }) => (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardValue}>{value}</Text>
      {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando dados...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Bem-vindo,</Text>
          <Text style={styles.clienteName}>
            {cliente?.cliente_nome || cliente?.razao_social || 'Cliente'}
          </Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Informações do Cliente */}
      <View style={styles.clienteInfo}>
        <Text style={styles.sectionTitle}>Suas Informações</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Documento:</Text>
          <Text style={styles.infoValue}>{cliente?.documento || 'N/A'}</Text>
        </View>
        {cliente?.email && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{cliente.email}</Text>
          </View>
        )}
        {cliente?.telefone && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Telefone:</Text>
            <Text style={styles.infoValue}>{cliente.telefone}</Text>
          </View>
        )}
      </View>

      {/* Dashboard Cards */}
      <View style={styles.dashboardSection}>
        <Text style={styles.sectionTitle}>Resumo</Text>
        <View style={styles.cardsContainer}>
          <DashboardCard
            title="Pedidos"
            value={pedidos.length.toString()}
            subtitle={`${
              pedidos.filter((p) => p.status === 'aberto').length
            } em aberto`}
            onPress={() => navigation.navigate('ClientePedidos')}
          />
          <DashboardCard
            title="Orçamentos"
            value={orcamentos.length.toString()}
            subtitle={`${
              orcamentos.filter((o) => o.status === 'pendente').length
            } pendentes`}
            onPress={() => navigation.navigate('ClienteOrcamentos')}
          />
          <DashboardCard
            title="Ordens de Serviço"
            value={ordensServico.length.toString()}
            subtitle={`${
              ordensServico.filter((os) => os.status === 'em_andamento').length
            } em andamento`}
            onPress={() => navigation.navigate('ClienteOrdensServico')}
          />
        </View>
      </View>
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Ver Pedidos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Ver Orçamentos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Ver Ordens de Serviço</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#243242',
    paddingHorizontal: 16,
    paddingVertical: 50,
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
    color: '#deb887',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#243242',

    borderWidth: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: '#deb887',
  },
  clienteName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#deb887',
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  clienteInfo: {
    backgroundColor: '#243242',
    borderBlockColor: '#fff',
    borderWidth: 1,
    margin: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#deb887',
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#deb887',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#deb887',
  },
  dashboardSection: {
    margin: 16,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#243242',
    borderBlockColor: '#fff',
    borderWidth: 1,
    width: '48%',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 14,
    color: '#deb887',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#18b7df',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#999',
  },
  actionsSection: {
    margin: 16,
    marginTop: 0,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#243242',
    borderBlockColor: '#fff',
    borderWidth: 1,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
})

export default HomeCliente
