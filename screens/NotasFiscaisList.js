import React, { useEffect, useState, useCallback } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Platform,
} from 'react-native'
import Toast from 'react-native-toast-message'
import { getStoredData } from '../services/storageService'
import {
  notasFiscaisService,
  notasFiscaisUtils,
} from '../componentsNotasFiscais/notasFiscaisService'
import styles from '../styles/notasFiscaisStyles'

export default function NotasFiscaisList({ navigation }) {
  const [notasFiscais, setNotasFiscais] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [slug, setSlug] = useState('')
  const pageSize = 20

  // Filtros de busca
  const [searchNumero, setSearchNumero] = useState('')
  const [searchEmpresa, setSearchEmpresa] = useState('')
  const [searchStatus, setSearchStatus] = useState('')
  const [searchDataInicio, setSearchDataInicio] = useState('')
  const [searchDataFim, setSearchDataFim] = useState('')

  // Paginação
  const [currentPage, setCurrentPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [totalItems, setTotalItems] = useState(0)

  useEffect(() => {
    const carregarSlug = async () => {
      try {
        const { slug } = await getStoredData()
        if (slug) {
          setSlug(slug)
        } else {
          console.warn('Slug não encontrado')
        }
      } catch (err) {
        console.error('Erro ao carregar slug:', err.message)
      }
    }
    carregarSlug()
  }, [])

  useEffect(() => {
    if (slug) {
      buscarNotasFiscais()
    }
  }, [slug])

  const buscarNotasFiscais = async (pagina = 1, refresh = false) => {
    console.log(`🚀 Iniciando busca - Página: ${pagina}, Refresh: ${refresh}`)

    if (refresh) {
      setRefreshing(true)
    } else {
      setIsSearching(true)
    }

    try {
      const offset = (pagina - 1) * pageSize
      const filtros = {
        limit: pageSize,
        offset,
      }

      // Aplicar filtros de busca
      if (searchNumero) {
        filtros.numero = searchNumero
        filtros.numero_completo = searchNumero
      }
      if (searchEmpresa) filtros.empresa = searchEmpresa
      if (searchStatus) {
        filtros.status = searchStatus
        filtros.status_nfe = searchStatus
      }
      if (searchDataInicio) filtros.data_inicio = searchDataInicio
      if (searchDataFim) filtros.data_fim = searchDataFim

      console.log('🔍 Filtros aplicados:', filtros)

      const response = await notasFiscaisService.buscarNotasFiscais(filtros)

      console.log('📦 Resposta recebida na tela:', {
        tipo: typeof response,
        temResults: !!response?.results,
        quantidadeResults: response?.results?.length,
        quantidadeArray: Array.isArray(response)
          ? response.length
          : 'não é array',
        count: response?.count,
        next: response?.next,
        previous: response?.previous,
      })

      if (pagina === 1) {
        const notas = response.results || response
        setNotasFiscais(notas)
        console.log(
          `✅ Notas carregadas na página 1: ${
            Array.isArray(notas) ? notas.length : 'não é array'
          }`,
        )
      } else {
        const novasNotas = response.results || response
        setNotasFiscais((prev) => {
          const total = [...prev, ...novasNotas]
          console.log(
            `✅ Notas adicionadas - Anteriores: ${prev.length}, Novas: ${novasNotas.length}, Total: ${total.length}`,
          )
          return total
        })
      }

      setCurrentPage(pagina)
      setHasNextPage(!!response.next)
      setTotalItems(
        response.count ||
          (response.results ? response.results.length : response.length),
      )

      console.log('📊 Estado atualizado:', {
        currentPage: pagina,
        hasNextPage: !!response.next,
        totalItems:
          response.count ||
          (response.results ? response.results.length : response.length),
      })
    } catch (error) {
      console.log('❌ Erro ao buscar notas fiscais:', error.message)
      console.error('❌ Stack do erro:', error)
      Alert.alert('Erro', 'Falha ao carregar notas fiscais')
    } finally {
      setIsSearching(false)
      setRefreshing(false)
      setLoading(false)
      console.log('🏁 Busca finalizada')
    }
  }

  const carregarMaisItens = () => {
    if (hasNextPage && !isSearching) {
      buscarNotasFiscais(currentPage + 1)
    }
  }

  const onRefresh = () => {
    setCurrentPage(1)
    buscarNotasFiscais(1, true)
  }

  const limparFiltros = () => {
    setSearchNumero('')
    setSearchEmpresa('')
    setSearchStatus('')
    setSearchDataInicio('')
    setSearchDataFim('')
    setCurrentPage(1)
    buscarNotasFiscais(1)
  }

  const excluirNotaFiscal = (item) => {
    const numero =
      item?.numero_nota_fiscal ?? item?.numero ?? item?.numero_completo
    Alert.alert('Confirmação', `Excluir a nota fiscal ${numero}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await notasFiscaisService.excluirNotaFiscal(
              item.empresa,
              item.filial,
              item.numero,
            )

            setNotasFiscais((prev) =>
              prev.filter(
                (nota) =>
                  nota.empresa !== item.empresa ||
                  nota.filial !== item.filial ||
                  nota.numero !== item.numero,
              ),
            )

            Alert.alert('Sucesso', 'Nota fiscal excluída com sucesso')
          } catch (error) {
            console.log('❌ Erro ao excluir nota fiscal:', error.message)
            Alert.alert('Erro', 'Erro ao excluir a nota fiscal')
          }
        },
      },
    ])
  }

  const visualizarXml = async (item) => {
    try {
      console.log('🔍 Dados do item para XML:', {
        empresa: item.empresa,
        filial: item.filial,
        numero: item.numero,
        numero_completo: item.numero_completo,
        item: item,
      })

      setIsSearching(true)

      // Extrair apenas o número da nota (remover prefixos como "002-")
      let numeroNota = item.numero

      if (!numeroNota && item.numero_completo) {
        // Extrair número do formato "002-10" -> "10"
        const match = item.numero_completo.match(/\d+-(\d+)/)
        numeroNota = match ? parseInt(match[1]) : item.numero_completo
      }

      if (!numeroNota) {
        throw new Error('Número da nota fiscal não encontrado')
      }

      const xmlData = await notasFiscaisService.buscarXmlNotaFiscal(
        item.empresa,
        item.filial,
        numeroNota,
      )

      // Navegar para tela de visualização do XML
      navigation.navigate('NotaFiscalXml', {
        xmlData,
        notaFiscal: item,
      })
    } catch (error) {
      console.log('❌ Erro ao buscar XML:', error.message)
      Alert.alert('Erro', 'Erro ao carregar XML da nota fiscal')
    } finally {
      setIsSearching(false)
    }
  }

  const obterStatusNfe = (item) => item?.status_nfe ?? item?.status

  const obterIdNota = (item) => item?.id ?? item?.pk ?? item?.nota_id

  const obterResumoSefaz = (payload) => {
    const data = payload || {}
    const sefaz = data?.sefaz_response || {}
    const status = Number(
      data?.status ?? data?.status_nfe ?? sefaz?.status ?? data?.statusNfe,
    )
    const chave = data?.chave_acesso || sefaz?.chave || data?.chave
    const protocolo =
      data?.protocolo_autorizacao || sefaz?.protocolo || data?.protocolo
    const motivo =
      data?.motivo_status ||
      sefaz?.mensagem ||
      sefaz?.motivo ||
      data?.mensagem ||
      data?.motivo

    return { status, chave, protocolo, motivo }
  }

  const toastSucessoAcao = (acao, payload) => {
    const { status, chave, protocolo, motivo } = obterResumoSefaz(payload)

    if (status === 100) {
      Toast.show({
        type: 'success',
        text1: `${acao} concluída`,
        text2: `Autorizada. ${chave ? `Chave: ${chave}. ` : ''}${protocolo ? `Protocolo: ${protocolo}.` : ''}`,
        visibilityTime: 6000,
      })
      return
    }

    if ([103, 105].includes(status)) {
      Toast.show({
        type: 'warning',
        text1: `${acao} enviada`,
        text2: motivo || 'SEFAZ em processamento. Consulte novamente em instantes.',
        visibilityTime: 6000,
      })
      return
    }

    if (Number.isFinite(status) && status > 0) {
      Toast.show({
        type: 'warning',
        text1: `${acao} concluída`,
        text2: motivo || `Status SEFAZ: ${status}`,
        visibilityTime: 6000,
      })
      return
    }

    Toast.show({
      type: 'success',
      text1: `${acao} concluída`,
      text2: 'Operação executada com sucesso',
      visibilityTime: 6000,
    })
  }

  const toastErroAcao = (acao, error) => {
    const msg =
      error?.response?.data?.detail ||
      error?.response?.data?.mensagem ||
      error?.response?.data?.erro ||
      error?.response?.data?.error ||
      error?.message ||
      `Falha ao ${acao.toLowerCase()}`

    Toast.show({
      type: 'error',
      text1: `Erro ao ${acao.toLowerCase()}`,
      text2: String(msg),
      visibilityTime: 6000,
    })
  }

  const temChaveOuXml = (item) =>
    Boolean(
      item?.chave_acesso ||
      item?.xml_assinado ||
      item?.xml_autorizado ||
      item?.chave_referenciada ||
      item?.ultimo_protocolo,
    )

  const obterValorTotalNota = (item) =>
    item?.valor_total ??
    item?.valor_total_nota ??
    item?.valor_total_nf ??
    item?.valor_total_nfe ??
    item?.valor_total_nota_fiscal ??
    item?.total_nota ??
    item?.valorTotal ??
    item?.total ??
    item?.valor

  const executarAcaoNota = async (acao, fn) => {
    setIsSearching(true)
    try {
      const result = await fn()
      toastSucessoAcao(acao, result)
      buscarNotasFiscais(1, true)
    } catch (error) {
      console.log(`❌ [NF] Falha ao ${acao}:`, {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
        url: error?.config?.url,
        method: error?.config?.method,
      })
      toastErroAcao(acao, error)
    } finally {
      setIsSearching(false)
    }
  }

  const transmitirNota = (item) => {
    const id = obterIdNota(item)
    if (!id) {
      Alert.alert('Erro', 'ID da nota fiscal não encontrado')
      return
    }
    executarAcaoNota('Transmitir', async () => {
      await notasFiscaisService.transmitirNotaFiscalPorPk(id)
      const consulta = await notasFiscaisService.consultarNotaFiscalPorPk(id)
      return consulta
    })
  }

  const consultarNota = (item) => {
    const id = obterIdNota(item)
    if (!id) {
      Alert.alert('Erro', 'ID da nota fiscal não encontrado')
      return
    }
    executarAcaoNota('Consultar', () =>
      notasFiscaisService.consultarNotaFiscalPorPk(id),
    )
  }

  const inutilizarNota = (item) => {
    const id = obterIdNota(item)
    if (!id) {
      Alert.alert('Erro', 'ID da nota fiscal não encontrado')
      return
    }
    console.log('🧾 [NF] Clique inutilizar:', { id, empresa: item?.empresa, filial: item?.filial, numero: item?.numero })
    const executar = () => {
      console.log('🧾 [NF] Confirmou inutilizar:', { id })
      return executarAcaoNota('Inutilizar', () =>
        notasFiscaisService.inutilizarNotaFiscalPorPk(id, {
          descricao: 'Inutilização via app',
        }),
      )
    }

    if (Platform.OS === 'web') {
      const ok = window.confirm('Confirma inutilizar a numeração da nota?')
      if (!ok) return
      executar()
      return
    }

    Alert.alert('Confirmação', 'Confirma inutilizar a numeração da nota?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Inutilizar', style: 'destructive', onPress: executar },
    ])
  }

  const cancelarNota = (item) => {
    const id = obterIdNota(item)
    if (!id) {
      Alert.alert('Erro', 'ID da nota fiscal não encontrado')
      return
    }
    console.log('🧾 [NF] Clique cancelar:', { id, empresa: item?.empresa, filial: item?.filial, numero: item?.numero })
    const executar = () => {
      console.log('🧾 [NF] Confirmou cancelar:', { id })
      return executarAcaoNota('Cancelar', () =>
        notasFiscaisService.cancelarNotaFiscalPorPk(id, {
          descricao: 'Cancelamento via app',
        }),
      )
    }

    if (Platform.OS === 'web') {
      const ok = window.confirm('Confirma cancelar a nota?')
      if (!ok) return
      executar()
      return
    }

    Alert.alert('Confirmação', 'Confirma cancelar a nota?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cancelar', style: 'destructive', onPress: executar },
    ])
  }

  useFocusEffect(
    useCallback(() => {
      if (slug) {
        buscarNotasFiscais(1)
      }
    }, [
      slug,
      searchNumero,
      searchEmpresa,
      searchStatus,
      searchDataInicio,
      searchDataFim,
    ]),
  )

  const formatarPessoa = (pessoa) => {
    if (pessoa == null) return ''
    if (typeof pessoa === 'string') return pessoa
    if (typeof pessoa === 'number') return String(pessoa)
    if (typeof pessoa !== 'object') return String(pessoa)

    return (
      pessoa.enti_nome ||
      pessoa.nome ||
      pessoa.razao_social ||
      pessoa.fantasia ||
      pessoa.enti_cnpj ||
      pessoa.cnpj ||
      pessoa.enti_cpf ||
      pessoa.cpf ||
      pessoa.enti_email ||
      pessoa.email ||
      ''
    )
  }

  const renderNotaFiscal = ({ item }) => {
    const statusNfe = obterStatusNfe(item)
    const bloqueada =
      statusNfe === 100 || statusNfe === 101 || statusNfe === 102
    const podeCancelar = statusNfe === 100
    const podeConsultar =
      temChaveOuXml(item) || [539, 204, 105, 100].includes(statusNfe)
    const podeTransmitir = !bloqueada && !podeConsultar

    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemHeader}>
          <Text style={styles.numeroNota}>
            NF-e:{' '}
            {item?.numero_nota_fiscal ?? item?.numero ?? item?.numero_completo}
          </Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: notasFiscaisUtils.obterCorStatus(
                  item?.status_nfe ?? item?.status,
                ),
              },
            ]}>
            <Text style={styles.statusText}>
              {notasFiscaisUtils.obterDescricaoStatus(
                item?.status_nfe ?? item?.status,
              )}
            </Text>
          </View>
        </View>

        <View style={styles.itemContent}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Empresa/Filial:</Text>
            <Text style={styles.value}>
              {item.empresa}/{item.filial}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Data Emissão:</Text>
            <Text style={styles.value}>
              {notasFiscaisUtils.formatarData(
                item?.data_emissao ?? item?.criado_em,
              )}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Valor Total:</Text>
            <Text style={styles.valueAmount}>
              {notasFiscaisUtils.formatarMoeda(obterValorTotalNota(item))}
            </Text>
          </View>

          {formatarPessoa(item.destinatario) ? (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Destinatário:</Text>
              <Text style={styles.value} numberOfLines={1}>
                {formatarPessoa(item.destinatario)}
              </Text>
            </View>
          ) : null}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              navigation.navigate('NotaFiscalDetalhe', { notaFiscal: item })
            }>
            <Text style={styles.actionButtonText}>Visualizar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.xmlButton]}
            onPress={() => visualizarXml(item)}>
            <Text style={styles.actionButtonText}>XML</Text>
          </TouchableOpacity>

          {!bloqueada && (
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() =>
                navigation.navigate('NotaFiscalForm', { notaFiscal: item })
              }>
              <Text style={styles.actionButtonText}>Editar</Text>
            </TouchableOpacity>
          )}

          {podeConsultar && (
            <TouchableOpacity
              style={[styles.actionButton, styles.consultarButton]}
              onPress={() => consultarNota(item)}>
              <Text style={styles.actionButtonText}>Consultar</Text>
            </TouchableOpacity>
          )}

          {!bloqueada && podeTransmitir && (
            <TouchableOpacity
              style={[styles.actionButton, styles.transmitirButton]}
              onPress={() => transmitirNota(item)}>
              <Text style={styles.actionButtonText}>Transmitir</Text>
            </TouchableOpacity>
          )}

          {!bloqueada && (
            <TouchableOpacity
              style={[styles.actionButton, styles.inutilizarButton]}
              onPress={() => inutilizarNota(item)}>
              <Text style={styles.actionButtonText}>Inutilizar</Text>
            </TouchableOpacity>
          )}

          {podeCancelar && (
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelarButton]}
              onPress={() => cancelarNota(item)}>
              <Text style={styles.actionButtonText}>Cancelar</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    )
  }

  const renderFooter = () => {
    if (!isSearching) return null
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#345686" />
      </View>
    )
  }

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Nenhuma nota fiscal encontrada</Text>
    </View>
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#345686" />
        <Text style={styles.loadingText}>Carregando notas fiscais...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Filtros de Busca */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Número da NF-e"
          placeholderTextColor="#999"
          value={searchNumero}
          onChangeText={setSearchNumero}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          placeholder="Status (0=Rascunho, 100=Autorizada, 101=Cancelada, 102= Inutilizada, 532=Denegada)"
          placeholderTextColor="#999"
          value={searchStatus}
          onChangeText={setSearchStatus}
          keyboardType="numeric"
        />

        <View style={styles.dateContainer}>
          <TextInput
            style={[styles.input, styles.dateInput]}
            placeholder="Data Início (DD/MM/AAAA)"
            placeholderTextColor="#999"
            value={searchDataInicio}
            onChangeText={setSearchDataInicio}
          />

          <TextInput
            style={[styles.input, styles.dateInput]}
            placeholder="Data Fim (DD/MM/AAAA)"
            placeholderTextColor="#999"
            value={searchDataFim}
            onChangeText={setSearchDataFim}
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => buscarNotasFiscais(1)}
            disabled={isSearching}>
            <Text style={styles.searchButtonText}>
              {isSearching ? 'Buscando...' : 'Buscar'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.clearButton} onPress={limparFiltros}>
            <Text style={styles.clearButtonText}>Limpar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Botões de Ação */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={styles.incluirButton}
          onPress={() => navigation.navigate('NotaFiscalForm')}>
          <Text style={styles.incluirButtonText}>+ Nova Nota Fiscal</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Notas Fiscais */}
      <FlatList
        data={notasFiscais}
        keyExtractor={(item, index) =>
          `${item.empresa}-${item.filial}-${item.numero}-${index}`
        }
        renderItem={renderNotaFiscal}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={carregarMaisItens}
        onEndReachedThreshold={0.1}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#345686']}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Informações de Paginação */}
      {totalItems > 0 && (
        <View style={styles.paginationInfo}>
          <Text style={styles.paginationText}>
            Total: {totalItems} nota{totalItems !== 1 ? 's' : ''} fiscal
            {totalItems !== 1 ? 'is' : ''}
          </Text>
        </View>
      )}
    </View>
  )
}
