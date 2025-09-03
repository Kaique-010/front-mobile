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
  apiDeleteComContexto,
  apiGetComContexto,
  safeSetItem,
} from '../utils/api'
import styles from '../styles/pedidosStyle'
import { getStoredData } from '../services/storageService'
import AsyncStorage from '@react-native-async-storage/async-storage'

const statusPedidos = {
  0: 'Aberto',
  1: 'Faturado',
  2: 'Cancelado',
}

// Cache para pedidos
const PEDIDOS_CACHE_KEY = 'pedidos_cache'
const PEDIDOS_CACHE_DURATION = 12 * 60 * 60 * 1000 // 12 horas

export default function Pedidos({ navigation }) {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchValue, setSearchValue] = useState('')
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

    // Verificar cache persistente para busca inicial
    if (!nextPage && !searchValue && primeiraCarga) {
      try {
        const cacheData = await AsyncStorage.getItem(PEDIDOS_CACHE_KEY)
        if (cacheData) {
          const { results, timestamp } = JSON.parse(cacheData)
          const now = Date.now()

          if (now - timestamp < PEDIDOS_CACHE_DURATION) {
            console.log('📦 [CACHE-PEDIDOS] Usando dados em cache persistente')
            setPedidos(results || [])
            setLoading(false)
            setIsFetchingMore(false)
            if (primeiraCarga) setInitialLoading(false)
            return
          }
        }
      } catch (error) {
        console.log('⚠️ Erro ao ler cache de pedidos:', error)
      }
    }

    try {
      const atualOffset = nextPage ? offset : 0
      console.log(
        `🔍 [PEDIDOS] Buscando pedidos${
          searchValue ? ` para: "${searchValue}"` : ''
        }`
      )

      const data = await apiGetComContexto(
        'pedidos/pedidos/',
        {
          limit: 50,
          offset: atualOffset,
          search: searchValue,
          cliente_nome: searchCliente,
          pedi_nume: searchNumero,
          ordering: '-pedi_data',
        },
        'pedi_'
      )

      const novosResultados = data.results || []
      console.log(`✅ [PEDIDOS] Encontrados ${novosResultados.length} pedidos`)

      setPedidos((prev) =>
        nextPage ? [...prev, ...novosResultados] : novosResultados
      )

      // Salvar no cache persistente se for busca inicial
      if (!nextPage && !searchValue) {
        try {
          const cacheData = {
            results: novosResultados,
            timestamp: Date.now(),
          }
          await safeSetItem(PEDIDOS_CACHE_KEY, JSON.stringify(cacheData))
          console.log(
            `💾 [CACHE-PEDIDOS] Salvos ${novosResultados.length} pedidos no cache`
          )
        } catch (error) {
          console.log('⚠️ Erro ao salvar cache de pedidos:', error)
        }
      }

      if (!data.next) setHasMore(false)
      else setOffset(atualOffset + 50)
    } catch (error) {
      console.log('❌ Erro ao buscar pedidos:', error.message)
    } finally {
      setLoading(false)
      setIsFetchingMore(false)
      if (!nextPage && primeiraCarga) setInitialLoading(false)
    }
  }

  const deletarPedido = (pedido) => {
    Alert.alert(
      'Confirmar exclusão',
      `Deseja realmente excluir o Pedido nº ${pedido.pedi_nume}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              // ✅ CORREÇÃO: Incluir empresa e filial na URL
              await apiDeleteComContexto(
                `pedidos/pedidos/${pedido.pedi_empr}/${pedido.pedi_fili}/${pedido.pedi_nume}/`
              )
              setPedidos((prev) =>
                prev.filter((p) => p.pedi_nume !== pedido.pedi_nume)
              )
              await AsyncStorage.removeItem(PEDIDOS_CACHE_KEY)
              console.log('🗑️ [CACHE-PEDIDOS] Cache limpo após exclusão')
            } catch (error) {
              console.error('Erro ao excluir pedido:', error.message)
              Alert.alert('Erro', 'Não foi possível excluir o pedido')
            }
          },
        },
      ]
    )
  }

  const renderPedidos = ({ item }) => {
    // Debug log para verificar os dados do item
    console.log('[DEBUG] Dados do pedido:', item)
    console.log('[DEBUG] ID que será passado:', item.pedi_nume)

    return (
      <View style={styles.card}>
        <Text style={styles.status}>
          Status: {statusPedidos[item.pedi_stat] ?? 'Desconhecido'}
        </Text>
        <Text style={styles.numero}>Nº Pedido: {item.pedi_nume}</Text>
        <Text style={styles.data}>Data: {item.pedi_data}</Text>
        <Text style={styles.cliente}>Cliente: {item.cliente_nome}</Text>
        {(() => {
          const bruto = Number(item.pedi_topr || item.pedi_tota || 0)
          const desc = Number(item.pedi_desc || 0)
          const liquido = Math.max(0, bruto - desc)
          return (
            <>
              <Text style={styles.total}>
                Total Bruto:{' '}
                {bruto.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </Text>
              {desc > 0 && (
                <Text
                  style={[styles.total, { color: '#ff7b7b', fontSize: 12 }]}>
                  Desconto: -
                  {desc.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </Text>
              )}
              <Text
                style={[
                  styles.total,
                  { color: '#18b7df', fontWeight: 'bold' },
                ]}>
                Total Líquido:{' '}
                {liquido.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </Text>
            </>
          )
        })()}
        <Text style={styles.empresa}>
          Empresa: {item.empresa_nome || '---'}
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.botao}
            onPress={() =>
              navigation.navigate('PedidosForm', { pedido: item })
            }>
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
  }

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
        <Text style={styles.incluirButtonText}>+ Incluir Pedido</Text>
      </TouchableOpacity>

      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Buscar por nome do cliente"
          placeholderTextColor="#777"
          style={styles.input}
          value={searchCliente}
          onChangeText={(text) => setSearchCliente(text)}
        />
        <TextInput
          placeholder="Buscar por nº pedido"
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
          `${item.pedi_nume || index}-${item.pedi_empr || ''}-${
            item.pedi_forn || ''
          }-${index}`
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
