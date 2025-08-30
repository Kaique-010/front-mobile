import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import Toast from 'react-native-toast-message'
import { apiGetComContextoSemFili } from '../utils/api'
import { getStoredData } from '../services/storageService'
import { useFocusEffect } from '@react-navigation/native'
import debounce from 'lodash.debounce'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { apiDelete, apiGet } from '../utils/api'
import styles from '../styles/entidadeStyles'

// Cache para entidades
const ENTIDADES_CACHE_KEY = 'entidades_cache'
const ENTIDADES_CACHE_DURATION = 12 * 60 * 60 * 1000 // 12 horas

export default function Entidades({ navigation }) {
  const [entidades, setEntidades] = useState([])
  const [loading, setLoading] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)
  const [slug, setSlug] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [searchValue, setSearchValue] = useState('')

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
      setEntidades([])
      setOffset(0)
      setHasMore(true)
      buscarEntidades(false)
    }
  }, [searchValue, slug])

  const debouncedSetSearchValue = useCallback(
    debounce((val) => {
      setSearchValue(val)
    }, 600),
    []
  )

  const buscarEntidades = async (nextPage = false) => {
    if (!slug || (isFetchingMore && nextPage)) return

    if (!nextPage) {
      setLoading(true)
      setOffset(0)
      setHasMore(true)
    } else {
      setIsFetchingMore(true)
    }

    try {
      const atualOffset = nextPage ? offset : 0
      const data = await apiGetComContextoSemFili(
        `entidades/entidades/`,
        { limit: 50, offset: atualOffset, search: searchValue },
        'enti_'
      )

      const novos = data.results || []

      if (nextPage) {
        setEntidades((prev) => [...prev, ...novos])
      } else {
        setEntidades(novos)
      }

      if (!data.next) {
        setHasMore(false)
      } else {
        setOffset(atualOffset + 50)
      }
    } catch (error) {
      console.log('❌ Erro ao buscar Entidades:', error.message)
    } finally {
      setLoading(false)
      setIsFetchingMore(false)
      setInitialLoading(false) // <- esse é o pulo do gato
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      const msg =
        navigation?.getState()?.routes?.[navigation.getState().index]?.params
          ?.mensagemSucesso
      if (msg) {
        Toast.show({ type: 'success', text1: 'Sucesso!', text2: msg })
        navigation.setParams({ mensagemSucesso: null })
      }
    }, [navigation])
  )

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.nome}>{item.enti_nome}</Text>
      <Text style={styles.numero}>Nº {item.enti_clie}</Text>
      <Text style={styles.codigo}>Tipo: {item.enti_tipo_enti}</Text>
      <Text style={styles.unidade}>CPF: {item.enti_cpf || '---'}</Text>
      <Text style={styles.unidade}>CNPJ: {item.enti_cnpj || '---'}</Text>
      <Text style={styles.saldo}>Cidade: {item.enti_cida}</Text>
      <Text style={styles.saldo}>
        Empresa: {item.empresa_nome || 'Não atribuída'}
      </Text>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.botao}
          onPress={() =>
            navigation.navigate('EntidadeForm', { entidade: item })
          }>
          <Text style={styles.botaoTexto}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.botao}
          onPress={() => {
            Toast.show({ type: 'info', text1: 'Ainda não implementado' })
          }}>
          <Text style={styles.botaoTexto}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      {!slug || initialLoading ? (
        <ActivityIndicator
          size="large"
          color="#007bff"
          style={{ marginTop: 50 }}
        />
      ) : (
        <>
          <TouchableOpacity
            style={styles.incluirButton}
            onPress={() => navigation.navigate('EntidadeForm')}>
            <Text style={styles.incluirButtonText}>+ Incluir Entidade</Text>
          </TouchableOpacity>

          <View style={styles.searchContainer}>
            <TextInput
              placeholder="Buscar por nome ou tipo"
              placeholderTextColor="#777"
              style={styles.input}
              value={searchTerm}
              onChangeText={(text) => {
                setSearchTerm(text)
                debouncedSetSearchValue(text)
              }}
              returnKeyType="search"
              onSubmitEditing={() => setSearchValue(searchTerm)}
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => setSearchValue(searchTerm)}>
              <Text style={styles.searchButtonText}>Buscar</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={entidades}
            renderItem={renderItem}
            keyExtractor={(item, index) =>
              `${item.enti_clie}-${item.enti_empr}-${index}`
            }
            onEndReached={() => {
              if (hasMore && !isFetchingMore) buscarEntidades(true)
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
            {entidades.length} entidade{entidades.length !== 1 ? 's' : ''}{' '}
            encontradas
          </Text>
        </>
      )}
    </View>
  )
}
