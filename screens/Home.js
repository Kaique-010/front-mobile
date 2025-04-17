import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import { BarChart, PieChart } from 'react-native-chart-kit'

const screenWidth = Dimensions.get('window').width

export default function Home() {
  const [user, setUser] = useState(null)
  const [empresaNome, setEmpresaNome] = useState(null)
  const [filialNome, setFilialNome] = useState(null)
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user')
        const storedEmpresa = await AsyncStorage.getItem('empresaNome')
        const storedFilialNome = await AsyncStorage.getItem('filialNome')

        if (storedUser) setUser(JSON.parse(storedUser))
        if (storedEmpresa) setEmpresaNome(storedEmpresa)
        if (storedFilialNome) setFilialNome(storedFilialNome)

        const response = await axios.get(
          'http://192.168.10.35:8000/api/dashboard/'
        )
        setDashboardData(response.data)
      } catch (err) {
        console.error('Erro ao carregar dados:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00bfff" />
      </View>
    )
  }

  const chartConfig = {
    backgroundGradientFrom: '#121212',
    backgroundGradientTo: '#121212',
    color: (opacity = 1) => `rgba(0, 191, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
  }

  const saldosData = {
    labels: dashboardData?.saldos_produto.map((item) => item.nome).slice(0, 6),
    datasets: [
      {
        data: dashboardData?.saldos_produto
          .map((item) => Number(item.total))
          .slice(0, 6),
      },
    ],
  }

  const pedidosData = dashboardData?.pedidos_por_cliente.map((item, index) => ({
    name: item.cliente,
    population: Number(item.total),
    color: ['#00bfff', '#1e90ff', '#4169e1', '#4682b4', '#5f9ea0'][index % 5],
    legendFontColor: '#fff',
    legendFontSize: 14,
  }))

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#121212' }}
      contentContainerStyle={styles.container}>
      <Text style={styles.welcome}>
        👋 Bem-vindo, {user?.username || 'Usuário'}!
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Empresa:</Text>
        <Text style={styles.value}>{empresaNome || 'Não selecionada'}</Text>
        <Text style={styles.label}>Filial:</Text>
        <Text style={styles.value}>{filialNome || 'Não selecionada'}</Text>
      </View>

      <Text style={styles.chartTitle}>Saldos de Produtos</Text>
      <BarChart
        data={saldosData}
        width={screenWidth - 32}
        height={220}
        chartConfig={chartConfig}
        verticalLabelRotation={30}
        style={styles.chart}
      />

      <Text style={styles.chartTitle}>Pedidos por Cliente</Text>
      <PieChart
        data={pedidosData}
        width={screenWidth - 32}
        height={220}
        chartConfig={chartConfig}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        style={styles.chart}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcome: {
    fontSize: 22,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    color: '#00bfff',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  chartTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  chart: {
    marginBottom: 20,
    borderRadius: 16,
  },
})
