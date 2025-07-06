import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { BarChart, PieChart, LineChart } from 'react-native-chart-kit'
import styles from '../stylesDash/PedidosVendaGraficoStyles'

const { width } = Dimensions.get('window')

export default function DashPedidosVendaGrafico({ route, navigation }) {
  const { dados, resumo, filtros } = route.params
  const [tipoGrafico, setTipoGrafico] = useState('vendedores')

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#36a2eb',
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
    },
    formatYLabel: (value) => {
      if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + 'M'
      } else if (value >= 1000) {
        return (value / 1000).toFixed(0) + 'K'
      }
      return value.toString()
    },
  }

  const gerarDadosVendedores = () => {
    const vendedoresData = Object.entries(resumo.totalPorVendedor)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)

    return {
      labels: vendedoresData.map(([nome]) =>
        nome.length > 8 ? nome.substring(0, 8) + '...' : nome
      ),
      datasets: [
        {
          data: vendedoresData.map(([, valor]) => valor),
        },
      ],
    }
  }

  const gerarDadosPorMes = () => {
    const dadosPorMes = {}

    dados.forEach((item) => {
      const data = new Date(item.data_pedido)
      const mesAno = `${String(data.getMonth() + 1).padStart(
        2,
        '0'
      )}/${data.getFullYear()}`

      if (!dadosPorMes[mesAno]) {
        dadosPorMes[mesAno] = 0
      }
      dadosPorMes[mesAno] += parseFloat(item.valor_total || 0)
    })

    const mesesOrdenados = Object.entries(dadosPorMes)
      .sort(([a], [b]) => {
        const [mesA, anoA] = a.split('/')
        const [mesB, anoB] = b.split('/')
        return new Date(anoA, mesA - 1) - new Date(anoB, mesB - 1)
      })
      .slice(-6)

    return {
      labels: mesesOrdenados.map(([mes]) => mes),
      datasets: [
        {
          data: mesesOrdenados.map(([, valor]) => valor),
          color: (opacity = 1) => `rgba(46, 204, 113, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    }
  }

  const gerarDadosPizza = () => {
    const cores = [
      '#FF6384',
      '#36A2EB',
      '#FFCE56',
      '#4BC0C0',
      '#9966FF',
      '#FF9F40',
    ]

    return Object.entries(resumo.totalPorVendedor)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([nome, valor], index) => ({
        name: nome.length > 12 ? nome.substring(0, 12) + '...' : nome,
        population: valor,
        color: cores[index % cores.length],
        legendFontColor: '#7F7F7F',
        legendFontSize: 12,
      }))
  }

  const renderGrafico = () => {
    switch (tipoGrafico) {
      case 'vendedores':
        return (
          <BarChart
            data={gerarDadosVendedores()}
            width={width - 5}
            height={250}
            chartConfig={chartConfig}
            style={styles.grafico}
            verticalLabelRotation={10}
            showValuesOnTopOfBars={true}
            showValues={true}
            valueColor={chartConfig.color}
            barPercentage={0.5}
            decimalPlaces={0}
            formatYLabel={chartConfig.formatYLabel}
            propsForBackgroundLines={chartConfig.propsForBackgroundLines}
            propsForLabels={{
              fontSize: 10,
            }}
            propsForValues={{
              fontSize: 10,
            }}
            fromZero
          />
        )
      case 'mensal':
        return (
          <LineChart
            data={gerarDadosPorMes()}
            width={width - 80}
            height={250}
            chartConfig={chartConfig}
            style={styles.grafico}
            bezier
            fromZero
          />
        )
      case 'pizza':
        return (
          <PieChart
            data={gerarDadosPizza()}
            width={width - 80}
            height={250}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="30"
            style={styles.grafico}
          />
        )
      default:
        return null
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
        <View style={styles.headerTextos}>
          <Text style={styles.headerTitle}>📈 Gráficos de Vendas</Text>
          <Text style={styles.headerSubtitle}>Análise Visual</Text>
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
      <View style={styles.seletorGrafico}>
        <TouchableOpacity
          style={[
            styles.botaoTipoGrafico,
            tipoGrafico === 'vendedores' && styles.botaoTipoGraficoAtivo,
          ]}
          onPress={() => setTipoGrafico('vendedores')}>
          <MaterialIcons
            name="bar-chart"
            size={20}
            color={tipoGrafico === 'vendedores' ? '#fff' : '#666'}
          />
          <Text
            style={[
              styles.botaoTipoGraficoTexto,
              tipoGrafico === 'vendedores' && styles.botaoTipoGraficoTextoAtivo,
            ]}>
            Vendedores
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.botaoTipoGrafico,
            tipoGrafico === 'mensal' && styles.botaoTipoGraficoAtivo,
          ]}
          onPress={() => setTipoGrafico('mensal')}>
          <MaterialIcons
            name="show-chart"
            size={20}
            color={tipoGrafico === 'mensal' ? '#fff' : '#666'}
          />
          <Text
            style={[
              styles.botaoTipoGraficoTexto,
              tipoGrafico === 'mensal' && styles.botaoTipoGraficoTextoAtivo,
            ]}>
            Mensal
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.botaoTipoGrafico,
            tipoGrafico === 'pizza' && styles.botaoTipoGraficoAtivo,
          ]}
          onPress={() => setTipoGrafico('pizza')}>
          <MaterialIcons
            name="pie-chart"
            size={20}
            color={tipoGrafico === 'pizza' ? '#fff' : '#666'}
          />
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
            {(resumo.totalGeral / resumo.quantidadePedidos || 0).toLocaleString(
              'pt-BR',
              {
                style: 'currency',
                currency: 'BRL',
              }
            )}
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}
