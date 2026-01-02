import React, { useEffect, useState, useCallback, memo } from 'react'
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { getStoredData } from '../services/storageService'
import Toast from 'react-native-toast-message'
import AsyncStorage from '@react-native-async-storage/async-storage'
import styles from '../styles/produtosStyles'
import database from '../componentsOrdemServico/schemas/database'
import { Q } from '@nozbe/watermelondb'

import { apiGetComContextoSemFili } from '../utils/api'
import { isOnlineAsync } from '../services/conectividadeService'

const ITEM_HEIGHT = 140

// Cache para produtos básicos
const PRODUTOS_BASICOS_CACHE_KEY = 'produtos_basicos_cache'
const PRODUTOS_BUSCA_CACHE_KEY = 'produtos_busca_cache'
const PRODUTOS_BASICOS_CACHE_DURATION = 12 * 60 * 60 * 1000 // 12 horas
const PRODUTOS_BUSCA_CACHE_DURATION = 12 * 60 * 60 * 1000 // 12 horas para buscas

const ProdutoCard = memo(({ item, navigation }) => (
  <View style={styles.card}>
    <Text style={styles.nome}>{item.prod_nome}</Text>
    <View style={styles.cardContent}>
      {item.imagem_base64 ? (
        <Image
          source={{ uri: `data:image/png;base64,${item.imagem_base64}` }}
          style={styles.imagemProduto}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.imagemProduto, styles.imagemPlaceholder]}>
          <Text style={{ color: '#888' }}>Sem Imagem</Text>
        </View>
      )}
      <View style={styles.infoContainer}>
        <Text style={styles.codigo}>Código: {item.prod_codi}</Text>
        {item.prod_unme && (
          <Text style={styles.unidade}>Unidade: {item.prod_unme}</Text>
        )}
        {item.prod_loca && (
          <Text style={styles.unidade}>Localidade: {item.prod_loca}</Text>
        )}
        <Text style={styles.saldo}>
          Saldo: {item.saldo || item.saldo_estoque || 0}
        </Text>
        <Text style={styles.saldo}>
          Preço: {item.preco_vista || item.prod_preco_vista || '0.00'}
        </Text>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.botao}
            onPress={() =>
              navigation.navigate('ProdutoForm', { produto: item })
            }>
            <Text style={styles.botaoTexto}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.botao}>
            <Text style={styles.botaoTexto}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </View>
))

