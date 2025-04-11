import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { apiGet } from '../utils/api'
import styles from '../styles/produtosStyles'

export default function Pedidos({ navigation }) {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const buscarPedidos = async () => {
    setIsSearching(true)
    try {
      const data = await apiGet('/api/pedidos/', { search: searchTerm })
      setPedidos(data)
    } catch (error) {
      console.log('❌ Erro ao buscar :', error.message)
    } finally {
      setIsSearching(false)
      setLoading(false)
    }
  }

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      buscarPedidos()
    }, 500)
    return () => clearTimeout(delayDebounce)
  }, [searchTerm])

  useEffect(() => {
    buscarPedidos()
  }, [])

  const renderPedidos = ({ pedidos }) => (
    <View style={styles.card}>
      <Text style={styles.numero}>Nº Pedido{pedidos.pedi_nume}</Text>
      <Text style={styles.data}>Data: {pedidos.pedi_data}</Text>
      <Text style={styles.cliente}>Cliente: {pedidos.pedi_forn}</Text>
      <Text style={styles.total}>Total Pedido: {pedidos.pedi_tota}</Text>
      <Text style={styles.status}>Status: {pedidos.pedi_stat}</Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.botao}
          onPress={() => navigation.navigate('', { pedidos: pedidos })}>
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
      {/* Botão de inclusão */}
      <TouchableOpacity
        style={styles.incluirButton}
        onPress={() => navigation.navigate('')}>
        <Text style={styles.incluirButtonText}>+ Incluir pedidos</Text>
      </TouchableOpacity>

      {/* Campo de busca */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Buscar por nome ou tipo"
          placeholderTextColor="#777"
          style={styles.input}
          value={searchTerm}
          onChangeText={setSearchTerm}
          onSubmitEditing={buscarPedidos}
        />
        <TouchableOpacity style={styles.searchButton} onPress={buscarPedidos}>
          <Text style={styles.searchButtonText}>
            {isSearching ? '🔍...' : 'Buscar'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de pedidos */}
      <FlatList
        data={pedidos}
        renderpedidos={renderPedidos}
        keyExtractor={(pedidos) => pedidos.pedi_nume.toString()}
      />
    </View>
  )
}
