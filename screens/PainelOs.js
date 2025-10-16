import React, { useEffect, useState, useMemo, useCallback } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
  TextInput,
  Dimensions,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import debounce from 'lodash.debounce'

import { apiGetComContextoos } from '../utils/api'
import commonStyles from '../styles/painelOsCommon'
import desktopStyles from '../styles/painelOsDesktop'
import mobileStyles from '../styles/painelOsMobile'
import tvStyles from '../styles/PainelTvOsStyles'

const STATUS_OPTIONS = [
  { label: 'Todas', value: null },
  { label: 'Aberta', value: 0 },
  { label: 'Orçamento gerado', value: 1 },
  { label: 'Aguardando Liberação', value: 2 },
  { label: 'Liberada', value: 3 },
  { label: 'Reprovada', value: 5 },
  { label: 'Faturada parcial', value: 20 },
  { label: 'Em atraso', value: 21 },
]

const statusColors = {
  0: '#d1ecf1',
  1: '#fff3cd',
  21: '#f5c6cb',
  3: '#d4edda',
  5: '#f5c6cb',
  20: '#bee5eb',
}

const PRIORIDADE_OPTIONS = [
  { label: 'Todas', value: null },
  { label: 'Normal', value: '0' },
  { label: 'Alerta', value: '1' },
  { label: 'Urgente', value: '2' },
]

const prioridadeColors = {
  0: '#d1ecf1',
  1: '#ffc107',
  2: '#dc3545',
}

