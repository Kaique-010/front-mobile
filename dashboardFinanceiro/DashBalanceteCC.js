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
} from 'react-native'
import { FontAwesome, MaterialIcons } from '@expo/vector-icons'
import { apiGetComContexto } from '../utils/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import styles from '../stylesDash/BalanceteCCStyles'

const { width } = Dimensions.get('window')
const filtroOptions = ['TODOS', 'POSITIVO', 'NEGATIVO']
const tipoOptions = ['TODOS', 'ANALITICO', 'SEM_CC']

export default function DashBalanceteCC() {
  const [meses, setMeses] = useState([])
  const [anos, setAnos] = useState([])
  const [anoSelecionado, setAnoSelecionado] = useState(null)
  const [mesSelecionado, setMesSelecionado] = useState(null)
  const [filtro, setFiltro] = useState('TODOS')
  const [tipoFiltro, setTipoFiltro] = useState('TODOS')
  const [dados, setDados] = useState(null)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState(null)
  const [empresaId, setEmpresaId] = useState('')
  const [filialId, setFilialId] = useState('')
  useEffect(() => {
    const iniciar = async () => {
      try {
        // Limpar valores antigos (remover após testar)
        await AsyncStorage.removeItem('balancete_ano')
        await AsyncStorage.removeItem('balancete_mes')

        const empresa = (await AsyncStorage.getItem('empresaId')) || ''
        const filial = (await AsyncStorage.getItem('filialId')) || ''
        const ano = await AsyncStorage.getItem('balancete_ano')
        const mes = await AsyncStorage.getItem('balancete_mes')

        setEmpresaId(empresa)
        setFilialId(filial)
        if (ano) setAnoSelecionado(ano)
        if (mes) setMesSelecionado(mes)

        // Só busca dados se tudo estiver presente
        if (empresa && filial && ano && mes) {
          buscarDados()
        }
      } catch (error) {
        console.log('Erro ao iniciar dados:', error)
      }
    }

    iniciar()
  }, [])

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

  const carregarAnoMesSalvos = async () => {
    try {
      const ano = await AsyncStorage.getItem('balancete_ano')
      const mes = await AsyncStorage.getItem('balancete_mes')
      if (ano) setAnoSelecionado(ano)
      if (mes) setMesSelecionado(mes)
    } catch (error) {
      console.log('Erro ao carregar ano/mês salvos:', error)
    }
  }

  const salvarAnoMes = async (ano, mes) => {
    try {
      await AsyncStorage.setItem('balancete_ano', String(ano))
      await AsyncStorage.setItem('balancete_mes', String(mes))
    } catch (error) {
      console.log('Erro ao salvar ano/mês:', error)
    }
  }

  const handleSelecionarAno = (ano) => {
    setAnoSelecionado(ano)
    salvarAnoMes(ano, mesSelecionado || '')
  }

  const handleSelecionarMes = (mes) => {
    setMesSelecionado(mes)
    salvarAnoMes(anoSelecionado || '', mes)
  }

  const nomeMesParaNumero = (nomeMes) => {
    const nomes = [
      'JANEIRO',
      'FEVEREIRO',
      'MARÇO',
      'ABRIL',
      'MAIO',
      'JUNHO',
      'JULHO',
      'AGOSTO',
      'SETEMBRO',
      'OUTUBRO',
      'NOVEMBRO',
      'DEZEMBRO',
    ]
    const index = nomes.indexOf(nomeMes?.toUpperCase())
    return index >= 0 ? (index + 1).toString().padStart(2, '0') : null
  }

  const buscarDados = useCallback(async () => {
    setLoading(true)
    setErro(null)
    try {
      const params = {
        page_size: 10000,
        limit: 10000,
        empr: empresaId,
        fili: filialId,
      }

      if (anoSelecionado) params.ano = anoSelecionado
      if (mesSelecionado) {
        const mesNumero = nomeMesParaNumero(mesSelecionado)
        if (mesNumero) params.mes = mesNumero
      }

      const res = await apiGetComContexto('dashboards/balancete-cc/', params)
      const dadosProcessados = processarDadosBackend(res)
      setDados(dadosProcessados)

      const mesesAPI = Object.keys(dadosProcessados.resumo_mensal || {})
      setMeses(mesesAPI)
      if (mesesAPI.length > 0 && !mesSelecionado)
        handleSelecionarMes(mesesAPI[0])

      const anosUnicos = [
        ...new Set(res.results?.map((item) => item.ano) || []),
      ].sort((a, b) => b - a)
      setAnos(anosUnicos)
      if (anosUnicos.length > 0 && !anoSelecionado)
        handleSelecionarAno(anosUnicos[0])
    } catch (e) {
      console.error('Erro detalhado:', e)
      const errorMessage =
        e.response?.data?.detail || e.message || 'Erro desconhecido'
      setErro(`Erro ao buscar dados: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }, [empresaId, filialId, anoSelecionado, mesSelecionado])

  const processarDadosBackend = (dadosBackend) => {
    const resumo_mensal = {}
    const detalhamento = {}

    let dados = dadosBackend
    if (
      dadosBackend &&
      dadosBackend.results &&
      Array.isArray(dadosBackend.results)
    ) {
      dados = dadosBackend.results
    }

    if (!dados || !Array.isArray(dados)) {
      return { resumo_mensal, detalhamento }
    }

    dados.forEach((item) => {
      const mes = item.mes_nome

      if (!resumo_mensal[mes]) {
        resumo_mensal[mes] = {
          total_recebido: 0,
          total_pago: 0,
          resultado_total: 0,
          centros_positivos: 0,
          centros_negativos: 0,
          total_centros: 0,
          centros_analiticos: 0,
          sem_centro_custo: 0,
          // Novos campos para filtros por tipo
          analitico_recebido: 0,
          analitico_pago: 0,
          analitico_resultado: 0,
          analitico_positivos: 0,
          analitico_negativos: 0,
          sem_cc_recebido: 0,
          sem_cc_pago: 0,
          sem_cc_resultado: 0,
          sem_cc_positivos: 0,
          sem_cc_negativos: 0,
        }
      }

      if (!detalhamento[mes]) {
        detalhamento[mes] = []
      }

      const valorRecebido = parseFloat(item.valor_recebido) || 0
      const valorPago = parseFloat(item.valor_pago) || 0
      const resultado = parseFloat(item.resultado) || 0
      const tipoCC = item.tipo_cc || 'SEM'

      // Totais gerais
      resumo_mensal[mes].total_recebido += valorRecebido
      resumo_mensal[mes].total_pago += valorPago
      resumo_mensal[mes].resultado_total += resultado
      resumo_mensal[mes].total_centros += 1

      if (resultado > 0) {
        resumo_mensal[mes].centros_positivos += 1
      } else if (resultado < 0) {
        resumo_mensal[mes].centros_negativos += 1
      }

      // Contabilizar por tipo
      if (tipoCC === 'SEM') {
        resumo_mensal[mes].sem_centro_custo += 1
        resumo_mensal[mes].sem_cc_recebido += valorRecebido
        resumo_mensal[mes].sem_cc_pago += valorPago
        resumo_mensal[mes].sem_cc_resultado += resultado
        if (resultado > 0) {
          resumo_mensal[mes].sem_cc_positivos += 1
        } else if (resultado < 0) {
          resumo_mensal[mes].sem_cc_negativos += 1
        }
      } else {
        resumo_mensal[mes].centros_analiticos += 1
        resumo_mensal[mes].analitico_recebido += valorRecebido
        resumo_mensal[mes].analitico_pago += valorPago
        resumo_mensal[mes].analitico_resultado += resultado
        if (resultado > 0) {
          resumo_mensal[mes].analitico_positivos += 1
        } else if (resultado < 0) {
          resumo_mensal[mes].analitico_negativos += 1
        }
      }

      detalhamento[mes].push({
        codigo: item.cecu_redu,
        nome: item.centro_nome,
        tipo_cc: tipoCC,
        valor_recebido: valorRecebido,
        valor_pago: valorPago,
        resultado: resultado,
        mes_ordem: item.mes_ordem,
      })
    })

    // Ordenar centros: primeiro por tipo (analíticos primeiro), depois por resultado
    Object.keys(detalhamento).forEach((mes) => {
      detalhamento[mes].sort((a, b) => {
        // Primeiro critério: tipo (analíticos primeiro)
        if (a.tipo_cc !== b.tipo_cc) {
          if (a.tipo_cc === 'SEM') return 1
          if (b.tipo_cc === 'SEM') return -1
        }
        // Segundo critério: resultado (maiores primeiro)
        return b.resultado - a.resultado
      })
    })

    return { resumo_mensal, detalhamento }
  }

  useEffect(() => {
    obterContexto()
    carregarAnoMesSalvos()
  }, [])

  useEffect(() => {
    if (empresaId && filialId) buscarDados()
  }, [empresaId, filialId])

  useEffect(() => {
    if (
      empresaId &&
      filialId &&
      anoSelecionado !== null &&
      mesSelecionado !== null
    ) {
      buscarDados()
    }
  }, [anoSelecionado, mesSelecionado])

  const dadosMes = dados?.detalhamento?.[mesSelecionado] || []
  const resumoMes = dados?.resumo_mensal?.[mesSelecionado] || {}

  // Função para obter resumo filtrado por tipo
  const obterResumoFiltrado = () => {
    if (tipoFiltro === 'ANALITICO') {
      return {
        total_recebido: resumoMes.analitico_recebido || 0,
        total_pago: resumoMes.analitico_pago || 0,
        resultado_total: resumoMes.analitico_resultado || 0,
        centros_positivos: resumoMes.analitico_positivos || 0,
        centros_negativos: resumoMes.analitico_negativos || 0,
        total_centros: resumoMes.centros_analiticos || 0,
        centros_analiticos: resumoMes.centros_analiticos || 0,
        sem_centro_custo: 0,
      }
    } else if (tipoFiltro === 'SEM_CC') {
      return {
        total_recebido: resumoMes.sem_cc_recebido || 0,
        total_pago: resumoMes.sem_cc_pago || 0,
        resultado_total: resumoMes.sem_cc_resultado || 0,
        centros_positivos: resumoMes.sem_cc_positivos || 0,
        centros_negativos: resumoMes.sem_cc_negativos || 0,
        total_centros: resumoMes.sem_centro_custo || 0,
        centros_analiticos: 0,
        sem_centro_custo: resumoMes.sem_centro_custo || 0,
      }
    }
    // TODOS - retorna o resumo completo
    return resumoMes
  }

  function obterCor(resultado) {
    if (resultado > 0) return '#27ae60' // Verde para positivo
    if (resultado < 0) return '#e74c3c' // Vermelho para negativo
    return '#95a5a6' // Cinza para zero
  }

  function obterIcone(resultado) {
    if (resultado > 0) return 'trending-up'
    if (resultado < 0) return 'trending-down'
    return 'remove'
  }

  function obterCorTipo(tipo) {
    if (tipo === 'SEM') return '#f39c12' // Laranja para sem centro
    return '#3498db' // Azul para analíticos
  }

  function obterIconeTipo(tipo) {
    if (tipo === 'SEM') return 'warning'
    return 'business'
  }

  const filtrarCentros = (centros) => {
    let centrosFiltrados = centros

    // Filtro por resultado
    if (filtro === 'POSITIVO') {
      centrosFiltrados = centrosFiltrados.filter((c) => c.resultado > 0)
    } else if (filtro === 'NEGATIVO') {
      centrosFiltrados = centrosFiltrados.filter((c) => c.resultado < 0)
    }

    // Filtro por tipo
    if (tipoFiltro === 'ANALITICO') {
      centrosFiltrados = centrosFiltrados.filter((c) => c.tipo_cc !== 'SEM')
    } else if (tipoFiltro === 'SEM_CC') {
      centrosFiltrados = centrosFiltrados.filter((c) => c.tipo_cc === 'SEM')
    }

    return centrosFiltrados
  }

  const ProgressBar = ({ valor, maximo, cor }) => {
    const largura =
      maximo > 0 ? Math.min(Math.abs(valor / maximo) * 100, 100) : 0
    return (
      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressBar,
            { width: `${largura}%`, backgroundColor: cor },
          ]}
        />
      </View>
    )
  }

  const ResumoGeralCard = () => {
    const resumoAtual = obterResumoFiltrado()
    const resultadoTotal = resumoAtual.resultado_total || 0
    const totalRecebido = resumoAtual.total_recebido || 0
    const totalPago = resumoAtual.total_pago || 0
    const centrosPositivos = resumoAtual.centros_positivos || 0
    const centrosNegativos = resumoAtual.centros_negativos || 0
    const totalCentros = resumoAtual.total_centros || 0
    const centrosAnaliticos = resumoAtual.centros_analiticos || 0
    const semCentroCusto = resumoAtual.sem_centro_custo || 0

    const corResultado = obterCor(resultadoTotal)
    const iconeResultado = obterIcone(resultadoTotal)

    // Título dinâmico baseado no filtro
    const getTitulo = () => {
      const base = `Balancete CC - ${mesSelecionado}`
      if (tipoFiltro === 'ANALITICO') return `${base} (Analíticos)`
      if (tipoFiltro === 'SEM_CC') return `${base} (Sem CC)`
      return base
    }

    return (
      <View style={[styles.resumoGeralCard, { borderLeftColor: corResultado }]}>
        <View style={styles.resumoHeader}>
          <Text style={styles.resumoTituloGeral}>{getTitulo()}</Text>
          <MaterialIcons name={iconeResultado} size={28} color={corResultado} />
        </View>

        <View style={styles.saldoContainer}>
          <View style={styles.saldoItem}>
            <Text style={styles.saldoLabel}>Total Recebido</Text>
            <Text style={[styles.saldoValor, { color: '#27ae60' }]}>
              {totalRecebido.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </Text>
          </View>

          <View style={styles.saldoItem}>
            <Text style={styles.saldoLabel}>Total Pago</Text>
            <Text style={[styles.saldoValor, { color: '#e74c3c' }]}>
              {totalPago.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </Text>
          </View>
        </View>

        <View style={styles.resultadoContainer}>
          <Text style={styles.resultadoLabel}>Resultado</Text>
          <Text style={[styles.resultadoValor, { color: corResultado }]}>
            {resultadoTotal.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </Text>
        </View>

        <View style={styles.estatisticasContainer}>
          <View style={styles.estatisticaItem}>
            <Text style={styles.estatisticaNumero}>{totalCentros}</Text>
            <Text style={styles.estatisticaLabel}>Total</Text>
          </View>
          {tipoFiltro === 'TODOS' && (
            <>
              <View style={styles.estatisticaItem}>
                <Text style={[styles.estatisticaNumero, { color: '#3498db' }]}>
                  {centrosAnaliticos}
                </Text>
                <Text style={styles.estatisticaLabel}>Analíticos</Text>
              </View>
              <View style={styles.estatisticaItem}>
                <Text style={[styles.estatisticaNumero, { color: '#f39c12' }]}>
                  {semCentroCusto}
                </Text>
                <Text style={styles.estatisticaLabel}>Sem CC</Text>
              </View>
            </>
          )}
          <View style={styles.estatisticaItem}>
            <Text style={[styles.estatisticaNumero, { color: '#27ae60' }]}>
              {centrosPositivos}
            </Text>
            <Text style={styles.estatisticaLabel}>Positivos</Text>
          </View>
        </View>
      </View>
    )
  }

  const dadosParaLista = useMemo(() => {
    const items = []

    // Adiciona card de resumo geral primeiro
    if (Object.keys(resumoMes).length > 0) {
      items.push({
        type: 'resumo_geral',
        id: 'resumo_geral',
      })
    }

    // Adiciona detalhamento dos centros de custo
    if (dadosMes && dadosMes.length > 0) {
      const centrosFiltrados = filtrarCentros(dadosMes)

      if (centrosFiltrados.length > 0) {
        // Separar por tipo para melhor organização
        const centrosAnaliticos = centrosFiltrados.filter(
          (c) => c.tipo_cc !== 'SEM'
        )
        const semCentroCusto = centrosFiltrados.filter(
          (c) => c.tipo_cc === 'SEM'
        )

        // Adicionar centros analíticos
        if (
          centrosAnaliticos.length > 0 &&
          (tipoFiltro === 'TODOS' || tipoFiltro === 'ANALITICO')
        ) {
          items.push({
            type: 'centros_header',
            id: 'header_analiticos',
            titulo: 'Centros de Custo Analíticos',
            cor: '#3498db',
          })

          centrosAnaliticos.forEach((centro, index) => {
            items.push({
              type: 'centro',
              id: `${empresaId}-${filialId}-analitico-${centro.codigo}-${index}`,
              centro,
              index,
            })
          })
        }

        // Adicionar lançamentos sem centro de custo
        if (
          semCentroCusto.length > 0 &&
          (tipoFiltro === 'TODOS' || tipoFiltro === 'SEM_CC')
        ) {
          items.push({
            type: 'centros_header',
            id: 'header_sem_cc',
            titulo: 'Lançamentos sem Centro de Custo',
            cor: '#f39c12',
          })

          semCentroCusto.forEach((centro, index) => {
            items.push({
              type: 'centro',
              id: `${empresaId}-${filialId}-sem-cc-${centro.codigo}-${index}`,
              centro,
              index,
            })
          })
        }
      }
    }

    return items
  }, [
    dadosMes,
    resumoMes,
    filtro,
    tipoFiltro,
    empresaId,
    filialId,
    mesSelecionado,
  ])

  // Renderiza cada item da lista principal
  const renderItem = ({ item }) => {
    switch (item.type) {
      case 'resumo_geral':
        return <ResumoGeralCard />

      case 'centros_header':
        return (
          <View style={styles.grupoHeaderContainer}>
            <View
              style={[styles.headerComIcone, { borderLeftColor: item.cor }]}>
              <MaterialIcons
                name={
                  item.titulo.includes('Analíticos') ? 'business' : 'warning'
                }
                size={20}
                color={item.cor}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.tituloGrupoDetalhado}>{item.titulo}</Text>
            </View>
          </View>
        )

      case 'centro':
        return renderCentro({ item: item.centro })

      default:
        return null
    }
  }

  const renderCentro = useCallback(({ item }) => {
    const cor = obterCor(item.resultado)
    const icone = obterIcone(item.resultado)
    const corTipo = obterCorTipo(item.tipo_cc)
    const iconeTipo = obterIconeTipo(item.tipo_cc)
    const maiorValor = Math.max(
      Math.abs(item.valor_recebido),
      Math.abs(item.valor_pago)
    )

    return (
      <View
        style={[
          styles.centroCard,
          { borderLeftColor: corTipo, borderLeftWidth: 4 },
        ]}>
        <View style={styles.centroHeader}>
          <View style={styles.centroInfo}>
            <View style={styles.centroTituloContainer}>
              <Text style={styles.centroCodigo}>{item.codigo}</Text>
              <View style={[styles.tipoBadge, { backgroundColor: corTipo }]}>
                <MaterialIcons name={iconeTipo} size={12} color="#fff" />
                <Text style={styles.tipoBadgeText}>
                  {item.tipo_cc === 'SEM' ? 'S/CC' : 'CC'}
                </Text>
              </View>
            </View>
            <Text style={styles.centroNome}>{item.nome}</Text>
          </View>
          <MaterialIcons name={icone} size={20} color={cor} />
        </View>

        <View style={styles.centroValores}>
          <View style={styles.centroValorItem}>
            <Text style={styles.centroValorLabel}>Recebido</Text>
            <Text style={[styles.centroValorTexto, { color: '#27ae60' }]}>
              {item.valor_recebido.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </Text>
            <ProgressBar
              valor={item.valor_recebido}
              maximo={maiorValor}
              cor="#27ae60"
            />
          </View>

          <View style={styles.centroValorItem}>
            <Text style={styles.centroValorLabel}>Pago</Text>
            <Text style={[styles.centroValorTexto, { color: '#e74c3c' }]}>
              {item.valor_pago.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </Text>
            <ProgressBar
              valor={item.valor_pago}
              maximo={maiorValor}
              cor="#e74c3c"
            />
          </View>
        </View>

        <View style={styles.centroResultado}>
          <Text style={styles.centroResultadoLabel}>Resultado</Text>
          <Text style={[styles.centroResultadoTexto, { color: cor }]}>
            {item.resultado.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </Text>
        </View>
      </View>
    )
  }, [])

  if (loading)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Carregando balancete...</Text>
      </View>
    )

  if (erro)
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

  if (!dados || !mesSelecionado) return null

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📊 Balancete por Centro de Custo</Text>
        <Text style={styles.headerSubtitle}>Receitas vs Despesas por CC</Text>
      </View>

      {/* Filtro de ano */}
      {anos.length > 1 && (
        <View style={styles.anoSelector}>
          <Text style={styles.anoSelectorLabel}>Ano:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {anos.map((ano) => (
              <TouchableOpacity
                key={ano}
                onPress={() => setAnoSelecionado(ano)}
                style={[
                  styles.anoButton,
                  anoSelecionado === ano && styles.anoSelecionado,
                ]}>
                <Text
                  style={
                    anoSelecionado === ano
                      ? styles.anoTextoSelecionado
                      : styles.anoTexto
                  }>
                  {ano}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Filtro de mês */}
      <View style={styles.mesSelectorGrid}>
        {meses.map((mes, index) => (
          <TouchableOpacity
            key={mes}
            onPress={() => setMesSelecionado(mes)}
            style={[
              styles.mesButtonGrid,
              mesSelecionado === mes && styles.mesSelecionado,
            ]}>
            <Text
              style={
                mesSelecionado === mes
                  ? styles.mesTextoSelecionado
                  : styles.mesTexto
              }>
              {mes}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Filtros de resultado */}
      <View style={styles.filtros}>
        {filtroOptions.map((opt) => (
          <TouchableOpacity
            key={opt}
            onPress={() => setFiltro(opt)}
            style={[
              styles.filtroButton,
              filtro === opt && styles.filtroSelecionado,
            ]}>
            <Text
              style={
                filtro === opt
                  ? styles.filtroTextoSelecionado
                  : styles.filtroTexto
              }>
              {opt === 'TODOS'
                ? 'Todos'
                : opt === 'POSITIVO'
                ? 'Positivos'
                : 'Negativos'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Filtros de tipo */}
      <View style={styles.filtros}>
        {tipoOptions.map((opt) => (
          <TouchableOpacity
            key={opt}
            onPress={() => setTipoFiltro(opt)}
            style={[
              styles.filtroButton,
              tipoFiltro === opt && styles.filtroTipoSelecionado,
            ]}>
            <Text
              style={
                tipoFiltro === opt
                  ? styles.filtroTextoSelecionado
                  : styles.filtroTexto
              }>
              {opt === 'TODOS'
                ? 'Todos Tipos'
                : opt === 'ANALITICO'
                ? 'Analíticos'
                : 'Sem CC'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista principal */}
      <FlatList
        data={dadosParaLista}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={styles.lista}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listaContent}
      />
    </View>
  )
}
