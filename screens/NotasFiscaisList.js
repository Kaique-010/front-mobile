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
  RefreshControl,
} from 'react-native'
import { getStoredData } from '../services/storageService'
import {
  notasFiscaisService,
  notasFiscaisUtils,
} from '../services/notasFiscaisService'
import styles from '../styles/notasFiscaisStyles'

export default function NotasFiscaisList({ navigation }) {
  const [notasFiscais, setNotasFiscais] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [slug, setSlug] = useState('')

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
      const filtros = {
        page: pagina,
      }

      // Aplicar filtros de busca
      if (searchNumero) filtros.numero_completo = searchNumero
      if (searchEmpresa) filtros.empresa = searchEmpresa
      if (searchStatus) filtros.status_nfe = searchStatus
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
          }`
        )
      } else {
        const novasNotas = response.results || response
        setNotasFiscais((prev) => {
          const total = [...prev, ...novasNotas]
          console.log(
            `✅ Notas adicionadas - Anteriores: ${prev.length}, Novas: ${novasNotas.length}, Total: ${total.length}`
          )
          return total
        })
      }

      setCurrentPage(pagina)
      setHasNextPage(!!response.next)
      setTotalItems(
        response.count ||
          (response.results ? response.results.length : response.length)
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
    Alert.alert('Confirmação', `Excluir a nota fiscal ${item.numero}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await notasFiscaisService.excluirNotaFiscal(
              item.empresa,
              item.filial,
              item.numero
            )

            setNotasFiscais((prev) =>
              prev.filter(
                (nota) =>
                  nota.empresa !== item.empresa ||
                  nota.filial !== item.filial ||
                  nota.numero !== item.numero
              )
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
        item: item
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
        numeroNota
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
    ])
  )

  const renderNotaFiscal = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemHeader}>
        <Text style={styles.numeroNota}>NF-e: {item.numero_nota_fiscal}</Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: notasFiscaisUtils.obterCorStatus(
                item.status_nfe
              ),
            },
          ]}>
          <Text style={styles.statusText}>
            {notasFiscaisUtils.obterDescricaoStatus(item.status_nfe)}
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
            {notasFiscaisUtils.formatarData(item.data_emissao)}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Valor Total:</Text>
          <Text style={styles.valueAmount}>
            {notasFiscaisUtils.formatarMoeda(item.valor_total)}
          </Text>
        </View>

        {item.destinatario && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Destinatário:</Text>
            <Text style={styles.value} numberOfLines={1}>
              {item.destinatario}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actionsContainer}>
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
      </View>
    </View>
  )

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
          placeholder="Empresa"
          placeholderTextColor="#999"
          value={searchEmpresa}
          onChangeText={setSearchEmpresa}
        />

        <TextInput
          style={styles.input}
          placeholder="Status (0=Pendente, 100=Autorizada, 101=Cancelada)"
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

        <TouchableOpacity
          style={styles.emitirButton}
          onPress={() => navigation.navigate('EmissaoNFe')}>
          <Text style={styles.emitirButtonText}>📄 Emitir NFe</Text>
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
