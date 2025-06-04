import React, { useState } from 'react'
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import { apiGetComContexto } from '../utils/api'
import debounce from 'lodash/debounce'

export default function BuscaServicoInput({ valorAtual = '', onSelect }) {
  const [query, setQuery] = useState('')
  const [servicos, setServicos] = useState([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const buscarServicos = debounce(async (texto) => {
    if (!texto.trim()) {
      setServicos([])
      return
    }

    try {
      setLoading(true)
      const response = await apiGetComContexto('produtos/produtos/busca/', {
        q: texto,
        tipo: 'S', // Filtro para serviços
      })

      const servicosArray = response?.results || response || []
      setServicos(servicosArray)
    } catch (error) {
      console.error('Erro ao buscar serviços:', error)
      setServicos([])
    } finally {
      setLoading(false)
    }
  }, 500)

  const handleSelect = (servico) => {
    setQuery(servico.prod_nome)
    setShowResults(false)
    onSelect({
      serv_codi: servico.prod_codi,
      serv_nome: servico.prod_nome,
      serv_preco: servico.prod_preco_vista,
    })
  }

  const handleChangeText = (texto) => {
    setQuery(texto)
    setShowResults(true)
    buscarServicos(texto)
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={query || valorAtual}
        onChangeText={handleChangeText}
        placeholder="Buscar serviço..."
        placeholderTextColor="#666"
        onFocus={() => setShowResults(true)}
      />

      {showResults && (loading || servicos.length > 0) && (
        <View style={styles.resultados}>
          {loading ? (
            <ActivityIndicator color="#10a2a7" style={styles.loading} />
          ) : (
            <FlatList
              data={servicos}
              keyExtractor={(item) => item.prod_codi.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.itemResultado}
                  onPress={() => handleSelect(item)}>
                  <Text style={styles.nomeServico}>{item.prod_nome}</Text>
                  <Text style={styles.precoServico}>
                    R$ {item.prod_preco_vista?.toFixed(2) || '0.00'}
                  </Text>
                </TouchableOpacity>
              )}
              style={styles.lista}
            />
          )}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1,
  },
  input: {
    backgroundColor: '#232935',
    color: 'white',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  resultados: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#232935',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    zIndex: 2,
  },
  lista: {
    padding: 8,
  },
  itemResultado: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2c3e50',
  },
  nomeServico: {
    color: 'white',
    fontSize: 14,
    marginBottom: 4,
  },
  precoServico: {
    color: '#10a2a7',
    fontSize: 12,
  },
  loading: {
    padding: 20,
  },
}) 