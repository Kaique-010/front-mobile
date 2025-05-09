import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { apiGet } from '../utils/api'
import styles from '../styles/pedidosStyle'

export default function Pedidos({ navigation }) {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  // Buscar pedidos com filtro de busca
  const buscarPedidos = async () => {
    setIsSearching(true)
    try {
      const data = await apiGet('/api/pedidos/', { search: searchTerm })
      setPedidos(data.results || [])
    } catch (error) {
      console.log('❌ Erro ao buscar :', error.message)
    } finally {
      setIsSearching(false)
      setLoading(false)
    }
  }

  // Função para excluir pedido com confirmação
  const excluirPedido = (pedi_nume) => {
    Alert.alert('Confirmação', 'Tem certeza que deseja excluir este pedido?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiGet(`/api/pedidos/${pedi_nume}/`, {}, 'DELETE')
            // Atualiza a lista removendo o item excluído
            setPedidos((prev) =>
              prev.filter((pedido) => pedido.pedi_nume !== pedi_nume)
            )
          } catch (error) {
            console.log('❌ Erro ao excluir pedido:', error.message)
          }
        },
      },
    ])
  }

  // Debounce pra busca
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      buscarPedidos()
    }, 500)
    return () => clearTimeout(delayDebounce)
  }, [searchTerm])

  // Carrega os pedidos na primeira renderização
  useEffect(() => {
    buscarPedidos()
  }, [])

  // Renderização de cada item da lista
  const renderPedidos = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.status}>Status: {item.pedi_stat}</Text>
      <Text style={styles.numero}>Nº Pedido: {item.pedi_nume}</Text>
      <Text style={styles.data}>Data: {item.pedi_data}</Text>
      <Text style={styles.cliente}>Cliente: {item.cliente_nome}</Text>
      <Text style={styles.total}>Total Pedido: {item.pedi_tota}</Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.botao}
          onPress={() => navigation.navigate('PedidosForm', { pedidos: item })}>
          <Text style={styles.botaoTexto}>✏️</Text>
        </TouchableOpacity>

        {/* Botão de excluir com chamada da função de exclusão */}
        <TouchableOpacity
          style={styles.botao}
          onPress={() => excluirPedido(item.pedi_nume)}>
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
        onPress={() => navigation.navigate('PedidosForm')} // Definido o destino da navegação
      >
        <Text style={styles.incluirButtonText}>+ Incluir pedidos</Text>
      </TouchableOpacity>

      {/* Campo de busca */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Buscar por pedido ou cliente"
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
        renderItem={renderPedidos}
        keyExtractor={(item) => item.pedi_nume.toString()}
      />
    </View>
  )
}
