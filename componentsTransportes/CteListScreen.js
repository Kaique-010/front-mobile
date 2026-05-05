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
import styles from '../styles/cteListStyles'

export default function CteListScreen({ navigation }) {
  const [ctes, setCtes] = useState([])
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
      const data = await transporteService.listarCtes(params)

      const novos = data.results || data || []

      setCtes((prev) => (reset ? novos : [...prev, ...novos]))
      setNext(data.next || null)
      setPage(pagina)
    } catch (e) {
      console.log('Erro ao carregar CT-e:', {
        status: e?.response?.status,
        data: e?.response?.data,
        message: e?.message,
      })
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
    const delay = setTimeout(
      () => {
        carregar(1, true, searchTerm.trim())
      },
      searchTerm === '' ? 0 : 300,
    )

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
        <Text style={styles.emptyText}>Nenhum CT-e encontrado.</Text>
      </View>
    )
  }

  function renderItem({ item }) {
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('CteForm', { id: item.id })}
        style={styles.card}>
        <Text style={styles.titulo}>CT-e #{item.numero || item.id}</Text>

        <Text style={styles.linha}>Status: {item.status ?? '-'}</Text>
        <Text style={styles.linha}>Emissão: {item.emissao || '-'}</Text>
        <Text style={styles.linha}>Chave: {item.chave_acesso || '-'}</Text>
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
        onPress={() => navigation.navigate('CteForm')}>
        <Text style={styles.incluirButtonText}>+ Incluir CT-e</Text>
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
      />

      <Text style={styles.footerText}>
        {ctes.length} CT-e{ctes.length !== 1 ? 's' : ''} encontrado
        {ctes.length !== 1 ? 's' : ''}
      </Text>
    </View>
  )
}
