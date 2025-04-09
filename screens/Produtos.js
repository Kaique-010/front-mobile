import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { apiFetch, BASE_URL } from '../utils/api'
import styles from '../styles/produtosStyles'

export default function Produtos({ navigation }) {
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const response = await apiFetch(`${BASE_URL}/api/produtos/`)
        setProdutos(response.data)
      } catch (error) {
        console.log(
          '❌ Erro ao buscar produtos:',
          error.response?.data || error.message
        )
      } finally {
        setLoading(false)
      }
    }

    fetchProdutos()
  }, [])

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.nome}>{item.prod_nome}</Text>
      <Text style={styles.codigo}>Código: {item.prod_codi}</Text>
      <Text style={styles.unidade}>Unidade: {item.prod_unme}</Text>
      <Text style={styles.unidade}>Localidade: {item.prod_loca}</Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.botao}
          onPress={() => navigation.navigate('ProdutoForm', { produto: item })}>
          <Text style={styles.botaoTexto}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botao}>
          <Text style={styles.botaoTexto}>🗑️</Text>
        </TouchableOpacity>
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
      <TouchableOpacity
        style={styles.incluirButton}
        onPress={() => navigation.navigate('ProdutoForm')}>
        <Text style={styles.incluirButtonText}>+ Incluir Produto</Text>
      </TouchableOpacity>

      {/* Busca (ainda pode ser implementada logicamente depois) */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Buscar por código ou nome"
          placeholderTextColor="#777"
          style={styles.input}
        />
        <TouchableOpacity style={styles.searchButton}>
          <Text style={styles.searchButtonText}>Buscar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={produtos}
        renderItem={renderItem}
        keyExtractor={(item) => item.prod_codi}
      />
    </View>
  )
}
