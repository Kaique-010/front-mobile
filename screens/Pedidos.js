import { useFocusEffect } from '@react-navigation/native'
import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { apiGetComContexto } from '../utils/api'
import styles from '../styles/pedidosStyle'
import { getStoredData } from '../services/storageService'

export default function Pedidos({ navigation }) {
  const [pedidos, setPedidos] = useState([])
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
      buscarPedidos()
    }
  }, [slug, searchTerm])
  console.log('Tela de Pedidos')
  const buscarPedidos = async () => {
    if (!slug) return
    setIsSearching(true)
    setLoading(true)
    try {
      const data = await apiGetComContexto(
        'pedidos/pedidos/',
        { limit: 50, offset: 0, search: searchTerm },
        'pedi_'
      )
      setPedidos(data.results || [])
    } catch (error) {
      console.error(error)
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
            await apiGet(
              `/api/${slug}/pedidos/pedidos/${pedi_nume}/`,
              {},
              'DELETE'
            )
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
  const statusPedidos = {
    0: 'Aberto',
  }

  // Renderização de cada item da lista
  const renderPedidos = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.status}>Status: {item.pedi_stat}</Text>
      <Text style={styles.numero}>Nº Pedido: {item.pedi_nume}</Text>
      <Text style={styles.data}>Data: {item.pedi_data}</Text>
      <Text style={styles.cliente}>Cliente: {item.cliente_nome}</Text>
      <Text style={styles.total}>Total Pedido: {item.pedi_tota}</Text>
      <Text style={styles.empresa}>Empresa: {item.empresa_nome || '---'}</Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.botao}
          onPress={() => navigation.navigate('PedidosForm', { pedido: item })}>
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
        onPress={() => navigation.navigate('PedidosForm')}>
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
        keyExtractor={(item, index) => {
          const key = `${item.pedi_nume}-${item.pedi_empr}-${item.pedi_forn}-${index}`

          return key
        }}
      />
      <Text style={styles.footerText}>
        {pedidos.length} pedidos{pedidos.length !== 1 ? 's' : ''} encontrados
      </Text>
    </View>
  )
}
