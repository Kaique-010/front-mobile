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
import { MaterialIcons } from '@expo/vector-icons'
import debounce from 'lodash.debounce'
import { apiDeleteComContexto, apiGetComContexto } from '../utils/api'
import { getStoredData } from '../services/storageService'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Toast from 'react-native-toast-message'

// Item memoizado, evita rerender quando props não mudam
const EtapaItem = React.memo(
  ({ item, onEdit, onDelete }) => {
    return (
      <View style={styles.card}>
        <Text style={styles.descricao}>{item.etap_descricao}</Text>
        <Text style={styles.empresa}>Empresa: {item.etap_empr}</Text>
        <Text style={styles.empresa}>Nome: {item.empresa_nome}</Text>
        {item.etap_obse && (
          <Text style={styles.observacao}>Obs: {item.etap_obse}</Text>
        )}
        <Text style={styles.data}>
          Criado em: {new Date(item.created_at).toLocaleDateString('pt-BR')}
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.botao} onPress={() => onEdit(item)}>
            <MaterialIcons name="edit" size={20} color="#007bff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.botao} onPress={() => onDelete(item)}>
            <MaterialIcons name="delete" size={20} color="#ff4757" />
          </TouchableOpacity>
        </View>
      </View>
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.item.id === nextProps.item.id &&
      prevProps.item.etap_descricao === nextProps.item.etap_descricao &&
      prevProps.item.etap_empr === nextProps.item.etap_empr &&
      prevProps.item.etap_obse === nextProps.item.etap_obse
    )
  }
)

// Cache para etapas
const ETAPAS_CACHE_KEY = 'etapas_cache'
const ETAPAS_CACHE_DURATION = 12 * 60 * 60 * 1000 // 12 horas

