import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native'

import { transporteService } from './servicetransportes'

export default function CteListScreen({ navigation }) {
  const [ctes, setCtes] = useState([])
  const [page, setPage] = useState(1)
  const [next, setNext] = useState(null)

  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  async function carregar(pagina = 1, reset = false) {
    try {
      if (pagina === 1 && !refreshing) setLoading(true)
      if (pagina > 1) setLoadingMore(true)

      const data = await transporteService.listarCtes({ page: pagina })

      const novos = data.results || data || []

      setCtes((prev) => (reset ? novos : [...prev, ...novos]))
      setNext(data.next || null)
      setPage(pagina)
    } catch (e) {
      console.log('Erro ao carregar CT-e:', e?.response?.data || e.message)
    } finally {
      setLoading(false)
      setLoadingMore(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    carregar(1, true)
  }, [])

  function onRefresh() {
    setRefreshing(true)
    carregar(1, true)
  }

  function carregarMais() {
    if (!next || loadingMore || loading) return
    carregar(page + 1, false)
  }

  function renderFooter() {
    if (!loadingMore) return null

    return (
      <View style={{ paddingVertical: 16 }}>
        <ActivityIndicator />
      </View>
    )
  }

  function renderEmpty() {
    if (loading) return null

    return (
      <View style={{ padding: 24, alignItems: 'center' }}>
        <Text>Nenhum CT-e encontrado.</Text>
      </View>
    )
  }

  function renderItem({ item }) {
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('CteForm', { id: item.id })}
        style={{
          padding: 14,
          borderBottomWidth: 1,
          borderColor: '#e5e5e5',
          backgroundColor: '#fff',
        }}>
        <Text style={{ fontWeight: '700', fontSize: 16 }}>
          CT-e #{item.numero || item.id}
        </Text>

        <Text>Status: {item.status ?? '-'}</Text>
        <Text>Emissão: {item.emissao || '-'}</Text>
        <Text>Chave: {item.chave_acesso || '-'}</Text>
      </TouchableOpacity>
    )
  }

  if (loading && !refreshing) {
    return <ActivityIndicator style={{ flex: 1 }} />
  }

  return (
    <FlatList
      data={ctes}
      keyExtractor={(item, index) => String(item.id || index)}
      renderItem={renderItem}
      ListEmptyComponent={renderEmpty}
      ListFooterComponent={renderFooter}
      onEndReached={carregarMais}
      onEndReachedThreshold={0.4}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={{
        flexGrow: 1,
        backgroundColor: '#f5f5f5',
      }}
    />
  )
}
