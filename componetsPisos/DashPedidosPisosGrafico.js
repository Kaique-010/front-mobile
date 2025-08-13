import React, { useState, useMemo } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { BarChart, PieChart } from 'react-native-chart-kit'

import styles from '../stylesDash/PedidosVendaStyles'

const { width: screenWidth } = Dimensions.get('window')

export default function DashPedidosPisosGrafico({ route, navigation }) {
  const { dados = [], resumo = {}, filtros = {} } = route.params || {}
  const [tipoGrafico, setTipoGrafico] = useState('barras')

  const dadosGraficoBarras = useMemo(() => {
    const vendedores = Object.entries(resumo.totalPorVendedor || {})
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)

    return {
      labels: vendedores.map(([nome]) =>
        nome.length > 8 ? nome.substring(0, 8) + '...' : nome
      ),
      datasets: [
        {
          data: vendedores.map(([, valor]) => valor),
        },
      ],
    }
  }, [resumo.totalPorVendedor])

  const dadosGraficoPizza = useMemo(() => {
    const vendedores = Object.entries(resumo.totalPorVendedor || {})
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)

    const cores = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']

    return vendedores.map(([nome, valor], index) => ({
      name: nome.length > 12 ? nome.substring(0, 12) + '...' : nome,
      population: valor,
      color: cores[index % cores.length],
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    }))
  }, [resumo.totalPorVendedor])

  const chartConfig = {
    backgroundColor: '#1a1a1a',
    backgroundGradientFrom: '#1a1a1a',
    backgroundGradientTo: '#2a2a2a',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(26, 183, 223, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#1ab7df',
    },
  }

  const renderGrafico = () => {
    if (tipoGrafico === 'barras') {
      return (
        <BarChart
          data={dadosGraficoBarras}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          verticalLabelRotation={30}
          showValuesOnTopOfBars
          fromZero
        />
      )
    } else {
      return (
        <PieChart
          data={dadosGraficoPizza}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      )
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.botaoVoltar}
          onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>📊 Gráficos - Pisos</Text>
          <Text style={styles.headerSubtitle}>Análise Visual de Vendas</Text>
        </View>
      </View>

      {/* Filtros aplicados */}
      <View style={styles.filtrosAplicados}>
        <Text style={styles.filtrosTitle}>Filtros Aplicados:</Text>
        <Text style={styles.filtroTexto}>
          Período: {filtros.dataInicio} - {filtros.dataFim}
        </Text>
        {filtros.vendedor && (
          <Text style={styles.filtroTexto}>Vendedor: {filtros.vendedor}</Text>
        )}
        {filtros.cliente && (
          <Text style={styles.filtroTexto}>Cliente: {filtros.cliente}</Text>
        )}
        {filtros.item && (
          <Text style={styles.filtroTexto}>Item: {filtros.item}</Text>
        )}
      </View>

      {/* Seletor de tipo de gráfico */}
      <View style={styles.tipoGraficoContainer}>
        <TouchableOpacity
          style={[
            styles.botaoTipoGrafico,
            tipoGrafico === 'barras' && styles.botaoTipoGraficoAtivo,
          ]}
          onPress={() => setTipoGrafico('barras')}>
          <Text
            style={[
              styles.botaoTipoGraficoTexto,
              tipoGrafico === 'barras' && styles.botaoTipoGraficoTextoAtivo,
            ]}>
            Barras
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.botaoTipoGrafico,
            tipoGrafico === 'pizza' && styles.botaoTipoGraficoAtivo,
          ]}
          onPress={() => setTipoGrafico('pizza')}>
          <Text
            style={[
              styles.botaoTipoGraficoTexto,
              tipoGrafico === 'pizza' && styles.botaoTipoGraficoTextoAtivo,
            ]}>
            Pizza
          </Text>
        </TouchableOpacity>
      </View>

      {/* Gráfico */}
      <View style={styles.graficoContainer}>{renderGrafico()}</View>

      {/* Resumo estatístico */}
      <View style={styles.resumoEstatistico}>
        <Text style={styles.resumoTitle}>Resumo Estatístico</Text>
        <View style={styles.estatisticaItem}>
          <Text style={styles.estatisticaLabel}>Total de Pedidos:</Text>
          <Text style={styles.estatisticaValor}>
            {resumo.quantidadePedidos}
          </Text>
        </View>
        <View style={styles.estatisticaItem}>
          <Text style={styles.estatisticaLabel}>Total de Itens:</Text>
          <Text style={styles.estatisticaValor}>
            {resumo.quantidadeItens.toLocaleString('pt-BR')}
          </Text>
        </View>
        <View style={styles.estatisticaItem}>
          <Text style={styles.estatisticaLabel}>Valor Total:</Text>
          <Text style={styles.estatisticaValor}>
            {resumo.totalGeral.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </Text>
        </View>
        <View style={styles.estatisticaItem}>
          <Text style={styles.estatisticaLabel}>Ticket Médio:</Text>
          <Text style={styles.estatisticaValor}>
            {resumo.ticketMedio.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}
