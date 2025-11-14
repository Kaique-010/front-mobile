import React, { useState } from 'react'
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import { apiGetComContexto } from '../utils/api'
import debounce from 'lodash/debounce'

// Adicionar no topo
import AsyncStorage from '@react-native-async-storage/async-storage'

// Cache para serviços (plural)
const SERVICOS_PLURAL_CACHE_KEY = 'servicos_plural_cache'
const SERVICOS_PLURAL_CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export default function BuscaServicoInput({ valorAtual = '', onSelect }) {
  const [query, setQuery] = useState('')
  const [servicos, setServicos] = useState([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)

  // Na função de busca, adicionar:
  const buscarServicos = debounce(async (texto) => {
    if (!texto.trim()) {
      setServicos([])
      return
    }

    // Verificar cache persistente
    const cacheKey = `${SERVICOS_PLURAL_CACHE_KEY}_${texto.toLowerCase()}`
    try {
      const cacheData = await AsyncStorage.getItem(cacheKey)
      if (cacheData) {
        const { results, timestamp } = JSON.parse(cacheData)
        const now = Date.now()

        if (now - timestamp < SERVICOS_PLURAL_CACHE_DURATION) {
          console.log(
            '📦 [CACHE-ASYNC] Usando dados em cache para serviços (plural):',
            texto
          )
          setServicos(results || [])
          return
        }
      }
    } catch (error) {
      console.log('⚠️ Erro ao ler cache de serviços (plural):', error)
    }

    try {
      setLoading(true)
      const response = await apiGetComContexto(
        'produtos/produtos/busca/',
        {
          q: texto,
          tipo: 'S',
        },
        'prod_'
      )

      const servicosArray = response?.results || response || []
      setServicos(servicosArray)
    } catch (error) {
      console.error('Erro ao buscar serviços:', error)
      setServicos([])
    } finally {
      setLoading(false)
    }
  }, 500)

  const handleSelect = (servico) => {
    setQuery(servico.prod_nome)
    setShowResults(false)
    onSelect({
      serv_codi: servico.prod_codi,
      serv_nome: servico.prod_nome,
      serv_preco: servico.prod_preco_vista,
    })
  }

  const handleChangeText = (texto) => {
    setQuery(texto)
    setShowResults(true)
    buscarServicos(texto)
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={query || valorAtual}
        onChangeText={handleChangeText}
        placeholder="Buscar serviço..."
        placeholderTextColor="#666"
        onFocus={() => setShowResults(true)}
      />

      {showResults && (loading || servicos.length > 0) && (
        <View style={styles.resultados}>
          {loading ? (
            <ActivityIndicator color="#10a2a7" style={styles.loading} />
          ) : (
            <FlatList
              data={servicos}
              keyExtractor={(item) =>
                `servico-${item.prod_codi}-${item.prod_nome}-${item.prod_empr}`
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.itemResultado}
                  onPress={() => handleSelect(item)}>
                  <Text style={styles.nomeServico}>{item.prod_nome}</Text>
                  <Text style={styles.precoServico}>
                    R${' '}
                    {Number(item.prod_preco_vista) > 0
                      ? Number(item.prod_preco_vista).toFixed(2)
                      : '0.00'}
                  </Text>
                </TouchableOpacity>
              )}
              style={styles.lista}
            />
          )}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1,
  },
  input: {
    backgroundColor: '#232935',
    color: 'white',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  resultados: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#232935',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    zIndex: 2,
  },
  lista: {
    padding: 8,
  },
  itemResultado: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2c3e50',
  },
  nomeServico: {
    color: 'white',
    fontSize: 14,
    marginBottom: 4,
  },
  precoServico: {
    color: '#10a2a7',
    fontSize: 12,
  },
  loading: {
    padding: 20,
  },
})
