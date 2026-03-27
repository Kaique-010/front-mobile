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
  StatusBar,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import useClienteAuth from '../hooks/useClienteAuth'
import {
  fetchClientePedidos,
  fetchClienteOrcamentos,
  fetchClienteOrdensServico,
  fetchClienteDashboard,
  fetchClienteOrdensTodas,
} from '../services/clienteService'

const { width } = Dimensions.get('window')

const HomeCliente = () => {
  const navigation = useNavigation()
  const { cliente, logout, usuario } = useClienteAuth()

  const [dashboardData, setDashboardData] = useState(null)
  const [pedidos, setPedidos] = useState([])
  const [totalPedidos, setTotalPedidos] = useState(0)
  const [orcamentos, setOrcamentos] = useState([])
  const [totalOrcamentos, setTotalOrcamentos] = useState(0)
  const [ordensServico, setOrdensServico] = useState([])
  const [totalOrdens, setTotalOrdens] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadClienteData()
  }, [])

  const loadClienteData = async () => {
    try {
      setLoading(true)

      const [dashData, pedidosData, orcamentosData, ordensData] =
        await Promise.all([
          fetchClienteDashboard(),
          fetchClientePedidos({ ordering: '-data_pedido' }),
          fetchClienteOrcamentos({ ordering: '-data_orcamento' }),
          fetchClienteOrdensServico({ ordering: '-data_abertura' }),
        ])

      setDashboardData(dashData)

      if (pedidosData?.results) {
        setPedidos(pedidosData.results)
        setTotalPedidos(pedidosData.count)
      } else if (Array.isArray(pedidosData)) {
        setPedidos(pedidosData)
        setTotalPedidos(pedidosData.length)
      }

      if (orcamentosData?.results) {
        setOrcamentos(orcamentosData.results)
        setTotalOrcamentos(orcamentosData.count)
      } else if (Array.isArray(orcamentosData)) {
        setOrcamentos(orcamentosData)
        setTotalOrcamentos(orcamentosData.length)
      }

      if (ordensData?.results) {
        setOrdensServico(ordensData.results)
        setTotalOrdens(ordensData.count)
      } else if (Array.isArray(ordensData)) {
        setOrdensServico(ordensData)
        setTotalOrdens(ordensData.length)
      }
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

  // ─── Componente: card de resumo ────────────────────────────────────────────
  const DashboardCard = ({ title, value, onPress, color }) => (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: color }]}
      onPress={onPress}
      activeOpacity={0.75}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={[styles.cardValue, { color }]}>{value}</Text>
      </View>
    </TouchableOpacity>
  )

  // ─── Componente: botão de ação ─────────────────────────────────────────────
  const QuickActionButton = ({ title, onPress, color }) => (
    <TouchableOpacity
      style={styles.quickActionButton}
      onPress={onPress}
      activeOpacity={0.75}>
      <View style={styles.quickActionContent}>
        <View style={styles.quickActionLeft}>
          <View style={[styles.quickActionDot, { backgroundColor: color }]} />
          <Text style={styles.quickActionText}>{title}</Text>
        </View>
        <Text style={[styles.quickActionArrow, { color }]}>→</Text>
      </View>
    </TouchableOpacity>
  )

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00D4FF" />
        <Text style={styles.loadingText}>Carregando</Text>
      </View>
    )
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#16213E" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Image
                source={require('../assets/eletro.png')}
                style={styles.logoImage}
              />
              <Text style={styles.welcomeText}>Bem-vindo</Text>
            </View>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}>
              <Text style={styles.logoutText}>Sair</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Card Informações do Cliente ── */}
        <View style={styles.clienteInfoCard}>
          <View style={styles.clienteInfoHeader}>
            <Text style={styles.clienteInfoLabel}>INFORMAÇÕES</Text>
            <Text style={styles.clienteInfoNome}>
              {cliente?.cliente_nome || 'Cliente'}
            </Text>
          </View>

          {/* Documento */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>CNPJ / CPF</Text>
            <Text style={styles.infoValue}>{cliente?.documento || 'N/A'}</Text>
          </View>

          {cliente?.email ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>EMAIL</Text>
              <Text style={styles.infoValue}>{cliente.email}</Text>
            </View>
          ) : null}

          {cliente?.telefone ? (
            <View style={[styles.infoRow, styles.infoRowLast]}>
              <Text style={styles.infoLabel}>TELEFONE</Text>
              <Text style={styles.infoValue}>{cliente.telefone}</Text>
            </View>
          ) : null}
        </View>

        {/* ── Resumo ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo</Text>
          <DashboardCard
            title="Ordens de Serviço"
            value={totalOrdens.toString()}
            color="#87dfb6"
            onPress={() => navigation.navigate('ClienteOrdensServicoList')}
          />
        </View>

        {/* ── Ações ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações</Text>
          <View style={styles.actionsGrid}>
            <QuickActionButton
              title="Ordens de Serviço"
              color="#00FF88"
              onPress={() => navigation.navigate('ClienteOrdensTodasList')}
            />
            <QuickActionButton
              title="Motores em Estoque"
              color="#FFD700"
              onPress={() => navigation.navigate('ClienteMotoresEstoqueList')}
            />
          </View>
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.footerLogo}
          />
          <Text style={styles.footerText}>
            Desenvolvido por Spartacus Sistemas 2026
          </Text>
          <Text style={styles.footerText}>Versão 1.0.0</Text>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </>
  )
}

// ─── Estilos ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F0F23',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#8B8BA7',
  },

  // Header
  header: {
    backgroundColor: '#16213E',
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'column',   // logo em cima, bem-vindo embaixo
    alignItems: 'flex-start',
    gap: 6,
  },
  logoImage: {
    width: 180,                // ← maior
    height: 64,
    resizeMode: 'contain',
  },
  welcomeText: {
    fontSize: 15,
    color: '#8B8BA7',
    fontWeight: '400',
  },
  logoutButton: {
    backgroundColor: '#1A1A2E',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF475750',
  },
  logoutText: {
    color: '#FF4757',
    fontSize: 14,
    fontWeight: '600',
  },

  // Card Informações
  clienteInfoCard: {
    backgroundColor: '#1A1A2E',
    marginHorizontal: 20,   // ← simétrico, sem marginLeft diferente
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 0.8,
    borderColor: '#BB8526',
    overflow: 'hidden',     // ← sem height fixo — cresce com o conteúdo
  },
  clienteInfoHeader: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#BB852650',
  },
  clienteInfoLabel: {
    fontSize: 10,
    color: '#8B8BA7',
    fontWeight: '500',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  clienteInfoNome: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoRow: {
    flexDirection: 'column',   // label em cima, valor embaixo
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#BB852640',
    gap: 4,
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: 10,
    color: '#8B8BA7',
    fontWeight: '500',
    letterSpacing: 0.8,
  },
  infoValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },

  // Seções
  section: {
    marginTop: 24,                    // ← espaçamento consistente entre seções
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    marginBottom: 12,
    marginTop: 20,
  },

  // Dashboard card
  card: {
    backgroundColor: '#1A1A2E',
    padding: 18,
    borderRadius: 12,
    borderWidth: 0.8,
    borderColor: '#BB8526',
    borderLeftWidth: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 13,
    color: '#8B8BA7',
    fontWeight: '500',
  },
  cardValue: {
    fontSize: 22,
    fontWeight: '600',
  },

  // Botões de ação
  actionsGrid: {
    gap: 12,
  },
  quickActionButton: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    borderWidth: 0.8,
    borderColor: '#BB8526',
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 12,
  },
  quickActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quickActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quickActionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  quickActionArrow: {
    fontSize: 18,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 8,
    gap: 6,
  },
  footerLogo: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    marginBottom: 4,
  },
  footerText: {
    fontSize: 11,
    color: '#555570',
    textAlign: 'center',
  },

  bottomSpacing: {
    height: 32,
  },
})

export default HomeCliente