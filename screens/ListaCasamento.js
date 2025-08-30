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
import { apiDelete, apiGet, safeSetItem } from '../utils/api'
import styles from '../styles/listaStyles'

// Cache para listas de casamento
const LISTAS_CASAMENTO_CACHE_KEY = 'listas_casamento_cache'
const LISTAS_CASAMENTO_CACHE_DURATION = 12 * 60 * 60 * 1000 // 12 horas

export default function ListaCasamento({ navigation }) {
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

  const buscarListas = async () => {
    setIsSearching(true)
    
    // Verificar cache primeiro (apenas para busca inicial sem filtros)
    if (!searchTerm) {
      try {
        const cacheData = await AsyncStorage.getItem(LISTAS_CASAMENTO_CACHE_KEY)
        if (cacheData) {
          const { results, timestamp } = JSON.parse(cacheData)
          const now = Date.now()
          
          if ((now - timestamp) < LISTAS_CASAMENTO_CACHE_DURATION) {
            console.log('📦 [CACHE-LISTAS] Usando cache para listas de casamento')
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
      console.log(`🔍 [LISTAS-CASAMENTO] Buscando listas${searchTerm ? ` para: "${searchTerm}"` : ''}`)
      
      const data = await apiGet(
        `/api/${slug}/listacasamento/listas-casamento/`,
        {
          search: searchTerm,
        }
      )
      
      const resultados = data.results || []
      console.log(`✅ [LISTAS-CASAMENTO] Encontradas ${resultados.length} listas`)
      setListas(resultados)
      
      // Salvar no cache apenas se for busca inicial
      if (!searchTerm) {
        try {
          const cacheData = {
            results: resultados,
            timestamp: Date.now()
          }
          await safeSetItem(LISTAS_CASAMENTO_CACHE_KEY, JSON.stringify(cacheData))
          console.log(`💾 [CACHE-LISTAS] Salvadas ${resultados.length} listas no cache`)
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
              `/api/${slug}/listacasamento/listas-casamento/${list_codi}/`,
              {},
              'DELETE'
            )
            setListas((prev) =>
              prev.filter((lista) => lista.list_codi !== list_codi)
            )
            
            // Limpar cache após exclusão
            try {
              await AsyncStorage.removeItem(LISTAS_CASAMENTO_CACHE_KEY)
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
  const statusMap = {
    0: 'Aberta',
    1: 'Aguardando',
    2: 'Finalizada',
    3: 'Cancelada',
  }

  const renderLista = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.status}>
        Status: {statusMap[item.list_stat] ?? 'Desconhecido'}
      </Text>
      <Text style={styles.numero}>Nº Lista: {item.list_codi}</Text>
      <Text style={styles.datalist}>Data: {item.list_data}</Text>
      <Text style={styles.cliente}>Cliente: {item.cliente_nome}</Text>
      <Text style={styles.empresa}>Empresa: {item.empresa_nome || '---'}</Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.botaoitens}
          onPress={() =>
            navigation.navigate('ItensListaModal', {
              listaId: item.list_codi,
              clienteId: item.list_noiv,
              cliente: item.cliente_nome,
              empresaId: item.list_empr,
              filialId: item.list_fili,
            })
          }>
          <Text style={styles.botaoTexto}>💍 </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.botao}
          onPress={() =>
            navigation.navigate('ListaCasamentoForm', { lista: item })
          }>
          <Text style={styles.botaoTexto}>✏️ </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.botao}
          onPress={() => excluirLista(item.list_codi)}>
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
        onPress={() => navigation.navigate('ListaCasamentoForm')}>
        <Text style={styles.incluirButtonText}>+ Incluir lista</Text>
      </TouchableOpacity>

      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Buscar por número ou cliente"
          placeholderTextColor="#777"
          style={styles.input}
          value={searchTerm}
          onChangeText={setSearchTerm}
          onSubmitEditing={buscarListas}
        />
        <TouchableOpacity style={styles.searchButton} onPress={buscarListas}>
          <Text style={styles.searchButtonText}>
            {isSearching ? '🔍...' : 'Buscar'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={listas}
        renderItem={renderLista}
        keyExtractor={(item) => item.list_codi.toString()}
      />
      <Text style={styles.footerText}>
        {listas.length} lista{listas.length !== 1 ? 's' : ''} encontrada
        {listas.length !== 1 ? 's' : ''}
      </Text>
    </View>
  )
}
