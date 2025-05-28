import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native'
import { apiGetComContextoSemFili } from '../utils/api'
import { getStoredData } from '../services/storageService'
import Toast from 'react-native-toast-message'
import styles from '../styles/produtosStyles'

const ITEM_HEIGHT = 140

export default function Produtos({ navigation }) {
  const [produtos, setProdutos] = useState([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
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

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (slug && searchTerm !== '') {
        buscarProdutos(true)
      }
    }, 600)

    return () => clearTimeout(delayDebounce)
  }, [searchTerm, slug])

  const handleSearchSubmit = () => {
    buscarProdutos(true)
  }

  const buscarProdutos = useCallback(
    async (reset = false) => {
      if (!slug || (isFetchingMore && !reset)) return

      if (reset) {
        if (produtos.length === 0) {
          setInitialLoading(true)
        }
        setIsSearching(true) // ativando o "carregando" da busca
        setOffset(0)
        setHasMore(true)
      } else {
        setIsFetchingMore(true)
      }

      try {
        const atualOffset = reset ? 0 : offset
        const data = await apiGetComContextoSemFili(
          `produtos/produtos/`,
          {
            limit: 20,
            offset: atualOffset,
            search: searchTerm,
          },
          'prod_'
        )

        if (reset) {
          setProdutos(data.results || [])
        } else {
          setProdutos((prev) => [...prev, ...(data.results || [])])
        }

        setOffset(atualOffset + 20)
        setHasMore(data.next !== null)
      } catch (error) {
        console.log('❌ Erro ao buscar produtos:', error.message)
      } finally {
        if (reset) {
          setInitialLoading(false)
          setIsSearching(false) // desativa "carregando" da busca
        }
        setIsFetchingMore(false)
      }
    },
    [slug, offset, searchTerm, isFetchingMore]
  )
  useEffect(() => {
    if (slug && produtos.length === 0 && !searchTerm) {
      buscarProdutos(true)
    }
  }, [slug])

  const renderItem = useCallback(
    ({ item }) => (
      <View style={styles.card}>
        <Text style={styles.nome}>{item.prod_nome}</Text>
        <View style={styles.cardContent}>
          {item.imagem_base64 ? (
            <Image
              source={{ uri: `data:image/png;base64,${item.imagem_base64}` }}
              style={styles.imagemProduto}
            />
          ) : (
            <View style={[styles.imagemProduto, styles.imagemPlaceholder]}>
              <Text style={{ color: '#888' }}>Sem Imagem</Text>
            </View>
          )}
          <View style={styles.infoContainer}>
            <Text style={styles.codigo}>Código: {item.prod_codi}</Text>
            <Text style={styles.unidade}>Unidade: {item.prod_unme}</Text>
            <Text style={styles.unidade}>Localidade: {item.prod_loca}</Text>
            <Text style={styles.saldo}>Saldo: {item.saldo_estoque}</Text>
            <Text style={styles.saldo}>Preço:{item.prod_preco_vista}</Text>
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
    ),
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
          onPress={() => buscarProdutos(true)}>
          <Text style={styles.searchButtonText}>
            {isSearching ? '🔍...' : 'Buscar'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={produtos}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        onEndReached={() => {
          if (hasMore && !isFetchingMore && !initialLoading) {
            buscarProdutos()
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
