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
import styles from './OrdensEletroStyles'

const { width } = Dimensions.get('window')

export default function DashOrdensEletro({ navigation }) {
  const [dados, setDados] = useState([])
  const [dadosFiltrados, setDadosFiltrados] = useState([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState(null)
  const [empresaId, setEmpresaId] = useState('')
  const [filialId, setFilialId] = useState('')

  // Filtros
  const [numeroOs, setNumeroOs] = useState('')
  const [buscaCliente, setBuscaCliente] = useState('')
  const [buscaSetor, setBuscaSetor] = useState('')
  const [buscaResponsavel, setBuscaResponsavel] = useState('')
  const [responsavelNome, setResponsavelNome] = useState('')
  const [statusOs, setStatusOs] = useState('')
  const [potencia, setPotencia] = useState('')
  const [dataInicio, setDataInicio] = useState(new Date())
  const [dataFim, setDataFim] = useState(new Date())
  const [showDatePickerInicio, setShowDatePickerInicio] = useState(false)
  const [showDatePickerFim, setShowDatePickerFim] = useState(false)

  const [resumo, setResumo] = useState({
    totalGeral: 0,
    totalPorSetor: {},
    totalResponsavel: {},
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

    const totalPorSetor = {}
    const totalResponsavel = {}
    const totalPorStatus = {}

    dadosParaCalculo.forEach((item) => {
      const setor = item.setor_nome || 'Não informado'
      const responsavel =
        item.responsavel_nome || item.nome_responsavel || 'Não informado'
      const status = item.status_ordem || 'Não informado'

      if (!totalPorSetor[setor]) {
        totalPorSetor[setor] = 0
      }
      totalPorSetor[setor] += 1

      if (!totalResponsavel[responsavel]) {
        totalResponsavel[responsavel] = 0
      }
      totalResponsavel[responsavel] += parseFloat(item.total_os || 0)

      if (!totalPorStatus[status]) {
        totalPorStatus[status] = 0
      }
      totalPorStatus[status] += 1
    })

    const ticketMedio =
      dadosParaCalculo.length > 0 ? totalGeral / dadosParaCalculo.length : 0

    setResumo({
      totalGeral,
      totalPorSetor,
      totalResponsavel,
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

    // Filtro por setor
    if (buscaSetor) {
      dadosFiltrados = dadosFiltrados.filter((item) =>
        item.setor_nome?.toLowerCase().includes(buscaSetor.toLowerCase())
      )
    }

    // Filtro por responsável
    if (buscaResponsavel) {
      dadosFiltrados = dadosFiltrados.filter((item) =>
        (item.responsavel_nome || item.nome_responsavel)
          ?.toLowerCase()
          .includes(buscaResponsavel.toLowerCase())
      )
    }

    // Filtro por status
    if (statusOs) {
      dadosFiltrados = dadosFiltrados.filter((item) =>
        item.status_ordem?.toLowerCase().includes(statusOs.toLowerCase())
      )
    }

    if (potencia) {
      dadosFiltrados = dadosFiltrados.filter((item) =>
        item.potencia?.toString().includes(potencia)
      )
    }

    return dadosFiltrados
  }, [
    dados,
    numeroOs,
    buscaCliente,
    buscaSetor,
    buscaResponsavel,
    statusOs,
    potencia,
  ])

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
      if (buscaSetor) params.setor_nome = buscaSetor
      if (buscaResponsavel) params.responsavel_nome = buscaResponsavel
      if (potencia) params.potencia = potencia
      if (statusOs) params.status_ordem = statusOs

      const res = await apiGetComContexto(
        'ordemdeservico/ordens-eletro/',
        params
      )

      let dadosProcessados = res.results || res
      if (!Array.isArray(dadosProcessados)) {
        dadosProcessados = []
      }

      // Log para verificar estrutura dos dados
      if (dadosProcessados.length > 0) {
        console.log('Primeiro item dos dados:', dadosProcessados[0])
        console.log('Campos disponíveis:', Object.keys(dadosProcessados[0]))
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
    navigation.navigate('OrdensEletroGrafico', {
      dados: filtrarDados,
      resumo: resumo,
      filtros: {
        dataInicio: formatarData(dataInicio),
        dataFim: formatarData(dataFim),
        numeroOs,
        cliente: buscaCliente,
        setor: buscaSetor,
        responsavel: buscaResponsavel,
        status: statusOs,
        potencia,
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
      ATRASADA: '#e67e22',
    }
    return statusColors[status?.toUpperCase()] || '#7f8c8d'
  }

  const ResumoCard = ({ titulo, valor, icone, cor, isSetor = false }) => (
    <View style={[styles.resumoCard, { borderLeftColor: cor }]}>
      <View style={styles.resumoHeader}>
        <Text style={styles.resumoTitulo}>{titulo}</Text>
        <MaterialIcons name={icone} size={24} color={cor} />
      </View>
      <Text style={[styles.resumoValor, { color: cor }]}>
        {titulo === 'Ordens' || isSetor
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
              { backgroundColor: getStatusColor(item.status_ordem) },
            ]}>
            <Text style={styles.statusText}>{item.status_ordem}</Text>
          </View>
          <Text style={styles.itemData}>
            {new Date(item.data_abertura).toLocaleDateString('pt-BR')}
          </Text>
        </View>
      </View>

      <View style={styles.itemDetalhes}>
        <Text style={styles.itemResponsavel}>
          Responsável: {item.nome_responsavel}
        </Text>
        <Text style={styles.itemSetor}>Setor: {item.setor_nome}</Text>
        <Text style={styles.itemServicos} numberOfLines={2}>
          Serviços: {item.servicos || 'Não informado'}
        </Text>
        <Text style={styles.itemPecas} numberOfLines={2}>
          Peças: {item.pecas || 'Não informado'}
        </Text>
        {item.potencia && (
          <Text style={styles.itemPotencia}>Potência: {item.potencia}</Text>
        )}
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
          {item.ultima_alteracao && (
            <>
              <Text style={styles.itemDataLabel}>Última Alteração:</Text>
              <Text style={styles.itemDataValor}>
                {new Date(item.ultima_alteracao).toLocaleDateString('pt-BR')}
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
            placeholder="💼 Setor..."
            value={buscaSetor}
            onChangeText={setBuscaSetor}
          />
          <TextInput
            style={styles.inputBuscaInline}
            placeholder="🔧 Responsável..."
            value={buscaResponsavel}
            onChangeText={setBuscaResponsavel}
          />
        </View>

        <View style={styles.filtrosBuscaContainer}>
          <TextInput
            style={[styles.inputBuscaInline]}
            placeholder="🚦 Status..."
            value={statusOs}
            onChangeText={setStatusOs}
          />

          <TextInput
            style={[styles.inputBuscaInline]}
            placeholder="⚡ Potência..."
            value={potencia}
            onChangeText={setPotencia}
            keyboardType="numeric"
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
        {Object.entries(resumo.totalPorSetor)
          .slice(0, 2)
          .map(([setor, valor]) => (
            <ResumoCard
              key={setor}
              titulo={
                setor.length > 15 ? setor.substring(0, 15) + '...' : setor
              }
              valor={valor}
              icone="business"
              cor="#9b59b6"
              isSetor={true}
            />
          ))}
        {Object.entries(resumo.totalResponsavel)
          .slice(0, 2)
          .map(([responsavel, valor]) => (
            <ResumoCard
              key={responsavel}
              titulo={
                responsavel.length > 15
                  ? responsavel.substring(0, 15) + '...'
                  : responsavel
              }
              valor={valor}
              icone="person"
              cor="#e67e22"
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