const PainelAcompanhamento = ({ navigation }) => {
  const [ordens, setOrdens] = useState([])
  const [loading, setLoading] = useState(false)
  const [filtroStatus, setFiltroStatus] = useState(null)
  const [filtroPrioridade, setFiltroPrioridade] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [modoExibicao, setModoExibicao] = useState('auto')
  const [ordenacao, setOrdenacao] = useState({ campo: null, direcao: 'asc' })
  const [contadores, setContadores] = useState({
    abertas: 0,
    atrasadas: 0,
    liberadas: 0,
    total: 0,
  })

  const detectarModoExibicao = () => {
    const { width, height } = Dimensions.get('window')
    const isLandscape = width > height
    const isTV = Platform.isTV || width > 1200

    if (modoExibicao === 'auto') {
      if (isTV && isLandscape) return 'tv'
      if (width < 768) return 'mobile'
      return 'desktop'
    }
    return modoExibicao
  }

  const modoAtual = detectarModoExibicao()

  const getStyles = () => {
    const base = commonStyles
    switch (modoAtual) {
      case 'tv':
        return { ...base, ...tvStyles }
      case 'mobile':
        return { ...base, ...mobileStyles }
      default:
        return { ...base, ...desktopStyles }
    }
  }

  const styles = getStyles()

  const getStatusText = (status) => {
    const option = STATUS_OPTIONS.find((opt) => opt.value === status)
    return option ? option.label : '-'
  }

  const calcularContadores = (ordensData) => {
    const abertas = ordensData.filter((o) => o.orde_stat_orde === 0).length
    const liberadas = ordensData.filter((o) => o.orde_stat_orde === 3).length
    const atrasadas = ordensData.filter((o) => o.orde_stat_orde === 21).length
    return { abertas, atrasadas, liberadas, total: ordensData.length }
  }

  const fetchOrdens = async (filtros = {}) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filtros.cliente_nome) {
        params.append('cliente_nome', filtros.cliente_nome)
      }

      const queryString = params.toString()
      const url = `ordemdeservico/ordens/${queryString ? `?${queryString}` : ''}`

      console.log('🔍 FRONTEND - URL da requisição:', url)

      const response = await apiGetComContextoos(url)
      let ordensData = []

      if (Array.isArray(response)) ordensData = response
      else if (response?.data && Array.isArray(response.data))
        ordensData = response.data
      else if (response?.results && Array.isArray(response.results))
        ordensData = response.results
      else if (response && typeof response === 'object') {
        const possibleArrays = Object.values(response).filter(Array.isArray)
        if (possibleArrays.length > 0) ordensData = possibleArrays[0]
      }

      console.log('📊 FRONTEND - Total de registros:', ordensData.length)
      setOrdens(ordensData)
      setContadores(calcularContadores(ordensData))
    } catch (error) {
      console.error('❌ FRONTEND - Erro ao buscar ordens:', error)
      setOrdens([])
    } finally {
      setLoading(false)
    }
  }

  // Debounced search — dispara fetch após digitar
  const debouncedFetch = useCallback(
    debounce((term) => {
      fetchOrdens({ cliente_nome: term })
    }, 600),
    []
  )

  const handleSearch = (text) => {
    setSearchTerm(text)
    debouncedFetch(text)
  }

  // Atualização automática a cada 1h30, apenas com a tela ativa
  useFocusEffect(
    useCallback(() => {
      fetchOrdens()
      const intervalo = setInterval(() => {
        console.log('⏰ Atualizando ordens automaticamente...')
        fetchOrdens()
      }, 5400000) // 1h30
      return () => clearInterval(intervalo)
    }, [])
  )

  const ordensFiltradasLocalmente = useMemo(() => {
    let resultado = [...ordens]

    if (filtroStatus !== null && filtroStatus !== 'Todas') {
      const statusNumerico =
        typeof filtroStatus === 'string'
          ? parseInt(filtroStatus, 10)
          : filtroStatus
      resultado = resultado.filter(
        (ordem) => ordem.orde_stat_orde === statusNumerico
      )
    }

    if (filtroPrioridade !== null) {
      resultado = resultado.filter(
        (ordem) => ordem.orde_prio === filtroPrioridade
      )
    }

    if (ordenacao.campo) {
      resultado.sort((a, b) => {
        let valorA, valorB
        switch (ordenacao.campo) {
          case 'os':
            valorA = a.orde_nume
            valorB = b.orde_nume
            break
          case 'cliente':
            valorA = a.cliente_nome || ''
            valorB = b.cliente_nome || ''
            break
          case 'status':
            valorA = getStatusText(a.orde_stat_orde)
            valorB = getStatusText(b.orde_stat_orde)
            break
          case 'setor':
            valorA = a.setor_nome || a.orde_seto || ''
            valorB = b.setor_nome || b.orde_seto || ''
            break
          default:
            return 0
        }
        if (typeof valorA === 'string' && typeof valorB === 'string') {
          valorA = valorA.toLowerCase()
          valorB = valorB.toLowerCase()
        }
        if (valorA < valorB) return ordenacao.direcao === 'asc' ? -1 : 1
        if (valorA > valorB) return ordenacao.direcao === 'asc' ? 1 : -1
        return 0
      })
    }

    return resultado
  }, [ordens, filtroStatus, filtroPrioridade, ordenacao])

  const handleOrdenacao = (campo) => {
    if (ordenacao.campo === campo) {
      setOrdenacao({
        campo,
        direcao: ordenacao.direcao === 'asc' ? 'desc' : 'asc',
      })
    } else {
      setOrdenacao({ campo, direcao: 'asc' })
    }
  }

  const alternarModo = () => {
    const modos = ['auto', 'mobile', 'desktop', 'tv']
    const indiceAtual = modos.indexOf(modoExibicao)
    const proximoIndice = (indiceAtual + 1) % modos.length
    setModoExibicao(modos[proximoIndice])
  }

  const getModoIcone = () => {
    switch (modoAtual) {
      case 'tv':
        return 'tv'
      case 'mobile':
        return 'phone-portrait'
      case 'desktop':
        return 'desktop'
      default:
        return 'refresh'
    }
  }

  const renderTableHeader = () => {
    const isMobile = modoAtual === 'mobile'
    const isTV = modoAtual === 'tv'

    const colStyles = isTV
      ? {
          os: styles.colOSTV,
          cliente: styles.colClienteTV,
          status: styles.colStatusTV,
          prioridade: styles.colPrioridadeTV,
          setor: styles.colSetorTV,
          data: styles.colDataTV,
          problema: styles.colProblemaTV,
        }
      : isMobile
      ? {
          os: styles.colOSMobile,
          cliente: styles.colClienteMobile,
          status: styles.colStatusMobile,
          setor: styles.colSetorMobile,
        }
      : {
          os: styles.colOS,
          cliente: styles.colCliente,
          status: styles.colStatus,
          prioridade: styles.colPrioridade,
          setor: styles.colSetor,
          data: styles.colData,
          problema: styles.colProblema,
        }

    const headerStyle = isTV ? styles.tableHeaderTV : styles.tableHeader
    const textStyle = isTV ? styles.tableHeaderTextTV : styles.tableHeaderText

    return (
      <View style={headerStyle}>
        <TouchableOpacity
          style={[styles.tableHeaderButton, colStyles.os]}
          onPress={() => handleOrdenacao('os')}>
          <Text style={textStyle}>OS</Text>
          {ordenacao.campo === 'os' && (
            <Ionicons
              name={ordenacao.direcao === 'asc' ? 'chevron-up' : 'chevron-down'}
              size={12}
              color="#fff"
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tableHeaderButton, colStyles.cliente]}
          onPress={() => handleOrdenacao('cliente')}>
          <Text style={textStyle}>Cliente</Text>
          {ordenacao.campo === 'cliente' && (
            <Ionicons
              name={ordenacao.direcao === 'asc' ? 'chevron-up' : 'chevron-down'}
              size={12}
              color="#fff"
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tableHeaderButton, colStyles.status]}
          onPress={() => handleOrdenacao('status')}>
          <Text style={textStyle}>Status</Text>
          {ordenacao.campo === 'status' && (
            <Ionicons
              name={ordenacao.direcao === 'asc' ? 'chevron-up' : 'chevron-down'}
              size={12}
              color="#fff"
            />
          )}
        </TouchableOpacity>

        {!isMobile && (
          <Text style={[textStyle, colStyles.prioridade]}>Prioridade</Text>
        )}

        <TouchableOpacity
          style={[styles.tableHeaderButton, colStyles.setor]}
          onPress={() => handleOrdenacao('setor')}>
          <Text style={textStyle}>Setor</Text>
          {ordenacao.campo === 'setor' && (
            <Ionicons
              name={ordenacao.direcao === 'asc' ? 'chevron-up' : 'chevron-down'}
              size={12}
              color="#fff"
            />
          )}
        </TouchableOpacity>

        {!isMobile && <Text style={[textStyle, colStyles.data]}>Data</Text>}
        {!isMobile && (
          <Text style={[textStyle, colStyles.problema]}>Problema</Text>
        )}
      </View>
    )
  }

  const renderTableRow = ({ item }) => {
    const isMobile = modoAtual === 'mobile'
    const isTV = modoAtual === 'tv'

    const colStyles = isTV
      ? {
          os: styles.colOSTV,
          cliente: styles.colClienteTV,
          status: styles.colStatusTV,
          prioridade: styles.colPrioridadeTV,
          setor: styles.colSetorTV,
          data: styles.colDataTV,
          problema: styles.colProblemaTV,
        }
      : isMobile
      ? {
          os: styles.colOSMobile,
          cliente: styles.colClienteMobile,
          status: styles.colStatusMobile,
          setor: styles.colSetorMobile,
        }
      : {
          os: styles.colOS,
          cliente: styles.colCliente,
          status: styles.colStatus,
          prioridade: styles.colPrioridade,
          setor: styles.colSetor,
          data: styles.colData,
          problema: styles.colProblema,
        }

    const rowStyle = isTV ? styles.tableRowTV : styles.tableRow
    const textStyle = isTV ? styles.tableCellTextTV : styles.tableCellText
    const osStyle = isTV ? styles.osNumberTV : styles.osNumber
    const badgeStyle = isTV ? styles.prioridadeBadgeTV : styles.prioridadeBadge
    const badgeTextStyle = isTV
      ? styles.prioridadeBadgeTextTV
      : styles.prioridadeBadgeText

    return (
      <TouchableOpacity
        style={[
          rowStyle,
          {
            backgroundColor: statusColors[item.orde_stat_orde] || '#fff',
            borderLeftColor: prioridadeColors[item.orde_prio] || '#aaa',
          },
        ]}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('OrdemDetalhe', { ordem: item })}>
        <Text style={[textStyle, colStyles.os, osStyle]}>
          #{item.orde_nume}
        </Text>

        <Text style={[textStyle, colStyles.cliente]} numberOfLines={2}>
          {item.cliente_nome || 'Cliente não informado'}
        </Text>

        <Text style={[textStyle, colStyles.status]} numberOfLines={1}>
          {getStatusText(item.orde_stat_orde)}
        </Text>

        {!isMobile && (
          <View style={[colStyles.prioridade, styles.prioridadeCellContainer]}>
            <View
              style={[
                badgeStyle,
                { backgroundColor: prioridadeColors[item.orde_prio] || '#aaa' },
              ]}>
              <Text style={badgeTextStyle}>
                {item.orde_prio === '0'
                  ? 'Normal'
                  : item.orde_prio === '1'
                  ? 'Alerta'
                  : item.orde_prio === '2'
                  ? 'Urgente'
                  : '-'}
              </Text>
            </View>
          </View>
        )}

        <Text style={[textStyle, colStyles.setor]} numberOfLines={1}>
          {item.setor_nome || item.orde_seto || '-'}
        </Text>

        {!isMobile && (
          <Text style={[textStyle, colStyles.data]}>
            {item.orde_data_aber || '-'}
          </Text>
        )}

        {!isMobile && (
          <Text style={[textStyle, colStyles.problema]} numberOfLines={2}>
            {item.orde_prob || 'Sem descrição do problema'}
          </Text>
        )}
      </TouchableOpacity>
    )
  }

  const renderIndicador = (label, valor, bgColor) => {
    const isTV = modoAtual === 'tv'
    const isMobile = modoAtual === 'mobile'

    const containerStyle = isTV
      ? styles.indicadorTV
      : isMobile
      ? styles.indicadorMobile
      : styles.indicador
    const labelStyle = isTV
      ? styles.indicadorLabelTV
      : isMobile
      ? styles.indicadorLabelMobile
      : styles.indicadorLabel
    const valorStyle = isTV
      ? styles.indicadorValorTV
      : isMobile
      ? styles.indicadorValorMobile
      : styles.indicadorValor

    return (
      <View style={[containerStyle, { backgroundColor: bgColor }]}>
        <Text style={labelStyle}>{label}</Text>
        <Text style={valorStyle}>{valor}</Text>
      </View>
    )
  }

  const containerStyle =
    modoAtual === 'tv'
      ? styles.containerTV
      : modoAtual === 'mobile'
      ? styles.containerMobile
      : styles.container
  const logoStyle =
    modoAtual === 'tv'
      ? styles.logoTV
      : modoAtual === 'mobile'
      ? styles.logoMobile
      : styles.logo
  const indicadoresStyle =
    modoAtual === 'tv'
      ? styles.indicadoresTV
      : modoAtual === 'mobile'
      ? styles.indicadoresMobile
      : styles.indicadores
  const filtrosStyle =
    modoAtual === 'tv'
      ? styles.filtrosTV
      : modoAtual === 'mobile'
      ? styles.filtrosMobile
      : styles.filtros

  return (
    <View style={containerStyle}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}></Text>
        <View style={styles.headerRight}>
          <Image source={require('../assets/eletro.png')} style={logoStyle} />

          <TouchableOpacity
            style={styles.modeButton}
            onPress={alternarModo}
            activeOpacity={0.7}>
            <Ionicons name={getModoIcone()} size={20} color="#fff" />
            <Text style={styles.modeButtonText}>
              {modoAtual === 'auto'
                ? 'Auto'
                : modoAtual === 'tv'
                ? 'TV'
                : modoAtual === 'mobile'
                ? 'Mobile'
                : 'Desktop'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.refreshButton}
            onPress={fetchOrdens}
            activeOpacity={0.7}>
            <Ionicons name="refresh" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Indicadores */}
      <View style={indicadoresStyle}>
        {renderIndicador('Abertas', contadores.abertas, '#d1ecf1')}
        {renderIndicador('Atrasadas', contadores.atrasadas, '#f8d7da')}
        {renderIndicador('Liberadas', contadores.liberadas, '#d4edda')}
        {renderIndicador('Total', contadores.total, '#eee')}
        <TouchableOpacity
          style={
            modoAtual === 'tv'
              ? styles.botaoCriarTV
              : modoAtual === 'mobile'
              ? styles.botaoCriarMobile
              : styles.botaoCriar
          }
          activeOpacity={0.7}
          onPress={() => navigation.navigate('OsCriacao')}>
          <Ionicons name="add-circle" size={20} color="#fff" />
          <Text
            style={
              modoAtual === 'tv'
                ? styles.botaoCriarTextTV
                : modoAtual === 'mobile'
                ? styles.botaoCriarTextMobile
                : styles.botaoCriarTexto
            }>
            Nova O.S.
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filtros */}
      <View style={filtrosStyle}>
        <View style={styles.filtroSection}>
          <Text
            style={
              modoAtual === 'tv' ? styles.filtroLabelTV : styles.filtroLabel
            }>
            Status
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtroScroll}>
            {STATUS_OPTIONS.map(({ label, value }) => (
              <TouchableOpacity
                key={label}
                style={[
                  modoAtual === 'tv'
                    ? styles.filtroButtonTV
                    : modoAtual === 'mobile'
                    ? styles.filtroButtonMobile
                    : styles.filtroButton,
                  {
                    backgroundColor:
                      value !== null
                        ? statusColors[value] || '#f0f0f0'
                        : '#f0f0f0',
                    borderColor:
                      filtroStatus === value ? '#284665' : 'transparent',
                    borderWidth: filtroStatus === value ? 3 : 2,
                  },
                ]}
                onPress={() => setFiltroStatus(value)}
                activeOpacity={0.7}>
                <Text
                  style={[
                    modoAtual === 'tv'
                      ? styles.filtroButtonTextTV
                      : modoAtual === 'mobile'
                      ? styles.filtroButtonTextMobile
                      : styles.filtroButtonText,
                    { fontWeight: filtroStatus === value ? 'bold' : 'normal' },
                  ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.filtroSection}>
          <Text
            style={
              modoAtual === 'tv' ? styles.filtroLabelTV : styles.filtroLabel
            }>
            Prioridade
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtroScroll}>
            {PRIORIDADE_OPTIONS.map(({ label, value }) => (
              <TouchableOpacity
                key={label}
                style={[
                  modoAtual === 'tv'
                    ? styles.filtroButtonTV
                    : modoAtual === 'mobile'
                    ? styles.filtroButtonMobile
                    : styles.filtroButton,
                  {
                    backgroundColor:
                      value !== null
                        ? prioridadeColors[value] || '#f0f0f0'
                        : '#f0f0f0',
                    borderColor:
                      filtroPrioridade === value ? '#284665' : 'transparent',
                    borderWidth: filtroPrioridade === value ? 3 : 2,
                  },
                ]}
                onPress={() => setFiltroPrioridade(value)}
                activeOpacity={0.7}>
                <Text
                  style={[
                    modoAtual === 'tv'
                      ? styles.filtroButtonTextTV
                      : modoAtual === 'mobile'
                      ? styles.filtroButtonTextMobile
                      : styles.filtroButtonText,
                    {
                      fontWeight:
                        filtroPrioridade === value ? 'bold' : 'normal',
                      color: value === '2' ? '#fff' : '#333',
                    },
                  ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <Text
          style={
            modoAtual === 'mobile' ? styles.filtrosMobileFiltro : styles.titulo
          }>
          Filtragem por Cliente
        </Text>
        <View
          style={
            modoAtual === 'tv'
              ? styles.searchContainerTV
              : styles.searchContainer
          }>
          <TextInput
            placeholder="Buscar por nome do cliente..."
            placeholderTextColor="#777"
            style={modoAtual === 'tv' ? styles.inputTV : styles.input}
            value={searchTerm}
            onChangeText={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity
            style={
              modoAtual === 'tv' ? styles.searchButtonTV : styles.searchButton
            }
            onPress={() => setSearchValue(searchTerm)}>
            <Text
              style={
                modoAtual === 'tv'
                  ? styles.searchButtonTextTV
                  : styles.searchButtonText
              }>
              Buscar
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabela */}
      {loading ? (
        <View
          style={
            modoAtual === 'tv'
              ? styles.loadingContainerTV
              : styles.loadingContainer
          }>
          <ActivityIndicator size="large" color="#284665" />
          <Text
            style={
              modoAtual === 'tv' ? styles.loadingTextTV : styles.loadingText
            }>
            Carregando ordens...
          </Text>
        </View>
      ) : (
        <View
          style={
            modoAtual === 'tv' ? styles.tableContainerTV : styles.tableContainer
          }>
          {renderTableHeader()}
          <ScrollView
            style={styles.tableScrollView}
            showsVerticalScrollIndicator={false}>
            {ordensFiltradasLocalmente.length === 0 ? (
              <View
                style={
                  modoAtual === 'tv'
                    ? styles.emptyContainerTV
                    : styles.emptyContainer
                }>
                <Text
                  style={
                    modoAtual === 'tv' ? styles.emptyTextTV : styles.emptyText
                  }>
                  Nenhuma ordem encontrada
                </Text>
              </View>
            ) : (
              ordensFiltradasLocalmente.map((item, index) => (
                <View
                  key={`${item.orde_empr || 'emp'}-${item.orde_fili || 'fil'}-${
                    item.orde_nume || 'num'
                  }-${item.cliente_codigo || 'cli'}-${index}`}>
                  {renderTableRow({ item })}
                </View>
              ))
            )}
          </ScrollView>
        </View>
      )}
    </View>
  )
}

export default PainelAcompanhamento
