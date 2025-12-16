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
import { notasFiscaisService } from '../services/notasFiscaisService'
import AsyncStorage from '@react-native-async-storage/async-storage'
import styles from '../stylesDash/DashNotasFiscaisStyles'

const { width } = Dimensions.get('window')

export default function DashNotasFiscais({ navigation }) {
  const [dados, setDados] = useState([])
  const [dadosFiltrados, setDadosFiltrados] = useState([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState(null)
  const [empresaId, setEmpresaId] = useState('')
  const [filialId, setFilialId] = useState('')
  const [buscaCliente, setBuscaCliente] = useState('')
  const [buscaNumero, setBuscaNumero] = useState('')
  const [dataInicio, setDataInicio] = useState(new Date())
  const [dataFim, setDataFim] = useState(new Date())
  const [showDatePickerInicio, setShowDatePickerInicio] = useState(false)
  const [showDatePickerFim, setShowDatePickerFim] = useState(false)
  const [resumo, setResumo] = useState({
    totalGeral: 0,
    totalAutorizadas: 0,
    totalCanceladas: 0,
    totalPendentes: 0,
    quantidadeNotas: 0,
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

  const formatarDataParaAPI = (data) => {
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
      (acc, item) => acc + parseFloat(item.valor_total_nota || 0),
      0
    )
    
    const autorizadas = dadosParaCalculo.filter(item => item.status_nfe === 100)
    const canceladas = dadosParaCalculo.filter(item => item.cancelada === true)
    const pendentes = dadosParaCalculo.filter(item => item.status_nfe !== 100 && !item.cancelada)

    const totalAutorizadas = autorizadas.reduce(
      (acc, item) => acc + parseFloat(item.valor_total_nota || 0),
      0
    )
    
    const totalCanceladas = canceladas.reduce(
      (acc, item) => acc + parseFloat(item.valor_total_nota || 0),
      0
    )
    
    const totalPendentes = pendentes.reduce(
      (acc, item) => acc + parseFloat(item.valor_total_nota || 0),
      0
    )

    setResumo({
      totalGeral,
      totalAutorizadas,
      totalCanceladas,
      totalPendentes,
      quantidadeNotas: dadosParaCalculo.length,
    })
  }

  const filtrarDados = useMemo(() => {
    let dadosFiltrados = dados

    // Filtro por cliente
    if (buscaCliente) {
      dadosFiltrados = dadosFiltrados.filter((item) =>
        item.nome_cliente
          ?.toLowerCase()
          .includes(buscaCliente.toLowerCase())
      )
    }

    // Filtro por número da nota
    if (buscaNumero) {
      dadosFiltrados = dadosFiltrados.filter((item) =>
        item.numero_completo
          ?.toLowerCase()
          .includes(buscaNumero.toLowerCase())
      )
    }

    return dadosFiltrados
  }, [dados, buscaCliente, buscaNumero])

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

  const buscarDados = useCallback(async () => {
    if (loading) return

    setLoading(true)
    setErro(null)

    try {
      const params = {
        empresa: empresaId,
        filial: filialId,
        page_size: 100,
      }

      if (buscaCliente) params.destinatario_nome__icontains = buscaCliente
      if (buscaNumero) params.numero_completo__icontains = buscaNumero
      if (dataInicio) params.data_emissao__gte = formatarDataAPI(dataInicio)
      if (dataFim) params.data_emissao__lte = formatarDataAPI(dataFim)

      console.log('📊 Parâmetros da busca:', params)

      const response = await notasFiscaisService.buscarDashboardNotasFiscais(params)
      
      console.log('📈 Resposta do dashboard:', response)
      
      setDados(response.dados || [])
      setResumo(response.resumo || {})
      
    } catch (error) {
      console.error('❌ Erro ao buscar dados:', error)
      setErro(error.message || 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [buscaCliente, buscaNumero, dataInicio, dataFim, loading, empresaId, filialId])

  const navegarParaGrafico = () => {
    navigation.navigate('DashNotasFiscaisGrafico', {
      dados: dadosFiltrados,
      resumo: resumo,
      filtros: {
        dataInicio: formatarData(dataInicio),
        dataFim: formatarData(dataFim),
        cliente: buscaCliente,
        numero: buscaNumero,
      },
    })
  }

  const getStatusColor = (item) => {
    return '#f39c12'
  }

  const getStatusText = (item) => {
    if (item.cancelada) return 'Cancelada'
    if (item.status_nfe === 100) return 'Autorizada'
    return 'Pendente'
  }

  const ResumoCard = ({ titulo, valor, icone, cor }) => (
    <View style={[styles.resumoCard, { borderLeftColor: cor }]}>
      <View style={styles.resumoHeader}>
        <Text style={styles.resumoTitulo}>{titulo}</Text>
        <MaterialIcons name={icone} size={24} color={cor} />
      </View>
      <Text style={[styles.resumoValor, { color: cor }]}>
        {titulo === 'Notas'
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
          <Text style={styles.itemNumero}>NF: {item.numero_completo}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item) }]}>
            <Text style={styles.statusText}>{getStatusText(item)}</Text>
          </View>
        </View>
        <Text style={styles.itemData}>
          {new Date(item.data_emissao).toLocaleDateString('pt-BR')}
        </Text>
      </View>

      <Text style={styles.itemCliente}>Cliente: {item.nome_cliente}</Text>
      <Text style={styles.itemChave}>Chave: {item.chave_nfe}</Text>

      <View style={styles.itemDetalhes}>
        <Text style={styles.itemObservacaoLabel}>Observações:</Text>
        <Text style={styles.itemObservacao}>{item.observacoes || 'Sem observações'}</Text>
      </View>

      <View style={styles.itemFooter}>
        <View style={styles.itemTotalContainer}>
          <Text style={styles.itemTotalLabel}>Valor Total:</Text>
          <Text style={styles.itemValor}>
            {parseFloat(item.valor_total_nota || 0).toLocaleString('pt-BR', {
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
        <Text style={styles.loadingText}>Carregando notas fiscais...</Text>
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
          <Text style={styles.headerTitle}>📄 Notas Fiscais</Text>
          <Text style={styles.headerSubtitle}>Dashboard de NFe</Text>
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
            <Text style={styles.labelBusca}>Cliente:</Text>
            <TextInput
              style={styles.inputBuscaInline}
              placeholder="Buscar cliente..."
              value={buscaCliente}
              onChangeText={setBuscaCliente}
            />
          </View>
          <View style={styles.inputBuscaGroup}>
            <Text style={styles.labelBusca}>Número NF:</Text>
            <TextInput
              style={styles.inputBuscaInline}
              placeholder="Buscar número..."
              value={buscaNumero}
              onChangeText={setBuscaNumero}
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
          titulo="Notas"
          valor={resumo.quantidadeNotas}
          icone="receipt"
          cor="#3498db"
        />
        <ResumoCard
          titulo="Autorizadas"
          valor={resumo.totalAutorizadas}
          icone="check-circle"
          cor="#27ae60"
        />
        <ResumoCard
          titulo="Pendentes"
          valor={resumo.totalPendentes}
          icone="schedule"
          cor="#f39c12"
        />
        <ResumoCard
          titulo="Canceladas"
          valor={resumo.totalCanceladas}
          icone="cancel"
          cor="#e74c3c"
        />
      </ScrollView>

      {/* Lista de notas fiscais */}
      <FlatList
        data={filtrarDados}
        keyExtractor={(item, index) =>
          `${item.numero_completo}-${item.codigo_cliente}-${index}`
        }
        renderItem={renderItem}
        style={styles.lista}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listaContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="inbox" size={64} color="#bdc3c7" />
            <Text style={styles.emptyText}>Nenhuma nota fiscal encontrada</Text>
          </View>
        }
      />
    </View>
  )
}