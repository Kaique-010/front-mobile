import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  ActivityIndicator,
  StyleSheet,
} from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import offlineSearch from '../utils/offlineSearchManager'
import NetInfo from '@react-native-community/netinfo'

/**
 * Componente de busca com suporte offline
 * Usa cache local para buscas rápidas e sincroniza em background
 */
export default function OfflineSearchInput({
  type,
  endpoint,
  placeholder,
  onSelect,
  displayField = 'nome',
  secondaryField,
  value,
  disabled = false,
  required = false,
  label,
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [isOffline, setIsOffline] = useState(false)
  const [fromCache, setFromCache] = useState(false)
  const searchTimeout = useRef(null)

  useEffect(() => {
    // Monitor network status
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected)
    })

    // Initialize with cached data
    loadInitialData()

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (value && value !== selectedItem?.[displayField]) {
      setQuery(value)
    }
  }, [value])

  const loadInitialData = async () => {
    try {
      // Try to get cached data for faster initial load
      const result = await offlineSearch.getFromCache(type, true)
      if (result.data && result.data.length > 0) {
        console.log(`📦 [SEARCH INPUT] Cache inicial carregado: ${result.data.length} itens`)
      }
    } catch (error) {
      console.error('[SEARCH INPUT] Erro ao carregar cache inicial:', error)
    }
  }

  const handleSearch = async (text) => {
    setQuery(text)

    if (!text || text.length < 2) {
      setResults([])
      setShowResults(false)
      return
    }

    // Debounce search
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }

    searchTimeout.current = setTimeout(async () => {
      setIsSearching(true)

      try {
        // Try local search first (instant)
        const localResults = await offlineSearch.searchLocal(
          type,
          text,
          displayField
        )

        if (localResults.length > 0) {
          console.log(`✅ [SEARCH INPUT] Busca local: ${localResults.length} resultados`)
          setResults(localResults.slice(0, 20)) // Limit to 20 results
          setShowResults(true)
          setFromCache(true)
        } else {
          // No local results, try API
          console.log('🔄 [SEARCH INPUT] Sem resultados locais, buscando API...')
          const apiResult = await offlineSearch.search(
            type,
            endpoint,
            { search: text, limit: 20 }
          )

          setResults(apiResult.data || [])
          setShowResults(true)
          setFromCache(apiResult.fromCache || apiResult.isOffline)
        }
      } catch (error) {
        console.error('[SEARCH INPUT] Erro na busca:', error)
        setResults([])
        setShowResults(false)
      } finally {
        setIsSearching(false)
      }
    }, 300)
  }

  const handleSelectItem = (item) => {
    setSelectedItem(item)
    setQuery(item[displayField] || '')
    setShowResults(false)
    setResults([])
    
    if (onSelect) {
      onSelect(item)
    }
  }

  const handleClear = () => {
    setQuery('')
    setSelectedItem(null)
    setResults([])
    setShowResults(false)
    
    if (onSelect) {
      onSelect(null)
    }
  }

  const renderResultItem = ({ item }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleSelectItem(item)}>
      <View style={styles.resultContent}>
        <Text style={styles.resultTitle} numberOfLines={1}>
          {item[displayField]}
        </Text>
        {secondaryField && item[secondaryField] && (
          <Text style={styles.resultSubtitle} numberOfLines={1}>
            {item[secondaryField]}
          </Text>
        )}
      </View>
      <FontAwesome name="chevron-right" size={14} color="#ccc" />
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <View style={styles.inputContainer}>
        <FontAwesome
          name="search"
          size={16}
          color="#999"
          style={styles.searchIcon}
        />
        
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={handleSearch}
          placeholder={placeholder}
          placeholderTextColor="#999"
          editable={!disabled}
        />

        {isSearching && (
          <ActivityIndicator size="small" color="#007AFF" style={styles.loader} />
        )}

        {query && !isSearching && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <FontAwesome name="times-circle" size={18} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Offline/Cache indicator */}
      {(isOffline || fromCache) && query.length >= 2 && (
        <View style={styles.indicator}>
          <FontAwesome
            name={isOffline ? "wifi" : "database"}
            size={12}
            color={isOffline ? "#FF9500" : "#007AFF"}
          />
          <Text style={[
            styles.indicatorText,
            { color: isOffline ? "#FF9500" : "#007AFF" }
          ]}>
            {isOffline ? "Modo Offline" : "Resultados do cache"}
          </Text>
        </View>
      )}

      {/* Results Modal */}
      <Modal
        visible={showResults && results.length > 0}
        transparent
        animationType="fade"
        onRequestClose={() => setShowResults(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowResults(false)}>
          <View style={styles.resultsContainer}>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>
                {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
              </Text>
              <TouchableOpacity onPress={() => setShowResults(false)}>
                <FontAwesome name="times" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={results}
              keyExtractor={(item, index) => 
                item.id?.toString() || item.codigo?.toString() || index.toString()
              }
              renderItem={renderResultItem}
              style={styles.resultsList}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* No results message */}
      {showResults && results.length === 0 && !isSearching && (
        <View style={styles.noResults}>
          <FontAwesome name="search" size={24} color="#ccc" />
          <Text style={styles.noResultsText}>Nenhum resultado encontrado</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#FF3B30',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  loader: {
    marginLeft: 8,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingHorizontal: 4,
  },
  indicatorText: {
    fontSize: 11,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  resultsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  resultsList: {
    maxHeight: 400,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultContent: {
    flex: 1,
    marginRight: 8,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  resultSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  noResults: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginTop: 8,
  },
  noResultsText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
})

// Exemplo de uso:
/*
<OfflineSearchInput
  type="clientes"
  endpoint="/licencas/clientes/"
  placeholder="Buscar cliente..."
  displayField="nome"
  secondaryField="cpf_cnpj"
  label="Cliente"
  required
  onSelect={(cliente) => {
    console.log('Cliente selecionado:', cliente)
    setCliente(cliente)
  }}
/>

<OfflineSearchInput
  type="produtos"
  endpoint="/licencas/produtos/"
  placeholder="Buscar produto..."
  displayField="descricao"
  secondaryField="codigo"
  label="Produto"
  onSelect={(produto) => setProduto(produto)}
/>
*/