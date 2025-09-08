import React, { useState, useEffect, useMemo } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ScrollView,
  Linking,
} from 'react-native'
import { useEnviarEmail } from '../hooks/useEnviarEmail'
import DateTimePicker from '@react-native-community/datetimepicker'
import Toast from 'react-native-toast-message'
import { Checkbox } from 'react-native-paper'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import styles from '../styles/cobrancasStyles'

// Import das funções de formatação
import {
  formatarData,
  formatCurrency as formatarValor,
} from '../utils/formatters'

// Imports dos componentes corrigidos
import { criarMensagemCobranca } from '../componentsEnvioCobranca/CriarMensagem'
import buscarCobrancas from '../componentsEnvioCobranca/BuscarCobrancas'
import FiltrosCobranca from '../componentsEnvioCobranca/FiltrosCobranca'
import ItemCobranca from '../componentsEnvioCobranca/ItemCobranca'
import ModalCobranca from '../componentsEnvioCobranca/ModalCobranca'
import compartilharBoleto from '../componentsEnvioCobranca/compartilharBoleto'
import enviarMultiplosEmails from '../componentsEnvioCobranca/EnviarMultiplosEmails'
import processarEnviosMultiplos from '../componentsEnvioCobranca/ProcessarMultiplosEnvios'
import enviarCobrancaWhatsApp from '../componentsEnvioCobranca/EnviarCobrancaWhatsUnica'
import enviarMultiplosWhatsapps from '../componentsEnvioCobranca/EnviarMultiplosWhats'

