import React, { useState, useEffect } from 'react'
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Keyboard,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { apiGetComContexto } from '../utils/api'

// Debounce simples
function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}

export default function BuscaProdutoInputOs({ onSelect, initialValue = '' }) {
  const [searchTerm, setSearchTerm] = useState(initialValue)
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(false)
  const [usuarioTemSetor, setUsuarioTemSetor] = useState(false)
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [showResults, setShowResults] = useState(false)

  // Verifica setor
  useEffect(() => {
    const verificarSetor = async () => {
      const setor = await AsyncStorage.getItem('setor')
      setUsuarioTemSetor(!!setor && setor !== '0' && setor !== 'null')
    }
    verificarSetor()
  }, [])

  // Atualiza valor inicial
  useEffect(() => {
    if (initialValue) setSearchTerm(initialValue)
  }, [initialValue])

  // Busca produtos
  useEffect(() => {
    if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) {
      setProdutos([])
      setShowResults(false)
      return
    }

    const buscar = async () => {
      setLoading(true)
      setShowResults(true)

      try {
        const data = await apiGetComContexto(
          'produtos/produtos/',
          {
            search: debouncedSearchTerm,
            limit: 10,
          },
          'prod_'
        )

        const validos = data.results.filter(
          (p) => p?.prod_codi && !isNaN(Number(p.prod_codi))
        )

        setProdutos(validos)
      } catch (err) {
        console.error('Erro ao buscar produtos:', err)
        setProdutos([])
      } finally {
        setLoading(false)
      }
    }

    buscar()
  }, [debouncedSearchTerm])

  const handleSelecionar = (produto) => {
    Keyboard.dismiss()

    // ENVIO 100% CONSISTENTE DOS PREÇOS
    onSelect &&
      onSelect({
        prod_codi: produto.prod_codi,
        prod_nome: produto.prod_nome,

        prod_preco_vista: produto.prod_preco_vista,
        prod_preco_normal: produto.prod_preco_normal,

        preco_final:
          produto.prod_preco_vista > 0
            ? produto.prod_preco_vista
            : produto.prod_preco_normal ?? 0,
      })

    setSearchTerm(produto.prod_nome)
    setProdutos([])
    setShowResults(false)
  }

  const mostrarPrecoAoUsuario = (p) =>
    !usuarioTemSetor && (p.prod_preco_vista > 0 || p.prod_preco_normal > 0)

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#232935',
          borderRadius: 10,
          paddingHorizontal: 10,
          marginBottom: 10,
        }}>
        <Ionicons
          name="pricetag"
          size={20}
          color="#aaa"
          style={{ marginRight: 8 }}
        />

        <TextInput
          style={{
            flex: 1,
            height: 45,
            color: 'white',
            fontSize: 15,
          }}
          placeholder="Buscar produto"
          placeholderTextColor="#aaa"
          value={searchTerm}
          onChangeText={(text) => {
            setSearchTerm(text)
            setShowResults(text.length >= 2)
          }}
        />

        {loading ? <ActivityIndicator size="small" color="#01ff16" /> : null}
      </View>

      {showResults && produtos.length > 0 && (
        <FlatList
          data={produtos}
          keyExtractor={(item) => `prod-${item.prod_codi}-${item.prod_empr}`}
          style={{
            maxHeight: 250,
            backgroundColor: '#1c1c1c',
            borderRadius: 8,
            paddingHorizontal: 4,
          }}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleSelecionar(item)}
              style={{
                padding: 10,
                borderBottomWidth: 1,
                borderBottomColor: '#333',
              }}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>
                {item.prod_nome}
              </Text>

              <Text style={{ color: '#bbb', marginTop: 2 }}>
                Código: {item.prod_codi} | UM: {item.prod_unme} | Saldo:{' '}
                {item.saldo_estoque}
              </Text>

              {mostrarPrecoAoUsuario(item) && (
                <Text style={{ color: '#0fdd79', marginTop: 2 }}>
                  Preço: R${' '}
                  {(
                    item.prod_preco_vista ||
                    item.prod_preco_normal ||
                    0
                  ).toFixed(2)}
                </Text>
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  )
}
