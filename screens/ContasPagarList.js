import React, { useEffect, useState, useCallback } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { getStoredData } from '../services/storageService'
import {
  apiDeleteComContexto,
  apiGetComContexto,
  apiPostComContexto,
} from '../utils/api'
import styles from '../styles/listaContasStyles'
import DatePickerCrossPlatform from '../components/DatePickerCrossPlatform'
import { useDebounce } from '../hooks/useDebounce'

const formatarData = (data) => {
  if (!data) return '-'
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

const formatarMoeda = (valor) => {
  if (!valor) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

export default function ContasPagarList({ navigation }) {
  const [contas, setContas] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchFornecedor, setSearchFornecedor] = useState('')
  const [searchTitulo, setSearchtitulo] = useState('')
  const [searchStatus, setSearchStatus] = useState('')

  const fornecedorDeb = useDebounce(searchFornecedor)
  const tituloDeb = useDebounce(searchTitulo)
  const statusDeb = useDebounce(searchStatus)

  const statusMap = {
    A: 'Aberto',
    T: 'Pago Total',
    P: 'Pago Parcialmente',
  }
  const [isSearching, setIsSearching] = useState(false)
  const [slug, setSlug] = useState('')
  const [dataInicial, setDataInicial] = useState('')
  const [dataFinal, setDataFinal] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    const carregarSlug = async () => {
      try {
        const { slug } = await getStoredData()
        const hoje = new Date()
        const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)

        const format = (d) => d.toISOString().split('T')[0]

        setDataInicial(format(inicioMes))
        setDataFinal(format(hoje))
        if (slug) setSlug(slug)
        else console.warn('Slug não encontrado')
      } catch (err) {
        console.error('Erro ao carregar slug:', err.message)
      }
    }
    carregarSlug()
  }, [])

  const buscarManual = () => {
    setPage(1)
    setHasMore(true)
    buscarContas(true)
  }

  const buscarContas = async (reset = false) => {
    if (loadingMore || isSearching) return

    reset ? setIsSearching(true) : setLoadingMore(true)

    try {
      const filtros = {
        page: reset ? 1 : page,
      }

      if (fornecedorDeb) filtros.fornecedor_nome = fornecedorDeb
      if (tituloDeb) filtros.titu_titu = tituloDeb
      if (statusDeb) filtros.titu_aber = statusDeb
      if (dataInicial) filtros.titu_venc__gte = dataInicial
      if (dataFinal) filtros.titu_venc__lte = dataFinal

      const data = await apiGetComContexto(
        'contas_a_pagar/titulos-pagar/',
        filtros
      )

      const resultados = Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data)
        ? data
        : []
      const next = data?.next ?? null
      const count = typeof data?.count === 'number' ? data.count : null
      const pageSize = resultados.length

      const currentPage = reset ? 1 : page
      const hasNext =
        next != null ||
        (count != null && pageSize > 0 && currentPage * pageSize < count)

      setHasMore(hasNext)
      setContas((prev) => (reset ? resultados : [...prev, ...resultados]))
      setPage((prev) => (reset ? 2 : prev + 1))
    } catch {
      Alert.alert('Erro', 'Erro ao carregar contas')
    } finally {
      setIsSearching(false)
      setLoadingMore(false)
      setLoading(false)
    }
  }

  const limparFiltros = () => {
    setSearchFornecedor('')
    setSearchtitulo('')
    setSearchStatus('')
    setDataInicial('')
    setDataFinal('')
    buscarManual()
  }

  const excluirConta = (item) => {
    Alert.alert('Confirmação', 'Excluir esta conta a pagar?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiDeleteComContexto(
              `contas_a_pagar/titulos-pagar/${item.titu_empr}/${item.titu_fili}/${item.titu_forn}/${item.titu_titu}/${item.titu_seri}/${item.titu_parc}/`,
              {},
              'DELETE'
            )
            setContas((prev) =>
              prev.filter(
                (conta) =>
                  conta.titu_empr !== item.titu_empr ||
                  conta.titu_fili !== item.titu_fili ||
                  conta.titu_forn !== item.titu_forn ||
                  conta.titu_titu !== item.titu_titu ||
                  conta.titu_seri !== item.titu_seri ||
                  conta.titu_parc !== item.titu_parc ||
                  conta.titu_aber !== item.titu_aber
              )
            )
          } catch (error) {
            console.log('❌ Erro ao excluir conta:', error.message)
            Alert.alert('Erro', 'Erro ao excluir a conta')
          }
        },
      },
    ])
  }
  useFocusEffect(
    useCallback(() => {
      if (slug) buscarManual()
    }, [slug])
  )

  const formMap = {
    '00': 'Duplicata',
    '01': 'Cheque',
    '02': 'Promissória',
    '03': 'Recibo',
    50: 'cheque pré-datado',
    51: 'Cartão de crédito',
    52: 'Cartão de débito',
    53: 'Boleto bancário',
    54: 'Dinheiro',
    55: 'Deposito em conta',
    56: 'Venda à vista',
    60: 'PIX',
  }

  const buscarHistoricoBaixas = async (item) => {
    try {
      const endpoint = `contas_a_pagar/titulos-pagar/${item.titu_empr}/${item.titu_fili}/${item.titu_forn}/${item.titu_titu}/${item.titu_seri}/${item.titu_parc}/${item.titu_emis}/${item.titu_venc}/historico_baixas/`

      const historico = await apiGetComContexto(endpoint)

      if (historico && historico.length > 0) {
        // Se título está parcialmente pago, mostrar opções
        if (item.titu_aber === 'P') {
          const opcoes = [
            {
              text: '💵 Pagar Restante',
              onPress: () =>
                navigation.navigate('BaixaTituloForm', {
                  titulo: item,
                  tipo: 'pagar',
                }),
            },
          ]

          // Adicionar opções de excluir baixas
          historico.forEach((baixa) => {
            opcoes.push({
              text: `🗑️ Excluir Baixa ${baixa.bapa_sequ} - ${formatarMoeda(
                baixa.bapa_pago
              )} (${new Date(baixa.bapa_dpag).toLocaleDateString('pt-BR')})`,
              onPress: () => excluirBaixa(item, baixa.bapa_sequ),
            })
          })

          opcoes.push({
            text: 'Cancelar',
            style: 'cancel',
          })

          Alert.alert('Gerenciar Título Parcial', 'Escolha uma opção:', opcoes)
        } else {
          // Se há apenas uma baixa, excluir diretamente
          if (historico.length === 1) {
            excluirBaixa(item, historico[0].bapa_sequ)
          } else {
            // Se há múltiplas baixas, mostrar opções
            const opcoes = historico.map((baixa, index) => ({
              text: `Baixa ${baixa.bapa_sequ} - ${formatarMoeda(
                baixa.bapa_pago
              )} (${new Date(baixa.bapa_dpag).toLocaleDateString('pt-BR')})`,
              onPress: () => excluirBaixa(item, baixa.bapa_sequ),
            }))

            opcoes.push({
              text: 'Cancelar',
              style: 'cancel',
            })

            Alert.alert(
              'Selecionar Baixa',
              'Escolha qual baixa deseja excluir:',
              opcoes
            )
          }
        }
      } else {
        Alert.alert('Aviso', 'Nenhuma baixa encontrada para este título')
      }
    } catch (error) {
      console.error('❌ Erro ao buscar histórico:', error)
      Alert.alert('Erro', 'Erro ao buscar histórico de baixas')
    }
  }

  const excluirBaixa = async (item, baixaId) => {
    try {
      Alert.alert(
        'Confirmar Exclusão',
        `Tem certeza que deseja excluir a baixa ${baixaId}?\n\nEsta ação não pode ser desfeita e o título será reaberto.`,
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Excluir',
            style: 'destructive',
            onPress: async () => {
              try {
                const endpoint = `contas_a_pagar/titulos-pagar/${item.titu_empr}/${item.titu_fili}/${item.titu_forn}/${item.titu_titu}/${item.titu_seri}/${item.titu_parc}/${item.titu_emis}/${item.titu_venc}/excluir_baixa/?baixa_id=${baixaId}`

                // Enviar dados no body em vez de query parameters
                const dadosExclusao = {
                  confirmar_exclusao: true,
                  motivo_exclusao: 'Exclusão solicitada pelo usuário',
                }

                const response = await apiDeleteComContexto(
                  endpoint,
                  dadosExclusao
                )

                Alert.alert(
                  'Sucesso',
                  'Baixa excluída com sucesso! O título foi reaberto.',
                  [{ text: 'OK', onPress: () => buscarContas() }]
                )
              } catch (error) {
                console.error('❌ Erro ao excluir baixa:', error)
                console.error('❌ Response data:', error.response?.data)
                Alert.alert(
                  'Erro',
                  error.response?.data?.error ||
                    error.response?.data?.confirmar_exclusao?.[0] ||
                    'Erro ao excluir baixa'
                )
              }
            },
          },
        ]
      )
    } catch (error) {
      console.error('❌ Erro:', error)
      Alert.alert('Erro', 'Erro inesperado')
    }
  }

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Titulo: {item.titu_titu}</Text>
        <Text style={[styles.badge, { backgroundColor: '#007bff' }]}>
          {formMap[item.titu_form_reci] || item.titu_form_reci}
        </Text>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Fornecedor:</Text>
          <Text style={styles.infoValue}>{item.titu_forn}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Nome Fornecedor:</Text>
          <Text style={styles.infoValue}>{item.fornecedor_nome || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Vencimento:</Text>
          <Text style={styles.infoValue}>{formatarData(item.titu_venc)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Valor:</Text>
          <Text style={[styles.infoValue, styles.valorDestaque]}>
            {formatarMoeda(item.titu_valo)}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Parcela:</Text>
          <Text style={styles.infoValue}>{item.titu_parc || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Status:</Text>
          <Text style={[styles.infoValue, styles.valorDestaqueStatus]}>
            {statusMap[item.titu_aber] || item.titu_aber}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        {/* Botão Pagar - só aparece se status for 'A' (Aberto) */}
        {item.titu_aber === 'A' && (
          <TouchableOpacity
            style={[styles.botao, styles.botaoEditar]}
            onPress={() =>
              navigation.navigate('BaixaTituloForm', {
                titulo: item,
                tipo: 'pagar',
              })
            }>
            <Text style={styles.botaoTexto}>💵 Pagar</Text>
          </TouchableOpacity>
        )}

        {/* Botão Excluir Baixa - só aparece se status for 'T' ou 'P' */}
        {(item.titu_aber === 'T' || item.titu_aber === 'P') && (
          <TouchableOpacity
            style={[styles.botao, { backgroundColor: '#ff6b35' }]}
            onPress={() => buscarHistoricoBaixas(item)}>
            <Text style={styles.botaoTexto}>🔄 Reabrir/Liquidar</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.botao, styles.botaoEditar]}
          onPress={() =>
            navigation.navigate('ContaPagarForm', {
              contaExistente: item,
              titu_parc: item.titu_parc,
            })
          }>
          <Text style={styles.botaoTexto}>✏️ Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.botao, styles.botaoExcluir]}
          onPress={() => excluirConta(item)}>
          <Text style={styles.botaoTexto}>🗑️ Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="#007bff"
        style={{ marginTop: 50 }}
      />
    )
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.incluirButton}
        onPress={() => navigation.navigate('ContaPagarForm')}>
        <Text style={styles.incluirButtonText}>+ Nova Conta</Text>
      </TouchableOpacity>

      <View style={styles.searchContainer}>
        <View style={{ marginBottom: 10 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}>
            <TextInput
              placeholder="nome fornecedor"
              placeholderTextColor="#777"
              style={[styles.input, { flex: 1, marginRight: 5 }]}
              value={searchFornecedor}
              onChangeText={setSearchFornecedor}
            />
            <TextInput
              placeholder="por status"
              placeholderTextColor="#777"
              style={[styles.input, { flex: 1, marginRight: 5 }]}
              value={searchStatus}
              onChangeText={setSearchStatus}
            />
            <TextInput
              placeholder="por título"
              placeholderTextColor="#777"
              style={[styles.input, { flex: 1 }]}
              value={searchTitulo}
              onChangeText={setSearchtitulo}
            />
          </View>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <DatePickerCrossPlatform
              value={dataInicial}
              onChange={setDataInicial}
              placeholder="Data Inicial"
              disabled={isSearching}
              style={[styles.input, { flex: 1, marginRight: 5 }]}
            />
            <DatePickerCrossPlatform
              value={dataFinal}
              onChange={setDataFinal}
              placeholder="Data Final"
              disabled={isSearching}
              style={[styles.input, { flex: 1 }]}
            />
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity
            style={[styles.searchButton, { width: '50%' }]}
            onPress={buscarManual}>
            <Text style={styles.searchButtonText}>
              {isSearching ? '🔍...' : 'Buscar'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.searchButton,
              { backgroundColor: '#6c757d' },
              { width: '50%' },
            ]}
            onPress={limparFiltros}>
            <Text style={styles.searchButtonText}>Limpar filtros</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={contas}
        renderItem={renderItem}
        keyExtractor={(item) =>
          `${item.titu_empr}_${item.titu_fili}_${item.titu_forn}_${item.titu_titu}_${item.titu_seri}_${item.titu_parc}`
        }
        onEndReached={() => {
          if (hasMore) buscarContas(false)
        }}
        onEndReachedThreshold={0.5}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator size="small" style={{ margin: 16 }} />
          ) : null
        }
        persistentScrollbar
      />

      <Text style={styles.footerText}>
        {contas.length} conta{contas.length !== 1 ? 's' : ''} encontrada
        {contas.length !== 1 ? 's' : ''}
      </Text>
    </View>
  )
}
