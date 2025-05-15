import React, { useState, useEffect } from 'react'
import { FlatList, View, ActivityIndicator } from 'react-native'
import { TextInput, Card, Snackbar } from 'react-native-paper'
import { getStoredData } from '../services/storageService'
import { apiGet } from '../utils/api'

export default function BuscaProdutoInput({ onSelect }) {
  const [searchTerm, setSearchTerm] = useState('')
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
    const delay = setTimeout(async () => {
      if (searchTerm.trim() === '') {
        setProdutos([])
        return
      }
      setLoading(true)
      try {
        const data = await apiGet(`/api/${slug}/produtos/produtos/`, {
          search: searchTerm,
        })
        setProdutos(data.results)
      } catch (err) {
        console.log('❌ Erro ao buscar produtos:', err.message)
      } finally {
        setLoading(false)
      }
    }, 500)

    return () => clearTimeout(delay)
  }, [searchTerm])

  const handleSelecionarProduto = (produto) => {
    if (!produto?.prod_codi || isNaN(Number(produto.prod_codi))) {
      console.warn('❌ Produto inválido selecionado:', produto)
      return
    }

    onSelect(produto) // adiciona ao pai
    setSearchTerm('') // limpa busca
    setProdutos([]) // limpa lista
    setSnackbarVisible(true) // mostra feedback
  }

  return (
    <View>
      <TextInput
        style={{
          backgroundColor: '#232935',
          color: 'white',
          borderRadius: 10,
          borderColor: 'white',
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
            text: 'white', // COR DO TEXTO DIGITADO
            placeholder: '#bbb', // COR DO PLACEHOLDER
            background: '#232935', // FUNDO DO INPUT
          },
        }}
        contentStyle={{
          color: 'white', // <- ESSA LINHA É A CHAVE!
        }}
      />

      {/* Indicador de carregamento */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#01ff16"
          style={{ marginVertical: 20 }}
        />
      ) : (
        <FlatList
          data={produtos.filter(
            (p) => p?.prod_codi && !isNaN(Number(p.prod_codi))
          )}
          keyExtractor={(item) => item.prod_codi.toString()}
          renderItem={({ item }) => (
            <Card
              onPress={() => handleSelecionarProduto(item)}
              style={{
                marginVertical: 4,
                backgroundColor: '#1c1c1c',
                borderRadius: 8,
                elevation: 3, // Leve sombra para destacar o card
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

      {/* Feedback para produto adicionado */}
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
