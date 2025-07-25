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

export default function Orcamentos({ navigation }) {
  const [orcamentos, setOrcamentos] = useState([])
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
      buscarOrcamentos(false, true)
    }
  }, [slug])

  useEffect(() => {
    if (slug) {
      buscarOrcamentos(false, false)
    }
  }, [searchValue])

  const buscarOrcamentos = async (nextPage = false, primeiraCarga = false) => {
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
        'orcamentos/orcamentos/',
        {
          limit: 50,
          offset: atualOffset,
          search: searchValue,
          cliente_nome: searchCliente,
          pedi_nume: searchNumero,
        },
        'pedi_'
      )

      const novosOrcamentos = data.results || []
      setOrcamentos((prev) =>
        nextPage ? [...prev, ...novosOrcamentos] : novosOrcamentos
      )
      if (!data.next) setHasMore(false)
      else setOffset(atualOffset + 50)
    } catch (error) {
      console.error('Erro ao buscar orcamentos:', error.message)
    } finally {
      setLoading(false)
      setIsFetchingMore(false)
      if (!nextPage && primeiraCarga) setInitialLoading(false)
    }
  }

  const deletarOrcamento = (orcamentos) => {
    Alert.alert(
      'Confirmar exclusão',
      `Deseja realmente excluir o Orçamento nº ${orcamentos.pedi_nume}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiDeleteComContexto(
                `orcamentos/orcamentos/${orcamentos.pedi_nume}/`
              )
              setOrcamentos((prev) =>
                prev.filter((o) => o.pedi_nume !== orcamentos.pedi_nume)
              )
            } catch (error) {
              console.error('Erro ao excluir orcamento:', error.message)
            }
          },
        },
      ]
    )
  }

  const renderOrcamentos = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.numero}>Nº Orcamento: {item.pedi_nume}</Text>
      <Text style={styles.data}>Data: {item.pedi_data}</Text>
      <Text style={styles.cliente}>Cliente: {item.cliente_nome}</Text>
      <Text style={styles.total}>Total orcamento: {item.pedi_tota}</Text>
      <Text style={styles.empresa}>Empresa: {item.empresa_nome || '---'}</Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.botao}
          onPress={() =>
            navigation.navigate('OrcamentosForm', { orcamento: item })
          }>
          <Text style={styles.botaoTexto}>✏️</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botao}
          onPress={() => deletarOrcamento(item)}>
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
        onPress={() => navigation.navigate('OrcamentosForm')}>
        <Text style={styles.incluirButtonText}>+ Incluir Orçamento</Text>
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
          placeholder="Buscar por nº orçamento"
          placeholderTextColor="#777"
          style={styles.input}
          keyboardType="numeric"
          value={searchNumero}
          onChangeText={(text) => setSearchNumero(text)}
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => buscarOrcamentos(false, false)}>
          <Text style={styles.searchButtonText}>🔍 Buscar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={orcamentos}
        renderItem={renderOrcamentos}
        keyExtractor={(item, index) =>
          `${item.pedi_nume}-${item.pedi_empr}-${item.pedi_forn}-${index}`
        }
        onEndReached={() => {
          if (hasMore && !isFetchingMore) buscarOrcamentos(true)
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
        {orcamentos.length} orcamento{orcamentos.length !== 1 ? 's' : ''}{' '}
        encontrado
        {orcamentos.length !== 1 ? 's' : ''}
      </Text>
    </View>
  )
}
