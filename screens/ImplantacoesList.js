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
import styles from '../styles/listaStyles'

export default function ImplantacoesList({ navigation }) {
  const [implantacoes, setImplantacoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchModulo, setSearchModulo] = useState('')
  const [searchTela, setSearchTela] = useState('')
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
      buscarImplantacoes()
    }
  }, [slug])

  const buscarImplantacoes = async () => {
    setIsSearching(true)
    try {
      const data = await apiGetComContexto(`implantacao/implantacoes/`, {
        modulo: searchModulo || undefined,
        tela: searchTela || undefined,
      })
      setImplantacoes(data.results || data)
    } catch (error) {
      console.log('❌ Erro ao buscar implantações:', error.message)
      Alert.alert('Erro', 'Falha ao carregar implantações')
    } finally {
      setIsSearching(false)
      setLoading(false)
    }
  }

  const excluirImplantacao = (id) => {
    Alert.alert('Confirmação', 'Excluir esta implantação?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiDeleteComContexto(
              `implantacao/implantacoes/${id}/`,
              {},
              'DELETE'
            )
            setImplantacoes((prev) => prev.filter((item) => item.id !== id))
          } catch (error) {
            console.log(
              '❌ Erro ao excluir implantação:',
              error.response?.data?.detail || error.message
            )
            Alert.alert(
              'Erro',
              error.response?.data?.detail || 'Erro ao excluir a implantação'
            )
          }
        },
      },
    ])
  }

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.status}>Status: {item.status}</Text>
      <Text style={styles.numero}>Cliente: {item.cliente}</Text>
      <Text style={styles.datalist}>Módulos: {item.modulos}</Text>
      <Text style={styles.cliente}>Telas: {item.telas}</Text>
      <Text style={styles.empresa}>
        Implantador: {item.implantador || '---'}
      </Text>
      <Text style={styles.empresa}>
        Treinado: {item.treinado ? 'Sim' : 'Não'}
      </Text>
      <Text style={styles.datalist}>Data: {item.data_implantacao}</Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.botao}
          onPress={() =>
            navigation.navigate('ImplantacaoForm', { implantacao: item })
          }>
          <Text style={styles.botaoTexto}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.botao}
          onPress={() => excluirImplantacao(item.id)}>
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
        onPress={() => navigation.navigate('ImplantacaoForm')}>
        <Text style={styles.incluirButtonText}>+ Nova Implantação</Text>
      </TouchableOpacity>

      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Filtrar por módulo"
          placeholderTextColor="#777"
          style={styles.input}
          value={searchModulo}
          onChangeText={setSearchModulo}
        />
        <TextInput
          placeholder="Filtrar por tela"
          placeholderTextColor="#777"
          style={styles.input}
          value={searchTela}
          onChangeText={setSearchTela}
          onSubmitEditing={buscarImplantacoes}
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={buscarImplantacoes}>
          <Text style={styles.searchButtonText}>
            {isSearching ? '🔍...' : 'Buscar'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={implantacoes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={() => (
          <Text style={{ textAlign: 'center', marginTop: 20 }}>
            Nenhuma implantação encontrada
          </Text>
        )}
      />

      <Text style={styles.footerText}>
        {implantacoes.length} implantação
        {implantacoes.length !== 1 ? 's' : ''} encontrada
        {implantacoes.length !== 1 ? 's' : ''}
      </Text>
    </View>
  )
}
