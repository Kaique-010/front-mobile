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
import { apiDeleteComContexto, apiGetComContexto } from '../utils/api'
import styles from '../styles/pedidosStyle'
import { getStoredData } from '../services/storageService'

const statusPedidos = {
  0: 'Aberto',
  1: 'Faturado',
  2: 'Cancelado',
}

// Item memoizado, evita rerender quando props não mudam
const PedidoItem = React.memo(
  ({ item, onEdit, onDelete }) => {
    // Calcular totais corretamente
    const calcularTotais = () => {
      const bruto = Number(item.pedi_topr || item.pedi_tota || 0)
      const desc = Number(item.pedi_desc || 0)
      const liquido = Math.max(0, bruto - desc)

      return { bruto, desc, liquido }
    }

    const { bruto, desc, liquido } = calcularTotais()

    return (
      <View style={styles.card}>
        <Text style={styles.status}>
          Status: {statusPedidos[item.pedi_stat] ?? 'Desconhecido'}
        </Text>
        <Text style={styles.numero}>Nº Pedido: {item.pedi_nume}</Text>
        <Text style={styles.data}>Data: {item.pedi_data}</Text>
        <Text style={styles.cliente}>Cliente: {item.cliente_nome}</Text>

        {/* Exibir totais */}
        <Text style={styles.total}>
          Total Bruto:{' '}
          {bruto.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })}
        </Text>

        {desc > 0 && (
          <Text style={[styles.total, { color: '#ff7b7b', fontSize: 12 }]}>
            Desconto: -
            {desc.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </Text>
        )}

        <Text style={[styles.total, { color: '#18b7df', fontWeight: 'bold' }]}>
          Total Líquido:{' '}
          {liquido.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })}
        </Text>

        <Text style={styles.empresa}>
          Empresa: {item.empresa_nome || '---'}
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.botao} onPress={() => onEdit(item)}>
            <Text style={styles.botaoTexto}>✏️</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.botao} onPress={() => onDelete(item)}>
            <Text style={styles.botaoTexto}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.item.pedi_nume === nextProps.item.pedi_nume &&
      prevProps.item.pedi_stat === nextProps.item.pedi_stat &&
      prevProps.item.pedi_tota === nextProps.item.pedi_tota &&
      prevProps.item.pedi_desc === nextProps.item.pedi_desc
    )
  }
)

// Item memoizado, evita rerender quando props não mudam

export default function Pedidos({ navigation }) {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchCliente, setSearchCliente] = useState('')
  const [searchNumero, setSearchNumero] = useState('')
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

  useEffect(() => {
    if (slug) {
      buscarPedidos(false, true)
    }
  }, [slug])
  useEffect(() => {
    const handler = setTimeout(() => {
      buscarPedidos(false, false)
    }, 600)
    return () => clearTimeout(handler)
  }, [searchCliente, searchNumero])
  const debouncedSearch = useCallback(
    debounce((text) => {
      setSearchCliente(text)
    }, 600),
    []
  )

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
        {
          limit: 40,
          offset: atualOffset,
          cliente_nome: searchCliente,
          pedi_nume: searchNumero,
        },
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
              await apiDeleteComContexto(`pedidos/pedidos/${pedido.pedi_nume}/`)
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

  // Memoize funções para não criar referência nova e forçar rerender do item
  const handleEdit = useCallback(
    (item) => {
      navigation.navigate('PedidosForm', { pedido: item })
    },
    [navigation]
  )

  const handleDelete = useCallback((item) => {
    deletarPedido(item)
  }, [])

  const renderPedidos = useCallback(
    ({ item }) => (
      <PedidoItem item={item} onEdit={handleEdit} onDelete={handleDelete} />
    ),
    [handleEdit, handleDelete]
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
          placeholder="Buscar por nome do cliente"
          placeholderTextColor="#777"
          style={styles.input}
          value={searchCliente}
          onChangeText={(text) => {
            setSearchCliente(text)
            debouncedSearch(text)
          }}
        />
        <TextInput
          placeholder="Buscar por nº orçamento"
          placeholderTextColor="#777"
          style={styles.input}
          keyboardType="numeric"
          value={searchNumero}
          onChangeText={(text) => setSearchNumero(text)}
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => buscarPedidos(false, false)}>
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
        initialNumToRender={10}
        maxToRenderPerBatch={5} // Reduzido para 5
        windowSize={3} // Reduzido para 3
        updateCellsBatchingPeriod={50} // Adicionar controle de batch
        removeClippedSubviews={true}
        getItemLayout={(data, index) => ({
          length: 180, // Altura estimada do item
          offset: 180 * index,
          index,
        })}
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
