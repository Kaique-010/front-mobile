import { useFocusEffect } from '@react-navigation/native'
import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'
import debounce from 'lodash.debounce'
import {
  apiDelete,
  apiDeleteComContexto,
  apiGetComContexto,
} from '../utils/api'
import styles from '../styles/pedidosStyle'
import { getStoredData } from '../services/storageService'

// ...imports

export default function Pedidos({ navigation }) {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchValue, setSearchValue] = useState('')
  const [slug, setSlug] = useState('')
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    const carregarSlug = async () => {
      try {
        const { slug } = await getStoredData()
        if (slug) setSlug(slug)
        else console.warn('Slug não encontrado')
      } catch (err) {
        console.error('Erro ao carregar slug:', err.message)
      }
    }
    carregarSlug()
  }, [])

  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchValue(value)
    }, 600),
    []
  )

  useEffect(() => {
    if (slug) {
      buscarPedidos(false, true)
    }
  }, [slug])

  useEffect(() => {
    if (slug) {
      buscarPedidos(false, false)
    }
  }, [searchValue])

  const buscarPedidos = async (nextPage = false, primeiraCarga = false) => {
    if (!slug || (isFetchingMore && nextPage)) return

    if (!nextPage) {
      setLoading(true)
      if (primeiraCarga) setInitialLoading(true)
      setOffset(0)
      setHasMore(true)
    } else {
      setIsFetchingMore(true)
    }

    try {
      const atualOffset = nextPage ? offset : 0
      const data = await apiGetComContexto(
        'pedidos/pedidos/',
        { limit: 50, offset: atualOffset, search: searchValue },
        'pedi_'
      )

      const novosPedidos = data.results || []
      setPedidos((prev) =>
        nextPage ? [...prev, ...novosPedidos] : novosPedidos
      )
      if (!data.next) setHasMore(false)
      else setOffset(atualOffset + 50)
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error.message)
    } finally {
      setLoading(false)
      setIsFetchingMore(false)
      if (!nextPage && primeiraCarga) setInitialLoading(false)
    }
  }

  const deletarPedido = (pedido) => {
    Alert.alert(
      'Confirmar exclusão',
      `Deseja realmente excluir o pedido nº ${pedido.pedi_nume}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiDeleteComContexto(
                `/pedidos/pedidos/${pedido.pedi_nume}/`
              )
              setPedidos((prev) =>
                prev.filter((p) => p.pedi_nume !== pedido.pedi_nume)
              )
            } catch (error) {
              console.error('Erro ao excluir pedido:', error.message)
            }
          },
        },
      ]
    )
  }

  const statusPedidos = {
    0: 'Aberto',
    1: 'Faturado',
    2: 'Cancelado',
  }

  const renderPedidos = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.status}>
        Status: {statusPedidos[item.pedi_stat] ?? 'Desconhecido'}
      </Text>
      <Text style={styles.numero}>Nº Pedido: {item.pedi_nume}</Text>
      <Text style={styles.data}>Data: {item.pedi_data}</Text>
      <Text style={styles.cliente}>Cliente: {item.cliente_nome}</Text>
      <Text style={styles.total}>Total Pedido: {item.pedi_tota}</Text>
      <Text style={styles.empresa}>Empresa: {item.empresa_nome || '---'}</Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.botao}
          onPress={() => navigation.navigate('PedidosForm', { pedido: item })}>
          <Text style={styles.botaoTexto}>✏️</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botao}
          onPress={() => deletarPedido(item)}>
          <Text style={styles.botaoTexto}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
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
        onPress={() => navigation.navigate('PedidosForm')}>
        <Text style={styles.incluirButtonText}>+ Incluir pedidos</Text>
      </TouchableOpacity>

      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Buscar por pedido ou cliente"
          placeholderTextColor="#777"
          style={styles.input}
          value={searchTerm}
          onChangeText={(text) => {
            setSearchTerm(text)
            debouncedSearch(text)
          }}
          returnKeyType="search"
          onSubmitEditing={() => setSearchValue(searchTerm)}
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => setSearchValue(searchTerm)}>
          <Text style={styles.searchButtonText}>🔍 Buscar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={pedidos}
        renderItem={renderPedidos}
        keyExtractor={(item, index) =>
          `${item.pedi_nume}-${item.pedi_empr}-${item.pedi_forn}-${index}`
        }
        onEndReached={() => {
          if (hasMore && !isFetchingMore) buscarPedidos(true)
        }}
        onEndReachedThreshold={0.2}
        ListFooterComponent={
          isFetchingMore ? (
            <ActivityIndicator
              size="small"
              color="#007bff"
              style={{ marginVertical: 10 }}
            />
          ) : null
        }
      />
      <Text style={styles.footerText}>
        {pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''} encontrado
        {pedidos.length !== 1 ? 's' : ''}
      </Text>
    </View>
  )
}
