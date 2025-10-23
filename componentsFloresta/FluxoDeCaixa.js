import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'
import { apiGetComContexto } from '../utils/api'
import { useRoute, useNavigation } from '@react-navigation/native'
import useContextoApp from '../hooks/useContextoApp'
import { Card } from 'react-native-paper'
import DateTimePicker from '@react-native-community/datetimepicker'

export default function FluxoDeCaixa() {
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState(null)
  const [dataInicial, setDataInicial] = useState(new Date('2025-01-01'))
  const [dataFinal, setDataFinal] = useState(new Date('2025-03-31'))
  const [dados, setDados] = useState(null)
  const [showPickerInicial, setShowPickerInicial] = useState(false)
  const [showPickerFinal, setShowPickerFinal] = useState(false)
  const [filtroNivel, setFiltroNivel] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [busca, setBusca] = useState('')
  const [expandidos, setExpandidos] = useState(new Set())
  
  const route = useRoute()
  const navigation = useNavigation()

  const carregarDados = async () => {
    try {
      setLoading(true)
      setErro(null)
      
      const params = {
        data_ini: dataInicial.toISOString().split('T')[0],
        data_fim: dataFinal.toISOString().split('T')[0],
      }
      
      const response = await apiGetComContexto('Floresta/fluxo-gerencial/', params)
      setDados(response)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      setErro('Erro ao carregar dados de fluxo de caixa')
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível carregar os dados'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [dataInicial, dataFinal])

  const formatarValor = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor || 0)
  }

  const formatarData = (data) => {
    if (!data) return '-'
    const dataObj = data instanceof Date ? data : new Date(data)
    return dataObj.toLocaleDateString('pt-BR')
  }

  const onChangeDataInicial = (event, selectedDate) => {
    setShowPickerInicial(false)
    if (selectedDate) {
      setDataInicial(selectedDate)
    }
  }

  const onChangeDataFinal = (event, selectedDate) => {
    setShowPickerFinal(false)
    if (selectedDate) {
      setDataFinal(selectedDate)
    }
  }

  const toggleExpand = (codigo) => {
    setExpandidos(prev => {
      const newSet = new Set(prev)
      if (newSet.has(codigo)) {
        newSet.delete(codigo)
      } else {
        newSet.add(codigo)
      }
      return newSet
    })
  }

  const orcadoTotal = dados?.orcado_total || 0
  const realizadoTotal = dados?.realizado_total || 0
  const diferenca = realizadoTotal - orcadoTotal
  const percExecucao = orcadoTotal > 0 ? ((realizadoTotal / orcadoTotal) * 100).toFixed(1) : 0
  const centrosCusto = dados?.centros_custo || []

  const getCorNivel = (nivel) => {
    const cores = {
      1: '#ddd6fe',
      2: '#bfdbfe', 
      3: '#bbf7d0',
      4: '#fde68a'
    }
    return cores[nivel] || '#f3f4f6'
  }

  const getCorBarra = (perc) => {
    if (perc >= 100) return '#10b981'
    if (perc >= 80) return '#3b82f6'
    return '#f59e0b'
  }

  const renderCentroCusto = (item) => {
    const isExpandido = expandidos.has(item.codigo)
    const temFilhos = item.tipo === 'S'
    
    return (
      <View key={item.codigo}>
        <View style={[
          styles.linhaGrid,
          item.nivel === 1 && styles.nivel1,
          item.nivel === 2 && styles.nivel2
        ]}>
          <View style={styles.celulaExpand}>
            {temFilhos ? (
              <TouchableOpacity 
                style={styles.btnExpand}
                onPress={() => toggleExpand(item.codigo)}
              >
                <Text style={styles.btnExpandText}>
                  {isExpandido ? '−' : '+'}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={{width: 30}} />
            )}
          </View>
          
          <View style={styles.celulaCodigo}>
            <Text style={styles.codigoText}>
              {'  '.repeat(item.nivel - 1)}{item.expandido}
            </Text>
          </View>
          
          <View style={styles.celulaNome}>
            <Text style={[styles.nomeText, item.tipo === 'S' && styles.nomeBold]}>
              {item.nome}
            </Text>
          </View>
          
          <View style={styles.celulaNivel}>
            <View style={[styles.badge, {backgroundColor: getCorNivel(item.nivel)}]}>
              <Text style={styles.badgeText}>N{item.nivel}</Text>
            </View>
          </View>
          
          <View style={styles.celulaTipo}>
            <View style={[styles.badge, {backgroundColor: item.tipo === 'S' ? '#e0e7ff' : '#f3f4f6'}]}>
              <Text style={styles.badgeText}>{item.tipo === 'S' ? 'Sint.' : 'Anal.'}</Text>
            </View>
          </View>
          
          <View style={styles.celulaValor}>
            <Text style={styles.valorText}>{formatarValor(item.orcado)}</Text>
          </View>
          
          <View style={styles.celulaValor}>
            <Text style={styles.valorText}>{formatarValor(item.realizado)}</Text>
          </View>
          
          <View style={styles.celulaValor}>
            <Text style={[styles.valorBold, {color: item.diferenca >= 0 ? '#10b981' : '#ef4444'}]}>
              {item.diferenca >= 0 ? '▲' : '▼'} {formatarValor(Math.abs(item.diferenca))}
            </Text>
          </View>
          
          <View style={styles.celulaExecucao}>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(item.percExec, 100)}%`,
                    backgroundColor: getCorBarra(item.percExec)
                  }
                ]} />
              </View>
              <Text style={styles.percText}>{item.percExec}%</Text>
            </View>
          </View>
        </View>
        
        {isExpandido && item.filhos && item.filhos.map(filho => renderCentroCusto(filho))}
      </View>
    )
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header Azul */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Resultado Financeiro por Centros de Custo</Text>
      </View>

      {/* Cards de Resumo */}
      <View style={styles.cardsContainer}>
        <Card style={[styles.card, styles.cardBorderBlue]}>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.cardLabel}>ORÇADO TOTAL</Text>
            <Text style={styles.cardValue}>{formatarValor(orcadoTotal)}</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.card, styles.cardBorderGreen]}>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.cardLabel}>REALIZADO TOTAL</Text>
            <Text style={styles.cardValue}>{formatarValor(realizadoTotal)}</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.card, styles.cardBorderPurple]}>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.cardLabel}>DIFERENÇA</Text>
            <Text style={[styles.cardValue, {color: diferenca >= 0 ? '#16a34a' : '#dc2626'}]}>
              {diferenca >= 0 ? '' : '-'}{formatarValor(Math.abs(diferenca))}
            </Text>
          </Card.Content>
        </Card>

        <Card style={[styles.card, styles.cardBorderOrange]}>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.cardLabel}>% EXECUÇÃO</Text>
            <Text style={styles.cardValue}>{percExecucao}%</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Filtros */}
      <View style={styles.filtrosContainer}>
        <View style={styles.filtroItem}>
          <Text style={styles.filtroLabel}>Data Início:</Text>
          <TouchableOpacity 
            style={styles.dateInput}
            onPress={() => setShowPickerInicial(true)}
          >
            <Text style={styles.dateInputText}>{formatarData(dataInicial)}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filtroItem}>
          <Text style={styles.filtroLabel}>Data Fim:</Text>
          <TouchableOpacity 
            style={styles.dateInput}
            onPress={() => setShowPickerFinal(true)}
          >
            <Text style={styles.dateInputText}>{formatarData(dataFinal)}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filtroItem}>
          <Text style={styles.filtroLabel}>Filtrar por Nível:</Text>
          <TextInput
            style={styles.filtroInput}
            placeholder="Todos"
            value={filtroNivel}
            onChangeText={setFiltroNivel}
          />
        </View>

        <View style={styles.filtroItem}>
          <Text style={styles.filtroLabel}>Filtrar por Tipo:</Text>
          <TextInput
            style={styles.filtroInput}
            placeholder="Todos"
            value={filtroTipo}
            onChangeText={setFiltroTipo}
          />
        </View>

        <View style={[styles.filtroItem, styles.filtroItemWide]}>
          <Text style={styles.filtroLabel}>Buscar:</Text>
          <TextInput
            style={styles.filtroInput}
            placeholder="Digite código ou nome..."
            value={busca}
            onChangeText={setBusca}
          />
        </View>
      </View>

      {showPickerInicial && (
        <DateTimePicker
          value={dataInicial}
          mode="date"
          display="default"
          onChange={onChangeDataInicial}
        />
      )}

      {showPickerFinal && (
        <DateTimePicker
          value={dataFinal}
          mode="date"
          display="default"
          onChange={onChangeDataFinal}
        />
      )}

      {/* Grid de Dados */}
      <View style={styles.gridContainer}>
        {/* Header do Grid */}
        <View style={styles.gridHeader}>
          <View style={styles.headerExpand}><Text style={styles.headerText}>Exp</Text></View>
          <View style={styles.headerCodigo}><Text style={styles.headerText}>Código</Text></View>
          <View style={styles.headerNome}><Text style={styles.headerText}>Nome</Text></View>
          <View style={styles.headerNivel}><Text style={styles.headerText}>Nível</Text></View>
          <View style={styles.headerTipo}><Text style={styles.headerText}>Tipo</Text></View>
          <View style={styles.headerValor}><Text style={styles.headerText}>Orçado</Text></View>
          <View style={styles.headerValor}><Text style={styles.headerText}>Realizado</Text></View>
          <View style={styles.headerValor}><Text style={styles.headerText}>Diferença</Text></View>
          <View style={styles.headerExecucao}><Text style={styles.headerText}>% Execução</Text></View>
        </View>

        {/* Dados */}
        <ScrollView style={styles.gridScroll}>
          {centrosCusto.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="receipt-long" size={48} color="#bdc3c7" />
              <Text style={styles.emptyText}>Nenhum lançamento encontrado</Text>
            </View>
          ) : (
            centrosCusto.map(item => renderCentroCusto(item))
          )}
        </ScrollView>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#7f8c8d',
  },
  header: {
    backgroundColor: '#20384bff',
    padding: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#1b2b38',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',    
    alignSelf: 'center',
    color: '#f0dbadff',
  },
  cardsContainer: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
    backgroundColor: '#f0f0f0',
  },
  card: {
    flex: 1,
    elevation: 2,
    backgroundColor: '#fff',
  },
  cardBorderBlue: {
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  cardBorderGreen: {
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  cardBorderPurple: {
    borderLeftWidth: 4,
    borderLeftColor: '#8b5cf6',
  },
  cardBorderOrange: {
    borderLeftWidth: 4,
    borderLeftColor: '#f97316',
  },
  cardContent: {
    paddingVertical: 8,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  filtrosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    marginHorizontal: 12,
    marginBottom: 12,
  },
  filtroItem: {
    width: '18%',
  },
  filtroItemWide: {
    width: '28%',
  },
  filtroLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#9ca3af',
    borderRadius: 4,
    padding: 8,
    backgroundColor: '#fff',
  },
  dateInputText: {
    fontSize: 12,
    color: '#1f2937',
  },
  filtroInput: {
    borderWidth: 1,
    borderColor: '#9ca3af',
    borderRadius: 4,
    padding: 8,
    fontSize: 12,
    backgroundColor: '#fff',
  },
  gridContainer: {
    marginHorizontal: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    maxHeight: 400,
  },
  gridHeader: {
    flexDirection: 'row',
    backgroundColor: '#3b82f6',
    borderBottomWidth: 1,
    borderBottomColor: '#1e40af',
  },
  headerText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerExpand: {
    width: 40,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#1e40af',
  },
  headerCodigo: {
    width: 120,
    padding: 8,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#1e40af',
  },
  headerNome: {
    flex: 1,
    padding: 8,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#1e40af',
  },
  headerNivel: {
    width: 70,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#1e40af',
  },
  headerTipo: {
    width: 70,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#1e40af',
  },
  headerValor: {
    width: 110,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#1e40af',
  },
  headerExecucao: {
    width: 130,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridScroll: {
    maxHeight: 340,
  },
  linhaGrid: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
  },
  nivel1: {
    backgroundColor: '#f0f0ff',
  },
  nivel2: {
    backgroundColor: '#f8f8ff',
  },
  celulaExpand: {
    width: 40,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  btnExpand: {
    width: 26,
    height: 26,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnExpandText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  celulaCodigo: {
    width: 120,
    padding: 8,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  codigoText: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
  celulaNome: {
    flex: 1,
    padding: 8,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  nomeText: {
    fontSize: 12,
  },
  nomeBold: {
    fontWeight: 'bold',
  },
  celulaNivel: {
    width: 70,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  celulaTipo: {
    width: 70,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  celulaValor: {
    width: 110,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'flex-end',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  valorText: {
    fontSize: 11,
    fontWeight: '600',
  },
  valorBold: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  celulaExecucao: {
    width: 130,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    width: 60,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  percText: {
    fontSize: 10,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#95a5a6',
  },
})