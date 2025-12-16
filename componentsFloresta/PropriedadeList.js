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
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getStoredData } from '../services/storageService'
import { apiDelete, apiGet, apiGetComContexto, safeSetItem } from '../utils/api'
import styles from '../styles/listaStyles'
import { useNavigation } from '@react-navigation/native'

// Cache para listas de propriedades
const LISTAS_PROPRIEDADE_CACHE_KEY = 'listas_propriedade_cache'
const LISTAS_PROPRIEDADE_CACHE_DURATION = 12 * 60 * 60 * 1000 // 12 horas

export default function ListaPropriedades({ navigation }) {
  const [listas, setListas] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
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
      buscarListas()
    }
  }, [slug])

  const buscarListas = async (ignorarCache = false) => {
    setIsSearching(true)

    // Verificar cache primeiro (apenas para busca inicial sem filtros e se não for para ignorar)
    if (!searchTerm && !ignorarCache) {
      try {
        const cacheData = await AsyncStorage.getItem(
          LISTAS_PROPRIEDADE_CACHE_KEY
        )
        if (cacheData) {
          const { results, timestamp } = JSON.parse(cacheData)
          const now = Date.now()

          if (now - timestamp < LISTAS_PROPRIEDADE_CACHE_DURATION) {
            console.log(
              '📦 [CACHE-LISTAS] Usando cache para listas de propriedades'
            )
            setListas(results || [])
            setIsSearching(false)
            setLoading(false)
            return
          }
        }
      } catch (error) {
        console.log('⚠️ Erro ao ler cache de listas:', error)
      }
    }

    try {
      console.log(
        `🔍 [LISTAS-PROPRIEDADE] Buscando listas${
          searchTerm ? ` para: "${searchTerm}"` : ''
        }`
      )

      const data = await apiGetComContexto(`Floresta/propriedades/`, {
        search: searchTerm,
      })

      const resultados = data.results || []
      console.log(
        `✅ [LISTAS-PROPRIEDADE] Encontradas ${resultados.length} propriedades`
      )
      setListas(resultados)

      // Salvar no cache apenas se for busca inicial
      if (!searchTerm) {
        try {
          const cacheData = {
            results: resultados,
            timestamp: Date.now(),
          }
          await safeSetItem(
            LISTAS_PROPRIEDADE_CACHE_KEY,
            JSON.stringify(cacheData)
          )
          console.log(
            `💾 [CACHE-LISTAS] Salvadas ${resultados.length} listas no cache`
          )
        } catch (error) {
          console.log('⚠️ Erro ao salvar cache de listas:', error)
        }
      }
    } catch (error) {
      console.log('❌ Erro ao buscar listas:', error.message)
    } finally {
      setIsSearching(false)
      setLoading(false)
    }
  }

  const excluirLista = (list_codi) => {
    Alert.alert('Confirmação', 'Excluir esta lista?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiDelete(
              `/api/${slug}/Florestas/propriedades/${list_codi}/`,
              {},
              'DELETE'
            )
            setListas((prev) =>
              prev.filter((lista) => lista.list_codi !== list_codi)
            )

            // Limpar cache após exclusão
            try {
              await AsyncStorage.removeItem(LISTAS_PROPRIEDADE_CACHE_KEY)
              console.log('🗑️ [CACHE-LISTAS] Cache limpo após exclusão')
            } catch (error) {
              console.log('⚠️ Erro ao limpar cache:', error)
            }
          } catch (error) {
            console.log(
              '❌ Erro ao excluir lista:',
              error.response?.data?.detail || error.message
            )
            Alert.alert(
              'Erro',
              error.response?.data?.detail || 'Erro ao excluir a lista'
            )
          }
        },
      },
    ])
  }

  const renderLista = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.numero}>Nº Propriedade: {item.prop_codi}</Text>
      <Text style={styles.datalist}>Nome da Propriedade: {item.prop_nome}</Text>
      <Text style={styles.datalist}>Sigla: {item.prop_sigl}</Text>
      <Text style={styles.datalist}>
        Ativa: {item.prop_inat === 'false' ? 'Não' : 'Sim'}
      </Text>
      <Text style={styles.empresa}>Empresa: {item.empresa_nome || '---'}</Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.botao}
          onPress={() =>
            navigation.navigate('PropriedadeForm', { 
              propriedade: item,
              propriedadeId: item.prop_codi,
              mode: 'edit'
            })
          }>
          <Text style={styles.botaoTexto}>✏️ </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.botao}
          onPress={() => excluirLista(item.prop_codi)}>
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
        onPress={() => navigation.navigate('PropriedadeForm')}>
        <Text style={styles.incluirButtonText}>+ Incluir propriedade</Text>
      </TouchableOpacity>

      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Buscar por nome da propriedade"
          placeholderTextColor="#777"
          style={styles.input}
          value={searchTerm}
          onChangeText={setSearchTerm}
          onSubmitEditing={() => buscarListas(true)}
        />
        <TouchableOpacity style={styles.searchButton} onPress={() => buscarListas(true)}>
          <Text style={styles.searchButtonText}>
            {isSearching ? '🔍...' : 'Buscar'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={listas}
        renderItem={renderLista}
        keyExtractor={(item) =>
          item.prop_codi?.toString() || Math.random().toString()
        }
      />
      <Text style={styles.footerText}>
        {listas.length} lista{listas.length !== 1 ? 's' : ''} encontrada
        {listas.length !== 1 ? 's' : ''}
      </Text>
    </View>
  )
}
