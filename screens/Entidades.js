import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import Toast from 'react-native-toast-message'
import { apiGet } from '../utils/api'
import { getStoredData } from '../services/storageService'
import styles from '../styles/produtosStyles'

export default function Entidades({ navigation }) {
  const [entidades, setEntidades] = useState([])
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
  console.log('Slug:', slug)

  // Buscar entidades da API
  const buscarEntidades = async () => {
    if (!slug) return
    setIsSearching(true)
    setLoading(true)
    try {
      const data = await apiGet(`/api/${slug}/entidades/entidades/?limit=50&offset=0/`, {
        search: searchTerm,
      })
      setEntidades(data.results || [])
    } catch (error) {
      console.log('❌ Erro ao buscar Entidades:', error.message)
    } finally {
      setIsSearching(false)
      setLoading(false)
    }
  }

  // Debounce na busca
  useEffect(() => {
    if (!slug) return
    const delayDebounce = setTimeout(() => {
      buscarEntidades()
    }, 500)
    return () => clearTimeout(delayDebounce)
  }, [searchTerm, slug])

  // Primeira busca
  useEffect(() => {
    if (slug) buscarEntidades()
  }, [slug])

  // Mensagem de sucesso
  useEffect(() => {
    const mensagem =
      navigation?.getState()?.routes?.[navigation?.getState()?.index]?.params
        ?.mensagemSucesso
    if (mensagem) {
      Toast.show({
        type: 'success',
        text1: 'Sucesso!',
        text2: mensagem,
      })
      navigation.setParams({ mensagemSucesso: null })
    }
  }, [navigation])

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.nome}>{item.enti_nome}</Text>
      <Text style={styles.numero}>Nº {item.enti_clie}</Text>
      <Text style={styles.codigo}>Tipo: {item.enti_tipo_enti}</Text>
      <Text style={styles.unidade}>CPF: {item.enti_cpf || '---'}</Text>
      <Text style={styles.unidade}>CNPJ: {item.enti_cnpj || '---'}</Text>
      <Text style={styles.saldo}>Cidade: {item.enti_cida}</Text>
      <Text style={styles.saldo}>
        Empresa: {item.empresa_nome || 'Não atribuída'}
      </Text>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.botao}
          onPress={() =>
            navigation.navigate('EntidadeForm', { entidade: item })
          }>
          <Text style={styles.botaoTexto}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botao}>
          <Text style={styles.botaoTexto}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      {!slug || loading ? (
        <ActivityIndicator
          size="large"
          color="#007bff"
          style={{ marginTop: 50 }}
        />
      ) : (
        <>
          <TouchableOpacity
            style={styles.incluirButton}
            onPress={() => navigation.navigate('EntidadeForm')}>
            <Text style={styles.incluirButtonText}>+ Incluir Entidade</Text>
          </TouchableOpacity>

          <View style={styles.searchContainer}>
            <TextInput
              placeholder="Buscar por nome ou tipo"
              placeholderTextColor="#777"
              style={styles.input}
              value={searchTerm}
              onChangeText={setSearchTerm}
              onSubmitEditing={buscarEntidades}
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={buscarEntidades}>
              <Text style={styles.searchButtonText}>
                {isSearching ? '🔍...' : 'Buscar'}
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={entidades}
            renderItem={renderItem}
            keyExtractor={(item) => `${item.enti_clie}-${item.enti_empr}`}
          />
        </>
      )}
    </View>
  )
}
