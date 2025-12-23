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
import { getStoredData } from '../services/storageService'
import { useFocusEffect } from '@react-navigation/native'
import debounce from 'lodash.debounce'
import AsyncStorage from '@react-native-async-storage/async-storage'
import styles from '../styles/entidadeStyles'
import database from '../componentsOrdemServico/schemas/database'
import { Q } from '@nozbe/watermelondb'

import { apiGetComContexto } from '../utils/api'
import NetInfo from '@react-native-community/netinfo'

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
    // Se não tiver slug, não busca (ou busca tudo? melhor garantir slug)
    // if (!slug) return

    if (isFetchingMore && nextPage) return

    if (!nextPage) {
      setLoading(true)
      setOffset(0)
      setHasMore(true)
    } else {
      setIsFetchingMore(true)
    }

    try {
      const atualOffset = nextPage ? offset : 0

      // Busca LOCAL (WatermelonDB)
      const collection = database.collections.get('mega_entidades')
      let queryConditions = []

      if (searchValue) {
        const sanitized = Q.sanitizeLikeString(searchValue)
        queryConditions.push(
          Q.or(
            Q.where('enti_nome', Q.like(`%${sanitized}%`)),
            Q.where('enti_cpf', Q.like(`%${sanitized}%`)),
            Q.where('enti_cnpj', Q.like(`%${sanitized}%`))
          )
        )
      }

      // Query Base
      const queryBase = collection.query(...queryConditions)
      const totalCount = await queryBase.fetchCount()

      // Se banco local estiver vazio e não for uma busca filtrada, tenta API
      if (totalCount === 0 && !searchValue) {
        const netState = await NetInfo.fetch()
        if (netState.isConnected) {
          console.log('[ENTIDADES] Banco local vazio. Buscando da API...')
          try {
            const apiData = await apiGetComContexto('entidades/entidades/', {
              limit: 50,
            })
            const resultsApi = apiData?.results || apiData || []

            if (resultsApi.length > 0) {
              // Mapear para o formato esperado (compatível com _raw)
              const mapped = resultsApi.map((cli) => ({
                enti_nome: cli.enti_nome,
                enti_clie: String(cli.enti_clie),
                enti_tipo_enti: cli.enti_tipo_enti,
                enti_cpf: cli.enti_cpf,
                enti_cnpj: cli.enti_cnpj,
                enti_cida: cli.enti_cida,
                empresa_nome: 'Carregado da API',
              }))

              setEntidades(mapped)
              setHasMore(false) // Paginação da API simplificada por enquanto

              // Opcional: Salvar no banco em background?
              // Melhor deixar o syncService cuidar disso para não duplicar lógica complexa
              // Mas podemos avisar o usuário
              Toast.show({
                type: 'info',
                text1: 'Modo Online',
                text2:
                  'Exibindo dados da API. Sincronização iniciará em breve.',
              })

              return // Encerra aqui, pois já setou dados
            }
          } catch (errApi) {
            console.error('[ENTIDADES] Erro no fallback da API:', errApi)
          }
        }
      }

      // Paginação
      const queryPaginated = collection.query(
        ...queryConditions,
        Q.skip(atualOffset),
        Q.take(50)
      )
      const results = await queryPaginated.fetch()

      const novos = results.map((item) => item._raw)

      if (nextPage) {
        setEntidades((prev) => [...prev, ...novos])
      } else {
        setEntidades(novos)
      }

      if (atualOffset + 50 >= totalCount) {
        setHasMore(false)
      } else {
        setOffset(atualOffset + 50)
      }

      console.log(
        `[ENTIDADES] Busca local: ${results.length} itens encontrados. Total: ${totalCount}`
      )
    } catch (error) {
      console.log('❌ Erro ao buscar Entidades (Local):', error.message)
      Toast.show({
        type: 'error',
        text1: 'Erro na busca',
        text2: 'Falha ao buscar dados locais',
      })
    } finally {
      setLoading(false)
      setIsFetchingMore(false)
      setInitialLoading(false)
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
