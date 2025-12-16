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

const { width } = Dimensions.get('window')
const filtroOptions = ['TODOS', 'ABAIXO', 'ACIMA']

export default function DashRealizado() {
  const [meses, setMeses] = useState([])
  const [mesSelecionado, setMesSelecionado] = useState(null)
  const [filtro, setFiltro] = useState('TODOS')
  const [dados, setDados] = useState(null)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState(null)
  const [empresaId, setEmpresaId] = useState('')
  const [filialId, setFilialId] = useState('')

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

  const buscarDados = async () => {
    setLoading(true)
    setErro(null)
    try {
      const params = { page_size: 10000, limit: 10000 }
      let res
      try {
        res = await apiGetComContexto('dashboards/orcamento-analitico', params)
      } catch (error1) {
        console.log('Tentativa 1 falhou, tentando endpoint alternativo...')
        try {
          res = await apiGetComContexto('orcamento-analitico/', params)
        } catch (error2) {
          console.log('Tentativa 2 falhou, tentando terceira opção...')
          try {
            res = await apiGetComContexto('orcamento-analitico', params)
          } catch (error3) {
            console.log('Todas as tentativas falharam:', error3)
            throw error3
          }
        }
      }
      const dadosProcessados = processarDadosBackend(res)
      setDados(dadosProcessados)

      const mesesAPI = Object.keys(dadosProcessados.resumo_mensal || {})
      setMeses(mesesAPI)
      if (mesesAPI.length > 0) setMesSelecionado(mesesAPI[0])
    } catch (e) {
      console.error('Erro detalhado:', e)
      const errorMessage =
        e.response?.data?.detail || e.message || 'Erro desconhecido'
      setErro(`Erro ao buscar dados: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

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
      const mes = item.mes

      let tipo = item.tipo
      if (tipo === 'RECEITA') {
        tipo = 'Receitas'
      } else if (tipo === 'DESPESA') {
        tipo = 'Despesas'
      }

      if (!resumo_mensal[mes]) {
        resumo_mensal[mes] = {
          Receitas: { previsto: 0, realizado: 0 },
          Despesas: { previsto: 0, realizado: 0 },
          saldo_previsto: 0,
          saldo_realizado: 0,
        }
      }

      if (!resumo_mensal[mes][tipo]) {
        resumo_mensal[mes][tipo] = { previsto: 0, realizado: 0 }
      }

      if (!detalhamento[mes]) {
        detalhamento[mes] = {
          Receitas: [],
          Despesas: [],
        }
      }

      if (!detalhamento[mes][tipo]) {
        detalhamento[mes][tipo] = []
      }

      // Calcular valor realizado baseado no tipo
      let valorRealizado = 0
      if (tipo === 'Receitas') {
        valorRealizado = parseFloat(item.valor_recebido) || 0
      } else if (tipo === 'Despesas') {
        valorRealizado = parseFloat(item.valor_pago) || 0
      }

      const valorOrcado = parseFloat(item.valor_orcado) || 0

      if (isNaN(valorOrcado) || isNaN(valorRealizado)) {
        console.warn(
          `Valores inválidos encontrados para ${tipo} no mês ${mes} - Orçado: ${item.valor_orcado}, Realizado: ${valorRealizado}`
        )
        return
      }

      resumo_mensal[mes][tipo].previsto += valorOrcado
      resumo_mensal[mes][tipo].realizado += valorRealizado

      detalhamento[mes][tipo].push({
        conta: item.plan_redu,
        nome: item.plan_nome,
        valor_previsto: item.valor_orcado || 0,
        valor_realizado: valorRealizado,
      })
    })

    // Calcular saldos
    Object.keys(resumo_mensal).forEach((mes) => {
      const receitas = resumo_mensal[mes].Receitas || {
        previsto: 0,
        realizado: 0,
      }
      const despesas = resumo_mensal[mes].Despesas || {
        previsto: 0,
        realizado: 0,
      }
      const receitasPrevisto = parseFloat(receitas.previsto) || 0
      const receitasRealizado = parseFloat(receitas.realizado) || 0
      const despesasPrevisto = parseFloat(despesas.previsto) || 0
      const despesasRealizado = parseFloat(despesas.realizado) || 0

      resumo_mensal[mes].saldo_previsto = receitasPrevisto - despesasPrevisto
      resumo_mensal[mes].saldo_realizado = receitasRealizado - despesasRealizado
    })

    return { resumo_mensal, detalhamento }
  }

  useEffect(() => {
    obterContexto()
    buscarDados()
  }, [])

  const dadosMes = dados?.detalhamento?.[mesSelecionado] || {}
  const resumoMes = dados?.resumo_mensal?.[mesSelecionado] || {}

  // Função para calcular percentual realizado (CORRIGIDA)
  function calcPercentual(previsto, realizado) {
    if (previsto === 0) return { valor: '-', numerico: 0 }
    const percentual = (realizado / previsto) * 100
    return {
      valor: percentual.toFixed(1) + '%',
      numerico: percentual,
    }
  }

  function obterCor(percentualNumerico) {
    if (percentualNumerico >= 110) return '#e74c3c' // Vermelho
    if (percentualNumerico > 100) return '#f39c12' // Laranja
    if (percentualNumerico >= 90) return '#27ae60' // Verde
    if (percentualNumerico >= 70) return '#f1c40f' // Amarelo
    return '#95a5a6' // Cinza
  }

  function obterIcone(percentualNumerico) {
    if (percentualNumerico >= 110) return 'trending-up'
    if (percentualNumerico > 100) return 'warning'
    if (percentualNumerico >= 90) return 'check-circle'
    if (percentualNumerico >= 70) return 'schedule'
    return 'trending-down'
  }

  const filtrarContas = (contas) => {
    const contasPositivas = contas.filter((c) => {
      return c.valor_previsto > 0 || c.valor_realizado > 0
    })

    if (filtro === 'TODOS') return contasPositivas
    return contasPositivas.filter((c) => {
      if (c.valor_previsto === 0) return false
      const perc = (c.valor_realizado / c.valor_previsto) * 100
      if (filtro === 'ABAIXO') return perc < 100
      if (filtro === 'ACIMA') return perc > 100
      return true
    })
  }

  const ProgressBar = ({ percentual, cor }) => {
    const largura = Math.min(Math.max(percentual, 0), 150)
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
    const resumoAtual = resumoMes || {}
    const saldoPrevisto = resumoAtual.saldo_previsto || 0
    const saldoRealizado = resumoAtual.saldo_realizado || 0

    const { valor: percentualTexto, numerico: percentualNumerico } =
      calcPercentual(saldoPrevisto, saldoRealizado)

    const corSaldo = saldoRealizado >= 0 ? '#27ae60' : '#e74c3c'
    const iconeSaldo = saldoRealizado >= 0 ? 'trending-up' : 'trending-down'

    return (
      <View style={[styles.resumoGeralCard, { borderLeftColor: corSaldo }]}>
        <View style={styles.resumoHeader}>
          <Text style={styles.resumoTituloGeral}>
            Resumo do Mês - {mesSelecionado}
          </Text>
          <MaterialIcons name={iconeSaldo} size={28} color={corSaldo} />
        </View>

        <View style={styles.saldoContainer}>
          <View style={styles.saldoItem}>
            <Text style={styles.saldoLabel}>Saldo Previsto</Text>
            <Text
              style={[
                styles.saldoValor,
                { color: saldoPrevisto >= 0 ? '#27ae60' : '#e74c3c' },
              ]}>
              {saldoPrevisto.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </Text>
          </View>

          <View style={styles.saldoItem}>
            <Text style={styles.saldoLabel}>Saldo Realizado</Text>
            <Text style={[styles.saldoValor, { color: corSaldo }]}>
              {saldoRealizado.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </Text>
          </View>
        </View>

        <View style={styles.diferencaContainer}>
          <Text style={styles.diferencaLabel}>Diferença</Text>
          <Text style={[styles.diferencaValor, { color: corSaldo }]}>
            {(
              Math.abs(saldoRealizado) - Math.abs(saldoPrevisto)
            ).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </Text>
        </View>
      </View>
    )
  }

  const ResumoCard = ({ grupo, dados }) => {
    let totalPrevisto, totalRealizado

    if (Array.isArray(dados)) {
      totalPrevisto = dados.reduce((acc, cur) => acc + cur.valor_previsto, 0)
      totalRealizado = dados.reduce((acc, cur) => acc + cur.valor_realizado, 0)
    } else {
      totalPrevisto = dados.previsto || 0
      totalRealizado = dados.realizado || 0
    }

    const { valor: percentualTexto, numerico: percentualNumerico } =
      calcPercentual(totalPrevisto, totalRealizado)
    const cor = obterCor(percentualNumerico)
    const icone = obterIcone(percentualNumerico)

    return (
      <View style={[styles.resumoCard, { borderLeftColor: cor }]}>
        <View style={styles.resumoHeader}>
          <Text style={styles.resumoTitulo}>{grupo}</Text>
          <MaterialIcons name={icone} size={24} color={cor} />
        </View>

        <View style={styles.resumoValores}>
          <View style={styles.valorItem}>
            <Text style={styles.valorLabel}>Orçado</Text>
            <Text style={styles.valorTexto}>
              {totalPrevisto.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </Text>
          </View>

          <View style={styles.valorItem}>
            <Text style={styles.valorLabel}>Realizado</Text>
            <Text style={[styles.valorTexto, { color: cor }]}>
              {totalRealizado.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </Text>
          </View>
        </View>

        <View style={styles.percentualContainer}>
          <Text style={[styles.percentualTexto, { color: cor }]}>
            {percentualTexto}
          </Text>
          <ProgressBar percentual={percentualNumerico} cor={cor} />
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

    if (resumoMes.Receitas || resumoMes.Despesas) {
      const gruposComDados = []

      if (resumoMes.Receitas) {
        gruposComDados.push({
          nome: 'Receitas',
          dados: resumoMes.Receitas,
        })
      }

      if (resumoMes.Despesas) {
        gruposComDados.push({
          nome: 'Despesas',
          dados: resumoMes.Despesas,
        })
      }

      if (gruposComDados.length > 0) {
        items.push({
          type: 'resumo_cards',
          id: 'resumo_cards',
          grupos: gruposComDados,
        })
      }
    }

    // Adiciona detalhamento se disponível
    if (dadosMes && Object.keys(dadosMes).length > 0) {
      ;['Receitas', 'Despesas'].forEach((grupo) => {
        const grupoContas = Array.isArray(dadosMes[grupo])
          ? dadosMes[grupo]
          : []

        if (grupoContas.length > 0) {
          const contasFiltradas = filtrarContas(grupoContas)

          if (contasFiltradas.length > 0) {
            items.push({
              type: 'grupo_header',
              id: `header_${grupo}`,
              grupo,
            })

            // Adiciona cada conta
            contasFiltradas.forEach((conta, index) => {
              items.push({
                type: 'conta',
                id: `${empresaId}-${filialId}-${grupo}-${conta.conta}-${index}`,
                grupo,
                conta,
                index,
              })
            })
          }
        }
      })
    }

    return items
  }, [dadosMes, resumoMes, filtro, empresaId, filialId, mesSelecionado])

  // Renderiza cada item da lista principal
  const renderItem = ({ item }) => {
    switch (item.type) {
      case 'resumo_geral':
        return <ResumoGeralCard />

      case 'resumo_cards':
        return (
          <View style={styles.cardsContainer}>
            {item.grupos.map((grupo, index) => (
              <ResumoCard
                key={grupo.nome}
                grupo={grupo.nome}
                dados={grupo.dados}
              />
            ))}
          </View>
        )

      case 'grupo_header':
        return (
          <View style={styles.grupoHeaderContainer}>
            <Text style={styles.tituloGrupoDetalhado}>
              Detalhamento - {item.grupo}
            </Text>
          </View>
        )

      case 'conta':
        return renderConta({ item: item.conta })

      default:
        return null
    }
  }

  const renderConta = useCallback(({ item }) => {
    const { valor: percentualTexto, numerico: percentualNumerico } =
      calcPercentual(item.valor_previsto, item.valor_realizado)
    const cor = obterCor(percentualNumerico)
    const icone = obterIcone(percentualNumerico)

    return (
      <View style={styles.contaCard}>
        <View style={styles.contaHeader}>
          <View style={styles.contaInfo}>
            <Text style={styles.contaCodigo}>{item.conta}</Text>
            <Text style={styles.contaNome}>{item.nome}</Text>
          </View>
          <MaterialIcons name={icone} size={20} color={cor} />
        </View>

        <View style={styles.contaValores}>
          <View style={styles.contaValorItem}>
            <Text style={styles.contaValorLabel}>Orçado</Text>
            <Text style={styles.contaValorTexto}>
              {item.valor_previsto.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </Text>
          </View>

          <View style={styles.contaValorItem}>
            <Text style={styles.contaValorLabel}>Realizado</Text>
            <Text style={[styles.contaValorTexto, { color: cor }]}>
              {item.valor_realizado.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </Text>
          </View>
        </View>

        <View style={styles.contaPercentual}>
          <Text style={[styles.contaPercentualTexto, { color: cor }]}>
            {percentualTexto}
          </Text>
          <ProgressBar percentual={percentualNumerico} cor={cor} />
        </View>
      </View>
    )
  }, [])

  if (loading)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Carregando dados financeiros...</Text>
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
        <Text style={styles.headerTitle}>💰 Dashboard Financeiro</Text>
        <Text style={styles.headerSubtitle}>Orçado vs Realizado</Text>
      </View>

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

      {/* Filtros de controle */}
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
                : opt === 'ABAIXO'
                ? 'Abaixo'
                : 'Acima'}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#667eea',
    paddingTop: 30,
    paddingBottom: 10,
    paddingHorizontal: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
    marginTop: 4,
  },

  mesSelectorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 8,
    gap: 6,
  },

  mesButtonGrid: {
    width: '20%',
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    marginBottom: 6,
    minHeight: 30,
  },

  mesSelecionado: {
    backgroundColor: '#007bff',
  },

  mesTexto: {
    fontSize: 12,
    color: '#333',
  },

  mesTextoSelecionado: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },

  // Filtros
  filtros: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  filtroButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filtroSelecionado: {
    backgroundColor: '#28a745',
    shadowColor: '#28a745',
    shadowOpacity: 0.3,
  },
  filtroTexto: {
    color: '#333',
    fontWeight: '600',
    fontSize: 12,
  },
  filtroTextoSelecionado: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },

  // Lista
  lista: {
    flex: 1,
  },
  listaContent: {
    paddingBottom: 20,
  },

  // Card de resumo geral
  resumoGeralCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  resumoTituloGeral: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  saldoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  saldoItem: {
    flex: 1,
    alignItems: 'center',
  },
  saldoLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 6,
    fontWeight: '600',
  },
  saldoValor: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  diferencaContainer: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  diferencaLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 6,
    fontWeight: '600',
  },
  diferencaValor: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  // Cards de resumo por grupo
  cardsContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  resumoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  resumoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resumoTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  resumoValores: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  valorItem: {
    flex: 1,
  },
  valorLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
    fontWeight: '600',
  },
  valorTexto: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  percentualContainer: {
    alignItems: 'center',
  },
  percentualTexto: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  // Progress Bar
  progressContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },

  // Header do grupo detalhado
  grupoHeaderContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  tituloGrupoDetalhado: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
  },

  // Cards de conta
  contaCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  contaInfo: {
    flex: 1,
  },
  contaCodigo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007bff',
  },
  contaNome: {
    fontSize: 16,
    color: '#2c3e50',
    marginTop: 2,
  },
  contaValores: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  contaValorItem: {
    flex: 1,
  },
  contaValorLabel: {
    fontSize: 11,
    color: '#7f8c8d',
    marginBottom: 2,
    fontWeight: '600',
  },
  contaValorTexto: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  contaPercentual: {
    alignItems: 'center',
  },
  contaPercentualTexto: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },

  // Estados de loading e erro
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6c757d',
  },
  erroContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  erroTexto: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginVertical: 16,
  },
  botaoTentarNovamente: {
    backgroundColor: '#007bff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },
  botaoTentarNovamenteTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
})