export default function CobrancasList() {
  const [cobrancas, setCobrancas] = useState([])
  const [cobrancasOriginais, setCobrancasOriginais] = useState([])
  const [loading, setLoading] = useState(false)
  const [dataIni, setDataIni] = useState(new Date())
  const [dataFim, setDataFim] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState({
    show: false,
    type: '',
  })
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedCobranca, setSelectedCobranca] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [loadingWhats, setLoadingWhats] = useState(false)
  const [selecionadas, setSelecionadas] = useState([])
  const [incluirBoleto, setIncluirBoleto] = useState(false)
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [filtroValorMin, setFiltroValorMin] = useState('')
  const [filtroValorMax, setFiltroValorMax] = useState('')
  const [enviandoLote, setEnviandoLote] = useState(false)
  const [progressoEnvio, setProgressoEnvio] = useState({ atual: 0, total: 0 })

  const { enviarEmail, loading: loadingEmail } = useEnviarEmail()

  // Lógica de filtragem com useMemo
  const cobrancasFiltradas = useMemo(() => {
    let resultado = [...cobrancas]

    if (searchText.trim()) {
      resultado = resultado.filter(
        (item) =>
          item.cliente_nome?.toLowerCase().includes(searchText.toLowerCase()) ||
          item.numero_titulo?.toString().includes(searchText)
      )
    }

    if (filtroStatus !== 'todos') {
      const hoje = new Date()
      resultado = resultado.filter((item) => {
        const vencimento = new Date(item.vencimento)
        if (filtroStatus === 'vencidos') {
          return vencimento < hoje
        } else if (filtroStatus === 'a_vencer') {
          return vencimento >= hoje
        }
        return true
      })
    }

    if (filtroValorMin) {
      const valorMin = parseFloat(filtroValorMin.replace(',', '.'))
      if (!isNaN(valorMin)) {
        resultado = resultado.filter(
          (item) => parseFloat(item.valor) >= valorMin
        )
      }
    }

    if (filtroValorMax) {
      const valorMax = parseFloat(filtroValorMax.replace(',', '.'))
      if (!isNaN(valorMax)) {
        resultado = resultado.filter(
          (item) => parseFloat(item.valor) <= valorMax
        )
      }
    }

    return resultado
  }, [cobrancas, searchText, filtroStatus, filtroValorMin, filtroValorMax])

  const limparFiltros = () => {
    setSearchText('')
    setFiltroStatus('todos')
    setFiltroValorMin('')
    setFiltroValorMax('')
    setDataIni(new Date())
    setDataFim(new Date())
    setSelecionadas([])
  }

  const toggleSelecionada = (item) => {
    const chave = item.id || item.numero_titulo
    setSelecionadas((prev) => {
      if (prev.includes(chave)) {
        return prev.filter((i) => i !== chave)
      } else {
        return [...prev, chave]
      }
    })
  }

  const abrirModalCobranca = (cobranca) => {
    setSelectedCobranca(cobranca)
    setModalVisible(true)
  }

  // Função de busca usando o componente
  const handleBuscarCobrancas = async () => {
    await buscarCobrancas({
      dataIni,
      dataFim,
      incluirBoleto,
      setLoading,
      setCobrancasOriginais,
      setCobrancas,
    })
  }

  // Função de envio único WhatsApp
  const handleEnviarCobrancaWhatsApp = async () => {
    await enviarCobrancaWhatsApp({
      selectedCobranca,
      incluirBoleto,
      setLoadingWhats,
      setModalVisible,
    })
  }

  // Função de envios múltiplos WhatsApp
  const handleEnviarMultiplosWhatsapps = () => {
    enviarMultiplosWhatsapps({
      cobrancas,
      selecionadas,
      incluirBoleto,
      setEnviandoLote,
      setProgressoEnvio,
      setSelecionadas,
    })
  }

  // Função de envios múltiplos Email
  const handleEnviarMultiplosEmails = async () => {
    await enviarMultiplosEmails({
      cobrancas,
      selecionadas,
      incluirBoleto,
      formatarData,
      formatarValor,
      enviarEmail,
      setSelecionadas,
    })
  }

  useEffect(() => {
    handleBuscarCobrancas()
  }, [])

  const renderCobranca = ({ item }) => (
    <ItemCobranca
      item={item}
      selecionadas={selecionadas}
      toggleSelecionada={toggleSelecionada}
      abrirModalCobranca={abrirModalCobranca}
      formatarData={formatarData}
      formatarValor={formatarValor}
    />
  )

  return (
    <View style={styles.container}>
      <FiltrosCobranca
        dataIni={dataIni}
        setDataIni={setDataIni}
        dataFim={dataFim}
        setDataFim={setDataFim}
        showDatePicker={showDatePicker}
        setShowDatePicker={setShowDatePicker}
        searchText={searchText}
        setSearchText={setSearchText}
        filtroStatus={filtroStatus}
        setFiltroStatus={setFiltroStatus}
        incluirBoleto={incluirBoleto}
        setIncluirBoleto={setIncluirBoleto}
        buscarCobrancas={handleBuscarCobrancas}
        limparFiltros={limparFiltros}
      />

      {/* Indicador de progresso durante envios em lote */}
      {enviandoLote && (
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Enviando {progressoEnvio.atual} de {progressoEnvio.total}...
          </Text>
        </View>
      )}
      {selecionadas.length > 0 && (
        <View style={styles.batchActionsContainer}>
          <Text style={styles.selectedCount}>
            {selecionadas.length} selecionada
            {selecionadas.length > 1 ? 's' : ''}
          </Text>
          <View style={styles.batchButtons}>
            <TouchableOpacity
              style={styles.whatsButton}
              onPress={handleEnviarMultiplosWhatsapps}
              disabled={enviandoLote}>
              <Text style={styles.whatsButtonText}>
                <MaterialCommunityIcons
                  name="whatsapp"
                  size={18}
                  color="#fff"
                />
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.emailButton}
              onPress={handleEnviarMultiplosEmails}
              disabled={loadingEmail}>
              <Text style={styles.emailButtonText}>
                <MaterialCommunityIcons
                  name="email-sync"
                  size={18}
                  color="#fff"
                />
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        data={cobrancasFiltradas}
        renderItem={renderCobranca}
        keyExtractor={(item, index) => {
          const empresa = item.empresa_id || item.empr_codi || 'emp'
          const filial = item.filial_id || item.fili_codi || 'fil'
          const cliente =
            item.cliente_id ||
            item.clie_codi ||
            item.cliente_nome?.replace(/\s+/g, '') ||
            'cli'
          const vencimento = item.vencimento
            ? item.vencimento.replace(/[^0-9]/g, '')
            : 'venc'
          const id = item.id || item.numero_titulo || 'titulo'
          const timestamp = Date.now()

          return `${empresa}-${filial}-${cliente}-${vencimento}-${id}-${index}-${timestamp}`
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {loading ? 'Carregando...' : 'Nenhuma cobrança encontrada'}
            </Text>
          </View>
        }
        refreshing={loading}
        onRefresh={buscarCobrancas}
      />
      <ModalCobranca
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        selectedCobranca={selectedCobranca}
        enviarCobrancaWhatsApp={handleEnviarCobrancaWhatsApp}
        loadingWhats={loadingWhats}
        formatarData={formatarData}
        formatarValor={formatarValor}
      />
    </View>
  )
}
