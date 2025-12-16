import React, { useState, useEffect, useCallback } from 'react'
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



export default function BuscaServicoInput({ valorAtual = '', onSelect, initialValue }) {
  const [query, setQuery] = useState('')
  const [servicos, setServicos] = useState([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [usuarioTemSetor, setUsuarioTemSetor] = useState(false)
  const [setorCarregado, setSetorCarregado] = useState(false)

useEffect(() => {
  const verificarSetor = async () => {
    try {
      const setorBruto = await AsyncStorage.getItem('setor')
      const setor = parseInt((setorBruto || '').trim(), 10)
      const temSetor = !isNaN(setor) && setor > 0
      setUsuarioTemSetor(temSetor)
      console.log('👤 [BuscaServico] Valor do setor bruto:', setorBruto)
      console.log('👤 [BuscaServico] Usuário tem setor?', temSetor)
    } catch (error) {
      console.error('Erro ao verificar setor:', error)
      setUsuarioTemSetor(false)
    } finally {
      setSetorCarregado(true)
    }
  }
  verificarSetor()
}, [])



  useEffect(() => {
    // Inicializa o input com o valor vindo de props, permitindo limpeza completa depois
    const inicial = initialValue ?? valorAtual
    if (inicial) setQuery(inicial)
  }, [initialValue, valorAtual])


  const buscarServicos = useCallback(
  debounce(async (texto) => {
    if (!texto.trim()) {
      setServicos([])
      return
    }

    try {
      setLoading(true)
      const response = await apiGetComContexto(
        'produtos/produtos/busca/',
        { q: texto, tipo: 'S' },
        'prod_'
      )
      const servicosArray = response?.results || response || []
      setServicos(servicosArray)
    } catch (error) {
      console.error('Erro ao buscar serviços:', error)
      setServicos([])
    } finally {
      setLoading(false)
    }
  }, 500),
  []
)

  const handleSelect = (servico) => {
    setQuery(servico.prod_nome)
    setShowResults(false)
    onSelect({
      serv_prod: servico.prod_codi,
      serv_nome: servico.prod_nome,
      serv_preco: servico.prod_preco_vista,
    })
  }

  const limpar = () => {
    setQuery('')
    setServicos([])
    setShowResults(false)
    if (typeof onSelect === 'function') onSelect(null)
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
        value={query}
        onChangeText={handleChangeText}
        placeholder="Buscar serviço..."
        placeholderTextColor="#666"
        onFocus={() => setShowResults(true)}
      />

      {!loading && !!query && (
        <TouchableOpacity onPress={limpar} style={styles.clearButton}>
          <Ionicons name="close-circle" size={20} color="#999" />
        </TouchableOpacity>
      )}

      {showResults && setorCarregado && (loading || servicos.length > 0) && (
        <View style={styles.resultados}>
          {loading ? (
            <ActivityIndicator color="#10a2a7" style={styles.loading} />
          ) : (
            <FlatList
              data={servicos}
              keyExtractor={(item) =>
                `servico-${item.prod_codi}-${item.prod_nome}-${item.prod_empr}`
              }
              renderItem={({ item }) => {
                // ✅ CORRIGIDO: Ocultar preço quando usuário tem setor (igual ao AbaPecas)
                const precoOculto = usuarioTemSetor
                
                console.log('🔍 [BuscaServico] Item:', item.prod_nome)
                console.log('🔍 [BuscaServico] usuarioTemSetor:', usuarioTemSetor)
                console.log('🔍 [BuscaServico] precoOculto:', precoOculto)

                const subtitulo = `Código: ${item.prod_codi} | Saldo: ${item.saldo_estoque}`

                return (
                  <TouchableOpacity
                    style={styles.itemResultado}
                    onPress={() => handleSelect(item)}>
                    <Text style={styles.nomeServico}>{item.prod_nome}</Text>
                    <Text style={styles.subtituloServico}>{subtitulo}</Text>
                    {!precoOculto && (item.prod_preco_vista > 0 || item.prod_preco_normal > 0) && (
                      <Text style={styles.precoServico}>
                        R${' '}
                        {Number(item.prod_preco_vista) > 0
                          ? Number(item.prod_preco_vista).toFixed(2)
                          : '0.00'}
                      </Text>
                    )}
                  </TouchableOpacity>
                )
              }}
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
  subtituloServico: {
    color: '#999',
    fontSize: 12,
    marginBottom: 4,
  },
  loading: {
    padding: 20,
  },
})
