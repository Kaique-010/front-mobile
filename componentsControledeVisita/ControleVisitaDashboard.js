import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { PieChart, BarChart } from 'react-native-chart-kit'
import { apiGetComContexto } from '../utils/api'
import { showToast } from '../config/toastConfig'

const { width } = Dimensions.get('window')

export default function ControleVisitaDashboard({ navigation }) {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [dashboardData, setDashboardData] = useState({
    totalVisitas: 0,
    visitasHoje: 0,
    visitasSemana: 0,
    visitasMes: 0,
    etapasData: [],
    vendedoresData: [],
    proximasVisitas: [],
    kmPercorrido: 0,
  })

  useEffect(() => {
    carregarDashboard()
  }, [])

  const carregarDashboard = async () => {
    try {
      setLoading(true)
      console.log('Iniciando carregamento do dashboard...')
      
      // Carregar dados do dashboard com tratamento de erro melhorado
      let visitasResponse, estatisticas, proximasVisitas
      
      try {
        visitasResponse = await apiGetComContexto('controledevisitas/controle-visitas/')
        console.log('Resposta das visitas:', visitasResponse)
      } catch (error) {
        console.error('Erro ao carregar visitas:', error.response?.data || error.message)
        visitasResponse = { results: [] }
      }

      try {
        estatisticas = await apiGetComContexto('controledevisitas/controle-visitas/estatisticas/')
      } catch (error) {
        console.log('Endpoint de estatísticas não disponível')
        estatisticas = []
      }

      try {
        proximasVisitas = await apiGetComContexto('controledevisitas/controle-visitas/proximas/')
      } catch (error) {
        console.log('Endpoint de próximas visitas não disponível')
        proximasVisitas = []
      }

      // Garantir que visitas seja sempre um array
      const visitas = Array.isArray(visitasResponse) 
        ? visitasResponse 
        : Array.isArray(visitasResponse?.results) 
          ? visitasResponse.results 
          : []

      console.log('Visitas processadas:', visitas.length)

      // Processar dados das etapas
      const etapasCount = {}
      visitas.forEach(visita => {
        const etapa = visita.etapa_display || 'Não definida'
        etapasCount[etapa] = (etapasCount[etapa] || 0) + 1
      })

      const etapasData = Object.entries(etapasCount).map(([name, population], index) => ({
        name,
        population,
        color: getEtapaColor(index),
        legendFontColor: '#fff',
        legendFontSize: 12,
      }))

      // Processar dados dos vendedores
      const vendedoresCount = {}
      visitas.forEach(visita => {
        const vendedor = visita.vendedor_nome || 'Não definido'
        vendedoresCount[vendedor] = (vendedoresCount[vendedor] || 0) + 1
      })

      const vendedoresData = {
        labels: Object.keys(vendedoresCount).slice(0, 5),
        datasets: [{
          data: Object.values(vendedoresCount).slice(0, 5),
        }],
      }

      // Calcular KM percorrido
      const kmTotal = visitas.reduce((total, visita) => {
        return total + (visita.km_percorrido || 0)
      }, 0)

      // Garantir que proximasVisitas seja um array
      const proximasArray = Array.isArray(proximasVisitas) 
        ? proximasVisitas 
        : Array.isArray(proximasVisitas?.results) 
          ? proximasVisitas.results 
          : []

      setDashboardData({
        totalVisitas: visitas.length,
        visitasHoje: visitas.filter(v => isToday(v.ctrl_data)).length,
        visitasSemana: visitas.filter(v => isThisWeek(v.ctrl_data)).length,
        visitasMes: visitas.filter(v => isThisMonth(v.ctrl_data)).length,
        etapasData,
        vendedoresData,
        proximasVisitas: proximasArray.slice(0, 5),
        kmPercorrido: kmTotal,
      })
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
      showToast('Erro ao carregar dados do dashboard', 'error')
      
      // Definir dados padrão em caso de erro
      setDashboardData({
        totalVisitas: 0,
        visitasHoje: 0,
        visitasSemana: 0,
        visitasMes: 0,
        etapasData: [],
        vendedoresData: { labels: [], datasets: [{ data: [] }] },
        proximasVisitas: [],
        kmPercorrido: 0,
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    carregarDashboard()
  }

  const getEtapaColor = (index) => {
    const colors = ['#e74c3c', '#f39c12', '#f1c40f', '#2ecc71', '#3498db']
    return colors[index % colors.length]
  }

  const isToday = (date) => {
    const today = new Date()
    const visitaDate = new Date(date)
    return visitaDate.toDateString() === today.toDateString()
  }

  const isThisWeek = (date) => {
    const today = new Date()
    const visitaDate = new Date(date)
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()))
    return visitaDate >= weekStart
  }

  const isThisMonth = (date) => {
    const today = new Date()
    const visitaDate = new Date(date)
    return visitaDate.getMonth() === today.getMonth() && 
           visitaDate.getFullYear() === today.getFullYear()
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const chartConfig = {
    backgroundColor: '#1a252f',
    backgroundGradientFrom: '#1a252f',
    backgroundGradientTo: '#2c3e50',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(46, 204, 113, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#2ecc71',
    },
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <MaterialIcons name="analytics" size={48} color="#2ecc71" />
        <Text style={styles.loadingText}>Carregando dashboard...</Text>
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard CRM</Text>
        <Text style={styles.subtitle}>Controle de Visitas</Text>
      </View>

      {/* Cards de Resumo */}
      <View style={styles.cardsContainer}>
        <View style={styles.cardRow}>
          <View style={[styles.card, styles.cardPrimary]}>
            <MaterialIcons name="visibility" size={24} color="#fff" />
            <Text style={styles.cardNumber}>{dashboardData.totalVisitas}</Text>
            <Text style={styles.cardLabel}>Total de Visitas</Text>
          </View>
          <View style={[styles.card, styles.cardSuccess]}>
            <MaterialIcons name="today" size={24} color="#fff" />
            <Text style={styles.cardNumber}>{dashboardData.visitasHoje}</Text>
            <Text style={styles.cardLabel}>Hoje</Text>
          </View>
        </View>

        <View style={styles.cardRow}>
          <View style={[styles.card, styles.cardWarning]}>
            <MaterialIcons name="date-range" size={24} color="#fff" />
            <Text style={styles.cardNumber}>{dashboardData.visitasSemana}</Text>
            <Text style={styles.cardLabel}>Esta Semana</Text>
          </View>
          <View style={[styles.card, styles.cardInfo]}>
            <MaterialIcons name="calendar-month" size={24} color="#fff" />
            <Text style={styles.cardNumber}>{dashboardData.visitasMes}</Text>
            <Text style={styles.cardLabel}>Este Mês</Text>
          </View>
        </View>

        <View style={styles.cardRow}>
          <View style={[styles.card, styles.cardDanger, { flex: 1 }]}>
            <MaterialIcons name="speed" size={24} color="#fff" />
            <Text style={styles.cardNumber}>{(dashboardData.kmPercorrido || 0).toFixed(0)} km</Text>
            <Text style={styles.cardLabel}>KM Percorrido</Text>
          </View>
        </View>
      </View>

      {/* Gráfico de Etapas */}
      {dashboardData.etapasData.length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Visitas por Etapa</Text>
          <PieChart
            data={dashboardData.etapasData}
            width={width - 32}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>
      )}

      {/* Gráfico de Vendedores */}
      {dashboardData.vendedoresData.labels?.length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Top 5 Vendedores</Text>
          <BarChart
            data={dashboardData.vendedoresData}
            width={width - 32}
            height={220}
            chartConfig={chartConfig}
            verticalLabelRotation={30}
            showValuesOnTopOfBars
          />
        </View>
      )}

      {/* Próximas Visitas */}
      <View style={styles.proximasContainer}>
        <View style={styles.proximasHeader}>
          <Text style={styles.proximasTitle}>Próximas Visitas</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('ControleVisitas')}
            style={styles.verTodosButton}
          >
            <Text style={styles.verTodosText}>Ver Todas</Text>
            <MaterialIcons name="arrow-forward" size={16} color="#2ecc71" />
          </TouchableOpacity>
        </View>

        {dashboardData.proximasVisitas.length > 0 ? (
          dashboardData.proximasVisitas.map((visita, index) => (
            <TouchableOpacity
              key={index}
              style={styles.proximaVisitaCard}
              onPress={() => navigation.navigate('ControleVisitaDetalhes', { 
                visitaId: visita.ctrl_id 
              })}
            >
              <View style={styles.proximaVisitaInfo}>
                <Text style={styles.proximaVisitaCliente}>
                  {visita.cliente_nome}
                </Text>
                <Text style={styles.proximaVisitaData}>
                  {formatDate(visita.ctrl_prox_visi)}
                </Text>
                <Text style={styles.proximaVisitaVendedor}>
                  {visita.vendedor_nome}
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyProximas}>
            <MaterialIcons name="event-available" size={48} color="#666" />
            <Text style={styles.emptyProximasText}>
              Nenhuma visita agendada
            </Text>
          </View>
        )}
      </View>

      {/* Botões de Ação */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.actionPrimary]}
          onPress={() => navigation.navigate('ControleVisitaForm')}
        >
          <MaterialIcons name="add" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Nova Visita</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.actionSecondary]}
          onPress={() => navigation.navigate('ControleVisitas')}
        >
          <MaterialIcons name="list" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Ver Todas</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1421',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  cardsContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  cardRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  cardPrimary: {
    backgroundColor: '#3498db',
  },
  cardSuccess: {
    backgroundColor: '#2ecc71',
  },
  cardWarning: {
    backgroundColor: '#f39c12',
  },
  cardInfo: {
    backgroundColor: '#9b59b6',
  },
  cardDanger: {
    backgroundColor: '#e74c3c',
  },
  cardNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 8,
  },
  cardLabel: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: '#1a252f',
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  proximasContainer: {
    margin: 16,
    backgroundColor: '#1a252f',
    borderRadius: 12,
    padding: 16,
  },
  proximasHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  proximasTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  verTodosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verTodosText: {
    color: '#2ecc71',
    fontSize: 14,
    fontWeight: '600',
  },
  proximaVisitaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2c3e50',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  proximaVisitaInfo: {
    flex: 1,
  },
  proximaVisitaCliente: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  proximaVisitaData: {
    fontSize: 14,
    color: '#2ecc71',
    marginBottom: 2,
  },
  proximaVisitaVendedor: {
    fontSize: 12,
    color: '#666',
  },
  emptyProximas: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyProximasText: {
    color: '#666',
    fontSize: 16,
    marginTop: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionPrimary: {
    backgroundColor: '#2ecc71',
  },
  actionSecondary: {
    backgroundColor: '#3498db',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})