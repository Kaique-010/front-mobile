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
} from 'react-native'
import { FontAwesome, MaterialIcons } from '@expo/vector-icons'
import { apiGetComContexto } from '../utils/api'
import AsyncStorage from '@react-native-async-storage/async-storage'

const { width } = Dimensions.get('window')
const filtroOptions = ['TODOS', 'DINHEIRO', 'CARTAO', 'PIX']

export default function DashExtratoCaixa() {
  const [dados, setDados] = useState([])
  const [dadosFiltrados, setDadosFiltrados] = useState([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState(null)
  const [empresaId, setEmpresaId] = useState('')
  const [filialId, setFilialId] = useState('')
  const [filtroForma, setFiltroForma] = useState('TODOS')
  const [buscaCliente, setBuscaCliente] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [resumo, setResumo] = useState({
    totalGeral: 0,
    totalPorForma: {},
    quantidadeTransacoes: 0,
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

  const buscarDados = async () => {
    setLoading(true)
    setErro(null)
    try {
      const params = {
        page_size: 10000,
        limit: 10000,
        empresa: empresaId,
        filial: filialId,
      }

      if (dataInicio) params.data__gte = dataInicio
      if (dataFim) params.data__lte = dataFim
      if (buscaCliente) params.search = buscaCliente

      const res = await apiGetComContexto('dashboards/extrato-caixa/', params)

      let dadosProcessados = res.results || res
      if (!Array.isArray(dadosProcessados)) {
        dadosProcessados = []
      }

      setDados(dadosProcessados)
      calcularResumo(dadosProcessados)
    } catch (e) {
      console.error('Erro detalhado:', e)
      const errorMessage =
        e.response?.data?.detail || e.message || 'Erro desconhecido'
      setErro(`Erro ao buscar dados: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const calcularResumo = (dados) => {
    const totalGeral = dados.reduce(
      (acc, item) => acc + parseFloat(item.valor_total || 0),
      0
    )
    const totalPorForma = {}

    dados.forEach((item) => {
      const forma = item.forma_de_recebimento || 'Não informado'
      if (!totalPorForma[forma]) {
        totalPorForma[forma] = 0
      }
      totalPorForma[forma] += parseFloat(item.valor_total || 0)
    })

    setResumo({
      totalGeral,
      totalPorForma,
      quantidadeTransacoes: dados.length,
    })
  }

  const filtrarDados = useMemo(() => {
    let dadosFiltrados = dados

    if (filtroForma !== 'TODOS') {
      dadosFiltrados = dadosFiltrados.filter((item) => {
        const forma = item.forma_de_recebimento?.toUpperCase() || ''
        return forma.includes(filtroForma)
      })
    }

    if (buscaCliente) {
      dadosFiltrados = dadosFiltrados.filter(
        (item) =>
          item.nome_cliente
            ?.toLowerCase()
            .includes(buscaCliente.toLowerCase()) ||
          item.produto?.toLowerCase().includes(buscaCliente.toLowerCase())
      )
    }

    return dadosFiltrados
  }, [dados, filtroForma, buscaCliente])

  useEffect(() => {
    obterContexto()
  }, [])

  useEffect(() => {
    if (empresaId && filialId) {
      buscarDados()
    }
  }, [empresaId, filialId, dataInicio, dataFim])

  const ResumoCard = ({ titulo, valor, icone, cor }) => (
    <View style={[styles.resumoCard, { borderLeftColor: cor }]}>
      <View style={styles.resumoHeader}>
        <Text style={styles.resumoTitulo}>{titulo}</Text>
        <MaterialIcons name={icone} size={24} color={cor} />
      </View>
      <Text style={[styles.resumoValor, { color: cor }]}>
        {typeof valor === 'number'
          ? valor.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })
          : valor}
      </Text>
    </View>
  )

  const renderItem = ({ item }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemPedido}>Pedido: {item.pedido}</Text>
          <Text style={styles.itemCliente}>{item.nome_cliente}</Text>
        </View>
        <Text style={styles.itemData}>
          {new Date(item.data).toLocaleDateString('pt-BR')}
        </Text>
      </View>

      <View style={styles.itemDetalhes}>
        <Text style={styles.itemProduto}>{item.produto}</Text>
        <Text style={styles.itemDescricao}>{item.descricao}</Text>
      </View>

      <View style={styles.itemFooter}>
        <View style={styles.itemQuantidade}>
          <Text style={styles.itemQuantidadeLabel}>Qtd:</Text>
          <Text style={styles.itemQuantidadeValor}>{item.quantidade}</Text>
        </View>
        <View style={styles.itemForma}>
          <Text style={styles.itemFormaTexto}>{item.forma_de_recebimento}</Text>
        </View>
        <Text style={styles.itemValor}>
          {parseFloat(item.valor_total || 0).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })}
        </Text>
      </View>
    </View>
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Carregando extrato de caixa...</Text>
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
        <Text style={styles.headerTitle}>💰 Extrato de Caixa</Text>
        <Text style={styles.headerSubtitle}>Movimentações Financeiras</Text>
      </View>

      {/* Filtros de busca */}
      <View style={styles.filtrosContainer}>
        <TextInput
          style={styles.inputBusca}
          placeholder="Buscar cliente ou produto..."
          value={buscaCliente}
          onChangeText={setBuscaCliente}
        />
      </View>

      {/* Filtros de forma de pagamento */}
      <View style={styles.filtros}>
        {filtroOptions.map((opt) => (
          <TouchableOpacity
            key={opt}
            onPress={() => setFiltroForma(opt)}
            style={[
              styles.filtroButton,
              filtroForma === opt && styles.filtroSelecionado,
            ]}>
            <Text
              style={
                filtroForma === opt
                  ? styles.filtroTextoSelecionado
                  : styles.filtroTexto
              }>
              {opt === 'TODOS' ? 'Todos' : opt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

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
          titulo="Transações"
          valor={resumo.quantidadeTransacoes}
          icone="receipt"
          cor="#3498db"
        />
        {Object.entries(resumo.totalPorForma).map(([forma, valor]) => (
          <ResumoCard
            key={forma}
            titulo={forma}
            valor={valor}
            icone="payment"
            cor="#9b59b6"
          />
        ))}
      </ScrollView>

      {/* Lista de transações */}
      <FlatList
        data={filtrarDados}
        keyExtractor={(item, index) =>
          `${item.pedido}-${item.cliente}-${index}`
        }
        renderItem={renderItem}
        style={styles.lista}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listaContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="inbox" size={48} color="#bdc3c7" />
            <Text style={styles.emptyText}>Nenhuma transação encontrada</Text>
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
  filtrosContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  inputBusca: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 14,
  },
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
  resumoContainer: {
    paddingHorizontal: 10,
  },
  resumoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12, // Reduzido de 16 para 12
    marginRight: 12,
    minWidth: 80,
    maxHeight: 80, // Reduzido de 100 para 80
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
    marginBottom: 6, // Reduzido de 8 para 6
  },
  resumoTitulo: {
    fontSize: 11, // Reduzido de 12 para 11
    color: '#666',
    fontWeight: '600',
  },
  resumoValor: {
    fontSize: 14, // Reduzido de 16 para 14
    fontWeight: 'bold',
  },
  lista: {
    flex: 1,
  },
  listaContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,

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
  },
  itemInfo: {
    flex: 1,
  },
  itemPedido: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  itemCliente: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
    marginTop: 2,
  },
  itemData: {
    fontSize: 12,
    color: '#666',
  },
  itemDetalhes: {
    marginBottom: 12,
  },
  itemProduto: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
  },
  itemDescricao: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemQuantidade: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemQuantidadeLabel: {
    fontSize: 12,
    color: '#666',
  },
  itemQuantidadeValor: {
    fontSize: 12,
    color: '#333',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  itemForma: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  itemFormaTexto: {
    fontSize: 10,
    color: '#1976d2',
    fontWeight: '600',
  },
  itemValor: {
    fontSize: 14,
    color: '#27ae60',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  erroContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 32,
  },
  erroTexto: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginVertical: 16,
  },
  botaoTentarNovamente: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  botaoTentarNovamenteTexto: {
    color: '#fff',
    fontWeight: 'bold',
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
    marginTop: 16,
  },
})
