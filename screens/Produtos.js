import React, { useEffect, useState, useCallback, memo, useRef } from 'react'
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
import { useFocusEffect } from '@react-navigation/native'
import { getStoredData } from '../services/storageService'
import Toast from 'react-native-toast-message'
import AsyncStorage from '@react-native-async-storage/async-storage'
import styles from '../styles/produtosStyles'
import database from '../componentsOrdemServico/schemas/database'
import { Q } from '@nozbe/watermelondb'

import { apiGetComContexto } from '../utils/api'
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
        {(item.prod_ncm || item.ncm) && (
          <Text style={styles.unidade}>NCM: {item.prod_ncm || item.ncm}</Text>
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
  const [empresaId, setEmpresaId] = useState('')
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const didFocusOnce = useRef(false)
  const fetchLock = useRef(false)
  const offsetRef = useRef(0)
  const produtosCountRef = useRef(0)
  const buscarProdutosRef = useRef(null)

  useEffect(() => {
    const carregarContexto = async () => {
      try {
        const { slug } = await getStoredData()
        if (slug) setSlug(slug)
        const empresaStorage = await AsyncStorage.getItem('empresaId')
        if (empresaStorage) setEmpresaId(String(empresaStorage))
      } catch (err) {
        console.error('Erro ao carregar slug:', err.message)
      }
    }
    carregarContexto()
  }, [])

  useEffect(() => {
    offsetRef.current = offset
  }, [offset])

  useEffect(() => {
    produtosCountRef.current = produtos.length
  }, [produtos.length])

  const buscarProdutos = useCallback(
    async ({ reset = false, forceRefresh = false }) => {
      if (!slug || !empresaId || fetchLock.current) return
      fetchLock.current = true

      const limit = 50
      const mergeDedupe = (prev, next) => {
        const map = new Map()
        for (const p of prev || []) {
          const k = `${p?.prod_empr ?? ''}-${p?.prod_codi ?? ''}`
          if (k !== '-') map.set(k, p)
        }
        for (const p of next || []) {
          const k = `${p?.prod_empr ?? ''}-${p?.prod_codi ?? ''}`
          if (k !== '-') map.set(k, { ...(map.get(k) || {}), ...p })
        }
        return Array.from(map.values())
      }

      const atualOffset = reset ? 0 : offsetRef.current

      if (reset) {
        setIsSearching(true)
        setHasMore(true)
        setOffset(0)
        if (produtosCountRef.current === 0) setInitialLoading(true)
      } else {
        setIsFetchingMore(true)
      }

      try {
        const collection = database.collections.get('mega_produtos')
        let queryConditions = [Q.where('prod_empr', String(empresaId))]

        if (searchTerm) {
          const sanitized = Q.sanitizeLikeString(searchTerm)
          queryConditions.push(
            Q.or(
              Q.where('prod_nome', Q.like(`%${sanitized}%`)),
              Q.where('prod_codi', Q.like(`%${sanitized}%`)),
            ),
          )
        }

        const queryBase = collection.query(...queryConditions)
        const count = await queryBase.fetchCount()

        const isOnline = await isOnlineAsync()

        if (isOnline) {
          console.log(
            `[PRODUTOS] Buscando da API (forceRefresh: ${forceRefresh}, count: ${count})...`,
          )
          try {
            // Usando endpoint detalhado que retorna saldo e imagem
            const params = { limit, offset: atualOffset }
            if (searchTerm) {
              params.search = searchTerm
            }

            const apiData = await apiGetComContexto(
              'produtos/produtosdetalhados/',
              params,
            )
            const resultsApi = Array.isArray(apiData?.results)
              ? apiData.results
              : Array.isArray(apiData)
                ? apiData
                : []

            const mapped = resultsApi.map((p) => ({
              ...p,
              prod_nome: p.nome || p.prod_nome,
              prod_codi: String(p.codigo || p.prod_codi),
              prod_empr: String(empresaId),
              prod_unme: p.unidade || p.prod_unme,
              prod_loca: p.localizacao || p.prod_loca,
              prod_ncm: p.ncm || p.prod_ncm,
              marca_nome:
                p.marca_nome || p.prod_marc_nome || p.prod_marca_nome || '',
              saldo_estoque: Number(p.saldo ?? p.saldo_estoque ?? 0),
              saldo: Number(p.saldo ?? p.saldo_estoque ?? 0),
              preco_vista: Number(p.preco_vista ?? p.prod_preco_vista ?? 0),
              imagem_base64: p.imagem_base64 || null,
              prod_e_serv: p.prod_e_serv || p.prod_eserv || false,
              prod_list_tabe_prec:
                p.prod_list_tabe_prec || p.prod_list_tabe_prod || false,
            }))

            setProdutos((prev) => {
              const nextList = reset ? mapped : mergeDedupe(prev, mapped)
              const progressed = reset || nextList.length > prev.length
              setHasMore(progressed && apiData?.next != null)
              return nextList
            })
            setOffset(atualOffset + mapped.length)

            try {
              await database.write(async () => {
                for (const p of mapped) {
                  const codigo = String(p.prod_codi)
                  const empr = String(p.prod_empr || empresaId)
                  const existing = await collection
                    .query(
                      Q.where('prod_codi', codigo),
                      Q.where('prod_empr', empr),
                    )
                    .fetch()
                  if (existing.length) {
                    await existing[0].update((row) => {
                      row.prodNome = p.prod_nome
                      row.prodUnme = p.prod_unme || null
                      row.prodNcm = p.prod_ncm || null
                      row.precoVista = Number(p.preco_vista ?? 0)
                      row.saldoEstoque = Number(p.saldo_estoque ?? 0)
                      row.marcaNome = p.marca_nome || null
                      row.imagemBase64 = p.imagem_base64 || null
                    })
                  } else {
                    await collection.create((row) => {
                      row._raw.id = `${codigo}-${empr}`
                      row.prodCodi = codigo
                      row.prodEmpr = empr
                      row.prodNome = p.prod_nome
                      row.prodUnme = p.prod_unme || null
                      row.prodNcm = p.prod_ncm || null
                      row.precoVista = Number(p.preco_vista ?? 0)
                      row.saldoEstoque = Number(p.saldo_estoque ?? 0)
                      row.marcaNome = p.marca_nome || null
                      row.imagemBase64 = p.imagem_base64 || null
                    })
                  }
                }
              })
            } catch {}

            if (forceRefresh) {
              Toast.show({
                type: 'info',
                text1: 'Modo Online',
                text2: 'Exibindo dados atualizados da API.',
              })
            }
            return
          } catch (errApi) {
            console.error('[PRODUTOS] Erro no fallback da API:', errApi)
          }
        }

        const queryPaginated = collection.query(
          ...queryConditions,
          Q.skip(atualOffset),
          Q.take(limit),
        )
        const results = await queryPaginated.fetch()

        const novos = results.map((item) => item._raw)

        setProdutos((prev) => {
          const nextList = reset ? novos : mergeDedupe(prev, novos)
          const progressed = reset || nextList.length > prev.length
          setHasMore(progressed && atualOffset + novos.length < count)
          return nextList
        })
        setOffset(atualOffset + novos.length)

        console.log(
          `[PRODUTOS] Busca local: ${novos.length} itens. Total: ${count}`,
        )
      } catch (error) {
        console.error('Erro buscar produtos local:', error)
        Toast.show({
          type: 'error',
          text1: 'Erro ao buscar produtos',
          text2: error.message,
        })
      } finally {
        fetchLock.current = false
        setInitialLoading(false)
        setIsSearching(false)
        setIsFetchingMore(false)
      }
    },
    [slug, empresaId, searchTerm],
  )

  useEffect(() => {
    buscarProdutosRef.current = buscarProdutos
  }, [buscarProdutos])

  useEffect(() => {
    if (slug && empresaId && produtos.length === 0 && !searchTerm) {
      buscarProdutos({ reset: true })
    }
  }, [slug, empresaId, produtos.length, searchTerm, buscarProdutos])

  useFocusEffect(
    useCallback(() => {
      if (didFocusOnce.current) {
        buscarProdutosRef.current?.({ reset: true, forceRefresh: true })
      } else {
        didFocusOnce.current = true
      }
      return () => {}
    }, []),
  )

  useEffect(() => {
    const delay = setTimeout(
      () => {
        if (slug && empresaId) {
          buscarProdutos({ reset: true })
        }
      },
      searchTerm === '' ? 0 : 300,
    )
    return () => clearTimeout(delay)
  }, [slug, empresaId, searchTerm, buscarProdutos])

  const handleSearchSubmit = () =>
    buscarProdutos({ reset: true, forceRefresh: true })

  const renderItem = useCallback(
    ({ item }) => <ProdutoCard item={item} navigation={navigation} />,
    [navigation],
  )

  const keyExtractor = useCallback(
    (item, index) =>
      String(
        item?.id || `${item?.prod_empr || ''}-${item?.prod_codi || index}`,
      ),
    [],
  )

  const getItemLayout = useCallback(
    (_, index) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    [],
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
        onEndReachedThreshold={0.1}
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
