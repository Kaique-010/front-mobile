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
import { apiGet } from '../utils/api'
import styles from '../styles/listaStyles'

export default function ListaCasamento({ navigation }) {
  const [listas, setListas] = useState([])
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
      buscarListas()
    }
  }, [slug])

  const buscarListas = async () => {
    setIsSearching(true)
    try {
      const data = await apiGet(
        `/api/${slug}/listacasamento/listas-casamento/`,
        {
          search: searchTerm,
        }
      )
      setListas(data.results || [])
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
            await apiGet(
              `/api/${slug}/listacasamento/listas-casamento/${list_codi}/`,
              {},
              'DELETE'
            )
            setListas((prev) =>
              prev.filter((lista) => lista.list_codi !== list_codi)
            )
          } catch (error) {
            console.log(
              '❌ Erro ao excluir lista:',
              error.response?.data?.detail || error.message
            )

            // Mostrando um alerta com a mensagem de erro
            Alert.alert(
              'Erro',
              error.response?.data?.detail || 'Erro ao excluir a lista'
            )
          }
        },
      },
    ])
  }
  const statusMap = {
    0: 'Aberta',
    1: 'Aguardando',
    2: 'Finalizada',
    3: 'Cancelada',
  }

  const renderLista = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.status}>
        Status: {statusMap[item.list_stat] ?? 'Desconhecido'}
      </Text>
      <Text style={styles.numero}>Nº Lista: {item.list_codi}</Text>
      <Text style={styles.datalist}>Data: {item.list_data}</Text>
      <Text style={styles.cliente}>Cliente: {item.cliente_nome}</Text>
      <Text style={styles.empresa}>Empresa: {item.empresa_nome || '---'}</Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.botaoitens}
          onPress={() =>
            navigation.navigate('ItensListaModal', {
              listaId: item.list_codi,
              clienteId: item.list_noiv,
              cliente: item.cliente_nome,
              empresaId: item.list_empr,
              filialId: item.list_fili,
            })
          }>
          <Text style={styles.botaoTexto}>💍 </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.botao}
          onPress={() =>
            navigation.navigate('ListaCasamentoForm', { lista: item })
          }>
          <Text style={styles.botaoTexto}>✏️ </Text>
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
      <Text style={styles.footerText}>
        {listas.length} lista{listas.length !== 1 ? 's' : ''} encontrada
        {listas.length !== 1 ? 's' : ''}
      </Text>
    </View>
  )
}
