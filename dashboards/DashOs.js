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
import styles from '../stylesDash/OrdemServicoStyles'

const { width } = Dimensions.get('window')

export default function DashOs({ navigation }) {
  const [dados, setDados] = useState([])
  const [dadosFiltrados, setDadosFiltrados] = useState([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState(null)
  const [empresaId, setEmpresaId] = useState('')
  const [filialId, setFilialId] = useState('')

  // Filtros
  const [numeroOs, setNumeroOs] = useState('')
  const [buscaCliente, setBuscaCliente] = useState('')
  const [buscaVendedor, setBuscaVendedor] = useState('')
  const [buscaAtendente, setBuscaAtendente] = useState('')
  const [statusOs, setStatusOs] = useState('')
  const [dataInicio, setDataInicio] = useState(new Date())
  const [dataFim, setDataFim] = useState(new Date())
  const [showDatePickerInicio, setShowDatePickerInicio] = useState(false)
  const [showDatePickerFim, setShowDatePickerFim] = useState(false)

  const [resumo, setResumo] = useState({
    totalGeral: 0,
    totalPorVendedor: {},
    totalPorStatus: {},
    quantidadeOs: 0,
    ticketMedio: 0,
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
      (acc, item) => acc + parseFloat(item.total_os || 0),
      0
    )

    const totalPorVendedor = {}
    const totalPorStatus = {}

    dadosParaCalculo.forEach((item) => {
      const vendedor = item.nome_vendedor || 'Não informado'
      const status = item.status_os || 'Não informado'

      if (!totalPorVendedor[vendedor]) {
        totalPorVendedor[vendedor] = 0
      }
      totalPorVendedor[vendedor] += parseFloat(item.total_os || 0)

      if (!totalPorStatus[status]) {
        totalPorStatus[status] = 0
      }
      totalPorStatus[status] += 1
    })

    const ticketMedio =
      dadosParaCalculo.length > 0 ? totalGeral / dadosParaCalculo.length : 0

    setResumo({
      totalGeral,
      totalPorVendedor,
      totalPorStatus,
      quantidadeOs: dadosParaCalculo.length,
      ticketMedio,
    })
  }

  const filtrarDados = useMemo(() => {
    let dadosFiltrados = dados

    // Filtro por número da OS
    if (numeroOs) {
      dadosFiltrados = dadosFiltrados.filter((item) =>
        item.ordem_de_servico?.toString().includes(numeroOs)
      )
    }

    // Filtro por cliente
    if (buscaCliente) {
      dadosFiltrados = dadosFiltrados.filter((item) =>
        item.nome_cliente?.toLowerCase().includes(buscaCliente.toLowerCase())
      )
    }

    // Filtro por vendedor
    if (buscaVendedor) {
      dadosFiltrados = dadosFiltrados.filter((item) =>
        item.nome_vendedor?.toLowerCase().includes(buscaVendedor.toLowerCase())
      )
    }

    // Filtro por atendente
    if (buscaAtendente) {
      dadosFiltrados = dadosFiltrados.filter((item) =>
        item.atendente?.toLowerCase().includes(buscaAtendente.toLowerCase())
      )
    }

    // Filtro por status
    if (statusOs) {
      dadosFiltrados = dadosFiltrados.filter((item) =>
        item.status_os?.toLowerCase().includes(statusOs.toLowerCase())
      )
    }

    return dadosFiltrados
  }, [dados, numeroOs, buscaCliente, buscaVendedor, buscaAtendente, statusOs])

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

      if (numeroOs) params.ordem_de_servico = numeroOs
      if (buscaCliente) params.nome_cliente = buscaCliente
      if (buscaVendedor) params.nome_vendedor = buscaVendedor
      if (buscaAtendente) params.atendente = buscaAtendente
      if (statusOs) params.status_os = statusOs

      const res = await apiGetComContexto('Os/os-geral/', params)

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
    navigation.navigate('DashOsGrafico', {
      dados: filtrarDados,
      resumo: resumo,
      filtros: {
        dataInicio: formatarData(dataInicio),
        dataFim: formatarData(dataFim),
        numeroOs,
        cliente: buscaCliente,
        vendedor: buscaVendedor,
        atendente: buscaAtendente,
        status: statusOs,
      },
    })
  }

  const getStatusColor = (status) => {
    const statusColors = {
      ABERTA: '#f39c12',
      'EM ANDAMENTO': '#3498db',
      FINALIZADA: '#27ae60',
      CANCELADA: '#e74c3c',
      PAUSADA: '#95a5a6',
    }
    return statusColors[status?.toUpperCase()] || '#7f8c8d'
  }

  const ResumoCard = ({ titulo, valor, icone, cor }) => (
    <View style={[styles.resumoCard, { borderLeftColor: cor }]}>
      <View style={styles.resumoHeader}>
        <Text style={styles.resumoTitulo}>{titulo}</Text>
        <MaterialIcons name={icone} size={24} color={cor} />
      </View>
      <Text style={[styles.resumoValor, { color: cor }]}>
        {titulo === 'Ordens'
          ? valor.toLocaleString('pt-BR')
          : titulo === 'Ticket Médio' || titulo.includes('R$')
          ? valor.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })
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
          <Text style={styles.itemOs}>OS: {item.ordem_de_servico}</Text>
          <Text style={styles.itemCliente}>{item.nome_cliente}</Text>
        </View>
        <View style={styles.itemStatusContainer}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status_os) },
            ]}>
            <Text style={styles.statusText}>{item.status_os}</Text>
          </View>
          <Text style={styles.itemData}>
            {new Date(item.data_abertura).toLocaleDateString('pt-BR')}
          </Text>
        </View>
      </View>

      <View style={styles.itemDetalhes}>
        <Text style={styles.itemVendedor}>Vendedor: {item.nome_vendedor}</Text>
        <Text style={styles.itemAtendente}>Atendente: {item.atendente}</Text>
        <Text style={styles.itemServicos} numberOfLines={2}>
          Serviços: {item.servicos || 'Não informado'}
        </Text>
        <Text style={styles.itemPecas} numberOfLines={2}>
          Peças: {item.pecas || 'Não informado'}
        </Text>
      </View>

      <View style={styles.itemFooter}>
        <View style={styles.itemDatas}>
          <Text style={styles.itemDataLabel}>Abertura:</Text>
          <Text style={styles.itemDataValor}>
            {new Date(item.data_abertura).toLocaleDateString('pt-BR')}
          </Text>
          {item.data_fim && (
            <>
              <Text style={styles.itemDataLabel}>Fim:</Text>
              <Text style={styles.itemDataValor}>
                {new Date(item.data_fim).toLocaleDateString('pt-BR')}
              </Text>
            </>
          )}
        </View>
        <Text style={styles.itemValor}>
          {parseFloat(item.total_os || 0).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })}
        </Text>
      </View>
    </View>
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Carregando ordens de serviço...</Text>
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
          <Text style={styles.headerTitle}>🔧 Ordens de Serviço</Text>
          <Text style={styles.headerSubtitle}>Dashboard de OS</Text>
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
          <TextInput
            style={styles.inputBuscaInline}
            placeholder="🔢 Nº OS..."
            value={numeroOs}
            onChangeText={setNumeroOs}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.inputBuscaInline}
            placeholder="👤 Cliente..."
            value={buscaCliente}
            onChangeText={setBuscaCliente}
          />
        </View>

        <View style={styles.filtrosBuscaContainer}>
          <TextInput
            style={styles.inputBuscaInline}
            placeholder="💼 Vendedor..."
            value={buscaVendedor}
            onChangeText={setBuscaVendedor}
          />
          <TextInput
            style={styles.inputBuscaInline}
            placeholder="🎧 Atendente..."
            value={buscaAtendente}
            onChangeText={setBuscaAtendente}
          />
        </View>

        <View style={styles.filtrosBuscaContainer}>
          <TextInput
            style={[styles.inputBuscaInline, { flex: 1 }]}
            placeholder="🚦 Status..."
            value={statusOs}
            onChangeText={setStatusOs}
          />
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
          titulo="Ordens"
          valor={resumo.quantidadeOs}
          icone="build"
          cor="#3498db"
        />
        <ResumoCard
          titulo="Ticket Médio"
          valor={resumo.ticketMedio}
          icone="trending-up"
          cor="#f39c12"
        />
        {Object.entries(resumo.totalPorVendedor)
          .slice(0, 3)
          .map(([vendedor, valor]) => (
            <ResumoCard
              key={vendedor}
              titulo={
                vendedor.length > 15
                  ? vendedor.substring(0, 15) + '...'
                  : vendedor
              }
              valor={valor}
              icone="person"
              cor="#9b59b6"
            />
          ))}
      </ScrollView>

      {/* Lista de ordens */}
      <FlatList
        data={filtrarDados}
        keyExtractor={(item, index) =>
          `${item.ordem_de_servico}-${item.cliente}-${index}`
        }
        renderItem={renderItem}
        style={styles.lista}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listaContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="build" size={64} color="#bdc3c7" />
            <Text style={styles.emptyText}>
              Nenhuma ordem de serviço encontrada
            </Text>
          </View>
        }
      />
    </View>
  )
}
