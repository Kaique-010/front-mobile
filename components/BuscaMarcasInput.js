import React, { useState, useEffect } from 'react'
import { FlatList, View, ActivityIndicator } from 'react-native'
import { TextInput, Card, Snackbar } from 'react-native-paper'
import { getStoredData } from '../services/storageService'
import { apiGetComContexto, safeSetItem } from '../utils/api'
import AsyncStorage from '@react-native-async-storage/async-storage'

const BUSCA_MARCA_CACHE_KEY = 'busca_marca'
const BUSCA_MARCA_CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

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

export default function BuscaMarcasInput({ onSelect, initialValue = '' }) {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300) // Mais responsivo
  const [marcas, setMarcas] = useState([])
  const [snackbarVisible, setSnackbarVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    try {
      // Se initialValue for um número (código), não definir searchTerm
      if (initialValue && typeof initialValue === 'string') {
        setSearchTerm(initialValue)
      }
    } catch (error) {
      console.error('❌ Erro ao processar initialValue:', error)
    }
  }, [initialValue])

  useEffect(() => {
    if (
      debouncedSearchTerm.trim().length < 2 ||
      debouncedSearchTerm === initialValue
    ) {
      setMarcas([])
      return
    }

    const buscar = async () => {
      setLoading(true)

      // Verificar cache primeiro
      try {
        const cacheKey = `${BUSCA_MARCA_CACHE_KEY}_${debouncedSearchTerm.toLowerCase()}`
        const cacheData = await AsyncStorage.getItem(cacheKey)

        if (cacheData) {
          const { results, timestamp } = JSON.parse(cacheData)
          const now = Date.now()

          if (now - timestamp < BUSCA_MARCA_CACHE_DURATION) {
            console.log(
              `📦 [CACHE-BUSCA] Usando cache para: "${debouncedSearchTerm}"`
            )
            const validos = results.filter(
              (p) => p?.codigo && !isNaN(Number(p.codigo))
            )
            setMarcas(validos)
            setLoading(false)
            return
          }
        }
      } catch (error) {
        console.log('⚠️ Erro ao ler cache de busca:', error)
      }

      try {
        console.log(
          `🔍 [BUSCA-OTIMIZADA] Buscando marcas para: "${debouncedSearchTerm}"`
        )

        const data = await apiGetComContexto(
          'produtos/marcas/',
          {
            search: debouncedSearchTerm,
            limit: 10,
          },
          'marca_'
        )

        const validos =
          data.results?.filter((p) => p?.codigo && !isNaN(Number(p.codigo))) ||
          []

        console.log(
          `✅ [BUSCA-OTIMIZADA] Encontrados ${validos.length} marcas válidos`
        )
        setMarcas(validos)

        // Salvar no cache
        try {
          const cacheKey = `${BUSCA_MARCA_CACHE_KEY}_${debouncedSearchTerm.toLowerCase()}`
          const cacheData = {
            results: data.results,
            timestamp: Date.now(),
          }
          await safeSetItem(cacheKey, JSON.stringify(cacheData))
          console.log(
            `💾 [CACHE-BUSCA] Salvos ${validos.length} marcas no cache`
          )
        } catch (error) {
          console.log('⚠️ Erro ao salvar cache de busca:', error)
        }
      } catch (err) {
        console.error('❌ Erro ao buscar marcas:', err.message)
      } finally {
        setLoading(false)
      }
    }

    buscar()
  }, [debouncedSearchTerm])

  const handleSelecionarMarca = (marca) => {
    try {
      if (!marca?.codigo || isNaN(Number(marca.codigo))) {
        console.warn('❌ Marca inválida selecionada:', marca)
        return
      }

      // Enviar apenas o código da marca (número inteiro)
      if (onSelect && typeof onSelect === 'function') {
        onSelect(Number(marca.codigo))
      }
      setSearchTerm(marca.nome)
      setMarcas([])
      setSnackbarVisible(true)
    } catch (error) {
      console.error('❌ Erro ao selecionar marca:', error)
    }
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
        label="Buscar marca"
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
          data={marcas}
          keyExtractor={(item) => `marca-${item.codigo}-${item.nome}`}
          scrollEnabled={false}
          maxToRenderPerBatch={10}
          windowSize={10}
          renderItem={({ item }) => (
            <Card
              onPress={() => handleSelecionarMarca(item)}
              style={{
                marginVertical: 4,
                backgroundColor: '#1c1c1c',
                borderRadius: 8,
                elevation: 3,
              }}>
              <Card.Title
                title={item.nome}
                subtitle={`Código: ${item.codigo} | Nome: ${item.nome}`}
                titleStyle={{ color: 'white', fontWeight: 'bold' }}
                subtitleStyle={{ color: '#A1A1A1' }}
              />
            </Card>
          )}
        />
      )}

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={1500}
        style={{ backgroundColor: '#388E3C' }}>
        Marca selecionada com sucesso!
      </Snackbar>
    </View>
  )
}
