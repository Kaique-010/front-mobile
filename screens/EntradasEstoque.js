import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { apiGet, apiGetComContexto } from '../utils/api'
import styles from '../styles/listaEntradasStyles'
import { getStoredData } from '../services/storageService'

export default function ListaEntradas({ navigation }) {
  const [entradas, setEntradas] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [offset, setOffset] = useState(0)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const PAGE_SIZE = 50
  const [slug, setSlug] = useState('')

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
      buscarEntradas(true)
    }
  }, [slug])

  const buscarEntradas = async (reset = false) => {
    if ((isFetchingMore && !reset) || (!hasMore && !reset)) return
    if (!slug) return

    if (reset) {
      setOffset(0)
      setEntradas([])
      setHasMore(true)
    }

    const atualOffset = reset ? 0 : offset
    const loadingSetter = reset ? setLoading : setIsFetchingMore
    loadingSetter(true)

    try {
      const params = {
        limit: PAGE_SIZE,
        offset: atualOffset,
      }

      if (searchTerm.trim()) {
        params.search = searchTerm
      }

      const data = await apiGetComContexto(
        `entradas_estoque/entradas-estoque/`,
        params,
        'entr_'
      )

      const newResults = data.results || []
      if (reset) {
        setEntradas(newResults)
      } else {
        setEntradas((prev) => [...prev, ...newResults])
      }

      if (newResults.length < PAGE_SIZE) {
        setHasMore(false)
      }

      setOffset(atualOffset + PAGE_SIZE)
    } catch (error) {
      console.log('❌ Erro ao buscar entradas:', error.message)
    } finally {
      loadingSetter(false)
    }
  }

  const excluirEntrada = (entr_sequ) => {
    Alert.alert('Confirmação', 'Excluir esta entrada?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiGet(`/api/entradas-estoque/${entr_sequ}/`, {}, 'DELETE')
            setEntradas((prev) =>
              prev.filter((entrada) => entrada.entr_sequ !== entr_sequ)
            )
          } catch (error) {
            console.log(
              '❌ Erro ao excluir entrada:',
              error.response?.data?.detail || error.message
            )
            Alert.alert(
              'Erro',
              error.response?.data?.detail || 'Erro ao excluir a entrada'
            )
          }
        },
      },
    ])
  }

  const renderEntrada = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.sequencia}>Controle: {item.entr_sequ}</Text>
      <Text style={styles.numero}>Produto: {item.entr_prod}</Text>
      <Text style={styles.datalist}>Data: {item.entr_data}</Text>
      <Text style={styles.quantidade}>Quantidade: {item.entr_quan}</Text>
      <Text style={styles.total}>Total: R$ {item.entr_tota}</Text>
      <Text style={styles.produto}>Produto: {item.produto_nome || '---'}</Text>
      <Text style={styles.empresa}>Empresa: {item.empresa_nome || '---'}</Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.botao}
          onPress={() =>
            navigation.navigate('EntradasForm', { entrada: item })
          }>
          <Text style={styles.botaoTexto}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.botao}
          onPress={() => excluirEntrada(item.entr_sequ)}>
          <Text style={styles.botaoTexto}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  if (loading) {
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
        onPress={() => navigation.navigate('EntradasForm')}>
        <Text style={styles.incluirButtonText}>+ Incluir entrada</Text>
      </TouchableOpacity>

      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Buscar por produto"
          placeholderTextColor="#777"
          style={styles.input}
          value={searchTerm}
          onChangeText={setSearchTerm}
          onSubmitEditing={() => buscarEntradas(true)}
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => buscarEntradas(true)}>
          <Text style={styles.searchButtonText}>🔍 Buscar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={entradas}
        renderItem={renderEntrada}
        keyExtractor={(item, index) =>
          `${item.entr_sequ}-${item.entr_empr}-${item.entr_fili}_${index}`
        }
        onEndReached={() => buscarEntradas()}
        onEndReachedThreshold={0.5}
      />
      <Text style={styles.footerText}>
        {entradas.length} entrada{entradas.length !== 1 ? 's' : ''} encontrada
        {entradas.length !== 1 ? 's' : ''}
      </Text>
    </View>
  )
}
