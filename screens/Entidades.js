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
import styles from '../styles/produtosStyles'

export default function Entidades({ navigation }) {
  const [entidades, setEntidades] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  // Buscar entidades com pesquisa
  const buscarEntidades = async () => {
    setIsSearching(true)
    try {
      const data = await apiGet('/api/entidades/?limit=1&offset=50', {
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

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      buscarEntidades()
    }, 500)
    return () => clearTimeout(delayDebounce)
  }, [searchTerm])

  useEffect(() => {
    buscarEntidades()
  }, [])

  useEffect(() => {
    if (
      navigation?.getState()?.routes?.[navigation?.getState()?.index]?.params
        ?.mensagemSucesso
    ) {
      const mensagem =
        navigation?.getState()?.routes?.[navigation?.getState()?.index]?.params
          ?.mensagemSucesso
      Toast.show({
        type: 'success',
        text1: 'Sucesso!',
        text2: mensagem,
      })

      // Limpa a mensagem para não mostrar na próxima navegação
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

      {/* Nome da Empresa */}
      {item.enti_empr ? (
        <Text style={styles.saldo}>Empresa: {item.empresa_nome}</Text>
      ) : (
        <Text style={styles.saldo}>Empresa: Não atribuída</Text>
      )}

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
        onPress={() => navigation.navigate('EntidadeForm')}>
        <Text style={styles.incluirButtonText}>+ Incluir Entidade</Text>
      </TouchableOpacity>

      {/* Campo de busca */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Buscar por nome ou tipo"
          placeholderTextColor="#777"
          style={styles.input}
          value={searchTerm}
          onChangeText={setSearchTerm}
          onSubmitEditing={buscarEntidades}
        />
        <TouchableOpacity style={styles.searchButton} onPress={buscarEntidades}>
          <Text style={styles.searchButtonText}>
            {isSearching ? '🔍...' : 'Buscar'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de entidades */}
      <FlatList
        data={entidades}
        renderItem={renderItem}
        keyExtractor={(item) => `${item.enti_clie}-${item.enti_empr}`}
      />
    </View>
  )
}