export default function EtapasList({ navigation }) {
  const [etapas, setEtapas] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [slug, setSlug] = useState('')

  useEffect(() => {
    const carregarSlug = async () => {
      try {
        const { slug } = await getStoredData()
        if (slug) setSlug(slug)
      } catch (err) {
        console.error('Erro ao carregar slug:', err.message)
      }
    }
    carregarSlug()
  }, [])

  const buscarEtapas = async () => {
    if (!slug) return

    setIsSearching(true)

    // Verificar cache persistente para busca inicial
    if (!searchTerm) {
      try {
        const cacheData = await AsyncStorage.getItem(ETAPAS_CACHE_KEY)
        if (cacheData) {
          const { results, timestamp } = JSON.parse(cacheData)
          const now = Date.now()

          if (now - timestamp < ETAPAS_CACHE_DURATION) {
            console.log('📦 [CACHE-ETAPAS] Usando dados em cache persistente')
            setEtapas(results || [])
            setLoading(false)
            setIsSearching(false)
            return
          }
        }
      } catch (error) {
        console.log('⚠️ Erro ao ler cache de etapas:', error)
      }
    }

    try {
      const params = searchTerm ? { search: searchTerm } : {}
      console.log('🔍 [ETAPAS-LIST] Buscando etapas com params:', params)
      const response = await apiGetComContexto(
        'controledevisitas/etapas-visita/',
        params
      )

      console.log('📋 [ETAPAS-LIST] Resposta completa:', response)

      // Corrigir parsing - dados estão diretamente no response
      const etapasData =
        response?.results || response?.data?.results || response?.data || []

      console.log('📊 [ETAPAS-LIST] Etapas encontradas:', etapasData.length)
      setEtapas(etapasData)

      // Salvar no cache apenas se não for busca
      if (!searchTerm && etapasData.length > 0) {
        try {
          const cacheData = {
            results: etapasData,
            timestamp: Date.now(),
          }
          await AsyncStorage.setItem(
            ETAPAS_CACHE_KEY,
            JSON.stringify(cacheData)
          )
          console.log('💾 [CACHE-ETAPAS] Dados salvos no cache persistente')
        } catch (error) {
          console.log('⚠️ Erro ao salvar cache de etapas:', error)
        }
      }
    } catch (error) {
      console.error('Erro ao buscar etapas:', error)
      Toast.show({
        type: 'error',
        text1: 'Erro ao carregar etapas',
        text2: error.message || 'Tente novamente',
      })
    } finally {
      setLoading(false)
      setIsSearching(false)
    }
  }

  // Debounce para busca
  const debouncedSearch = useCallback(
    debounce(() => {
      buscarEtapas()
    }, 500),
    [slug, searchTerm]
  )

  useEffect(() => {
    if (slug) {
      debouncedSearch()
    }
    return () => {
      debouncedSearch.cancel()
    }
  }, [slug, searchTerm, debouncedSearch])

  // Recarregar ao focar na tela
  useFocusEffect(
    useCallback(() => {
      if (slug) {
        // Limpar cache para garantir dados atualizados
        AsyncStorage.removeItem(ETAPAS_CACHE_KEY)
        buscarEtapas()
      }
    }, [slug])
  )

  const handleEdit = (etapa) => {
    navigation.navigate('EtapasForm', {
      etapaId: etapa.etap_id,
      etapa: etapa,
      mode: 'edit',
    })
  }

  const handleDelete = (etapa) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja excluir a etapa "${etapa.etap_descricao}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => confirmarExclusao(etapa),
        },
      ]
    )
  }

  const confirmarExclusao = async (etapa) => {
    try {
      await apiDeleteComContexto(
        `controledevisitas/etapas-visita/${etapa.etap_id}/`
      ) // Corrigido: usar etap_id

      // Remover do estado local
      setEtapas((prev) => prev.filter((item) => item.etap_id !== etapa.etap_id)) // Corrigido: usar etap_id

      // Limpar cache
      await AsyncStorage.removeItem(ETAPAS_CACHE_KEY)

      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Etapa excluída com sucesso',
      })
    } catch (error) {
      console.error('Erro ao excluir etapa:', error)
      Toast.show({
        type: 'error',
        text1: 'Erro ao excluir',
        text2: error.message || 'Tente novamente',
      })
    }
  }

  const handleNovaEtapa = () => {
    navigation.navigate('EtapasForm', { mode: 'create' })
  }

  const renderEtapa = ({ item }) => (
    <EtapaItem item={item} onEdit={handleEdit} onDelete={handleDelete} />
  )

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="assignment" size={64} color="#666" />
      <Text style={styles.emptyText}>
        {searchTerm ? 'Nenhuma etapa encontrada' : 'Nenhuma etapa cadastrada'}
      </Text>
      {!searchTerm && (
        <TouchableOpacity style={styles.emptyButton} onPress={handleNovaEtapa}>
          <Text style={styles.emptyButtonText}>Criar primeira etapa</Text>
        </TouchableOpacity>
      )}
    </View>
  )

  const renderFooter = () => {
    if (!isSearching) return null
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#007bff" />
        <Text style={styles.footerText}>Buscando etapas...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Etapas de Visita</Text>
        <TouchableOpacity onPress={handleNovaEtapa} style={styles.addButton}>
          <MaterialIcons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Busca */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Buscar etapas..."
          placeholderTextColor="#666"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        {searchTerm.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchTerm('')}>
            <MaterialIcons name="clear" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Lista */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Carregando etapas...</Text>
        </View>
      ) : (
        <FlatList
          data={etapas}
          renderItem={renderEtapa}
          keyExtractor={(item) =>
            item.id?.toString() ||
            `${item.etap_empr || 'no-empr'}-${item.etap_nume || 'no-nume'}-${Math.random().toString(36).substr(2, 9)}`
          }
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          refreshing={isSearching}
          onRefresh={buscarEtapas}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  )
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a3441',
    backgroundColor: '#1a252f',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#007bff',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    backgroundColor: '#1a252f',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a3441',
  },
  input: {
    flex: 1,
    color: '#fff',
    height: 48,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  clearButton: {
    padding: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  card: {
    backgroundColor: '#1a252f',
    borderColor: '#2a3441',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16,
  },
  descricao: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  empresa: {
    color: '#007bff',
    fontSize: 14,
    marginBottom: 4,
  },
  observacao: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  data: {
    color: '#666',
    fontSize: 12,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  botao: {
    marginLeft: 16,
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 16,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    color: '#666',
    marginLeft: 8,
  },
}
