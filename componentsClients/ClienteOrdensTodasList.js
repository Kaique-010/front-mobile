import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { fetchClienteOrdensTodas } from '../services/clienteService'
import { formatCurrency, formatDate } from '../utils/formatters'
import DatePickerCrossPlatform from '../components/DatePickerCrossPlatform'
import { useFocusEffect } from '@react-navigation/native'

const STATUS_OPTIONS = [
  { label: 'Todas', value: '' },
  { label: 'Aberta', value: '0' },
  { label: 'Orçamento Gerado', value: '1' },
  { label: 'Aguardando liberação', value: '2' },
  { label: 'Liberada', value: '3' },
  { label: 'Finalizada', value: '4' },
  { label: 'Reprovada', value: '5' },
  { label: 'Parcial', value: '20' },
  { label: 'Em atraso', value: '21' },
  { label: 'Em Estoque', value: '22' },
  { label: 'Em Andamento', value: 'E' },
  { label: 'Concluída', value: 'C' },
  { label: 'Cancelada', value: 'X' },
]

const ORDEM_TIPOS = {
  1: 'Motor C.A',
  2: 'Motor C.C',
  3: 'Motor E.X',
  4: 'Motor Sincrono',
  5: 'Motor Monofásico',
  6: 'Transformador',
  7: 'Servo Motor',
  8: 'Drives',
  9: 'Campo M.C.A',
  10: 'Campo Transformador',
  11: 'Campo Geral',
  12: 'Motor Bomba',
  13: 'Bomba',
  14: 'Redutor',
  15: 'Gerador',
  16: 'Eixo',
  17: 'Carcaça',
}

const formatTipoOrdem = (tipo) => {
  const key = String(tipo || '').trim()
  if (!key) return '—'
  const desc = ORDEM_TIPOS[key]
  return desc ? `${key} - ${desc}` : key
}

const TIPO_OPTIONS = [
  { label: 'Todos', value: '' },
  ...Object.entries(ORDEM_TIPOS).map(([k, v]) => ({
    label: `${k} - ${v}`,
    value: String(k),
  })),
]

