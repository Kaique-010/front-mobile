import React, { useState, useEffect } from 'react'
import { FlatList, View, ActivityIndicator } from 'react-native'
import { TextInput, Card, Snackbar } from 'react-native-paper'
import { getStoredData } from '../services/storageService'
import { apiGet } from '../utils/api'

// Hook de debounce
function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

export default function BuscaProdutoInput({ onSelect, initialValue = '' }) {
  const [searchTerm, setSearchTerm] = useState(initialValue)
  const debouncedSearchTerm = useDebounce(searchTerm, 400)
  const [produtos, setProdutos] = useState([])
  const [snackbarVisible, setSnackbarVisible] = useState(false)
  const [loading, setLoading] = useState(false)
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
    if (initialValue) setSearchTerm(initialValue)
  }, [initialValue])

  useEffect(() => {
    if (
      !slug ||
      debouncedSearchTerm.trim().length < 2 ||
      debouncedSearchTerm === initialValue
    ) {
      setProdutos([])
      return
    }

    const buscar = async () => {
      setLoading(true)
      try {
        const data = await apiGet(`/api/${slug}/produtos/produtos/`, {
          search: debouncedSearchTerm,
        })

        const validos = data.results.filter(
          (p) => p?.prod_codi && !isNaN(Number(p.prod_codi))
        )

        setProdutos(validos)
      } catch (err) {
        console.error('❌ Erro ao buscar produtos:', err.message)
      } finally {
        setLoading(false)
      }
    }

    buscar()
  }, [debouncedSearchTerm, slug])

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
          keyExtractor={(item) => item.prod_codi.toString()}
          nestedScrollEnabled={true}
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
