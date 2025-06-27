import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { ProgressChart } from 'react-native-chart-kit'

const { width } = Dimensions.get('window')

// Dados mocados para o cooperado logado
const contratosCooperado = [
  {
    id: 1,
    numero: 'CT-2024-001',
    valor_total: 150000.0,
    valor_pago: 75000.0,
    data_vencimento: '2024-02-15',
    data_assinatura: '2023-12-01',
    status: 'PAGOS_PARCIAL',
    parcelas_pagas: 6,
    total_parcelas: 12,
    proxima_parcela: '2024-02-15',
    valor_parcela: 12500.0,
    descricao: 'Contrato de Financiamento Rural - Safra 2024',
  },
  {
    id: 2,
    numero: 'CT-2023-015',
    valor_total: 80000.0,
    valor_pago: 80000.0,
    data_vencimento: '2024-01-30',
    data_assinatura: '2023-06-15',
    status: 'PAGOS_INTEGRAL',
    parcelas_pagas: 8,
    total_parcelas: 8,
    proxima_parcela: null,
    valor_parcela: 10000.0,
    descricao: 'Contrato de Custeio Agrícola - Finalizado',
  },
  {
    id: 3,
    numero: 'CT-2024-008',
    valor_total: 200000.0,
    valor_pago: 50000.0,
    data_vencimento: '2024-12-31',
    data_assinatura: '2024-01-10',
    status: 'ABERTOS',
    parcelas_pagas: 2,
    total_parcelas: 10,
    proxima_parcela: '2024-03-10',
    valor_parcela: 20000.0,
    descricao: 'Contrato de Investimento em Equipamentos',
  },
]

const cooperadoInfo = {
  nome: 'João Silva Santos',
  cpf: '123.456.789-00',
  cooperativa: 'Cooperativa Frisia',
  totalContratos: 3,
  valorTotalContratado: 430000.0,
  valorTotalPago: 205000.0,
}

