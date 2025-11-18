import React, { useState, useEffect } from 'react'
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
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Ionicons } from '@expo/vector-icons'

export default function BuscaServicoInput({
  valorAtual = '',
  onSelect,
  initialValue,
}) {
  const [query, setQuery] = useState('')
  const [servicos, setServicos] = useState([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [usuarioTemSetor, setUsuarioTemSetor] = useState(false)

  useEffect(() => {
    const load = async () => {
      const setor = await AsyncStorage.getItem('setor')
      setUsuarioTemSetor(!!setor && setor !== '0' && setor !== 'null')
    }
    load()
  }, [])

  useEffect(() => {
    const inicial = initialValue ?? valorAtual
    if (inicial) setQuery(inicial)
  }, [initialValue, valorAtual])

  const buscarServicos = debounce(async (texto) => {
    if (!texto.trim()) {
      setServicos([])
      return
    }

    try {
      setLoading(true)
      const response = await apiGetComContexto(
        'produtos/produtos/',
        {
          search: texto,
          limit: 10,
          tipo: 'S',
        },
        'prod_'
      )

      const servicosArray = response?.results || []
      setServicos(servicosArray)
    } catch (error) {
      console.error('Erro ao buscar serviços:', error)
      setServicos([])
    } finally {
      setLoading(false)
    }
  }, 500)

  const normalizarPreco = (valor) => {
    const num = parseFloat(String(valor ?? 0).replace(',', '.'))
    return isNaN(num) ? 0 : num
  }

  const handleSelect = (servico) => {
    onSelect &&
      onSelect({
        serv_codi: servico.prod_codi,
        serv_nome: servico.prod_nome,

        prod_preco_vista: normalizarPreco(servico.prod_preco_vista),
        prod_preco_normal: normalizarPreco(servico.prod_preco_normal),

        preco_final: (() => {
          const vista = normalizarPreco(servico.prod_preco_vista)
          const normal = normalizarPreco(servico.prod_preco_normal)
          return vista > 0 ? vista : normal > 0 ? normal : 0
        })(),
      })

    setQuery(servico.prod_nome)
    setShowResults(false)
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={query}
        onChangeText={(texto) => {
          setQuery(texto)
          setShowResults(true)
          buscarServicos(texto)
        }}
        placeholder="Buscar serviço..."
        placeholderTextColor="#666"
        onFocus={() => setShowResults(true)}
      />

      {!loading && !!query && (
        <TouchableOpacity
          onPress={() => {
            setQuery('')
            setServicos([])
          }}
          style={styles.clearButton}>
          <Ionicons name="close-circle" size={20} color="#999" />
        </TouchableOpacity>
      )}

      {showResults && (loading || servicos.length > 0) && (
        <View style={styles.resultados}>
          {loading ? (
            <ActivityIndicator color="#10a2a7" style={styles.loading} />
          ) : (
            <FlatList
              data={servicos}
              keyExtractor={(item) =>
                `servico-${item.prod_codi}-${item.prod_nome}-${item.prod_empr}`
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.itemResultado}
                  onPress={() => handleSelect(item)}>
                  <Text style={styles.nomeServico}>{item.prod_nome}</Text>

                  {!usuarioTemSetor && (
                    <Text style={styles.precoServico}>
                      R${' '}
                      {(
                        item.prod_preco_vista ||
                        item.prod_preco_normal ||
                        0
                      ).toFixed(2)}
                    </Text>
                  )}
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
  container: { position: 'relative', zIndex: 1 },
  input: {
    backgroundColor: '#232935',
    color: 'white',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
    zIndex: 3,
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
  lista: { padding: 8 },
  itemResultado: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2c3e50',
  },
  nomeServico: { color: 'white', fontSize: 14, marginBottom: 4 },
  precoServico: { color: '#10a2a7', fontSize: 12 },
  loading: { padding: 20 },
})
