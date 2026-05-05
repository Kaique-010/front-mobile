import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native'

import { transporteService } from './servicetransportes'
import styles from '../styles/mdfeListStyles'

export default function MdfeListScreen({ navigation }) {
  const [mdfes, setMdfes] = useState([])
  const [page, setPage] = useState(1)
  const [next, setNext] = useState(null)

  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  async function carregar(pagina = 1, reset = false, termo = '') {
    try {
      if (pagina === 1 && !refreshing) setLoading(true)
      if (pagina > 1) setLoadingMore(true)
      if (reset) setIsSearching(true)

      const params = { page: pagina }
      if (termo) params.search = termo
      const data = await transporteService.listarMdfes(params)

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
      setIsSearching(false)
    }
  }

  useEffect(() => {
    carregar(1, true)
  }, [])

  useEffect(() => {
    const delay = setTimeout(() => {
      carregar(1, true, searchTerm.trim())
    }, searchTerm === '' ? 0 : 300)

    return () => clearTimeout(delay)
  }, [searchTerm])

  function onRefresh() {
    setRefreshing(true)
    carregar(1, true, searchTerm.trim())
  }

  function carregarMais() {
    if (!next || loadingMore || loading) return
    carregar(page + 1, false, searchTerm.trim())
  }

  function renderFooter() {
    if (!loadingMore) return null

    return (
      <View style={styles.footerLoading}>
        <ActivityIndicator />
      </View>
    )
  }

  function renderEmpty() {
    if (loading) return null

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Nenhum MDF-e encontrado.</Text>
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
        style={styles.card}>
        <Text style={styles.titulo}>MDF-e #{item.mdf_nume || item.mdf_id}</Text>

        <Text style={styles.linha}>Status: {getStatusLabel(item.mdf_stat)}</Text>
        <Text style={styles.linha}>Emissão: {item.mdf_emis || '-'}</Text>
        <Text style={styles.linha}>Chave: {item.mdf_chav || '-'}</Text>
      </TouchableOpacity>
    )
  }

  if (loading && !refreshing) {
    return <ActivityIndicator style={{ flex: 1 }} />
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.incluirButton}
        onPress={() => navigation.navigate('MdfeForm')}>
        <Text style={styles.incluirButtonText}>+ Incluir MDF-e</Text>
      </TouchableOpacity>

      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Buscar por número, chave ou status"
          placeholderTextColor="#777"
          style={styles.input}
          value={searchTerm}
          onChangeText={setSearchTerm}
          onSubmitEditing={() => carregar(1, true, searchTerm.trim())}
        />

        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => carregar(1, true, searchTerm.trim())}>
          <Text style={styles.searchButtonText}>
            {isSearching ? '🔍...' : 'Buscar'}
          </Text>
        </TouchableOpacity>
      </View>

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
      />

      <Text style={styles.footerText}>
        {mdfes.length} MDF-e{mdfes.length !== 1 ? 's' : ''} encontrado
        {mdfes.length !== 1 ? 's' : ''}
      </Text>
    </View>
  )
}
