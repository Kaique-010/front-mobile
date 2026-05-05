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

export default function MdfeListScreen({ navigation }) {
  const [mdfes, setMdfes] = useState([])
  const [page, setPage] = useState(1)
  const [next, setNext] = useState(null)

  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  async function carregar(pagina = 1, reset = false) {
    try {
      if (pagina === 1 && !refreshing) setLoading(true)
      if (pagina > 1) setLoadingMore(true)

      const data = await transporteService.listarMdfes({ page: pagina })

      const novos = data.results || data || []

      setMdfes((prev) => (reset ? novos : [...prev, ...novos]))
      setNext(data.next || null)
      setPage(pagina)
    } catch (e) {
      console.log('Erro ao carregar MDF-e:', e?.response?.data || e.message)
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
        <Text>Nenhum MDF-e encontrado.</Text>
      </View>
    )
  }

  function getStatusLabel(status) {
    const mapa = {
      0: 'Aberto',
      1: 'Emitido',
      2: 'Encerrado',
      3: 'Cancelado',
    }

    return mapa[status] || status || '-'
  }

  function renderItem({ item }) {
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('MdfeForm', { id: item.mdf_id })}
        style={{
          padding: 14,
          borderBottomWidth: 1,
          borderColor: '#e5e5e5',
          backgroundColor: '#fff',
        }}>
        <Text style={{ fontWeight: '700', fontSize: 16 }}>
          MDF-e #{item.mdf_nume || item.mdf_id}
        </Text>

        <Text>Status: {getStatusLabel(item.mdf_stat)}</Text>
        <Text>Emissão: {item.mdf_emis || '-'}</Text>
        <Text>Chave: {item.mdf_chav || '-'}</Text>
      </TouchableOpacity>
    )
  }

  if (loading && !refreshing) {
    return <ActivityIndicator style={{ flex: 1 }} />
  }

  return (
    <FlatList
      data={mdfes}
      keyExtractor={(item, index) => String(item.mdf_id || index)}
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
