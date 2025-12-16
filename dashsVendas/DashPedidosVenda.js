import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Dimensions,
  TextInput,
  Platform,
} from 'react-native'
import { FontAwesome, MaterialIcons } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'
import { apiGetComContexto } from '../utils/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import styles from '../stylesDash/PedidosVendaStyles'

const { width } = Dimensions.get('window')
const filtroOptions = ['TODOS', 'VENDEDOR', 'CLIENTE', 'ITEM']

export default function DashPedidosVenda({ navigation }) {
  const [dados, setDados] = useState([])
  const [dadosFiltrados, setDadosFiltrados] = useState([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState(null)
  const [empresaId, setEmpresaId] = useState('')
  const [filialId, setFilialId] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('TODOS')
  const [buscaVendedor, setBuscaVendedor] = useState('')
  const [buscaCliente, setBuscaCliente] = useState('')
  const [buscaItem, setBuscaItem] = useState('')
  const [dataInicio, setDataInicio] = useState(new Date())
  const [dataFim, setDataFim] = useState(new Date())
  const [showDatePickerInicio, setShowDatePickerInicio] = useState(false)
  const [showDatePickerFim, setShowDatePickerFim] = useState(false)
  const [resumo, setResumo] = useState({
    totalGeral: 0,
    totalPorVendedor: {},
    quantidadePedidos: 0,
    quantidadeItens: 0,
  })

  const obterContexto = async () => {
    try {
      const empresa = (await AsyncStorage.getItem('empresaId')) || ''
      const filial = (await AsyncStorage.getItem('filialId')) || ''
      setEmpresaId(empresa)
      setFilialId(filial)
    } catch (error) {
      console.log('Erro ao obter contexto:', error)
    }
  }

  const formatarData = (data) => {
    return data.toLocaleDateString('pt-BR')
  }

  const formatarDataAPI = (data) => {
    const ano = data.getFullYear()
    const mes = String(data.getMonth() + 1).padStart(2, '0')
    const dia = String(data.getDate()).padStart(2, '0')
    return `${ano}-${mes}-${dia}`
  }

  const onChangeDataInicio = (event, selectedDate) => {
    const currentDate = selectedDate || dataInicio
    setShowDatePickerInicio(Platform.OS === 'ios')
    setDataInicio(currentDate)

    if (empresaId && filialId) {
      setTimeout(() => {
        buscarDados()
      }, 300)
    }
  }

  const onChangeDataFim = (event, selectedDate) => {
    const currentDate = selectedDate || dataFim
    setShowDatePickerFim(Platform.OS === 'ios')
    setDataFim(currentDate)
    
    if (empresaId && filialId) {
      setTimeout(() => {
        buscarDados()
      }, 300)
    }
  }

  const calcularResumo = (dadosParaCalculo) => {
    const totalGeral = dadosParaCalculo.reduce(
      (acc, item) => acc + parseFloat(item.valor_total || 0),
      0
    )
    const totalPorVendedor = {}
    const quantidadeItens = dadosParaCalculo.reduce(
      (acc, item) => acc + parseFloat(item.quantidade_total || 0),
      0
    )

    dadosParaCalculo.forEach((item) => {
      const vendedor = item.nome_vendedor || 'Não informado'
      if (!totalPorVendedor[vendedor]) {
        totalPorVendedor[vendedor] = 0
      }
      totalPorVendedor[vendedor] += parseFloat(item.valor_total || 0)
    })

    setResumo({
      totalGeral,
      totalPorVendedor,
      quantidadePedidos: dadosParaCalculo.length,
      quantidadeItens,
    })
  }

  const filtrarDados = useMemo(() => {
    let dadosFiltrados = dados

    // Filtro por vendedor
    if (buscaVendedor) {
      dadosFiltrados = dadosFiltrados.filter((item) =>
        item.nome_vendedor
          ?.toLowerCase()
          .includes(buscaVendedor.toLowerCase())
      )
    }

    // Filtro por cliente
    if (buscaCliente) {
      dadosFiltrados = dadosFiltrados.filter((item) =>
        item.nome_cliente
          ?.toLowerCase()
          .includes(buscaCliente.toLowerCase())
      )
    }

    // Filtro por item
    if (buscaItem) {
      dadosFiltrados = dadosFiltrados.filter((item) =>
        item.itens_do_pedido
          ?.toLowerCase()
          .includes(buscaItem.toLowerCase())
      )
    }

    return dadosFiltrados
  }, [dados, buscaVendedor, buscaCliente, buscaItem])

  useEffect(() => {
    if (filtrarDados.length > 0 || dados.length > 0) {
      calcularResumo(filtrarDados)
    }
  }, [filtrarDados])

  useEffect(() => {
    obterContexto()
  }, [])

  useEffect(() => {
    if (empresaId && filialId) {
      buscarDados()
    }
  }, [empresaId, filialId, dataInicio, dataFim])

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

      const res = await apiGetComContexto('pedidos/pedidos-geral/', params)

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
    navigation.navigate('DashPedidosVendaGrafico', {
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

  const ResumoCard = ({ titulo, valor, icone, cor }) => (
    <View style={[styles.resumoCard, { borderLeftColor: cor }]}>
      <View style={styles.resumoHeader}>
        <Text style={styles.resumoTitulo}>{titulo}</Text>
        <MaterialIcons name={icone} size={24} color={cor} />
      </View>
      <Text style={[styles.resumoValor, { color: cor }]}>
        {titulo === 'Pedidos' || titulo === 'Itens'
          ? valor.toLocaleString('pt-BR')
          : valor.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
      </Text>
    </View>
  )

  const renderItem = ({ item }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemPedido}>Pedido: {item.numero_pedido}</Text>
        </View>
        <Text style={styles.itemData}>
          {new Date(item.data_pedido).toLocaleDateString('pt-BR')}
        </Text>
      </View>

      <Text style={styles.itemCliente}>Cliente: {item.nome_cliente}</Text>
      <Text style={styles.itemVendedor}>Vendedor: {item.nome_vendedor}</Text>

      <View style={styles.itemDetalhes}>
        <Text style={styles.itemProdutosLabel}>Produtos do Pedido:</Text>
        <Text style={styles.itemDescricao}>{item.itens_do_pedido}</Text>
        
        <Text style={styles.itemTipoFinanceiroLabel}>Forma de Recebimento:</Text>
        <Text style={styles.itemTipoFinanceiro}>{item.tipo_financeiro}</Text>
      </View>

      <View style={styles.itemFooter}>
        <View style={styles.itemQuantidadeContainer}>
          <Text style={styles.itemQuantidadeLabel}>Quantidade Total:</Text>
          <Text style={styles.itemQuantidadeValor}>{item.quantidade_total} itens</Text>
        </View>
        <View style={styles.itemTotalContainer}>
          <Text style={styles.itemTotalLabel}>Valor Total:</Text>
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
        <Text style={styles.loadingText}>Carregando pedidos de venda...</Text>
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
          <Text style={styles.headerTitle}>📊 Pedidos de Venda</Text>
          <Text style={styles.headerSubtitle}>Análise de Vendas</Text>
        </View>
        <TouchableOpacity
          style={styles.botaoGrafico}
          onPress={navegarParaGrafico}>
          <MaterialIcons name="bar-chart" size={20} color="#fff" />
          <Text style={styles.botaoGraficoTexto}>Gráfico</Text>
        </TouchableOpacity>
      </View>

      {/* Filtros de busca e data */}
      <View style={styles.filtrosContainer}>
        {/* Filtros de Data */}
        <View style={styles.filtrosData}>
          <View style={styles.inputDataContainer}>
            <Text style={styles.labelData}>Data Início:</Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDatePickerInicio(true)}>
              <Text style={styles.datePickerText}>
                {formatarData(dataInicio)}
              </Text>
              <MaterialIcons name="date-range" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          <View style={styles.inputDataContainer}>
            <Text style={styles.labelData}>Data Fim:</Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDatePickerFim(true)}>
              <Text style={styles.datePickerText}>{formatarData(dataFim)}</Text>
              <MaterialIcons name="date-range" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filtros de busca em linha */}
        <View style={styles.filtrosBuscaContainer}>
          <View style={styles.inputBuscaGroup}>
            <Text style={styles.labelBusca}>Vendedor:</Text>
            <TextInput
              style={styles.inputBuscaInline}
              placeholder="Buscar vendedor..."
              value={buscaVendedor}
              onChangeText={setBuscaVendedor}
            />
          </View>
          <View style={styles.inputBuscaGroup}>
            <Text style={styles.labelBusca}>Cliente:</Text>
            <TextInput
              style={styles.inputBuscaInline}
              placeholder="Buscar cliente..."
              value={buscaCliente}
              onChangeText={setBuscaCliente}
            />
          </View>
          <View style={styles.inputBuscaGroup}>
            <Text style={styles.labelBusca}>Item:</Text>
            <TextInput
              style={styles.inputBuscaInline}
              placeholder="Buscar item..."
              value={buscaItem}
              onChangeText={setBuscaItem}
            />
          </View>
        </View>
      </View>

      {/* DatePickers */}
      {showDatePickerInicio && (
        <DateTimePicker
          testID="dateTimePickerInicio"
          value={dataInicio}
          mode="date"
          is24Hour={true}
          display="default"
          onChange={onChangeDataInicio}
        />
      )}
      {showDatePickerFim && (
        <DateTimePicker
          testID="dateTimePickerFim"
          value={dataFim}
          mode="date"
          is24Hour={true}
          display="default"
          onChange={onChangeDataFim}
        />
      )}

      {/* Cards de resumo */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.resumoContainer}>
        <ResumoCard
          titulo="Total Geral"
          valor={resumo.totalGeral}
          icone="account-balance-wallet"
          cor="#27ae60"
        />
        <ResumoCard
          titulo="Pedidos"
          valor={resumo.quantidadePedidos}
          icone="receipt"
          cor="#3498db"
        />
        <ResumoCard
          titulo="Itens"
          valor={resumo.quantidadeItens}
          icone="inventory"
          cor="#f39c12"
        />
        {Object.entries(resumo.totalPorVendedor).slice(0, 3).map(([vendedor, valor]) => (
          <ResumoCard
            key={vendedor}
            titulo={vendedor.length > 15 ? vendedor.substring(0, 15) + '...' : vendedor}
            valor={valor}
            icone="person"
            cor="#9b59b6"
          />
        ))}
      </ScrollView>

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
            <MaterialIcons name="inbox" size={64} color="#bdc3c7" />
            <Text style={styles.emptyText}>Nenhum pedido encontrado</Text>
          </View>
        }
      />
    </View>
  )
}