const ClienteOrdensTodasList = ({ navigation }) => {
  const [ordens, setOrdens] = useState([])
  const [totalOrdens, setTotalOrdens] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Paginação
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  // Estados para filtros
  const [filtrosVisiveis, setFiltrosVisiveis] = useState(false)
  const [statusFiltro, setStatusFiltro] = useState('')
  const [dataInicial, setDataInicial] = useState(null)
  const [dataFinal, setDataFinal] = useState(null)
  const [numeroFiltro, setNumeroFiltro] = useState('')
  const [motorFiltro, setMotorFiltro] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState('')
  const [voltagemFiltro, setVoltagemFiltro] = useState('')
  const [potenciaFiltro, setPotenciaFiltro] = useState('')

  const carregarOrdens = useCallback(
    async (filtrosOverride = null, pagina = 1) => {
      try {
        if (pagina === 1) {
          setLoading(true)
        } else {
          setLoadingMore(true)
        }

        const filtros = filtrosOverride || {
          status: statusFiltro,
          data_inicial: formatarDataParaAPI(dataInicial),
          data_final: formatarDataParaAPI(dataFinal),
          numero: numeroFiltro,
          motor: motorFiltro,
          tipo: tipoFiltro,
          voltagem: voltagemFiltro,
          potencia: potenciaFiltro,
        }

        const params = {
          ordering: '-data_abertura',
          page: pagina,
        }

        if (filtros.status) params.status = filtros.status
        if (filtros.data_inicial) params.data_inicial = filtros.data_inicial
        if (filtros.data_final) params.data_final = filtros.data_final
        if (filtros.numero) params.numero = filtros.numero
        if (filtros.motor) params.motor = filtros.motor
        if (filtros.tipo) params.tipo = filtros.tipo
        if (filtros.voltagem) params.voltagem = filtros.voltagem
        if (filtros.potencia) params.potencia = filtros.potencia

        const data = await fetchClienteOrdensTodas(params)

        if (data && data.results && Array.isArray(data.results)) {
          if (pagina === 1) {
            setOrdens(data.results)
          } else {
            setOrdens((prevOrdens) => [...prevOrdens, ...data.results])
          }

          setTotalOrdens(data.count || data.results.length)
          setHasMore(!!data.next)
          setPage(pagina)
        } else if (Array.isArray(data)) {
          // Fallback para API sem paginação
          setOrdens(data)
          setTotalOrdens(data.length)
          setHasMore(false)
        } else {
          setOrdens([])
          setTotalOrdens(0)
          setHasMore(false)
        }
      } catch (error) {
        console.error('Erro ao carregar ordens de serviço:', error)
        Alert.alert('Erro', 'Não foi possível carregar suas ordens de serviço')
      } finally {
        setLoading(false)
        setLoadingMore(false)
        setRefreshing(false)
      }
    },
    [
      statusFiltro,
      dataInicial,
      dataFinal,
      numeroFiltro,
      motorFiltro,
      tipoFiltro,
      voltagemFiltro,
      potenciaFiltro,
    ],
  )

  useFocusEffect(
    useCallback(() => {
      carregarOrdens(null, 1)
    }, [carregarOrdens]),
  )

  const onRefresh = () => {
    setRefreshing(true)
    carregarOrdens(null, 1)
  }

  const loadMoreOrdens = () => {
    if (!loadingMore && hasMore && !loading) {
      carregarOrdens(null, page + 1)
    }
  }

  const formatarDataParaAPI = (data) => {
    if (!data) return null
    const d = new Date(data)
    return d.toISOString().split('T')[0]
  }

  const aplicarFiltros = () => {
    carregarOrdens(null, 1)
    setFiltrosVisiveis(false)
  }

  const limparFiltros = () => {
    setStatusFiltro('')
    setDataInicial(null)
    setDataFinal(null)
    setNumeroFiltro('')
    setMotorFiltro('')
    setTipoFiltro('')
    setVoltagemFiltro('')
    setPotenciaFiltro('')
    setFiltrosVisiveis(false)
    carregarOrdens(
      {
        status: '',
        data_inicial: null,
        data_final: null,
        numero: '',
        motor: '',
        tipo: '',
        voltagem: '',
        potencia: '',
      },
      1,
    )
  }

  const renderItem = ({ item }) => {
    console.log('ClienteOrdensServicoList item:', item.id, item.ver_preco)
    const statusColor = getStatusColor(item.orde_stat_orde)
    const motorTexto =
      [item.orde_mode, item.orde_seri, item.orde_patr, item.orde_plac]
        .filter(Boolean)
        .join(' | ') || 'Não informado'

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate('ClienteOrdensServicoDetalhes', {
            ordemId: item.id,
            ordemInicial: item,
          })
        }>
        <View style={styles.cardHeader}>
          <Text style={styles.ordemNumero}>
            OS #{item.orde_nume || item.id}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>
              {formatStatus(item.orde_stat_orde)}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>DATA ABERTURA</Text>
            <Text style={styles.infoValue}>
              {formatDate(item.orde_data_aber)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>DATA FECHAMENTO</Text>
            <Text style={styles.infoValue}>
              {formatDate(item.orde_data_fech)}
            </Text>
          </View>

          {item.ver_preco === true && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>VALOR TOTAL</Text>
              <Text style={styles.infoValue}>
                {formatCurrency(item.orde_tota)}
              </Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>MOTOR</Text>
            <Text style={styles.infoValue}>{motorTexto}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>TIPO</Text>
            <Text style={styles.infoValue}>
              {formatTipoOrdem(item.orde_tipo)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>VOLTAGEM</Text>
            <Text style={styles.infoValue}>
              {item.orde_volt != null ? String(item.orde_volt) : '—'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>POTÊNCIA</Text>
            <Text style={styles.infoValue}>{item.orde_pote || '—'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>DEFEITO</Text>
            <Text style={styles.infoValueDefeito}>
              {item.orde_defe_desc || 'Não atribuído'}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Ionicons name="chevron-forward" size={20} color="#00D4FF" />
        </View>

        <View
          style={[styles.cardGlow, { backgroundColor: `${statusColor}08` }]}
        />
      </TouchableOpacity>
    )
  }

  const getStatusColor = (status) => {
    // Handle string or number status
    const statusStr = String(status)
    const statusNum = Number(status)

    if (
      statusNum === 0 ||
      statusStr === '0' ||
      statusStr === 'A' ||
      statusStr === 'aberta'
    )
      return '#93e0d6ff'
    if (statusNum === 1 || statusStr === '1') return '#ada15cff'
    if (statusNum === 2 || statusStr === '2') return '#78bbc9ff'
    if (statusNum === 3 || statusStr === '3') return '#6cac8eff'
    if (
      statusNum === 4 ||
      statusStr === '4' ||
      statusStr === 'C' ||
      statusStr === 'Finalizada'
    )
      return '#94d89dff'
    if (
      statusNum === 5 ||
      statusStr === '5' ||
      statusStr === 'X' ||
      statusStr === 'cancelada'
    )
      return '#d65661ff'
    if (statusNum === 20 || statusStr === '20') return '#FFD700'
    if (statusNum === 21 || statusStr === '21') return '#af4e56ff'
    if (statusNum === 22 || statusStr === '22') return '#72ac91ff'

    return '#8B8BA7'
  }

  const formatStatus = (status) => {
    switch (status) {
      case 'aberta':
      case 'A':
      case 0:
        return 'Aberta'
      case 1:
        return 'Orçamento Gerado'
      case 2:
        return 'Aguardando liberação'
      case 3:
        return 'Liberada'
      case 4:
        return 'Finalizada'
      case 5:
        return 'Reprovada'
      case 20:
        return 'Parcial'
      case 21:
        return 'Em atraso'
      case 22:
        return 'Em Estoque'
      case 'em_andamento':
      case 'E':
        return 'Em Andamento'
      case 'concluida':
      case 'C':
        return 'Concluída'
      case 'cancelada':
      case 'X':
        return 'Cancelada'
      default:
        // Verifica se status é string antes de tentar usar métodos de string
        if (typeof status === 'string') {
          return (
            status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')
          )
        }
        return 'Desconhecido'
    }
  }

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#00D4FF" />
          <Text style={styles.loadingText}>
            Carregando ordens de serviço...
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerActions}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFiltrosVisiveis(!filtrosVisiveis)}>
          <Ionicons name="filter" size={20} color="#00D4FF" />
          <Text style={styles.filterButtonText}>
            {filtrosVisiveis ? 'Ocultar Filtros' : 'Filtrar'}
          </Text>
        </TouchableOpacity>
      </View>

      {filtrosVisiveis && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filterSectionTitle}>Status</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.statusScroll}>
            {STATUS_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.label}
                style={[
                  styles.statusChip,
                  statusFiltro === option.value && styles.statusChipSelected,
                ]}
                onPress={() => setStatusFiltro(option.value)}>
                <Text
                  style={[
                    styles.statusChipText,
                    statusFiltro === option.value &&
                      styles.statusChipTextSelected,
                  ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.filterSectionTitle}>Período</Text>
          <View style={styles.dateRow}>
            <View style={styles.dateInputContainer}>
              <Text style={styles.dateLabel}>De</Text>
              <DatePickerCrossPlatform
                value={dataInicial}
                onChange={setDataInicial}
                placeholder="Data inicial"
                style={styles.datePicker}
                textStyle={styles.datePickerText}
              />
            </View>
            <View style={styles.dateInputContainer}>
              <Text style={styles.dateLabel}>Até</Text>
              <DatePickerCrossPlatform
                value={dataFinal}
                onChange={setDataFinal}
                placeholder="Data final"
                style={styles.datePicker}
                textStyle={styles.datePickerText}
              />
            </View>
          </View>

          <Text style={styles.filterSectionTitle}>Tipo da Ordem</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.statusScroll}>
            {TIPO_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.label}
                style={[
                  styles.statusChip,
                  tipoFiltro === option.value && styles.statusChipSelected,
                ]}
                onPress={() => setTipoFiltro(option.value)}>
                <Text
                  style={[
                    styles.statusChipText,
                    tipoFiltro === option.value &&
                      styles.statusChipTextSelected,
                  ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.filterSectionTitle}>Outros Filtros</Text>
          <View style={styles.dateRow}>
            <View style={styles.dateInputContainer}>
              <Text style={styles.dateLabel}>Número da OS</Text>
              <TextInput
                value={numeroFiltro}
                onChangeText={setNumeroFiltro}
                placeholder="Ex: 12345"
                placeholderTextColor="#8B8BA7"
                style={styles.textInput}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.dateInputContainer}>
              <Text style={styles.dateLabel}>Motor</Text>
              <TextInput
                value={motorFiltro}
                onChangeText={setMotorFiltro}
                placeholder="Modelo / Série / Patrimônio"
                placeholderTextColor="#8B8BA7"
                style={styles.textInput}
              />
            </View>
          </View>
          <View style={styles.dateRow}>
            <View style={styles.dateInputContainer}>
              <Text style={styles.dateLabel}>Voltagem</Text>
              <TextInput
                value={voltagemFiltro}
                onChangeText={setVoltagemFiltro}
                placeholder="Ex: 220"
                placeholderTextColor="#8B8BA7"
                style={styles.textInput}
                keyboardType="numeric"
              />
            </View>
          </View>
          <View style={styles.dateRow}>
            <View style={styles.dateInputContainer}>
              <Text style={styles.dateLabel}>Potência</Text>
              <TextInput
                value={potenciaFiltro}
                onChangeText={setPotenciaFiltro}
                placeholder="Ex: 5cv"
                placeholderTextColor="#8B8BA7"
                style={styles.textInput}
              />
            </View>
          </View>

          <View style={styles.filterButtonsRow}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={limparFiltros}>
              <Text style={styles.clearButtonText}>Limpar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={aplicarFiltros}>
              <Text style={styles.applyButtonText}>Aplicar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        data={ordens}
        renderItem={renderItem}
        keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={onRefresh}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMoreOrdens}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="construct-outline" size={60} color="#8B8BA7" />
            <Text style={styles.emptyText}>
              Você não possui ordens de serviço
            </Text>
          </View>
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerContainer}>
              <ActivityIndicator
                size="small"
                color="#00D4FF"
                style={{ marginBottom: 8 }}
              />
              <Text style={styles.footerText}>Carregando mais ordens...</Text>
            </View>
          ) : ordens.length > 0 ? (
            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>
                {ordens.length} de {totalOrdens} ordens carregadas
              </Text>
              {ordens.length < totalOrdens && (
                <Text style={styles.footerSubText}>
                  Role para baixo para ver mais
                </Text>
              )}
            </View>
          ) : (
            <View style={{ height: 20 }} />
          )
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  listContent: {
    padding: 20,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F0F23',
  },
  loadingContent: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '500',
    color: '#8B8BA7',
  },
  card: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    borderWidth: 0.8,
    borderColor: '#2D2D44',
    marginBottom: 16,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  cardGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    zIndex: 1,
  },
  ordemNumero: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  cardBody: {
    marginBottom: 12,
    zIndex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D44',
  },
  infoLabel: {
    fontSize: 10,
    color: '#8B8BA7',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  infoValueDefeito: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFD700',
  },
  cardFooter: {
    alignItems: 'flex-end',
    zIndex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8B8BA7',
    textAlign: 'center',
    fontWeight: '500',
  },
  headerActions: {
    padding: 16,
    paddingBottom: 0,
    alignItems: 'flex-end',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
  },
  filterButtonText: {
    color: '#00D4FF',
    marginLeft: 6,
    fontWeight: '600',
  },
  filtersContainer: {
    backgroundColor: '#1A1A2E',
    margin: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2D2D44',
  },
  filterSectionTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  statusScroll: {
    marginBottom: 20,
    maxHeight: 50,
  },
  statusChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#0F0F23',
    borderWidth: 1,
    borderColor: '#2D2D44',
    marginRight: 8,
    height: 36,
    justifyContent: 'center',
  },
  statusChipSelected: {
    backgroundColor: '#00D4FF',
    borderColor: '#00D4FF',
  },
  statusChipText: {
    color: '#8B8BA7',
    fontSize: 12,
    fontWeight: '500',
  },
  statusChipTextSelected: {
    color: '#0F0F23',
    fontWeight: '700',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dateInputContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  dateLabel: {
    color: '#8B8BA7',
    fontSize: 12,
    marginBottom: 6,
  },
  datePicker: {
    backgroundColor: '#0F0F23',
    borderColor: '#2D2D44',
    padding: 10,
    height: 45,
  },
  datePickerText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  textInput: {
    backgroundColor: '#0F0F23',
    borderColor: '#2D2D44',
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 45,
    color: '#FFFFFF',
    fontSize: 12,
    borderRadius: 6,
  },
  filterButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  clearButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2D2D44',
  },
  clearButtonText: {
    color: '#8B8BA7',
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: '#00D4FF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  applyButtonText: {
    color: '#0F0F23',
    fontWeight: '700',
  },
  footerContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    opacity: 0.8,
  },
  footerText: {
    color: '#8B8BA7',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 4,
  },
  footerSubText: {
    color: '#00D4FF',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
})

export default ClienteOrdensTodasList