export default function PainelCooperado() {
  const [contratos, setContratos] = useState(contratosCooperado)
  const [resumo, setResumo] = useState({
    totalContratos: 0,
    valorTotal: 0,
    valorPago: 0,
    percentualPago: 0,
    proximosVencimentos: [],
  })

  useEffect(() => {
    calcularResumo()
  }, [contratos])

  const calcularResumo = () => {
    const totalContratos = contratos.length
    const valorTotal = contratos.reduce(
      (acc, item) => acc + item.valor_total,
      0
    )
    const valorPago = contratos.reduce((acc, item) => acc + item.valor_pago, 0)
    const percentualPago = valorTotal > 0 ? (valorPago / valorTotal) * 100 : 0

    const proximosVencimentos = contratos
      .filter((c) => c.proxima_parcela)
      .sort((a, b) => new Date(a.proxima_parcela) - new Date(b.proxima_parcela))
      .slice(0, 3)

    setResumo({
      totalContratos,
      valorTotal,
      valorPago,
      percentualPago,
      proximosVencimentos,
    })
  }

  const getStatusColor = (status) => {
    const colors = {
      VENCIDOS: '#e74c3c',
      A_VENCER: '#f39c12',
      ABERTOS: '#3498db',
      PAGOS_PARCIAL: '#f1c40f',
      PAGOS_INTEGRAL: '#27ae60',
    }
    return colors[status] || '#95a5a6'
  }

  const getStatusLabel = (status) => {
    const labels = {
      VENCIDOS: 'Vencido',
      A_VENCER: 'A Vencer',
      ABERTOS: 'Em Andamento',
      PAGOS_PARCIAL: 'Pagamento Parcial',
      PAGOS_INTEGRAL: 'Finalizado',
    }
    return labels[status] || status
  }

  const renderContrato = ({ item }) => {
    const percentualPago = (item.valor_pago / item.valor_total) * 100
    const diasParaVencimento = item.proxima_parcela
      ? Math.ceil(
          (new Date(item.proxima_parcela) - new Date()) / (1000 * 60 * 60 * 24)
        )
      : null

    return (
      <View style={styles.contratoCard}>
        <View style={styles.contratoHeader}>
          <View style={styles.contratoInfo}>
            <Text style={styles.contratoNumero}>{item.numero}</Text>
            <Text style={styles.contratoDescricao}>{item.descricao}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}>
            <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
          </View>
        </View>

        <View style={styles.contratoDetalhes}>
          <View style={styles.valorContainer}>
            <View style={styles.valorItem}>
              <Text style={styles.valorLabel}>Valor Total</Text>
              <Text style={styles.valorTexto}>
                {item.valor_total.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </Text>
            </View>
            <View style={styles.valorItem}>
              <Text style={styles.valorLabel}>Valor Pago</Text>
              <Text style={[styles.valorTexto, { color: '#27ae60' }]}>
                {item.valor_pago.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressLabel}>Progresso do Pagamento</Text>
              <Text style={styles.progressPercent}>
                {percentualPago.toFixed(1)}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${percentualPago}%` }]}
              />
            </View>
            <Text style={styles.parcelasInfo}>
              {item.parcelas_pagas} de {item.total_parcelas} parcelas pagas
            </Text>
          </View>

          {item.proxima_parcela && (
            <View style={styles.proximaParcelaContainer}>
              <MaterialIcons name="schedule" size={16} color="#f39c12" />
              <View style={styles.proximaParcelaInfo}>
                <Text style={styles.proximaParcelaLabel}>Próxima Parcela</Text>
                <Text style={styles.proximaParcelaData}>
                  {new Date(item.proxima_parcela).toLocaleDateString('pt-BR')} -
                  {item.valor_parcela.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </Text>
                {diasParaVencimento !== null && (
                  <Text
                    style={[
                      styles.diasVencimento,
                      {
                        color: diasParaVencimento <= 7 ? '#e74c3c' : '#f39c12',
                      },
                    ]}>
                    {diasParaVencimento > 0
                      ? `${diasParaVencimento} dias para vencimento`
                      : diasParaVencimento === 0
                      ? 'Vence hoje'
                      : `${Math.abs(diasParaVencimento)} dias em atraso`}
                  </Text>
                )}
              </View>
            </View>
          )}
        </View>
      </View>
    )
  }

  const dadosGraficoProgresso = {
    data: [resumo.percentualPago / 100],
  }

  return (
    <View style={styles.container}>
      {/* Header com Logo */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/logofrisia.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Painel do Cooperado</Text>
            <Text style={styles.headerSubtitle}>Acompanhe seus contratos</Text>
          </View>
        </View>
      </View>

      {/* Informações do Cooperado */}
      <View style={styles.cooperadoInfo}>
        <View style={styles.cooperadoHeader}>
          <MaterialIcons name="person" size={24} color="#667eea" />
          <Text style={styles.cooperadoNome}>{cooperadoInfo.nome}</Text>
        </View>
        <Text style={styles.cooperadoCpf}>CPF: {cooperadoInfo.cpf}</Text>
      </View>

      {/* Resumo Geral */}
      <View style={styles.resumoGeral}>
        <View style={styles.resumoItem}>
          <Text style={styles.resumoNumero}>{resumo.totalContratos}</Text>
          <Text style={styles.resumoLabel}>Contratos</Text>
        </View>
        <View style={styles.resumoItem}>
          <Text style={styles.resumoNumero}>
            {resumo.valorTotal.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </Text>
          <Text style={styles.resumoLabel}>Valor Total</Text>
        </View>
        <View style={styles.resumoItem}>
          <Text style={[styles.resumoNumero, { color: '#27ae60' }]}>
            {resumo.percentualPago.toFixed(1)}%
          </Text>
          <Text style={styles.resumoLabel}>Pago</Text>
        </View>
      </View>

      {/* Gráfico de Progresso */}
      <View style={styles.graficoContainer}>
        <Text style={styles.graficoTitulo}>Progresso Geral dos Pagamentos</Text>
        <ProgressChart
          data={dadosGraficoProgresso}
          width={width - 32}
          height={180}
          strokeWidth={16}
          radius={60}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#f8f9fa',
            backgroundGradientTo: '#ffffff',
            color: (opacity = 1) => `rgba(0, 184, 148, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          hideLegend={true}
          style={{
            borderRadius: 16,
          }}
        />
        <Text style={styles.progressoTexto}>
          {resumo.valorPago.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })}{' '}
          de{' '}
          {resumo.valorTotal.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })}
        </Text>
      </View>

      {/* Lista de Contratos */}
      <View style={styles.contratosSection}>
        <Text style={styles.sectionTitle}>Meus Contratos</Text>
        <FlatList
          data={contratos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderContrato}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listaContent}
        />
      </View>
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
  logoPlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#ffffff',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
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
  cooperadoInfo: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cooperadoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cooperadoNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  cooperadoCpf: {
    fontSize: 14,
    color: '#666',
  },
  resumoGeral: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resumoItem: {
    alignItems: 'center',
  },
  resumoNumero: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  resumoLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  graficoContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  graficoTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  progressoTexto: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
  contratosSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  listaContent: {
    paddingBottom: 20,
  },
  contratoCard: {
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
  contratoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  contratoInfo: {
    flex: 1,
  },
  contratoNumero: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  contratoDescricao: {
    fontSize: 12,
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
  contratoDetalhes: {
    marginTop: 8,
  },
  valorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  valorItem: {
    flex: 1,
  },
  valorLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  valorTexto: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#27ae60',
    borderRadius: 4,
  },
  parcelasInfo: {
    fontSize: 11,
    color: '#666',
  },
  proximaParcelaContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff9e6',
    padding: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#f39c12',
  },
  proximaParcelaInfo: {
    marginLeft: 8,
    flex: 1,
  },
  proximaParcelaLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#f39c12',
  },
  proximaParcelaData: {
    fontSize: 12,
    color: '#333',
    marginTop: 2,
  },
  diasVencimento: {
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 2,
  },
})
