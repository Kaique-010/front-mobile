import React, { useState, useEffect } from 'react'
import { FlatList, View, ActivityIndicator } from 'react-native'
import { TextInput, Card, Snackbar } from 'react-native-paper'
import { getStoredData } from '../services/storageService'
import { apiGetComContexto, safeSetItem } from '../utils/api'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Constantes de cache
const BUSCA_PROPRIEDADE_CACHE_KEY = 'busca_propriedade_cache'
const BUSCA_PROPRIEDADE_CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

// Hook de debounce otimizado
function useDebounce(value, delay = 300) {
  // Reduzido de 400ms para 300ms
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

export default function BuscaPropriedades({ onSelect, initialValue = '' }) {
  const [searchTerm, setSearchTerm] = useState(initialValue)
  const debouncedSearchTerm = useDebounce(searchTerm, 300) // Mais responsivo
  const [propriedades, setPropriedades] = useState([])
  const [snackbarVisible, setSnackbarVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (initialValue) setSearchTerm(initialValue)
  }, [initialValue])

  useEffect(() => {
    if (
      debouncedSearchTerm.trim().length < 2 ||
      debouncedSearchTerm === initialValue
    ) {
      setPropriedades([])
      return
    }

    const buscar = async () => {
      setLoading(true)

      // Verificar cache primeiro
      try {
        const cacheKey = `${BUSCA_PROPRIEDADE_CACHE_KEY}_${debouncedSearchTerm.toLowerCase()}`
        const cacheData = await AsyncStorage.getItem(cacheKey)

        if (cacheData) {
          const { results, timestamp } = JSON.parse(cacheData)
          const now = Date.now()

          if (now - timestamp < BUSCA_PROPRIEDADE_CACHE_DURATION) {
            console.log(
              `📦 [CACHE-BUSCA] Usando cache para: "${debouncedSearchTerm}"`
            )
            const validos = Array.isArray(results) ? results.filter(
              (p) => p?.prop_codi && !isNaN(Number(p.prop_codi))
            ) : []
            setPropriedades(validos)
            setLoading(false)
            return
          }
        }
      } catch (error) {
        console.log('⚠️ Erro ao ler cache de busca:', error)
      }

      try {
        console.log(
          `🔍 [BUSCA-OTIMIZADA] Buscando propriedades para: "${debouncedSearchTerm}"`
        )

        const data = await apiGetComContexto(
          'Floresta/propriedades/',
          {
            search: debouncedSearchTerm,
            limit: 10,
          },
          'prop_'
        )

        if (!data || !data.results) {
          console.warn('⚠️ Resposta da API inválida:', data)
          setPropriedades([])
          setLoading(false)
          return
        }

        const validos = Array.isArray(data.results) ? data.results.filter(
          (p) => p?.prop_codi && !isNaN(Number(p.prop_codi))
        ) : []

        console.log(
          `✅ [BUSCA-OTIMIZADA] Encontrados ${validos.length} propriedades válidas`
        )
        setPropriedades(validos)

        // Salvar no cache
        try {
          const cacheKey = `${BUSCA_PROPRIEDADE_CACHE_KEY}_${debouncedSearchTerm.toLowerCase()}`
          const cacheData = {
            results: data.results,
            timestamp: Date.now(),
          }
          await safeSetItem(cacheKey, JSON.stringify(cacheData))
          console.log(
            `💾 [CACHE-BUSCA] Salvos ${validos.length} propriedades no cache`
          )
        } catch (error) {
          console.log('⚠️ Erro ao salvar cache de busca:', error)
        }
      } catch (err) {
        console.error('❌ Erro ao buscar propriedades:', err.message)
        setPropriedades([])
        // Não mostrar snackbar para evitar spam de erros
      } finally {
        setLoading(false)
      }
    }

    buscar()
  }, [debouncedSearchTerm])

  const handleSelecionarPropriedade = (propriedade) => {
    if (!propriedade?.prop_codi || isNaN(Number(propriedade.prop_codi))) {
      console.warn('❌ Propriedade inválida selecionada:', propriedade)
      return
    }

    onSelect(propriedade)
    setSearchTerm(propriedade.prop_nome)
    setPropriedades([])
    setSnackbarVisible(true)
  }

  return (
    <View>
      <TextInput
        style={{
          backgroundColor: '#232935',
          color: 'white',
          borderRadius: 10,
          marginBottom: 10,
        }}
        label="Buscar propriedade"  
        value={searchTerm}
        onChangeText={setSearchTerm}
        right={<TextInput.Icon icon="magnify" />}
        mode="outlined"
        theme={{
          colors: {
            primary: '#cedaf0',
            text: 'white',
            placeholder: '#bbb',
            background: '#232935',
          },
        }}
        contentStyle={{
          color: 'white',
        }}
      />

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#01ff16"
          style={{ marginVertical: 20 }}
        />
      ) : (
        <FlatList
          data={propriedades}
          keyExtractor={(item, index) => `propriedade-${item?.prop_codi || index}-${index}`}
          nestedScrollEnabled={true}
          maxToRenderPerBatch={10} // Otimização de renderização
          windowSize={10} // Otimização de memória
          renderItem={({ item }) => {
            // Validação adicional para evitar crashes
            if (!item || !item.prop_codi) {
              return null
            }
            
            return (
              <Card
                onPress={() => handleSelecionarPropriedade(item)}
                style={{
                  marginVertical: 4,
                  backgroundColor: '#1c1c1c',
                  borderRadius: 8,
                  elevation: 3,
                }}>
                <Card.Title
                  title={item.prop_nome || 'Nome não disponível'}
                  subtitle={`Código: ${item.prop_codi} | Nome: ${item.prop_nome || 'N/A'}`}
                  titleStyle={{ color: 'white', fontWeight: 'bold' }}
                  subtitleStyle={{ color: '#A1A1A1' }}
                />
              </Card>
            )
          }}
        />
      )}

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={1500}
        style={{ backgroundColor: '#388E3C' }}>
        Propriedade adicionada com sucesso!
      </Snackbar>
    </View>
  )
}
