import React, { useState, useEffect } from 'react'
import { FlatList, View, ActivityIndicator } from 'react-native'
import { TextInput, Card, Snackbar } from 'react-native-paper'
import { getStoredData } from '../services/storageService'
import { apiGetComContexto, safeSetItem } from '../utils/api'
import AsyncStorage from '@react-native-async-storage/async-storage'

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

export default function BuscaSetorInput({ onSelect, initialValue = '' }) {
  const [searchTerm, setSearchTerm] = useState(initialValue)
  const debouncedSearchTerm = useDebounce(searchTerm, 300) // Mais responsivo
  const [setores, setSetores] = useState([])
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
      setSetores([])
      return
    }

    const buscar = async () => {
      setLoading(true)

      // Verificar cache primeiro
      try {
        const cacheKey = `${BUSCA_SETOR_CACHE_KEY}_${debouncedSearchTerm.toLowerCase()}`
        const cacheData = await AsyncStorage.getItem(cacheKey)

        if (cacheData) {
          const { results, timestamp } = JSON.parse(cacheData)
          const now = Date.now()

          if (now - timestamp < BUSCA_SETOR_CACHE_DURATION) {
            console.log(
              `📦 [CACHE-BUSCA] Usando cache para: "${debouncedSearchTerm}"`
            )
            const validos = results.filter(
              (p) => p?.osfs_codi && !isNaN(Number(p.osfs_codi))
            )
            setSetores(validos)
            setLoading(false)
            return
          }
        }
      } catch (error) {
        console.log('⚠️ Erro ao ler cache de busca:', error)
      }

      try {
        console.log(
          `🔍 [BUSCA-OTIMIZADA] Buscando setores para: "${debouncedSearchTerm}"`
        )

        const data = await apiGetComContexto(
          'ordemdeservico/fase-setor/',
          {
            search: debouncedSearchTerm,
            limit: 10,
          },
          'seto_'
        )

        const validos = data.results.filter(
          (p) => p?.osfs_codi && !isNaN(Number(p.osfs_codi))
        )

        console.log(
          `✅ [BUSCA-OTIMIZADA] Encontrados ${validos.length} setores válidos`
        )
        setSetores(validos)

        // Salvar no cache
        try {
          const cacheKey = `${BUSCA_SETOR_CACHE_KEY}_${debouncedSearchTerm.toLowerCase()}`
          const cacheData = {
            results: data.results,
            timestamp: Date.now(),
          }
          await safeSetItem(cacheKey, JSON.stringify(cacheData))
          console.log(
            `💾 [CACHE-BUSCA] Salvos ${validos.length} setores no cache`
          )
        } catch (error) {
          console.log('⚠️ Erro ao salvar cache de busca:', error)
        }
      } catch (err) {
        console.error('❌ Erro ao buscar setores:', err.message)
      } finally {
        setLoading(false)
      }
    }

    buscar()
  }, [debouncedSearchTerm])

  const handleSelecionarSetor = (setor) => {
    if (!setor?.osfs_codi || isNaN(Number(setor.osfs_codi))) {
      console.warn('❌ Setor inválido selecionado:', setor)
      return
    }

    onSelect(setor)
    setSearchTerm(setor.osfs_nome)
    setSetores([])
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
        label="Buscar setor"
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
          data={setores}
          keyExtractor={(item) => `setor-${item.osfs_codi}-${item.osfs_nome}`}
          nestedScrollEnabled={true}
          maxToRenderPerBatch={10} // Otimização de renderização
          windowSize={10} // Otimização de memória
          renderItem={({ item }) => (
            <Card
              onPress={() => handleSelecionarSetor(item)}
              style={{
                marginVertical: 4,
                backgroundColor: '#1c1c1c',
                borderRadius: 8,
                elevation: 3,
              }}>
              <Card.Title
                title={item.osfs_nome}
                subtitle={`Código: ${item.osfs_codi} | Nome: ${item.osfs_nome}`}
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
        Setor adicionado com sucesso!
      </Snackbar>
    </View>
  )
}
