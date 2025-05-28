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
import { getStoredData } from '../services/storageService'
import { apiDeleteComContexto, apiGetComContexto } from '../utils/api'
import styles from '../styles/listaContasStyles'

export default function ContratosList({ navigation }) {
  const [contratos, setContratos] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchCliente, setSearchCliente] = useState('')
  const [searchProduto, setSearchProduto] = useState('')
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
    if (slug) buscarContratos()
  }, [slug])

  const buscarContratos = async () => {
    setIsSearching(true)
    try {
      const data = await apiGetComContexto(`contratos/contratos-vendas/`, {
        cont_clie: searchCliente || undefined,
        cont_prod: searchProduto || undefined,
      })
      setContratos(data.results || data)
    } catch (error) {
      console.log('❌ Erro ao buscar contratos:', error.message)
      Alert.alert('Erro', 'Falha ao carregar contratos')
    } finally {
      setIsSearching(false)
      setLoading(false)
    }
  }

  const excluirContrato = (id) => {
    Alert.alert('Confirmação', 'Excluir este contrato?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiDeleteComContexto(
              `contratos/contratos-vendas/${id}/`,
              {},
              'DELETE'
            )
            setContratos((prev) => prev.filter((item) => item.id !== id))
          } catch (error) {
            console.log('❌ Erro ao excluir contrato:', error.message)
            Alert.alert('Erro', 'Erro ao excluir o contrato')
          }
        },
      },
    ])
  }

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.status}>Contrato: {item.cont_cont}</Text>
      <Text style={styles.numero}>Cliente: {item.cont_clie}</Text>
      <Text style={styles.datalist}>Data: {item.cont_venc}</Text>
      <Text style={styles.cliente}>Valor: R$ {item.titu_valo}</Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.botao}
          onPress={() => navigation.navigate('', { conta: item })}>
          <Text style={styles.botaoTexto}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.botao}
          onPress={() => excluirContrato(item.id)}>
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
        onPress={() => navigation.navigate('')}>
        <Text style={styles.incluirButtonText}>+ Novo Contrato</Text>
      </TouchableOpacity>

      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Filtrar por Cliente"
          placeholderTextColor="#777"
          style={styles.input}
          value={searchCliente}
          onChangeText={setSearchCliente}
        />
        <TextInput
          placeholder="Filtrar por produto"
          placeholderTextColor="#777"
          style={styles.input}
          value={searchProduto}
          onChangeText={setSearchProduto}
          onSubmitEditing={buscarContratos}
        />
        <TouchableOpacity style={styles.searchButton} onPress={buscarContratos}>
          <Text style={styles.searchButtonText}>
            {isSearching ? '🔍...' : 'Buscar'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={contratos}
        renderItem={renderItem}
        keyExtractor={(item) =>
          `${item.cont_cont}_${item.cont_clie}_${item.cont_empr}_${item.cont_fili}`
        }
        ListEmptyComponent={() => (
          <Text style={{ textAlign: 'center', marginTop: 20 }}>
            Nenhum contrato encontrado
          </Text>
        )}
      />

      <Text style={styles.footerText}>
        {contratos.length} contrato{contratos.length !== 1 ? 's' : ''}{' '}
        encontrado
        {contratos.length !== 1 ? 's' : ''}
      </Text>
    </View>
  )
}
