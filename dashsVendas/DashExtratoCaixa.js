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
import styles from '../stylesDash/ExtratoStyles'

const { width } = Dimensions.get('window')
const filtroOptions = ['TODOS', 'DINHEIRO', 'CARTAO', 'PIX']

export default function DashExtratoCaixa() {
  const [dados, setDados] = useState([])
  const [dadosFiltrados, setDadosFiltrados] = useState([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState(null)
  const [empresaId, setEmpresaId] = useState('')
  const [filialId, setFilialId] = useState('')
  const [filtroForma, setFiltroForma] = useState('TODOS')
  const [buscaCliente, setBuscaCliente] = useState('')
  const [dataInicio, setDataInicio] = useState(new Date())
  const [dataFim, setDataFim] = useState(new Date())
  const [showDatePickerInicio, setShowDatePickerInicio] = useState(false)
  const [showDatePickerFim, setShowDatePickerFim] = useState(false)
  const [resumo, setResumo] = useState({
    totalGeral: 0,
    totalPorForma: {},
    quantidadeTransacoes: 0,
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
    // Garantir que a data seja no timezone local
    const ano = data.getFullYear()
    const mes = String(data.getMonth() + 1).padStart(2, '0')
    const dia = String(data.getDate()).padStart(2, '0')
    const dataFormatada = `${ano}-${mes}-${dia}`
    console.log('Data original:', data, 'Data formatada:', dataFormatada)
    return dataFormatada
  }

  const formatarDataInicioAPI = (data) => {
    const dataInicio = new Date(data)
    dataInicio.setHours(0, 0, 0, 0)
    const dataFormatada = dataInicio.toISOString().split('T')[0] + 'T00:00:00'
    console.log('Data início formatada:', dataFormatada)
    return dataFormatada
  }

  const formatarDataFimAPI = (data) => {
    const dataFim = new Date(data)
    dataFim.setHours(23, 59, 59, 999)
    const dataFormatada = dataFim.toISOString().split('T')[0] + 'T23:59:59'
    console.log('Data fim formatada:', dataFormatada)
    return dataFormatada
  }

  const onChangeDataInicio = (event, selectedDate) => {
    const currentDate = selectedDate || dataInicio
    setShowDatePickerInicio(Platform.OS === 'ios')
    setDataInicio(currentDate)

    if (empresaId && filialId) {
      setTimeout(() => {
        console.log('Buscando dados com nova data início:', currentDate)
        buscarDados()
      }, 300)
    }
  }

  const onChangeDataFim = (event, selectedDate) => {
    const currentDate = selectedDate || dataFim
    setShowDatePickerFim(Platform.OS === 'ios')
    setDataFim(currentDate)
    // Força a busca após mudança de data com delay maior
    if (empresaId && filialId) {
      setTimeout(() => {
        console.log('Buscando dados com nova data fim:', currentDate)
        buscarDados()
      }, 300)
    }
  }

  const calcularResumo = (dadosParaCalculo) => {
    const totalGeral = dadosParaCalculo.reduce(
      (acc, item) => acc + parseFloat(item.valor_total || 0),
      0
    )
    const totalPorForma = {}

    dadosParaCalculo.forEach((item) => {
      const forma = item.forma_de_recebimento || 'Não informado'
      if (!totalPorForma[forma]) {
        totalPorForma[forma] = 0
      }
      totalPorForma[forma] += parseFloat(item.valor_total || 0)
    })

    setResumo({
      totalGeral,
      totalPorForma,
      quantidadeTransacoes: dadosParaCalculo.length,
    })
  }

  const filtrarDados = useMemo(() => {
    let dadosFiltrados = dados

    // Filtro de data no frontend (fallback caso a API não funcione)
    if (dataInicio && dataFim) {
      const inicioStr = formatarDataAPI(dataInicio)
      const fimStr = formatarDataAPI(dataFim)

      console.log(
        'Aplicando filtro de data no frontend:',
        inicioStr,
        'até',
        fimStr
      )

      dadosFiltrados = dadosFiltrados.filter((item) => {
        const dataItem = item.data
        const dentroDoRange = dataItem >= inicioStr && dataItem <= fimStr
        if (!dentroDoRange) {
          console.log(
            `Removendo registro fora do range: ${dataItem} (${item.nome_cliente})`
          )
        }
        return dentroDoRange
      })

      console.log(
        `Filtro de data aplicado: ${dados.length} -> ${dadosFiltrados.length} registros`
      )
    }

    // Filtro por forma de pagamento
    if (filtroForma !== 'TODOS') {
      dadosFiltrados = dadosFiltrados.filter((item) => {
        const forma = item.forma_de_recebimento?.toUpperCase() || ''
        return forma.includes(filtroForma)
      })
    }

    // Filtro por cliente/produto
    if (buscaCliente) {
      dadosFiltrados = dadosFiltrados.filter(
        (item) =>
          item.nome_cliente
            ?.toLowerCase()
            .includes(buscaCliente.toLowerCase()) ||
          item.produto?.toLowerCase().includes(buscaCliente.toLowerCase())
      )
    }

    return dadosFiltrados
  }, [dados, filtroForma, buscaCliente, dataInicio, dataFim]) // Adicionado dataInicio e dataFim

  // useEffect para recalcular resumo quando dados filtrados mudarem
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
      console.log('useEffect disparado - buscando dados...')
      buscarDados()
    }
  }, [empresaId, filialId, dataInicio, dataFim]) // Adicionado dataInicio e dataFim de volta

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

      // Tentar diferentes formatos de filtro de data
      if (dataInicio && dataFim) {
        const inicio = new Date(dataInicio)
        const fim = new Date(dataFim)

        console.log('Data Início:', inicio)
        console.log('Data Fim:', fim)

        if (inicio <= fim) {
          // Tentar diferentes nomes de parâmetros
          params.data__gte = formatarDataAPI(inicio)
          params.data__lte = formatarDataAPI(fim)

          // Alternativas caso a API use outros nomes
          params.data_inicio = formatarDataAPI(inicio)
          params.data_fim = formatarDataAPI(fim)
          params.data_gte = formatarDataAPI(inicio)
          params.data_lte = formatarDataAPI(fim)
          params.date__gte = formatarDataAPI(inicio)
          params.date__lte = formatarDataAPI(fim)
        } else {
          params.data__gte = formatarDataAPI(fim)
          params.data__lte = formatarDataAPI(inicio)
          params.data_inicio = formatarDataAPI(fim)
          params.data_fim = formatarDataAPI(inicio)
          params.data_gte = formatarDataAPI(fim)
          params.data_lte = formatarDataAPI(inicio)
          params.date__gte = formatarDataAPI(fim)
          params.date__lte = formatarDataAPI(inicio)
        }

        console.log('Todos os parâmetros de data enviados:', {
          data__gte: params.data__gte,
          data__lte: params.data__lte,
          data_inicio: params.data_inicio,
          data_fim: params.data_fim,
          data_gte: params.data_gte,
          data_lte: params.data_lte,
          date__gte: params.date__gte,
          date__lte: params.date__lte,
        })
      }

      if (buscaCliente) params.search = buscaCliente

      console.log('URL completa que será chamada:')
      console.log('dashboards/extrato-caixa/', params)

      const res = await apiGetComContexto('dashboards/extrato-caixa/', params)

      console.log(
        'Resposta da API (primeiros 100 chars):',
        JSON.stringify(res).substring(0, 100)
      )

      let dadosProcessados = res.results || res
      if (!Array.isArray(dadosProcessados)) {
        dadosProcessados = []
      }

      // Log detalhado das datas retornadas
      if (dadosProcessados.length > 0) {
        console.log('TODAS as datas dos registros retornados:')
        const datasUnicas = [
          ...new Set(dadosProcessados.map((item) => item.data)),
        ]
        console.log('Datas únicas encontradas:', datasUnicas)

        dadosProcessados.forEach((item, index) => {
          if (index < 10) {
            // Mostrar apenas os primeiros 10
            console.log(
              `Registro ${index + 1}: Data=${item.data}, Cliente=${
                item.nome_cliente
              }, Valor=${item.valor_total}`
            )
          }
        })
      }

      setDados(dadosProcessados)
      console.log('Dados processados:', dadosProcessados.length, 'registros')
    } catch (e) {
      console.error('Erro detalhado:', e)
      const errorMessage =
        e.response?.data?.detail || e.message || 'Erro desconhecido'
      setErro(`Erro ao buscar dados: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const ResumoCard = ({ titulo, valor, icone, cor }) => (
    <View style={[styles.resumoCard, { borderLeftColor: cor }]}>
      <View style={styles.resumoHeader}>
        <Text style={styles.resumoTitulo}>{titulo}</Text>
        <MaterialIcons name={icone} size={24} color={cor} />
      </View>
      <Text style={[styles.resumoValor, { color: cor }]}>
        {titulo === 'Transações'
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
          <Text style={styles.itemPedido}>Pedido: {item.pedido}</Text>
          <Text style={styles.itemCliente}>{item.nome_cliente}</Text>
        </View>
        <Text style={styles.itemData}>
          {new Date(item.data).toLocaleDateString('pt-BR')}
        </Text>
      </View>

      <View style={styles.itemDetalhes}>
        <Text style={styles.itemProduto}>{item.produto}</Text>
        <Text style={styles.itemDescricao}>{item.descricao}</Text>
      </View>

      <View style={styles.itemFooter}>
        <View style={styles.itemQuantidade}>
          <Text style={styles.itemQuantidadeLabel}>Qtd:</Text>
          <Text style={styles.itemQuantidadeValor}>{item.quantidade}</Text>
        </View>
        <View style={styles.itemForma}>
          <Text style={styles.itemFormaTexto}>{item.forma_de_recebimento}</Text>
        </View>
        <Text style={styles.itemValor}>
          {parseFloat(item.valor_total || 0).toLocaleString('pt-BR', {
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
        <Text style={styles.loadingText}>Carregando extrato de caixa...</Text>
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
        <Text style={styles.headerTitle}>💰 Extrato de Caixa</Text>
        <Text style={styles.headerSubtitle}>Movimentações Financeiras</Text>
      </View>

      {/* Filtros de busca e data */}
      <View style={styles.filtrosContainer}>
        <TextInput
          style={styles.inputBusca}
          placeholder="Buscar cliente ou produto..."
          value={buscaCliente}
          onChangeText={setBuscaCliente}
        />

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

      {/* Filtros de forma de pagamento */}
      <View style={styles.filtros}>
        {filtroOptions.map((opt) => (
          <TouchableOpacity
            key={opt}
            onPress={() => setFiltroForma(opt)}
            style={[
              styles.filtroButton,
              filtroForma === opt && styles.filtroSelecionado,
            ]}>
            <Text
              style={
                filtroForma === opt
                  ? styles.filtroTextoSelecionado
                  : styles.filtroTexto
              }>
              {opt === 'TODOS' ? 'Todos' : opt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

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
          titulo="Transações"
          valor={resumo.quantidadeTransacoes}
          icone="receipt"
          cor="#3498db"
        />
        {Object.entries(resumo.totalPorForma).map(([forma, valor]) => (
          <ResumoCard
            key={forma}
            titulo={forma}
            valor={valor}
            icone="payment"
            cor="#9b59b6"
          />
        ))}
      </ScrollView>

      {/* Lista de transações */}
      <FlatList
        data={filtrarDados}
        keyExtractor={(item, index) =>
          `${item.pedido}-${item.cliente}-${index}`
        }
        renderItem={renderItem}
        style={styles.lista}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listaContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="inbox" size={10} color="#bdc3c7" />
            <Text style={styles.emptyText}>Nenhuma transação encontrada</Text>
          </View>
        }
      />
    </View>
  )
}
