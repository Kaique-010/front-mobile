import React, { useState, useEffect, useMemo } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
  Dimensions,
  TextInput,
  Platform,
  Image,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'
import { PieChart, BarChart } from 'react-native-chart-kit'

const { width } = Dimensions.get('window')
const statusOptions = [
  'TODOS',
  'VENCIDOS',
  'A_VENCER',
  'ABERTOS',
  'PAGOS_PARCIAL',
  'PAGOS_INTEGRAL',
]

// Dados mocados
const contratosMocados = [
  {
    id: 1,
    numero: 'CT-2024-001',
    cooperado: 'João Silva Santos',
    valor_total: 150000.0,
    valor_pago: 75000.0,
    data_vencimento: '2024-02-15',
    data_assinatura: '2023-12-01',
    status: 'PAGOS_PARCIAL',
    parcelas_pagas: 6,
    total_parcelas: 12,
  },
  {
    id: 2,
    numero: 'CT-2024-002',
    cooperado: 'Maria Oliveira Costa',
    valor_total: 200000.0,
    valor_pago: 200000.0,
    data_vencimento: '2024-01-30',
    data_assinatura: '2023-11-15',
    status: 'PAGOS_INTEGRAL',
    parcelas_pagas: 10,
    total_parcelas: 10,
  },
  {
    id: 3,
    numero: 'CT-2024-003',
    cooperado: 'Carlos Pereira Lima',
    valor_total: 120000.0,
    valor_pago: 0.0,
    data_vencimento: '2024-01-10',
    data_assinatura: '2023-10-20',
    status: 'VENCIDOS',
    parcelas_pagas: 0,
    total_parcelas: 8,
  },
  {
    id: 4,
    numero: 'CT-2024-004',
    cooperado: 'Ana Paula Rodrigues',
    valor_total: 180000.0,
    valor_pago: 0.0,
    data_vencimento: '2024-03-20',
    data_assinatura: '2024-01-05',
    status: 'A_VENCER',
    parcelas_pagas: 0,
    total_parcelas: 15,
  },
  {
    id: 5,
    numero: 'CT-2024-005',
    cooperado: 'Roberto Almeida Souza',
    valor_total: 95000.0,
    valor_pago: 0.0,
    data_vencimento: '2024-12-31',
    data_assinatura: '2024-01-10',
    status: 'ABERTOS',
    parcelas_pagas: 0,
    total_parcelas: 6,
  },
]

