import React, { useState, useEffect } from 'react'
import { FlatList, View, ActivityIndicator } from 'react-native'
import { TextInput, Card, Snackbar } from 'react-native-paper'
import { getStoredData } from '../services/storageService'
import { apiGetComContexto, safeSetItem } from '../utils/api'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Cache para busca de produtos
const BUSCA_PRODUTOS_CACHE_KEY = 'busca_produtos_cache'
const BUSCA_PRODUTOS_CACHE_DURATION = 12 * 60 * 60 * 1000 // 12 horas

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

export default function BuscaProdutoInput({ onSelect, initialValue = '' }) {
  const [searchTerm, setSearchTerm] = useState(initialValue)
  const debouncedSearchTerm = useDebounce(searchTerm, 300) // Mais responsivo
  const [produtos, setProdutos] = useState([])
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
      setProdutos([])
      return
    }

    const buscar = async () => {
      setLoading(true)

      // Verificar cache primeiro
      try {
        const cacheKey = `${BUSCA_PRODUTOS_CACHE_KEY}_${debouncedSearchTerm.toLowerCase()}`
        const cacheData = await AsyncStorage.getItem(cacheKey)

        if (cacheData) {
          const { results, timestamp } = JSON.parse(cacheData)
          const now = Date.now()

          if (now - timestamp < BUSCA_PRODUTOS_CACHE_DURATION) {
            console.log(
              `📦 [CACHE-BUSCA] Usando cache para: "${debouncedSearchTerm}"`
            )
            const validos = results.filter(
              (p) => p?.prod_codi && !isNaN(Number(p.prod_codi))
            )
            setProdutos(validos)
            setLoading(false)
            return
          }
        }
      } catch (error) {
        console.log('⚠️ Erro ao ler cache de busca:', error)
      }

      try {
        console.log(
          `🔍 [BUSCA-OTIMIZADA] Buscando produtos para: "${debouncedSearchTerm}"`
        )

        const data = await apiGetComContexto(
          'produtos/produtos/',
          {
            search: debouncedSearchTerm,
            limit: 10,
          },
          'prod_'
        )

        const validos = data.results.filter(
          (p) => p?.prod_codi && !isNaN(Number(p.prod_codi))
        )

        console.log(
          `✅ [BUSCA-OTIMIZADA] Encontrados ${validos.length} produtos válidos`
        )
        setProdutos(validos)

        // Salvar no cache
        try {
          const cacheKey = `${BUSCA_PRODUTOS_CACHE_KEY}_${debouncedSearchTerm.toLowerCase()}`
          const cacheData = {
            results: data.results,
            timestamp: Date.now(),
          }
          await safeSetItem(cacheKey, JSON.stringify(cacheData))
          console.log(
            `💾 [CACHE-BUSCA] Salvos ${validos.length} produtos no cache`
          )
        } catch (error) {
          console.log('⚠️ Erro ao salvar cache de busca:', error)
        }
      } catch (err) {
        console.error('❌ Erro ao buscar produtos:', err.message)
      } finally {
        setLoading(false)
      }
    }

    buscar()
  }, [debouncedSearchTerm])

  const handleSelecionarProduto = (produto) => {
    if (!produto?.prod_codi || isNaN(Number(produto.prod_codi))) {
      console.warn('❌ Produto inválido selecionado:', produto)
      return
    }

    onSelect(produto)
    setSearchTerm(produto.prod_nome)
    setProdutos([])
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
        label="Buscar produto"
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
          data={produtos}
          keyExtractor={(item) =>
            `produto-${item.prod_codi}-${item.prod_nome}-${item.prod_empr}`
          }
          nestedScrollEnabled={true}
          maxToRenderPerBatch={10} // Otimização de renderização
          windowSize={10} // Otimização de memória
          renderItem={({ item }) => (
            <Card
              onPress={() => handleSelecionarProduto(item)}
              style={{
                marginVertical: 4,
                backgroundColor: '#1c1c1c',
                borderRadius: 8,
                elevation: 3,
              }}>
              <Card.Title
                title={item.prod_nome}
                subtitle={`Código: ${item.prod_codi} | Saldo: ${item.saldo_estoque}`}
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
        Produto adicionado com sucesso!
      </Snackbar>
    </View>
  )
}
