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
import {
  apiDeleteComContexto,
  apiGetComContexto,
  apiDelete,
} from '../utils/api'
import styles from '../styles/listaContratosStyles'

export default function ContratosList({ navigation }) {
  const [contratos, setContratos] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchcliente_nome, setSearchCliente_nome] = useState('')
  const [searchContrato, setSearchCOntrato] = useState('')
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
        cliente_nome: searchcliente_nome || undefined,
        cont_cont: searchContrato || undefined,
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

  const excluirContrato = (cont_cont) => {
    Alert.alert('Confirmação', 'Excluir este contrato?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            console.log('Excluindo contrato com cont_cont:', cont_cont)
            await apiDelete(
              `/api/${slug}/contratos/contratos-vendas/${cont_cont}/`
            )
            setContratos((prev) =>
              prev.filter((item) => item.cont_cont !== cont_cont)
            )
          } catch (error) {
            console.log(
              '❌ Erro ao excluir contrato:',
              error.response?.data?.detail || error.message
            )
            Alert.alert(
              error.response?.data?.detail || 'Erro',
              'Erro ao excluir o contrato'
            )
          }
        },
      },
    ])
  }

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.contrato}>Contrato: {item.cont_cont}</Text>
      <Text style={styles.cliente}>Cliente: {item.cliente_nome}</Text>
      <Text style={styles.datalist}>Data: {item.cont_data}</Text>
      <Text style={styles.cliente}>Produto: {item.produto_nome}</Text>
      <Text style={styles.cliente}>Valor: R$ {item.cont_tota}</Text>
      <Text style={styles.cliente}>Empresa: {item.empresa_nome}</Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.botao}
          onPress={() =>
            navigation.navigate('ContratosForm', { contratos: item })
          }>
          <Text style={styles.botaoTexto}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.botao}
          onPress={() => excluirContrato(item.cont_cont)}>
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
        onPress={() => navigation.navigate('ContratosForm')}>
        <Text style={styles.incluirButtonText}>+ Novo Contrato</Text>
      </TouchableOpacity>

      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Filtrar por Cliente"
          placeholderTextColor="#777"
          style={styles.input}
          value={searchcliente_nome}
          onChangeText={setSearchCliente_nome}
        />
        <TextInput
          placeholder="Filtrar por Contrato"
          placeholderTextColor="#777"
          style={styles.input}
          value={searchContrato}
          onChangeText={setSearchCOntrato}
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
