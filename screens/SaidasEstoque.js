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
import { apiGet } from '../utils/api'
import styles from '../styles/listaSaidasStyles'

const PAGE_SIZE = 50

export default function ListaSaidas({ navigation }) {
  const [saidas, setSaidas] = useState([])
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const buscarSaidas = async (reset = false) => {
    if ((isFetchingMore && !reset) || (!hasMore && !reset)) return

    if (reset) {
      setOffset(0)
      setHasMore(true)
      setSaidas([])
    }

    const atualOffset = reset ? 0 : offset
    const loadingSetter = reset ? setLoading : setIsFetchingMore

    loadingSetter(true)

    try {
      const data = await apiGet(
        `/api/saidas-estoque/?limit=${PAGE_SIZE}&offset=${atualOffset}`,
        { search: searchTerm }
      )
      const newResults = data.results || []

      if (reset) {
        setSaidas(newResults)
      } else {
        setSaidas((prev) => [...prev, ...newResults])
      }

      if (newResults.length < PAGE_SIZE) {
        setHasMore(false)
      }

      setOffset(atualOffset + PAGE_SIZE)
    } catch (error) {
      console.log('❌ Erro ao buscar saídas:', error.message)
    } finally {
      loadingSetter(false)
    }
  }

  const excluirSaida = (said_prod) => {
    Alert.alert('Confirmação', 'Excluir esta saída?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiGet(`/api/saidas-estoque/${said_prod}/`, {}, 'DELETE')
            setSaidas((prev) =>
              prev.filter((saida) => saida.said_prod !== said_prod)
            )
          } catch (error) {
            console.log(
              '❌ Erro ao excluir saída:',
              error.response?.data?.detail || error.message
            )
            Alert.alert(
              'Erro',
              error.response?.data?.detail || 'Erro ao excluir a saída'
            )
          }
        },
      },
    ])
  }

  useEffect(() => {
    const debounce = setTimeout(() => {
      buscarSaidas(true) // nova busca com filtro
    }, 500)
    return () => clearTimeout(debounce)
  }, [searchTerm])

  useEffect(() => {
    buscarSaidas(true)
  }, [])

  const renderSaida = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.sequencia}>Controle: {item.said_sequ}</Text>
      <Text style={styles.numero}>Produto: {item.said_prod}</Text>
      <Text style={styles.datalist}>Data: {item.said_data}</Text>
      <Text style={styles.quantidade}>Quantidade: {item.said_quan}</Text>
      <Text style={styles.total}>Total: R$ {item.said_tota}</Text>
      <Text style={styles.produto}>Produto: {item.produto_nome || '---'}</Text>
      <Text style={styles.empresa}>Empresa: {item.empresa_nome || '---'}</Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.botao}
          onPress={() => navigation.navigate('SaidasForm', { saida: item })}>
          <Text style={styles.botaoTexto}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.botao}
          onPress={() => excluirSaida(item.said_prod)}>
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
        onPress={() => navigation.navigate('SaidasForm')}>
        <Text style={styles.incluirButtonText}>+ Incluir saída</Text>
      </TouchableOpacity>

      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Buscar por produto"
          placeholderTextColor="#777"
          style={styles.input}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => buscarSaidas(true)}>
          <Text style={styles.searchButtonText}>
            {isSearching ? '🔍...' : 'Buscar'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={saidas}
        renderItem={renderSaida}
        keyExtractor={(item) => item.said_sequ.toString()}
        onEndReached={() => buscarSaidas()}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingMore ? (
            <ActivityIndicator size="small" color="#007bff" />
          ) : null
        }
      />
      <Text style={styles.footerText}>
        {saidas.length} saída{saidas.length !== 1 ? 's' : ''} encontrada
        {saidas.length !== 1 ? 's' : ''}
      </Text>
    </View>
  )
}
