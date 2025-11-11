import React, { useState, useEffect } from 'react'
import { FlatList, View, ActivityIndicator } from 'react-native'
import { TextInput, Card, Snackbar } from 'react-native-paper'
import { getStoredData } from '../services/storageService'
import { apiGetComContexto, safeSetItem } from '../utils/api'
import AsyncStorage from '@react-native-async-storage/async-storage'

const BUSCA_VOLTAGEM_CACHE_KEY = 'busca_voltagem'
const BUSCA_VOLTAGEM_CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

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

export default function BuscaVoltagemInput({ onSelect, initialValue = '' }) {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300) // Mais responsivo
  const [voltagens, setVoltagens] = useState([])
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
      setVoltagens([])
      return
    }

    const buscar = async () => {
      setLoading(true)

      // Verificar cache primeiro
      try {
        const cacheKey = `${BUSCA_VOLTAGEM_CACHE_KEY}_${debouncedSearchTerm.toLowerCase()}`
        const cacheData = await AsyncStorage.getItem(cacheKey)

        if (cacheData) {
          const { results, timestamp } = JSON.parse(cacheData)
          const now = Date.now()

          if (now - timestamp < BUSCA_VOLTAGEM_CACHE_DURATION) {
            console.log(
              `📦 [CACHE-BUSCA] Usando cache para: "${debouncedSearchTerm}"`
            )
            const validos = results.filter(
              (p) => p?.osvo_codi && !isNaN(Number(p.osvo_codi))
            )
            setVoltagens(validos)
            setLoading(false)
            return
          }
        }
      } catch (error) {
        console.log('⚠️ Erro ao ler cache de busca:', error)
      }

      try {
        console.log(
          `🔍 [BUSCA-OTIMIZADA] Buscando voltagens para: "${debouncedSearchTerm}"`
        )

        const data = await apiGetComContexto(
          'ordemdeservico/voltagens/',
          {
            search: debouncedSearchTerm,
            limit: 10,
          },
          'voltagem_'
        )

        const validos =
          data.results?.filter((p) => p?.osvo_codi && !isNaN(Number(p.osvo_codi))) ||
          []

        console.log(
          `✅ [BUSCA-OTIMIZADA] Encontrados ${validos.length} voltagens válidos`
        )
        setVoltagens(validos)

        // Salvar no cache
        try {
          const cacheKey = `${BUSCA_VOLTAGEM_CACHE_KEY}_${debouncedSearchTerm.toLowerCase()}`
          const cacheData = {
            results: data.results,
            timestamp: Date.now(),
          }
          await safeSetItem(cacheKey, JSON.stringify(cacheData))
          console.log(
            `💾 [CACHE-BUSCA] Salvos ${validos.length} voltagens no cache`
          )
        } catch (error) {
          console.log('⚠️ Erro ao salvar cache de busca:', error)
        }
      } catch (err) {
        console.error('❌ Erro ao buscar voltagens:', err.message)
      } finally {
        setLoading(false)
      }
    }

    buscar()
  }, [debouncedSearchTerm])

  const handleSelecionarVoltagem = (voltagem) => {
    try {
      if (!voltagem?.osvo_codi || isNaN(Number(voltagem.osvo_codi))) {
        console.warn('❌ Voltagem inválida selecionada:', voltagem)
        return
      }

      // Enviar apenas o código da voltagem (número inteiro)
      if (onSelect && typeof onSelect === 'function') {
        onSelect(Number(voltagem.osvo_codi))
      }
      setSearchTerm(voltagem.osvo_nome)
      setVoltagens([])  
      setSnackbarVisible(true)
    } catch (error) {
      console.error('❌ Erro ao selecionar voltagem:', error)
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
        label="Buscar voltagem"
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
          data={voltagens}
          keyExtractor={(item) => `voltagem-${item.osvo_codi}-${item.osvo_nome}`}
          scrollEnabled={false}
          maxToRenderPerBatch={10}
          windowSize={10}
          renderItem={({ item }) => (
            <Card
              onPress={() => handleSelecionarVoltagem(item)}
              style={{
                marginVertical: 4,
                backgroundColor: '#1c1c1c',
                borderRadius: 8,
                elevation: 3,
              }}>
              <Card.Title
                title={item.osvo_nome}
                subtitle={`Código: ${item.osvo_codi} | Nome: ${item.osvo_nome}`}  
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
        Voltagem selecionada com sucesso!
      </Snackbar>
    </View>
  )
}
