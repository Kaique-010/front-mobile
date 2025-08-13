import React, { useState, useEffect, useMemo } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { useContextoApp } from '../hooks/useContextoApp'
import { apiGetComContexto } from '../utils/api'
import { formatarData, formatarDataAPI } from '../utils/formatters'

import styles from '../stylesDash/PedidosVendaStyles'

export default function DashPedidosPisos({ navigation }) {
  const { empresaId, filialId } = useContextoApp()
  const [dados, setDados] = useState([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState(null)
  const [dataInicio, setDataInicio] = useState(new Date())
  const [dataFim, setDataFim] = useState(new Date())
  const [buscaVendedor, setBuscaVendedor] = useState('')
  const [buscaCliente, setBuscaCliente] = useState('')
  const [buscaItem, setBuscaItem] = useState('')

  useEffect(() => {
    if (empresaId && filialId) {
      buscarDados()
    }
  }, [empresaId, filialId])

  const buscarDados = async () => {
    setLoading(true)
    setErro(null)
    try {
      const params = {
        page_size: 10000,
        limit: 10000,
        empresa: empresaId,
        filial: filialId,
      }

      if (dataInicio && dataFim) {
        const inicio = new Date(dataInicio)
        const fim = new Date(dataFim)

        if (inicio <= fim) {
          params.data_inicial = formatarDataAPI(inicio)
          params.data_final = formatarDataAPI(fim)
        } else {
          params.data_inicial = formatarDataAPI(fim)
          params.data_final = formatarDataAPI(inicio)
        }
      }

      if (buscaVendedor) params.nome_vendedor = buscaVendedor
      if (buscaCliente) params.nome_cliente = buscaCliente

      const res = await apiGetComContexto('pisos/pedidos-pisos/', params)

      let dadosProcessados = res.results || res
      if (!Array.isArray(dadosProcessados)) {
        dadosProcessados = []
      }

      setDados(dadosProcessados)
    } catch (e) {
      console.error('Erro detalhado:', e)
      const errorMessage =
        e.response?.data?.detail || e.message || 'Erro desconhecido'
      setErro(`Erro ao buscar dados: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const navegarParaGrafico = () => {
    navigation.navigate('DashPedidosPisosGrafico', {
      dados: filtrarDados,
      resumo: resumo,
      filtros: {
        dataInicio: formatarData(dataInicio),
        dataFim: formatarData(dataFim),
        vendedor: buscaVendedor,
        cliente: buscaCliente,
        item: buscaItem,
      },
    })
  }

  const filtrarDados = useMemo(() => {
    return dados.filter((item) => {
      const matchItem = buscaItem
        ? item.itens?.some((i) =>
            i.produto_nome?.toLowerCase().includes(buscaItem.toLowerCase())
          )
        : true
      return matchItem
    })
  }, [dados, buscaItem])

  const resumo = useMemo(() => {
    const totalGeral = filtrarDados.reduce(
      (acc, item) => acc + parseFloat(item.valor_total || 0),
      0
    )
    const quantidadePedidos = filtrarDados.length
    const quantidadeItens = filtrarDados.reduce(
      (acc, item) => acc + parseInt(item.quantidade_total || 0),
      0
    )
    const ticketMedio =
      quantidadePedidos > 0 ? totalGeral / quantidadePedidos : 0

    const totalPorVendedor = filtrarDados.reduce((acc, item) => {
      const vendedor = item.nome_vendedor || 'Sem vendedor'
      acc[vendedor] = (acc[vendedor] || 0) + parseFloat(item.valor_total || 0)
      return acc
    }, {})

    return {
      totalGeral: totalGeral || 0,
      quantidadePedidos: quantidadePedidos || 0,
      quantidadeItens: quantidadeItens || 0,
      ticketMedio: ticketMedio || 0,
      totalPorVendedor: totalPorVendedor || {},
    }
  }, [filtrarDados])

  // POR:
  const ResumoCard = ({ titulo, valor, icone, cor }) => {
    const formatarValor = () => {
      const valorNumerico = Number(valor) || 0

      if (titulo === 'Ticket Médio' || titulo.includes('Total')) {
        return valorNumerico.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        })
      }

      return valorNumerico.toLocaleString('pt-BR')
    }

    return (
      <View style={styles.resumoCard}>
        <View style={styles.resumoIcone}>
          <MaterialIcons name={icone} size={24} color={cor} />
        </View>
        <View style={styles.resumoTextos}>
          <Text style={styles.resumoTitulo}>{titulo}</Text>
          <Text style={styles.resumoValor}>{formatarValor()}</Text>
        </View>
      </View>
    )
  }

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemNumero}>Pedido #{item.numero_pedido}</Text>
        <Text style={styles.itemData}>{formatarData(item.data_pedido)}</Text>
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemCliente}>
          {item.codigo_cliente} - {item.nome_cliente}
        </Text>
        <Text style={styles.itemVendedor}>Vendedor: {item.nome_vendedor}</Text>
        <View style={styles.itemFooter}>
          <View style={styles.itemQuantidade}>
            <Text style={styles.itemQuantidadeLabel}>Qtd:</Text>
            <Text style={styles.itemQuantidadeValor}>
              {item.quantidade_total}
            </Text>
          </View>
          <Text style={styles.itemValor}>
            {parseFloat(item.valor_total || 0).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </Text>
        </View>
      </View>
    </View>
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Carregando pedidos de pisos...</Text>
      </View>
    )
  }

  if (erro) {
    return (
      <View style={styles.erroContainer}>
        <MaterialIcons name="error-outline" size={48} color="#e74c3c" />
        <Text style={styles.erroTexto}>{erro}</Text>
        <TouchableOpacity
          onPress={buscarDados}
          style={styles.botaoTentarNovamente}>
          <MaterialIcons
            name="refresh"
            size={20}
            color="#fff"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.botaoTentarNovamenteTexto}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>🏠 Pedidos de Pisos</Text>
          <Text style={styles.headerSubtitle}>Análise de Vendas de Pisos</Text>
        </View>
        <TouchableOpacity
          style={styles.botaoGrafico}
          onPress={navegarParaGrafico}>
          <MaterialIcons name="bar-chart" size={20} color="#fff" />
          <Text style={styles.botaoGraficoTexto}>Gráficos</Text>
        </TouchableOpacity>
      </View>

      {/* Filtros */}
      <View style={styles.filtrosContainer}>
        <View style={styles.filtrosData}>
          <View style={styles.inputDataContainer}>
            <Text style={styles.labelData}>Data Início:</Text>
            <TextInput
              style={styles.inputData}
              value={formatarData(dataInicio)}
              onChangeText={(text) => {
                const data = new Date(text.split('/').reverse().join('-'))
                if (!isNaN(data)) setDataInicio(data)
              }}
              placeholder="DD/MM/AAAA"
            />
          </View>
          <View style={styles.inputDataContainer}>
            <Text style={styles.labelData}>Data Fim:</Text>
            <TextInput
              style={styles.inputData}
              value={formatarData(dataFim)}
              onChangeText={(text) => {
                const data = new Date(text.split('/').reverse().join('-'))
                if (!isNaN(data)) setDataFim(data)
              }}
              placeholder="DD/MM/AAAA"
            />
          </View>
        </View>

        <View style={styles.filtrosBusca}>
          <TextInput
            style={styles.inputBusca}
            placeholder="Buscar vendedor..."
            value={buscaVendedor}
            onChangeText={setBuscaVendedor}
          />
          <TextInput
            style={styles.inputBusca}
            placeholder="Buscar cliente..."
            value={buscaCliente}
            onChangeText={setBuscaCliente}
          />
          <TextInput
            style={styles.inputBusca}
            placeholder="Buscar item..."
            value={buscaItem}
            onChangeText={setBuscaItem}
          />
        </View>

        <TouchableOpacity style={styles.botaoBuscar} onPress={buscarDados}>
          <MaterialIcons name="search" size={20} color="#fff" />
          <Text style={styles.botaoBuscarTexto}>Buscar</Text>
        </TouchableOpacity>
      </View>

      {/* Cards de resumo */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={[
          {
            titulo: 'Total Geral',
            valor: resumo.totalGeral,
            icone: 'attach-money',
            cor: '#27ae60',
          },
          {
            titulo: 'Pedidos',
            valor: resumo.quantidadePedidos,
            icone: 'receipt',
            cor: '#3498db',
          },
          {
            titulo: 'Ticket Médio',
            valor: resumo.ticketMedio,
            icone: 'trending-up',
            cor: '#f39c12',
          },
        ]}
        renderItem={({ item }) => (
          <ResumoCard
            titulo={item.titulo}
            valor={item.valor}
            icone={item.icone}
            cor={item.cor}
          />
        )}
        keyExtractor={(item) => item.titulo}
        style={styles.resumoContainer}
      />

      {/* Lista de pedidos */}
      <FlatList
        data={filtrarDados}
        keyExtractor={(item, index) =>
          `${item.numero_pedido}-${item.codigo_cliente}-${index}`
        }
        renderItem={renderItem}
        style={styles.lista}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listaContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="home" size={64} color="#bdc3c7" />
            <Text style={styles.emptyText}>
              Nenhum pedido de piso encontrado
            </Text>
          </View>
        }
      />
    </View>
  )
}
