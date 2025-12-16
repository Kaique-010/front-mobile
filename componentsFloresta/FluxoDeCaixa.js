import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, TextInput, useWindowDimensions } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Toast from 'react-native-toast-message'
import { apiGetComContexto } from '../utils/api'
import { useRoute, useNavigation } from '@react-navigation/native'

export default function FluxoDeCaixa() {
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState(null)
  const [mesInicial, setMesInicial] = useState(1)
  const [mesFinal, setMesFinal] = useState(3)
  const [dados, setDados] = useState(null)
  const [filtroNivel, setFiltroNivel] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [busca, setBusca] = useState('')
  const [expandidos, setExpandidos] = useState(new Set())
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  
  const { width } = useWindowDimensions()
  const isSmallScreen = width < 768
  const route = useRoute()
  const navigation = useNavigation()

  const meses = [
    { nome: 'Janeiro', num: 1 },
    { nome: 'Fevereiro', num: 2 },
    { nome: 'Março', num: 3 },
    { nome: 'Abril', num: 4 },
    { nome: 'Maio', num: 5 },
    { nome: 'Junho', num: 6 },
    { nome: 'Julho', num: 7 },
    { nome: 'Agosto', num: 8 },
    { nome: 'Setembro', num: 9 },
    { nome: 'Outubro', num: 10 },
    { nome: 'Novembro', num: 11 },
    { nome: 'Dezembro', num: 12 },
  ]

  const carregarDados = async () => {
    try {
      setLoading(true)
      const params = {
        mes_ini: mesInicial,
        mes_fim: mesFinal,
        nivel: filtroNivel || '',
        tipo: filtroTipo || '',
        busca: busca || ''
      }
      const response = await apiGetComContexto('Floresta/fluxo-gerencial/', params)
      setDados(response)
    } catch (e) {
      console.error(e)
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Falha ao carregar dados' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [mesInicial, mesFinal, filtroNivel, filtroTipo, busca])

  const formatarValor = (valor) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0)
  }

  const toggleExpand = (codigo) => {
    setExpandidos(prev => {
      const newSet = new Set(prev)
      if (newSet.has(codigo)) newSet.delete(codigo)
      else newSet.add(codigo)
      return newSet
    })
  }

  const getCorNivel = (nivel) => {
    const cores = { 1: '#ddd6fe', 2: '#bfdbfe', 3: '#bbf7d0', 4: '#fde68a' }
    return cores[nivel] || '#f3f4f6'
  }

  const getCorBarra = (perc) => {
    if (perc >= 100) return '#10b981'
    if (perc >= 80) return '#3b82f6'
    return '#f59e0b'
  }

  const navegarParaDashboard = async () => {
    try {
      // Salvar dados no AsyncStorage para evitar limite de serialização
      await AsyncStorage.setItem('dashboardFluxoData', JSON.stringify(dados))
      
      navigation.navigate('DashboardFluxo', { 
        mesInicial, 
        mesFinal
      })
    } catch (error) {
      console.error('Erro ao salvar dados para dashboard:', error)
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível abrir o dashboard'
      })
    }
  }

  const centrosCusto = dados?.centros_custo || []
  const orcadoTotal = dados?.orcado_total || 0
  const realizadoTotal = dados?.realizado_total || 0
  const diferenca = realizadoTotal - orcadoTotal
  const percExecucao = orcadoTotal > 0 ? ((realizadoTotal / orcadoTotal) * 100).toFixed(1) : 0

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
              <TouchableOpacity style={styles.btnExpand} onPress={() => toggleExpand(item.codigo)}>
                <Text style={styles.btnExpandText}>{isExpandido ? '−' : '+'}</Text>
              </TouchableOpacity>
            ) : <View style={{width: 26}} />}
          </View>

          <View style={styles.celulaCodigo}>
            <Text style={styles.codigoText} numberOfLines={1}>{item.expandido}</Text>
          </View>

          <View style={styles.celulaNome}>
            <Text style={[styles.nomeText, item.tipo === 'S' && styles.nomeBold]} numberOfLines={2}>{item.nome}</Text>
          </View>

          <View style={styles.celulaMes}>
            <Text style={styles.mesText}>{item.mes}</Text>
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

          <View style={styles.celulaValor}><Text style={styles.valorText} numberOfLines={1}>{formatarValor(item.orcado)}</Text></View>
          <View style={styles.celulaValor}><Text style={styles.valorText} numberOfLines={1}>{formatarValor(item.realizado)}</Text></View>
          <View style={styles.celulaValor}>
            <Text style={[styles.valorBold, {color: item.diferenca >= 0 ? '#10b981' : '#ef4444'}]} numberOfLines={1}>
              {item.diferenca >= 0 ? '▲' : '▼'} {formatarValor(Math.abs(item.diferenca))}
            </Text>
          </View>

          <View style={styles.celulaExecucao}>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[
                  styles.progressFill,
                  {width: `${Math.min(item.percExec, 100)}%`, backgroundColor: getCorBarra(item.percExec)}
                ]}/>
              </View>
              <Text style={styles.percText}>{item.percExec}%</Text>
            </View>
          </View>
        </View>

        {isExpandido && item.filhos && item.filhos.map((filho, index) => (
          <View key={`${item.codigo}-filho-${filho.codigo}-${index}`}>
            {renderCentroCusto(filho)}
          </View>
        ))}
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Resultado Financeiro por Centro de Custo</Text>
      </View>

      {/* Toggle filtros no mobile */}
      {isSmallScreen && (
        <TouchableOpacity 
          style={styles.filtrosToggle}
          onPress={() => setMostrarFiltros(!mostrarFiltros)}
        >
          <MaterialIcons name="filter-list" size={20} color="#3b82f6" />
          <Text style={styles.filtrosToggleText}>{mostrarFiltros ? 'Ocultar Filtros' : 'Mostrar Filtros'}</Text>
          <MaterialIcons name={mostrarFiltros ? "expand-less" : "expand-more"} size={20} color="#3b82f6" />
        </TouchableOpacity>
      )}

      {(!isSmallScreen || mostrarFiltros) && (
        <View style={styles.filtrosContainer}>
          {/* Primeira linha: Mês inicial e final */}
          <View style={styles.filtroRowMeses}>
            <View style={styles.filtroMesItem}>
              <Text style={styles.filtroLabel}>Mês Início:</Text>
              <View style={styles.filtroSelect}>
                {meses.map(m => (
                  <TouchableOpacity key={`inicio-${m.num}`} onPress={() => setMesInicial(m.num)}
                    style={[styles.mesBtn, mesInicial === m.num && styles.mesBtnAtivo]}>
                    <Text style={[styles.mesBtnText, mesInicial === m.num && styles.mesBtnTextAtivo]}>
                      {m.nome.slice(0,3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filtroMesItem}>
              <Text style={styles.filtroLabel}>Mês Fim:</Text>
              <View style={styles.filtroSelect}>
                {meses.map(m => (
                  <TouchableOpacity key={`fim-${m.num}`} onPress={() => setMesFinal(m.num)}
                    style={[styles.mesBtn, mesFinal === m.num && styles.mesBtnAtivo]}>
                    <Text style={[styles.mesBtnText, mesFinal === m.num && styles.mesBtnTextAtivo]}>
                      {m.nome.slice(0,3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Segunda linha: Outros filtros com space-between */}
          <View style={styles.filtroRowOutros}>
            <View style={styles.filtroOutroItem}>
              <Text style={styles.filtroLabel}>Nível:</Text>
              <TextInput
                style={styles.filtroInput}
                placeholder="Todos"
                value={filtroNivel}
                onChangeText={setFiltroNivel}
              />
            </View>

            <View style={styles.filtroOutroItem}>
              <Text style={styles.filtroLabel}>Tipo:</Text>
              <TextInput
                style={styles.filtroInput}
                placeholder="Todos"
                value={filtroTipo}
                onChangeText={setFiltroTipo}
              />
            </View>

            <View style={styles.filtroOutroItem}>
              <Text style={styles.filtroLabel}>Buscar:</Text>
              <TextInput
                style={styles.filtroInput}
                placeholder="Digite código ou nome..."
                value={busca}
                onChangeText={setBusca}
              />
            </View>
          </View>
        </View>
      )}

      {/* Tabela */}
      <View style={styles.gridContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.gridContent}>
            <View style={styles.gridHeader}>
              <View style={styles.headerExpand}><Text style={styles.headerText}>Exp</Text></View>
              <View style={styles.headerCodigo}><Text style={styles.headerText}>Código</Text></View>
              <View style={styles.headerNome}><Text style={styles.headerText}>Nome</Text></View>
              <View style={styles.headerMes}><Text style={styles.headerText}>Mês</Text></View>
              <View style={styles.headerNivel}><Text style={styles.headerText}>Nível</Text></View>
              <View style={styles.headerTipo}><Text style={styles.headerText}>Tipo</Text></View>
              <View style={styles.headerValor}><Text style={styles.headerText}>Orçado</Text></View>
              <View style={styles.headerValor}><Text style={styles.headerText}>Realizado</Text></View>
              <View style={styles.headerValor}><Text style={styles.headerText}>Diferença</Text></View>
              <View style={styles.headerExecucao}><Text style={styles.headerText}>% Execução</Text></View>
            </View>

            <ScrollView style={styles.gridScroll}>
              {centrosCusto.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <MaterialIcons name="receipt-long" size={48} color="#bdc3c7" />
                  <Text style={styles.emptyText}>Nenhum lançamento encontrado</Text>
                </View>
              ) : (
                centrosCusto.map((item, index) => (
                  <View key={`centro-custo-${item.codigo}-${index}`}>
                    {renderCentroCusto(item)}
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </ScrollView>

        {/* Rodapé */}
        <View style={styles.footerResumo}>
          <View style={styles.footerItem}>
            <Text style={styles.footerText}>Total Orçado:</Text>
            <Text style={styles.footerValue}>{formatarValor(orcadoTotal)}</Text>
          </View>
          <View style={styles.footerItem}>
            <Text style={styles.footerText}>Total Realizado:</Text>
            <Text style={styles.footerValue}>{formatarValor(realizadoTotal)}</Text>
          </View>
          <View style={styles.footerItem}>
            <Text style={styles.footerText}>Diferença:</Text>
            <Text style={[styles.footerValue, {color: diferenca >= 0 ? '#10b981' : '#ef4444'}]}>
              {formatarValor(diferenca)}
            </Text>
          </View>
          <View style={styles.footerItem}>
            <Text style={styles.footerText}>Execução:</Text>
            <Text style={styles.footerValue}>{percExecucao}%</Text>
          </View>
        </View>
      </View>

      {/* Botão Dashboard */}
      <TouchableOpacity style={styles.dashboardButton} onPress={navegarParaDashboard}>
        <MaterialIcons name="dashboard" size={24} color="#fff" />
        <Text style={styles.dashboardButtonText}>Ver Dashboard</Text>
        <MaterialIcons name="arrow-forward" size={20} color="#fff" />
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#7f8c8d' },
  header: { backgroundColor: '#20384bff', padding: 16, borderBottomWidth: 2, borderBottomColor: '#1b2b38' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', color: '#f0dbadff' },
  
  // Toggle filtros
  filtrosToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#fff', padding: 12, margin: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  filtrosToggleText: { fontSize: 14, fontWeight: '600', color: '#3b82f6' },
  
  // Container principal dos filtros
  filtrosContainer: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, marginHorizontal: 12, marginBottom: 12, padding: 12 },
  
  // Primeira linha: Meses
  filtroRowMeses: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  filtroMesItem: { flex: 1, marginHorizontal: 6 },
  
  // Segunda linha: Outros filtros
  filtroRowOutros: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  filtroOutroItem: { flex: 1 },
  
  // Elementos dos filtros
  filtroLabel: { fontSize: 12, fontWeight: 'bold', color: '#374151', marginBottom: 6 },
  filtroInput: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 6, padding: 10, fontSize: 13, backgroundColor: '#fff' },
  filtroSelect: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  mesBtn: { paddingVertical: 4, paddingHorizontal: 6, borderRadius: 4, borderWidth: 1, borderColor: '#d1d5db', backgroundColor: '#fff' },
  mesBtnAtivo: { backgroundColor: '#3b82f6', borderColor: '#2563eb' },
  mesBtnText: { fontSize: 11, color: '#1f2937' },
  mesBtnTextAtivo: { color: '#fff', fontWeight: 'bold' },
  
  // Grid/Tabela
  gridContainer: { flex: 1, marginHorizontal: 12, marginBottom: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, overflow: 'hidden' },
  gridContent: { minWidth: 1000 },
  gridHeader: { flexDirection: 'row', backgroundColor: '#3b82f6' },
  headerText: { color: '#fff', fontSize: 11, fontWeight: 'bold', textAlign: 'center' },
  
  // Cabeçalhos das colunas
  headerExpand: { width: 50, padding: 8, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderRightColor: '#1e40af' },
  headerCodigo: { width: 100, padding: 8, justifyContent: 'center', borderRightWidth: 1, borderRightColor: '#1e40af' },
  headerNome: { width: 200, padding: 8, justifyContent: 'center', borderRightWidth: 1, borderRightColor: '#1e40af' },
  headerMes: { width: 80, padding: 8, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderRightColor: '#1e40af' },
  headerNivel: { width: 70, padding: 8, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderRightColor: '#1e40af' },
  headerTipo: { width: 70, padding: 8, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderRightColor: '#1e40af' },
  headerValor: { width: 120, padding: 8, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderRightColor: '#1e40af' },
  headerExecucao: { width: 130, padding: 8, justifyContent: 'center', alignItems: 'center' },
  
  gridScroll: { maxHeight: 400 },
  
  // Linhas da tabela
  linhaGrid: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', backgroundColor: '#fff', minHeight: 50 },
  nivel1: { backgroundColor: '#f0f0ff' },
  nivel2: { backgroundColor: '#f8f8ff' },
  
  // Células da tabela
  celulaExpand: { width: 50, padding: 8, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderRightColor: '#e5e7eb' },
  btnExpand: { width: 26, height: 26, backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#9ca3af', borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  btnExpandText: { fontSize: 16, fontWeight: 'bold', color: '#374151' },
  celulaCodigo: { width: 100, padding: 8, justifyContent: 'center', borderRightWidth: 1, borderRightColor: '#e5e7eb' },
  codigoText: { fontSize: 11, color: '#374151', textAlign: 'center' },
  celulaNome: { width: 200, padding: 8, justifyContent: 'center', borderRightWidth: 1, borderRightColor: '#e5e7eb' },
  nomeText: { fontSize: 11, color: '#374151' },
  nomeBold: { fontWeight: 'bold' },
  celulaMes: { width: 80, padding: 8, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderRightColor: '#e5e7eb' },
  mesText: { fontSize: 11, color: '#374151' },
  celulaNivel: { width: 70, padding: 8, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderRightColor: '#e5e7eb' },
  celulaTipo: { width: 70, padding: 8, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderRightColor: '#e5e7eb' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  badgeText: { fontSize: 9, fontWeight: 'bold', color: '#374151' },
  celulaValor: { width: 120, padding: 8, justifyContent: 'center', alignItems: 'flex-end', borderRightWidth: 1, borderRightColor: '#e5e7eb' },
  valorText: { fontSize: 10, fontWeight: '600', color: '#1f2937', textAlign: 'right' },
  valorBold: { fontSize: 10, fontWeight: 'bold', textAlign: 'right' },
  celulaExecucao: { width: 130, padding: 8, justifyContent: 'center', alignItems: 'center' },
  progressContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressBar: { width: 60, height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%' },
  percText: { fontSize: 10, fontWeight: '600', color: '#1f2937' },
  
  // Footer
  footerResumo: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 12, backgroundColor: '#f9fafb', borderTopWidth: 1, borderTopColor: '#d1d5db', flexWrap: 'wrap' },
  footerItem: { alignItems: 'center', minWidth: '20%', marginVertical: 4 },
  footerText: { fontSize: 11, fontWeight: '600', color: '#6b7280', textAlign: 'center' },
  footerValue: { fontSize: 12, fontWeight: 'bold', color: '#1f2937', textAlign: 'center', marginTop: 2 },
  
  // Botão Dashboard
  dashboardButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#3b82f6', marginHorizontal: 12, marginBottom: 20, paddingVertical: 16, paddingHorizontal: 24, borderRadius: 12, gap: 12, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  dashboardButtonText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  
  // Empty state
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48 },
  emptyText: { marginTop: 12, fontSize: 16, color: '#9ca3af' }
})