export default function DashContratos() {
  const [dados, setDados] = useState(contratosMocados)
  const [dadosFiltrados, setDadosFiltrados] = useState(contratosMocados)
  const [filtroStatus, setFiltroStatus] = useState('TODOS')
  const [buscaCooperado, setBuscaCooperado] = useState('')
  const [dataInicio, setDataInicio] = useState(new Date('2023-01-01'))
  const [dataFim, setDataFim] = useState(new Date())
  const [showDatePickerInicio, setShowDatePickerInicio] = useState(false)
  const [showDatePickerFim, setShowDatePickerFim] = useState(false)
  const [resumo, setResumo] = useState({
    totalContratos: 0,
    valorTotal: 0,
    valorPago: 0,
    porStatus: {},
  })

  const formatarData = (data) => {
    return data.toLocaleDateString('pt-BR')
  }

  const getStatusLabel = (status) => {
    const labels = {
      VENCIDOS: 'Vencidos',
      A_VENCER: 'A Vencer',
      ABERTOS: 'Abertos',
      PAGOS_PARCIAL: 'Pagos Parcialmente',
      PAGOS_INTEGRAL: 'Pagos Integralmente',
    }
    return labels[status] || status
  }

  const getStatusColor = (status) => {
    const colors = {
      VENCIDOS: '#ff7675', // Rosa pastel suave
      A_VENCER: '#fdcb6e', // Amarelo pastel
      ABERTOS: '#74b9ff', // Azul pastel
      PAGOS_PARCIAL: '#a29bfe', // Roxo pastel
      PAGOS_INTEGRAL: '#00b894', // Verde pastel
    }
    return colors[status] || '#ddd'
  }

  const onChangeDataInicio = (event, selectedDate) => {
    const currentDate = selectedDate || dataInicio
    setShowDatePickerInicio(Platform.OS === 'ios')
    setDataInicio(currentDate)
  }

  const onChangeDataFim = (event, selectedDate) => {
    const currentDate = selectedDate || dataFim
    setShowDatePickerFim(Platform.OS === 'ios')
    setDataFim(currentDate)
  }

  const calcularResumo = (dadosParaCalculo) => {
    const totalContratos = dadosParaCalculo.length
    const valorTotal = dadosParaCalculo.reduce(
      (acc, item) => acc + item.valor_total,
      0
    )
    const valorPago = dadosParaCalculo.reduce(
      (acc, item) => acc + item.valor_pago,
      0
    )

    const porStatus = {}
    dadosParaCalculo.forEach((item) => {
      if (!porStatus[item.status]) {
        porStatus[item.status] = 0
      }
      porStatus[item.status]++
    })

    setResumo({ totalContratos, valorTotal, valorPago, porStatus })
  }

  const filtrarDados = useMemo(() => {
    let dadosFiltrados = dados

    // Filtro por status
    if (filtroStatus !== 'TODOS') {
      dadosFiltrados = dadosFiltrados.filter(
        (item) => item.status === filtroStatus
      )
    }

    // Filtro por cooperado
    if (buscaCooperado) {
      dadosFiltrados = dadosFiltrados.filter(
        (item) =>
          item.cooperado.toLowerCase().includes(buscaCooperado.toLowerCase()) ||
          item.numero.toLowerCase().includes(buscaCooperado.toLowerCase())
      )
    }

    // Filtro por data
    dadosFiltrados = dadosFiltrados.filter((item) => {
      const dataItem = new Date(item.data_assinatura)
      return dataItem >= dataInicio && dataItem <= dataFim
    })

    return dadosFiltrados
  }, [dados, filtroStatus, buscaCooperado, dataInicio, dataFim])

  useEffect(() => {
    calcularResumo(filtrarDados)
  }, [filtrarDados])

  const ResumoCard = ({ titulo, valor, icone, cor, isValor = false }) => (
    <View style={[styles.resumoCard, { borderLeftColor: cor }]}>
      <View style={styles.resumoHeader}>
        <Text style={styles.resumoTitulo}>{titulo}</Text>
        <MaterialIcons name={icone} size={24} color={cor} />
      </View>
      <Text style={[styles.resumoValor, { color: cor }]}>
        {isValor
          ? valor.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })
          : valor}
      </Text>
    </View>
  )

  const renderItem = ({ item }) => {
    const percentualPago = (item.valor_pago / item.valor_total) * 100

    return (
      <View style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemNumero}>{item.numero}</Text>
            <Text style={styles.itemCooperado}>{item.cooperado}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}>
            <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
          </View>
        </View>

        <View style={styles.itemDetalhes}>
          <View style={styles.detalheRow}>
            <Text style={styles.detalheLabel}>Valor Total:</Text>
            <Text style={styles.detalheValor}>
              {item.valor_total.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </Text>
          </View>
          <View style={styles.detalheRow}>
            <Text style={styles.detalheLabel}>Valor Pago:</Text>
            <Text style={styles.detalheValor}>
              {item.valor_pago.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </Text>
          </View>
          <View style={styles.detalheRow}>
            <Text style={styles.detalheLabel}>Parcelas:</Text>
            <Text style={styles.detalheValor}>
              {item.parcelas_pagas}/{item.total_parcelas}
            </Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${percentualPago}%` }]}
            />
          </View>
          <Text style={styles.progressText}>{percentualPago.toFixed(1)}%</Text>
        </View>

        <View style={styles.itemFooter}>
          <Text style={styles.itemData}>
            Vencimento:{' '}
            {new Date(item.data_vencimento).toLocaleDateString('pt-BR')}
          </Text>
        </View>
      </View>
    )
  }

  // Dados para gráficos
  const dadosGraficoPizza = Object.entries(resumo.porStatus).map(
    ([status, quantidade]) => ({
      name: getStatusLabel(status),
      population: quantidade,
      color: getStatusColor(status),
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    })
  )

  const dadosGraficoBarras = {
    labels: Object.keys(resumo.porStatus).map((status) =>
      getStatusLabel(status).substring(0, 8)
    ),
    datasets: [
      {
        data: Object.values(resumo.porStatus),
      },
    ],
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/logofrisia.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>📋 Dashboard de Contratos</Text>
            <Text style={styles.headerSubtitle}>Gestão e Acompanhamento</Text>
          </View>
        </View>
      </View>

      {/* Filtros */}
      <View style={styles.filtrosContainer}>
        <TextInput
          style={styles.inputBusca}
          placeholder="Buscar cooperado ou número do contrato..."
          value={buscaCooperado}
          onChangeText={setBuscaCooperado}
        />

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
          value={dataInicio}
          mode="date"
          display="default"
          onChange={onChangeDataInicio}
        />
      )}
      {showDatePickerFim && (
        <DateTimePicker
          value={dataFim}
          mode="date"
          display="default"
          onChange={onChangeDataFim}
        />
      )}

      {/* Filtros de Status */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtros}>
        {statusOptions.map((opt) => (
          <TouchableOpacity
            key={opt}
            onPress={() => setFiltroStatus(opt)}
            style={[
              styles.filtroButton,
              filtroStatus === opt && styles.filtroSelecionado,
            ]}>
            <Text
              style={
                filtroStatus === opt
                  ? styles.filtroTextoSelecionado
                  : styles.filtroTexto
              }>
              {opt === 'TODOS' ? 'Todos' : getStatusLabel(opt)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Cards de Resumo */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.resumoContainer}>
        <ResumoCard
          titulo="Total Contratos"
          valor={resumo.totalContratos}
          icone="description"
          cor="#74b9ff"
        />
        <ResumoCard
          titulo="Valor Total"
          valor={resumo.valorTotal}
          icone="account-balance-wallet"
          cor="#a29bfe"
          isValor={true}
        />
        <ResumoCard
          titulo="Valor Pago"
          valor={resumo.valorPago}
          icone="check-circle"
          cor="#00b894"
          isValor={true}
        />
        <ResumoCard
          titulo="Pendente"
          valor={resumo.valorTotal - resumo.valorPago}
          icone="schedule"
          cor="#fdcb6e"
          isValor={true}
        />
      </ScrollView>

      {/* Gráficos */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.graficosContainer}>
        {dadosGraficoPizza.length > 0 && (
          <View style={styles.graficoCard}>
            <Text style={styles.graficoTitulo}>Distribuição por Status</Text>
            <PieChart
              data={dadosGraficoPizza}
              width={280}
              height={200}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                color: (opacity = 1) => `rgba(116, 185, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              center={[10, 10]}
              absolute
            />
          </View>
        )}

        {Object.keys(resumo.porStatus).length > 0 && (
          <View style={styles.graficoCard}>
            <Text style={styles.graficoTitulo}>Quantidade por Status</Text>
            <BarChart
              data={dadosGraficoBarras}
              width={280}
              height={200}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#f8f9fa',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(162, 155, 254, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: '#a29bfe',
                },
              }}
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          </View>
        )}
      </ScrollView>

      {/* Lista de Contratos */}
      <FlatList
        data={filtrarDados}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        style={styles.lista}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listaContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="inbox" size={48} color="#bdc3c7" />
            <Text style={styles.emptyText}>Nenhum contrato encontrado</Text>
          </View>
        }
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
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 60,
    height: 60,
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 2,
  },
  filtrosContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  inputBusca: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 14,
    marginBottom: 8,
  },
  filtrosData: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  inputDataContainer: {
    flex: 1,
  },
  labelData: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '600',
  },
  datePickerButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  datePickerText: {
    fontSize: 14,
    color: '#333',
  },
  filtros: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  filtroButton: {
    marginHorizontal: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filtroSelecionado: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  filtroTexto: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  filtroTextoSelecionado: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  resumoContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  resumoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 140,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resumoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resumoTitulo: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  resumoValor: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  graficosContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  graficoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  graficoTitulo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  lista: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listaContent: {
    paddingBottom: 20,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemNumero: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  itemCooperado: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  itemDetalhes: {
    marginBottom: 12,
  },
  detalheRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detalheLabel: {
    fontSize: 12,
    color: '#666',
  },
  detalheValor: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#ecf0f1',
    borderRadius: 3,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#27ae60',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  itemFooter: {
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    paddingTop: 8,
  },
  itemData: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#bdc3c7',
    marginTop: 8,
  },
})
