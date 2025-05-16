import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native'
import { apiGet } from '../utils/api'
import { getStoredData } from '../services/storageService'
import Toast from 'react-native-toast-message'
import styles from '../styles/produtosStyles'

export default function Produtos({ navigation }) {
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
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
    if (slug) {
      buscarProdutos()
    }
  }, [slug])

  // Buscar produtos com search
  const buscarProdutos = async () => {
    setIsSearching(true)
    try {
      const data = await apiGet(
        `/api/${slug}/produtos/produtos/?limit=50&offset=0/`,
        { search: searchTerm }
      )

      setProdutos(data.results || [])
      if (data.count === 0) {
        Toast.show({
          type: 'info',
          text1: 'Nenhum produto encontrado',
          position: 'top',
        })
      }
    } catch (error) {
      console.log('❌ Erro ao buscar produtos:', error.message)
    } finally {
      setIsSearching(false)
      setLoading(false)
    }
  }

  // Busca automática com debounce (500ms)
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      buscarProdutos()
    }, 500)
    return () => clearTimeout(delayDebounce)
  }, [searchTerm])

  // Renderiza cada item do produto
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.nome}>{item.prod_nome}</Text>
      <View style={styles.cardContent}>
        {item.imagem_base64 ? (
          <Image
            source={{ uri: `data:image/png;base64,${item.imagem_base64}` }}
            style={styles.imagemProduto}
          />
        ) : (
          <View style={[styles.imagemProduto, styles.imagemPlaceholder]}>
            <Text style={{ color: '#888' }}>Sem Imagem</Text>
          </View>
        )}

        <View style={styles.infoContainer}>
          <Text style={styles.codigo}>Código: {item.prod_codi}</Text>
          <Text style={styles.unidade}>Unidade: {item.prod_unme}</Text>
          <Text style={styles.unidade}>Localidade: {item.prod_loca}</Text>
          <Text style={styles.saldo}>Saldo: {item.saldo_estoque}</Text>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.botao}
              onPress={() =>
                navigation.navigate('ProdutoForm', { produto: item })
              }>
              <Text style={styles.botaoTexto}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.botao}>
              <Text style={styles.botaoTexto}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  )

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="#007bff"
        style={{ marginTop: 50 }}
      />
    )
  }

  return (
    <View style={styles.container}>
      {/* Botão de inclusão */}
      <TouchableOpacity
        style={styles.incluirButton}
        onPress={() => navigation.navigate('ProdutoForm')}>
        <Text style={styles.incluirButtonText}>+ Incluir Produto</Text>
      </TouchableOpacity>

      {/* Campo de busca */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Buscar por código ou nome"
          placeholderTextColor="#777"
          style={styles.input}
          value={searchTerm}
          onChangeText={setSearchTerm}
          onSubmitEditing={buscarProdutos}
        />
        <TouchableOpacity style={styles.searchButton} onPress={buscarProdutos}>
          <Text style={styles.searchButtonText}>
            {isSearching ? '🔍...' : 'Buscar'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de produtos */}
      <FlatList
        data={produtos}
        renderItem={renderItem}
        keyExtractor={(item) => item.prod_codi}
      />
      <Text style={styles.footerText}>
        {produtos.length} produtos{produtos.length !== 1 ? 's' : ''} encontrados
      </Text>
    </View>
  )
}
