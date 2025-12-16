import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, StyleSheet } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { useRoute, useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { BarChart, LineChart } from 'react-native-chart-kit'
import { formatCurrency } from '../utils/formatters'

export default function DashboardFluxo() {
  const route = useRoute()
  const navigation = useNavigation()
  const { mesInicial, mesFinal } = route.params
  
  const [dados, setDados] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    carregarDados()
  }, [])
  
  const carregarDados = async () => {
    try {
      const dadosString = await AsyncStorage.getItem('dashboardFluxoData')
      if (dadosString) {
        const dadosCarregados = JSON.parse(dadosString)
        setDados(dadosCarregados)
      }
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const screenData = Dimensions.get('window')
  const chartWidth = screenData.width - 32

  // Preparar dados para os gráficos
  const prepararDadosGraficos = () => {
    if (!dados || !dados.centros_custo) return null
    
    const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    
    // Agrupar dados por mês
    const dadosPorMes = {}
    dados.centros_custo.forEach(item => {
      if (!dadosPorMes[item.mes_num]) {
        dadosPorMes[item.mes_num] = {
          mes: mesesNomes[item.mes_num - 1],
          orcado: 0,
          realizado: 0
        }
      }
      dadosPorMes[item.mes_num].orcado += parseFloat(item.orcado || 0)
      dadosPorMes[item.mes_num].realizado += parseFloat(item.realizado || 0)
    })
    
    return dadosPorMes
  }

  const prepararDadosOrcadoVsRealizado = () => {
    const dadosPorMes = prepararDadosGraficos()
    if (!dadosPorMes) return null
    
    const mesesOrdenados = Object.keys(dadosPorMes).sort((a, b) => a - b)
    
    return {
      labels: mesesOrdenados.map(mes => dadosPorMes[mes].mes),
      datasets: [
        {
          data: mesesOrdenados.map(mes => dadosPorMes[mes].orcado),
          color: () => '#3b82f6'
        },
        {
          data: mesesOrdenados.map(mes => dadosPorMes[mes].realizado),
          color: () => '#10b981'
        }
      ]
    }
  }

  const prepararDadosVariacao = () => {
    const dadosPorMes = prepararDadosGraficos()
    if (!dadosPorMes) return null
    
    const mesesOrdenados = Object.keys(dadosPorMes).sort((a, b) => a - b)
    
    return {
      labels: mesesOrdenados.map(mes => dadosPorMes[mes].mes),
      datasets: [{
        data: mesesOrdenados.map(mes => {
          const orcado = dadosPorMes[mes].orcado
          const realizado = dadosPorMes[mes].realizado
          return orcado > 0 ? ((realizado - orcado) / orcado) * 100 : 0
        }),
        color: () => '#8b5cf6'
      }]
    }
  }

  const prepararDadosTop10 = () => {
    if (!dados?.centros_custo) return null
    
    // Calcular diferenças e pegar os top 10
    const diferencas = dados.centros_custo
      .filter(item => item.tipo === 'A') // Apenas contas analíticas
      .map(item => ({
        nome: item.nome.substring(0, 12) + '...',
        diferenca: Math.abs(parseFloat(item.diferenca || 0))
      }))
      .sort((a, b) => b.diferenca - a.diferenca)
      .slice(0, 10)
    
    return {
      labels: diferencas.map(item => item.nome),
      datasets: [{
        data: diferencas.map(item => item.diferenca),
        color: () => '#ef4444'
      }]
    }
  }

  // Preparar dados dos gráficos
  const dadosOrcadoVsRealizado = prepararDadosOrcadoVsRealizado()
  const dadosVariacao = prepararDadosVariacao()
  const dadosTop10 = prepararDadosTop10()
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Carregando dashboard...</Text>
      </View>
    )
  }
  
  if (!dados) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>Erro ao carregar dados do dashboard</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const formatarValor = (valor) => {
    return formatCurrency(valor)
  }

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#ffa726'
    },
    formatYLabel: formatarValor
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#f0dbadff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dashboard - Fluxo de Caixa</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.periodInfo}>
        <Text style={styles.periodText}>
          Período: Mês {mesInicial} ao {mesFinal}
        </Text>
      </View>

      {/* Gráfico 1: Orçado vs Realizado */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Orçado vs Realizado por Mês</Text>
        {dadosOrcadoVsRealizado ? (
          <BarChart
            data={dadosOrcadoVsRealizado}
            width={chartWidth}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
            showValuesOnTopOfBars={true}
            fromZero={true}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <MaterialIcons name="bar-chart" size={48} color="#bdc3c7" />
            <Text style={styles.noDataText}>Dados não disponíveis</Text>
          </View>
        )}
      </View>

      {/* Gráfico 2: Variação Orçamentária */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Variação Orçamentária (%)</Text>
        {dadosVariacao ? (
          <LineChart
            data={dadosVariacao}
            width={chartWidth}
            height={220}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(147, 51, 234, ${opacity})`,
              formatYLabel: (value) => `${parseFloat(value).toFixed(1)}%`
            }}
            style={styles.chart}
            bezier
          />
        ) : (
          <View style={styles.noDataContainer}>
            <MaterialIcons name="trending-up" size={48} color="#bdc3c7" />
            <Text style={styles.noDataText}>Dados não disponíveis</Text>
          </View>
        )}
      </View>

      {/* Gráfico 3: Top 10 - Maior Diferença */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Top 10 - Maior Diferença</Text>
        {dadosTop10 ? (
          <BarChart
            data={dadosTop10}
            width={chartWidth}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
            showValuesOnTopOfBars={true}
            fromZero={true}
            withCustomBarColorFromData={true}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <MaterialIcons name="leaderboard" size={48} color="#bdc3c7" />
            <Text style={styles.noDataText}>Dados não disponíveis</Text>
          </View>
        )}
      </View>

      {/* Resumo dos dados */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Resumo Executivo</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Orçado</Text>
            <Text style={styles.summaryValue}>
              {formatarValor(dados?.orcado_total || 0)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Realizado</Text>
            <Text style={styles.summaryValue}>
              {formatarValor(dados?.realizado_total || 0)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Diferença</Text>
            <Text style={[
              styles.summaryValue,
              { color: (dados?.diferenca_total || 0) >= 0 ? '#10b981' : '#ef4444' }
            ]}>
              {formatarValor(dados?.diferenca_total || 0)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>% Execução</Text>
            <Text style={styles.summaryValue}>
              {(dados?.perc_execucao_total || 0).toFixed(1)}%
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 20
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  backButton: {
    marginTop: 20,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginLeft: 12
  },
  headerSpacer: {
    width: 40
  },
  periodInfo: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center'
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151'
  },
  scrollContainer: {
    padding: 16
  },
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  chartContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center'
  },
  chart: {
    borderRadius: 8
  },
  noDataContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center'
  },
  noDataText: {
    fontSize: 16,
    color: '#64748b'
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  summaryContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center'
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  summaryItem: {
    width: '48%',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b'
  }
})