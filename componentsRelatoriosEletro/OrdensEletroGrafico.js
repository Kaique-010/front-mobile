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
import styles from '../stylesDash/OrdemServicoGraficoStyles'

const { width } = Dimensions.get('window')

export default function OrdensEletroGrafico({ route, navigation }) {
  const { dados, resumo, filtros } = route.params
  const [tipoGrafico, setTipoGrafico] = useState('vendedor')

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(44, 62, 80, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#3498db',
    },
  }

  const gerarDadosVendedor = () => {
    if (!resumo.totalResponsavel) {
      return { labels: [], datasets: [{ data: [] }] }
    }
    
    const vendedores = Object.entries(resumo.totalResponsavel)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)

    return {
      labels: vendedores.map(([nome]) =>
        nome.length > 12 ? nome.substring(0, 12) + '...' : nome
      ),
      datasets: [
        {
          data: vendedores.map(([, valor]) => valor),
        },
      ],
    }
  }

  const gerarDadosStatus = () => {
    if (!resumo.totalPorStatus) {
      return []
    }
    
    const cores = [
      '#f39c12', // ABERTA
      '#3498db', // EM ANDAMENTO
      '#27ae60', // FINALIZADA
      '#e74c3c', // CANCELADA
      '#95a5a6', // PAUSADA
    ]

    return Object.entries(resumo.totalPorStatus).map(
      ([status, quantidade], index) => ({
        name: status,
        population: quantidade,
        color: cores[index % cores.length],
        legendFontColor: '#7F7F7F',
        legendFontSize: 12,
      })
    )
  }

  const gerarDadosTemporais = () => {
    // Agrupa por data
    const dadosPorData = {}
    dados.forEach((item) => {
      const data = new Date(item.data_abertura).toLocaleDateString('pt-BR')
      if (!dadosPorData[data]) {
        dadosPorData[data] = { quantidade: 0, valor: 0 }
      }
      dadosPorData[data].quantidade += 1
      dadosPorData[data].valor += parseFloat(item.total_os || 0)
    })

    const datasOrdenadas = Object.keys(dadosPorData).sort((a, b) => {
      const [diaA, mesA, anoA] = a.split('/')
      const [diaB, mesB, anoB] = b.split('/')
      return new Date(anoA, mesA - 1, diaA) - new Date(anoB, mesB - 1, diaB)
    })

    return {
      labels: datasOrdenadas.slice(-7).map((data) => {
        const [dia, mes] = data.split('/')
        return `${dia}/${mes}`
      }),
      datasets: [
        {
          data: datasOrdenadas
            .slice(-7)
            .map((data) => dadosPorData[data].quantidade),
          strokeWidth: 2,
        },
      ],
    }
  }

  const renderGrafico = () => {
    switch (tipoGrafico) {
      case 'vendedor':
        const dadosVendedor = gerarDadosVendedor()
        if (dadosVendedor.labels.length === 0) {
          return <Text style={styles.semDados}>Sem dados para exibir</Text>
        }
        return (
          <BarChart
            data={dadosVendedor}
            width={width - 40}
            height={220}
            chartConfig={chartConfig}
            style={styles.grafico}
            verticalLabelRotation={30}
          />
        )

      case 'status':
        const dadosStatus = gerarDadosStatus()
        if (dadosStatus.length === 0) {
          return <Text style={styles.semDados}>Sem dados para exibir</Text>
        }
        return (
          <PieChart
            data={dadosStatus}
            width={width - 40}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            style={styles.grafico}
          />
        )

      case 'temporal':
        const dadosTemporais = gerarDadosTemporais()
        if (dadosTemporais.labels.length === 0) {
          return <Text style={styles.semDados}>Sem dados para exibir</Text>
        }
        return (
          <LineChart
            data={dadosTemporais}
            width={width - 40}
            height={220}
            chartConfig={chartConfig}
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
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>📊 Gráficos - OS</Text>
          <Text style={styles.headerSubtitle}>Análise Visual</Text>
        </View>
      </View>

      {/* Filtros aplicados */}
      <View style={styles.filtrosAplicados}>
        <Text style={styles.filtrosTitle}>Filtros Aplicados:</Text>
        <Text style={styles.filtroTexto}>
          📅 {filtros.dataInicio} - {filtros.dataFim}
        </Text>
        {filtros.numeroOs && (
          <Text style={styles.filtroTexto}>🔢 OS: {filtros.numeroOs}</Text>
        )}
        {filtros.cliente && (
          <Text style={styles.filtroTexto}>👤 Cliente: {filtros.cliente}</Text>
        )}
        {filtros.responsavel && (
          <Text style={styles.filtroTexto}>
            💼 Responsável: {filtros.responsavel}
          </Text>
        )}
        {filtros.setor && (
          <Text style={styles.filtroTexto}>🏢 Setor: {filtros.setor}</Text>
        )}
        {filtros.status && (
          <Text style={styles.filtroTexto}>🚦 Status: {filtros.status}</Text>
        )}
      </View>

      {/* Seletor de tipo de gráfico */}
      <View style={styles.seletorContainer}>
        <TouchableOpacity
          style={[
            styles.botaoSeletor,
            tipoGrafico === 'vendedor' && styles.botaoSeletorAtivo,
          ]}
          onPress={() => setTipoGrafico('vendedor')}>
          <Text
            style={[
              styles.textoSeletor,
              tipoGrafico === 'vendedor' && styles.textoSeletorAtivo,
            ]}>
            Por Responsável
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.botaoSeletor,
            tipoGrafico === 'status' && styles.botaoSeletorAtivo,
          ]}
          onPress={() => setTipoGrafico('status')}>
          <Text
            style={[
              styles.textoSeletor,
              tipoGrafico === 'status' && styles.textoSeletorAtivo,
            ]}>
            Por Status
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.botaoSeletor,
            tipoGrafico === 'temporal' && styles.botaoSeletorAtivo,
          ]}
          onPress={() => setTipoGrafico('temporal')}>
          <Text
            style={[
              styles.textoSeletor,
              tipoGrafico === 'temporal' && styles.textoSeletorAtivo,
            ]}>
            Temporal
          </Text>
        </TouchableOpacity>
      </View>

      {/* Gráfico */}
      <View style={styles.graficoContainer}>{renderGrafico()}</View>

      {/* Resumo estatístico */}
      <View style={styles.resumoEstatistico}>
        <Text style={styles.resumoTitle}>📈 Resumo Estatístico</Text>
        <View style={styles.estatisticaItem}>
          <Text style={styles.estatisticaLabel}>Total de Ordens:</Text>
          <Text style={styles.estatisticaValor}>{resumo.quantidadeOs}</Text>
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