export default function Produtos({ navigation }) {
  const [produtos, setProdutos] = useState([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [slug, setSlug] = useState('')
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState(false)

  useEffect(() => {
    const carregarSlug = async () => {
      try {
        const { slug } = await getStoredData()
        if (slug) setSlug(slug)
      } catch (err) {
        console.error('Erro ao carregar slug:', err.message)
      }
    }
    carregarSlug()
  }, [])

  const buscarProdutos = useCallback(
    async ({ reset = false, forceRefresh = false }) => {
      if (!slug || (isFetchingMore && !reset)) return

      const atualOffset = reset ? 0 : offset

      if (reset) {
        setIsSearching(true)
        setHasMore(true)
        if (produtos.length === 0) setInitialLoading(true)
      } else {
        setIsFetchingMore(true)
      }

      try {
        const collection = database.collections.get('mega_produtos')
        let queryConditions = []

        if (searchTerm) {
          const sanitized = Q.sanitizeLikeString(searchTerm)
          queryConditions.push(
            Q.or(
              Q.where('prod_nome', Q.like(`%${sanitized}%`)),
              Q.where('prod_codi', Q.like(`%${sanitized}%`))
            )
          )
        }

        const queryBase = collection.query(...queryConditions)
        const count = await queryBase.fetchCount()

        const isOnline = await isOnlineAsync()

        // Se banco local vazio e online, OU se forçado refresh (busca explícita), tenta API
        if (isOnline && ((count === 0 && !searchTerm) || forceRefresh)) {
          console.log(
            `[PRODUTOS] Buscando da API (forceRefresh: ${forceRefresh}, count: ${count})...`
          )
          try {
            // Usando endpoint detalhado que retorna saldo e imagem
            const params = { limit: 50 }
            if (searchTerm) {
              params.search = searchTerm
            }

            const apiData = await apiGetComContextoSemFili(
              'produtos/produtosdetalhados/',
              params
            )
            const resultsApi = apiData?.results || apiData || []

            if (resultsApi.length > 0) {
              const mapped = resultsApi.map((p) => ({
                prod_nome: p.nome || p.prod_nome,
                prod_codi: String(p.codigo || p.prod_codi),
                prod_unme: p.unidade || p.prod_unme,
                prod_loca: p.localizacao || p.prod_loca,
                prod_ncm: p.ncm || p.prod_ncm,
                marca_nome: p.marca_nome || p.prod_marca_nome || '',
                saldo: Number(p.saldo ?? 0),
                preco_vista: Number(p.preco_vista ?? p.prod_preco_vista ?? 0),
                imagem_base64: p.imagem_base64 || null,
              }))

              setProdutos(mapped)
              setHasMore(false)
              Toast.show({
                type: 'info',
                text1: 'Modo Online',
                text2: 'Exibindo dados atualizados da API.',
              })
              return
            }
          } catch (errApi) {
            console.error('[PRODUTOS] Erro no fallback da API:', errApi)
          }
        }

        const queryPaginated = collection.query(
          ...queryConditions,
          Q.skip(atualOffset),
          Q.take(50)
        )
        const results = await queryPaginated.fetch()

        const novos = results.map((item) => item._raw)

        setProdutos(reset ? novos : [...produtos, ...novos])
        setOffset(atualOffset + 50)
        setHasMore(atualOffset + 50 < count)

        console.log(
          `[PRODUTOS] Busca local: ${novos.length} itens. Total: ${count}`
        )
      } catch (error) {
        console.error('Erro buscar produtos local:', error)
        Toast.show({
          type: 'error',
          text1: 'Erro ao buscar produtos',
          text2: error.message,
        })
      } finally {
        setInitialLoading(false)
        setIsSearching(false)
        setIsFetchingMore(false)
      }
    },
    [slug, offset, searchTerm, isFetchingMore, produtos]
  )

  useEffect(() => {
    if (slug && produtos.length === 0 && !searchTerm) {
      buscarProdutos({ reset: true })
    }
  }, [slug])

  useEffect(() => {
    const delay = setTimeout(() => {
      if (slug && searchTerm !== '') {
        buscarProdutos({ reset: true })
      }
    }, 300) // Reduzido de 600ms para 300ms para ser mais responsivo
    return () => clearTimeout(delay)
  }, [searchTerm])

  const handleSearchSubmit = () =>
    buscarProdutos({ reset: true, forceRefresh: true })

  const renderItem = useCallback(
    ({ item }) => <ProdutoCard item={item} navigation={navigation} />,
    [navigation]
  )

  const keyExtractor = useCallback(
    (item, index) =>
      `${item.prod_codi}-${item.prod_empr}-${item.prod_fili}_${index}`,
    []
  )

  const getItemLayout = useCallback(
    (_, index) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    []
  )

  if (initialLoading) {
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
        onPress={() => navigation.navigate('ProdutoForm')}>
        <Text style={styles.incluirButtonText}>+ Incluir Produto</Text>
      </TouchableOpacity>

      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Buscar por código ou nome"
          placeholderTextColor="#777"
          style={styles.input}
          value={searchTerm}
          onChangeText={setSearchTerm}
          onSubmitEditing={handleSearchSubmit}
        />

        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearchSubmit}>
          <Text style={styles.searchButtonText}>
            {isSearching ? '🔍...' : 'Buscar'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlashList
        data={produtos}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        estimatedItemSize={ITEM_HEIGHT}
        onEndReached={() => {
          if (hasMore && !isFetchingMore && !initialLoading) {
            buscarProdutos({ reset: false })
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingMore ? (
            <ActivityIndicator
              size="small"
              color="#007bff"
              style={{ margin: 10 }}
            />
          ) : null
        }
      />

      <Text style={styles.footerText}>
        {produtos.length} produto{produtos.length !== 1 ? 's' : ''} encontrado
        {produtos.length !== 1 ? 's' : ''}
      </Text>
    </View>
  )
}
