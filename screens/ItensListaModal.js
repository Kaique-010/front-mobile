import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { apiGet, apiPost } from '../utils/api'
import styles from '../styles/itensStyle'
import debounce from 'lodash.debounce'

export default function ItensListaModal({ route, navigation }) {
  const { listaId } = route.params

  const [produtos, setProdutos] = useState([])
  const [busca, setBusca] = useState('')
  const [selecionados, setSelecionados] = useState([])
  const [itensLista, setItensLista] = useState([])
  const [carregando, setCarregando] = useState(false)

  const buscarProdutos = useCallback(async () => {
    if (!busca.trim()) {
      setProdutos([])
      return
    }

    setCarregando(true)
    try {
      const response = await apiGet('/api/produtos/', { search: busca })
      setProdutos(response?.results || [])
    } catch (error) {
      console.log('Erro ao buscar produtos', error.message)
    } finally {
      setCarregando(false)
    }
  }, [busca])

  const debouncedBuscarProdutos = useMemo(
    () => debounce(buscarProdutos, 500),
    [buscarProdutos]
  )

  useEffect(() => {
    debouncedBuscarProdutos()
    return () => debouncedBuscarProdutos.cancel() // cleanup
  }, [busca, debouncedBuscarProdutos])

  const buscarItensLista = async () => {
    try {
      const data = await apiGet('/api/itens-lista/', { lista: listaId })
      setItensLista(data?.results || [])
    } catch (error) {
      console.log('Erro ao carregar itens da lista', error.message)
    }
  }

  useEffect(() => {
    buscarItensLista()
  }, [])

  const adicionarItens = async () => {
    if (selecionados.length === 0) {
      Alert.alert('Erro', 'Selecione pelo menos um produto.')
      return
    }

    try {
      await Promise.all(
        selecionados.map((produtoId) =>
          apiPost('/api/itens-lista-casamento/', {
            item_list: listaId,
            item_prod: produtoId,
          })
        )
      )
      Alert.alert('Sucesso', 'Itens adicionados!')
      setSelecionados([])
      buscarItensLista()
    } catch (error) {
      console.log('❌ Erro ao adicionar itens:', error.message)
      Alert.alert('Erro', 'Falha ao adicionar itens.')
    }
  }

  const toggleProduto = (id) => {
    setSelecionados((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  return (
    <View style={styles.inner}>
      <TextInput
        placeholder="Buscar produto..."
        value={busca}
        onChangeText={setBusca}
        style={styles.input}
      />

      {carregando ? (
        <ActivityIndicator size="large" color="#000" />
      ) : (
        <FlatList
          data={produtos}
          keyExtractor={(item) => item.item_item.toString()}
          ListEmptyComponent={
            busca.length > 2 && (
              <Text style={{ textAlign: 'center' }}>
                Nenhum produto encontrado
              </Text>
            )
          }
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => toggleProduto(item.nome)}>
              <Text
                style={{
                  color: selecionados.includes(item.nome) ? 'green' : 'black',
                }}>
                {item.nome || 'Sem nome'}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity style={styles.incluirButton} onPress={adicionarItens}>
        <Text style={styles.incluirButtonText}>Adicionar Itens</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Itens adicionados:</Text>
      <FlatList
        data={itensLista}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center' }}>Nenhum item adicionado</Text>
        }
        renderItem={({ item }) => (
          <View>
            <Text>{item.produto_nome || 'Sem produto'}</Text>
          </View>
        )}
      />
    </View>
  )
}
