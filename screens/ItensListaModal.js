import React, { useState, useEffect, useCallback } from 'react'
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
  const [carregando, setCarregando] = useState(false)

  // Função para buscar produtos
  const buscarProdutos = useCallback(
    async (novaBusca = false) => {
      try {
        // Não faz nada se a busca for vazia
        if (!busca.trim()) {
          setProdutos([])
          return
        }

        setCarregando(true)

        // Chamada à API
        const response = await apiGet('/api/produtos/', {
          search: busca,
        })

        // Verificando a resposta da API
        if (response && response.results) {
          setProdutos(response.results)  // Atualiza o estado com os produtos encontrados
        } else {
          setProdutos([])  // Caso não haja resultados, limpa a lista
        }
      } catch (error) {
        console.log('Erro ao buscar produtos', error.message)
      } finally {
        setCarregando(false)  // Desativa o carregamento
      }
    },
    [busca]
  )

  // Debounce para evitar muitas chamadas durante a digitação
  const debouncedBuscarProdutos = useCallback(
    debounce((novaBusca) => buscarProdutos(novaBusca), 500),
    []
  )

  // useEffect para executar o debounce e buscar sempre que a busca for alterada
  useEffect(() => {
    // Apenas chama a busca se a string de busca não estiver vazia
    if (busca.trim()) {
      debouncedBuscarProdutos(true)
    } else {
      setProdutos([])  // Limpa os produtos se a busca estiver vazia
    }
  }, [busca, debouncedBuscarProdutos])

  // Alterna a seleção do produto
  const toggleProduto = (produtoId) => {
    setSelecionados((prev) =>
      prev.includes(produtoId)
        ? prev.filter((id) => id !== produtoId)
        : [...prev, produtoId]
    )
  }

  // Função para salvar os itens selecionados
  const salvarItens = async () => {
    try {
      for (let prod_id of selecionados) {
        await apiPost('/api/itens-lista-casamento/', {
          item_lista: listaId,
          item_prod: prod_id,
        })
      }
      Alert.alert('Sucesso', 'Itens adicionados com sucesso!')
      navigation.goBack()
    } catch (error) {
      console.log('Erro ao salvar itens:', error.message)
      Alert.alert('Erro', 'Falha ao salvar os itens.')
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Buscar Produto</Text>
      <TextInput
        style={styles.input}
        value={busca}
        onChangeText={setBusca}
        placeholder="Nome ou código do produto"
        placeholderTextColor="#aaa"
      />

      {carregando ? (
        <View style={{ marginVertical: 10, alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : produtos.length === 0 && !carregando && busca.trim() ? (
        <Text style={{ textAlign: 'center', color: '#fff', marginTop: 20 }}>
          Nenhum produto encontrado.
        </Text>
      ) : (
        <FlatList
          data={produtos}
          keyExtractor={(item) => item.prod_codi.toString()}
          renderItem={({ item }) => {
            const isSelected = selecionados.includes(item.prod_codi)
            return (
              <TouchableOpacity
                style={[
                  styles.sugestaoItem,
                  isSelected && { backgroundColor: '#4CAF50' },
                ]}
                onPress={() => toggleProduto(item.prod_codi)}>
                <Text style={styles.sugestaoTexto}>
                  {item.prod_nome} ({item.prod_codi})
                </Text>
              </TouchableOpacity>
            )
          }}
        />
      )}

      <TouchableOpacity style={styles.incluirButton} onPress={salvarItens}>
        <Text style={styles.incluirButtonText}>Salvar Itens Selecionados</Text>
      </TouchableOpacity>
    </View>
  )
}
