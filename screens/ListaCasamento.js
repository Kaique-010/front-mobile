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
import { apiGet } from '../utils/api' // função padrão sua de GET, POST etc.
import styles from '../styles/pedidosStyle' // aproveitando o estilo do pedidos

export default function ListaCasamento({ navigation }) {
  const [listas, setListas] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const buscarListas = async () => {
    setIsSearching(true)
    try {
      const data = await apiGet('/api/listas-casamento/', {
        search: searchTerm,
      })
      setListas(data)
    } catch (error) {
      console.log('❌ Erro ao buscar listas:', error.message)
    } finally {
      setIsSearching(false)
      setLoading(false)
    }
  }

  const excluirLista = (list_codi) => {
    Alert.alert('Confirmação', 'Excluir esta lista?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiGet(`/api/listas-casamento/${list_codi}/`, {}, 'DELETE')
            setListas((prev) =>
              prev.filter((lista) => lista.list_codi !== list_codi)
            )
          } catch (error) {
            console.log('❌ Erro ao excluir lista:', error.message)
          }
        },
      },
    ])
  }

  useEffect(() => {
    const debounce = setTimeout(() => {
      buscarListas()
    }, 500)
    return () => clearTimeout(debounce)
  }, [searchTerm])

  useEffect(() => {
    buscarListas()
  }, [])

  const renderLista = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.status}>Status: {item.list_stat}</Text>
      <Text style={styles.numero}>Nº Lista: {item.list_codi}</Text>
      <Text style={styles.data}>Data: {item.list_data}</Text>
      <Text style={styles.cliente}>Cliente: {item.cliente_nome}</Text>
      <Text style={styles.total}>Empresa: {item.empresa_nome || '---'}</Text>


      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.botao}
          onPress={() =>
            navigation.navigate('ListaCasamentoForm', { lista: item })
          }>
          <Text style={styles.botaoTexto}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.botao}
          onPress={() => excluirLista(item.list_codi)}>
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
        onPress={() => navigation.navigate('ListaCasamentoForm')}>
        <Text style={styles.incluirButtonText}>+ Incluir lista</Text>
      </TouchableOpacity>

      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Buscar por número ou cliente"
          placeholderTextColor="#777"
          style={styles.input}
          value={searchTerm}
          onChangeText={setSearchTerm}
          onSubmitEditing={buscarListas}
        />
        <TouchableOpacity style={styles.searchButton} onPress={buscarListas}>
          <Text style={styles.searchButtonText}>
            {isSearching ? '🔍...' : 'Buscar'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={listas}
        renderItem={renderLista}
        keyExtractor={(item) => item.list_codi.toString()}
      />
    </View>
  )
}
