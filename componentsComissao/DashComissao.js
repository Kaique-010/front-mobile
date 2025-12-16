import React, { useState, useEffect, useMemo } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  TextInput,
  Platform,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'
import { apiGetComContexto } from '../utils/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import styles from './ComissaoStyles'

const { width } = Dimensions.get('window')

export default function DashComissao({ navigation }) {
  const [dados, setDados] = useState([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState(null)
  const [empresaId, setEmpresaId] = useState('')
  const [filialId, setFilialId] = useState('')

  // Filtros
  const [buscaFuncionario, setBuscaFuncionario] = useState('')
  const [categoria, setCategoria] = useState('')
  const [dataInicio, setDataInicio] = useState(new Date())
  const [dataFim, setDataFim] = useState(new Date())
  const [showDatePickerInicio, setShowDatePickerInicio] = useState(false)
  const [showDatePickerFim, setShowDatePickerFim] = useState(false)

  const [resumo, setResumo] = useState({
    totalGeral: 0,
    totalComissoes: 0,
    totalPorCategoria: {},
    totalPorFuncionario: {},
    quantidadeComissoes: 0,
    ticketMedio: 0,
  })

  const categorias = [
    { value: '1', label: 'Melhoria', cor: '#e74c3c' },
    { value: '2', label: 'Implantação', cor: '#f39c12' },
    { value: '3', label: 'Dashboards', cor: '#3498db' },
    { value: '4', label: 'Mobile', cor: '#9b59b6' },
    { value: '5', label: 'Vendas', cor: '#27ae60' },
  ]

  useEffect(() => {
    obterContexto()
  }, [])

  useEffect(() => {
    if (empresaId && filialId) {
      buscarDados()
    }
  }, [empresaId, filialId, dataInicio, dataFim])

  const obterContexto = async () => {
    try {
      const empresa = await AsyncStorage.getItem('empresaId')
      const filial = await AsyncStorage.getItem('filialId')
      setEmpresaId(empresa || '')
      setFilialId(filial || '')
    } catch (error) {
      console.log('Erro ao obter contexto:', error)
    }
  }

  const buscarDados = async () => {
    setLoading(true)
    setErro(null)
    try {
      const params = {
        comi_empr: empresaId,
        comi_fili: filialId,
        data_inicial: dataInicio.toISOString().split('T')[0],
        data_final: dataFim.toISOString().split('T')[0],
        page_size: 10000,
      }

      const response = await apiGetComContexto(
        'comissoes/comissoes-sps/',
        params
      )
      const dadosProcessados = response.results || response || []
      setDados(dadosProcessados)
    } catch (error) {
      setErro('Erro ao buscar dados')
    } finally {
      setLoading(false)
    }
  }

  const calcularResumo = (dadosParaCalculo) => {
    const totalGeral = dadosParaCalculo.reduce(
      (acc, item) => acc + parseFloat(item.comi_valo_tota || 0),
      0
    )

    const totalComissoes = dadosParaCalculo.reduce(
      (acc, item) => acc + parseFloat(item.comi_comi_tota || 0),
      0
    )

    const totalPorCategoria = {}
    const totalPorFuncionario = {}

    dadosParaCalculo.forEach((item) => {
      const categoria = item.comi_cate
      const funcionario = item.comi_func_nome || 'Não informado'
      const comissao = parseFloat(item.comi_comi_tota || 0)

      if (!totalPorCategoria[categoria]) {
        totalPorCategoria[categoria] = 0
      }
      totalPorCategoria[categoria] += comissao

      if (!totalPorFuncionario[funcionario]) {
        totalPorFuncionario[funcionario] = 0
      }
      totalPorFuncionario[funcionario] += comissao
    })

    const ticketMedio =
      dadosParaCalculo.length > 0 ? totalComissoes / dadosParaCalculo.length : 0

    setResumo({
      totalGeral,
      totalComissoes,
      totalPorCategoria,
      totalPorFuncionario,
      quantidadeComissoes: dadosParaCalculo.length,
      ticketMedio,
    })
  }

  const dadosFiltrados = useMemo(() => {
    let filtrados = dados

    if (buscaFuncionario) {
      filtrados = filtrados.filter((item) =>
        item.comi_func_nome
          ?.toLowerCase()
          .includes(buscaFuncionario.toLowerCase())
      )
    }

    if (categoria) {
      filtrados = filtrados.filter((item) => item.comi_cate === categoria)
    }

    return filtrados
  }, [dados, buscaFuncionario, categoria])

  useEffect(() => {
    if (dadosFiltrados.length > 0 || dados.length > 0) {
      calcularResumo(dadosFiltrados)
    }
  }, [dadosFiltrados])

  const getCategoriaInfo = (codigo) => {
    return (
      categorias.find((c) => c.value === codigo) || {
        label: codigo,
        cor: '#7f8c8d',
      }
    )
  }

  const ResumoCard = ({ titulo, valor, icone, cor, isMonetary = true }) => (
    <View style={[styles.resumoCard, { borderLeftColor: cor }]}>
      <View style={styles.resumoHeader}>
        <Text style={styles.resumoTitulo}>{titulo}</Text>
        <MaterialIcons name={icone} size={24} color={cor} />
      </View>
      <Text style={[styles.resumoValor, { color: cor }]}>
        {isMonetary
          ? valor.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })
          : valor.toLocaleString('pt-BR')}
      </Text>
    </View>
  )

  const renderItem = ({ item }) => {
    const categoriaInfo = getCategoriaInfo(item.comi_cate)

    return (
      <View style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemFuncionario}>{item.comi_func_nome || item.comi_func}</Text>
            <View
              style={[
                styles.categoriaBadge,
                { backgroundColor: categoriaInfo.cor },
              ]}>
              <Text style={styles.categoriaText}>{categoriaInfo.label}</Text>
            </View>
          </View>
          <Text style={styles.itemData}>
            {new Date(item.comi_data_entr).toLocaleDateString('pt-BR')}
          </Text>
        </View>

        <View style={styles.itemDetalhes}>
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Valor Total:</Text>
            <Text style={styles.itemValue}>
              {parseFloat(item.comi_valo_tota).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </Text>
          </View>

          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Comissão ({item.comi_perc}%):</Text>
            <Text style={[styles.itemValue, styles.comissaoValue]}>
              {parseFloat(item.comi_comi_tota).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </Text>
          </View>

          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Parcelas:</Text>
            <Text style={styles.itemValue}>
              {item.comi_parc}x de{' '}
              {parseFloat(item.comi_comi_parc).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </Text>
          </View>

          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Cliente:</Text>
            <Text style={styles.itemValue}>{item.comi_clie_nome || item.comi_clie || 'Não informado'}</Text>
          </View>

          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Forma Pagamento:</Text>
            <Text style={styles.itemValue}>{item.comi_form_paga}</Text>
          </View>
        </View>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Carregando dashboard...</Text>
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
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>💰 Dashboard Comissões</Text>
          <Text style={styles.headerSubtitle}>Análise de Comissões</Text>
        </View>
        <TouchableOpacity
          style={styles.botaoGrafico}
          onPress={() => navigation.navigate('ComissaoList')}>
          <MaterialIcons name="list" size={20} color="#fff" />
          <Text style={styles.botaoGraficoTexto}>Lista</Text>
        </TouchableOpacity>
      </View>

      {/* Filtros */}
      <View style={styles.filtrosContainer}>
        <View style={styles.filtrosData}>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowDatePickerInicio(true)}>
            <Text style={styles.datePickerText}>
              {dataInicio.toLocaleDateString('pt-BR')}
            </Text>
            <MaterialIcons name="date-range" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowDatePickerFim(true)}>
            <Text style={styles.datePickerText}>
              {dataFim.toLocaleDateString('pt-BR')}
            </Text>
            <MaterialIcons name="date-range" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Buscar funcionário..."
          value={buscaFuncionario}
          onChangeText={setBuscaFuncionario}
        />
      </View>

      {showDatePickerInicio && (
        <DateTimePicker
          value={dataInicio}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePickerInicio(Platform.OS === 'ios')
            if (selectedDate) setDataInicio(selectedDate)
          }}
        />
      )}

      {showDatePickerFim && (
        <DateTimePicker
          value={dataFim}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePickerFim(Platform.OS === 'ios')
            if (selectedDate) setDataFim(selectedDate)
          }}
        />
      )}

      {/* Cards de resumo */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.resumoContainer}>
        <ResumoCard
          titulo="Total Geral"
          valor={resumo.totalGeral}
          icone="account-balance-wallet"
          cor="#3498db"
        />
        <ResumoCard
          titulo="Total Comissões"
          valor={resumo.totalComissoes}
          icone="money"
          cor="#27ae60"
        />
        <ResumoCard
          titulo="Quantidade"
          valor={resumo.quantidadeComissoes}
          icone="assignment"
          cor="#f39c12"
          isMonetary={false}
        />
        <ResumoCard
          titulo="Ticket Médio"
          valor={resumo.ticketMedio}
          icone="trending-up"
          cor="#9b59b6"
        />

        {/* Cards por categoria */}
        {Object.entries(resumo.totalPorCategoria).map(([codigo, valor]) => {
          const categoriaInfo = getCategoriaInfo(codigo)
          return (
            <ResumoCard
              key={codigo}
              titulo={categoriaInfo.label}
              valor={valor}
              icone="category"
              cor={categoriaInfo.cor}
            />
          )
        })}
      </ScrollView>

      {/* Lista de comissões */}
      <FlatList
        data={dadosFiltrados}
        keyExtractor={(item) => item.comi_id.toString()}
        renderItem={renderItem}
        style={styles.lista}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listaContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="money-off" size={64} color="#bdc3c7" />
            <Text style={styles.emptyText}>Nenhuma comissão encontrada</Text>
          </View>
        }
      />
    </View>
  )
}
