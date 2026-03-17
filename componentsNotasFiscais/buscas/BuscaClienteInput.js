import React, { useState, useEffect, useCallback } from 'react'
import {
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  View,
  Keyboard,
  ActivityIndicator,
  StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import debounce from 'lodash/debounce'
import { buscarEntidades } from '../repositorios/entidadeRepository'

export default function BuscaClienteInput({
  onSelect,
  placeholder = 'Buscar...',
  tipo = null,
  value = '',
  isEdit = false,
}) {
  const [termo, setTermo] = useState(value || '')
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    setTermo(value || '')
    if (!value || value === '') {
      setClientes([])
      setShowResults(false)
    }
  }, [value])

  const buscar = useCallback(
    debounce(async (texto) => {
      if (!texto || texto.length < 3) {
        setClientes([])
        setShowResults(false)
        return
      }

      setLoading(true)

      try {
        const resultados = await buscarEntidades({ termo: texto, tipo })

        setClientes(resultados)
        setShowResults(resultados.length > 0)
      } catch {
        setClientes([])
        setShowResults(false)
      } finally {
        setLoading(false)
      }
    }, 500),
    [tipo],
  )

  const selecionar = (item) => {
    const texto =
      item?.label || `${item?.enti_clie || ''} - ${item?.enti_nome || ''}`
    setTermo(texto)
    onSelect(item)
    setClientes([])
    setShowResults(false)
    Keyboard.dismiss()
  }

  const limpar = () => {
    setTermo('')
    setClientes([])
    setShowResults(false)
    onSelect(null) // Notifica o componente pai que a seleção foi limpa
  }

  const isSelecionado =
    typeof termo === 'string' && termo.includes(' - ') && clientes.length === 0

  return (
    <View>
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.inputcliente,
            isSelecionado ? styles.inputSelecionado : null,
          ]}
          value={termo}
          onChangeText={(text) => {
            setTermo(text)
            setClientes([])
            setShowResults(false)
            if (text && text.length >= 3) {
              buscar(text)
            }
          }}
          placeholder={placeholder}
          placeholderTextColor="#aaa"
          onFocus={() => {
            if (clientes.length > 0) {
              setShowResults(true)
            } else if (termo && termo.length >= 3 && !termo.includes(' - ')) {
              buscar(termo)
            }
          }}
        />
        {loading ? (
          <ActivityIndicator
            size="small"
            color="#10a2a7"
            style={{ position: 'absolute', right: 10 }}
          />
        ) : isSelecionado ? (
          <TouchableOpacity
            onPress={limpar}
            style={{ position: 'absolute', right: 10, padding: 5 }}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        ) : null}
      </View>

      {showResults && clientes.length > 0 && (
        <FlatList
          data={clientes}
          keyExtractor={(item) => String(item?.value ?? item?.enti_clie ?? '')}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
          style={[styles.sugestaoLista, { maxHeight: 200 }]}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => selecionar(item)}
              style={styles.sugestaoItem}>
              <Text style={styles.sugestaoTexto}>
                {item?.label ||
                  `${item?.enti_clie || ''} - ${item?.enti_nome || ''}`}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  inputContainer: { position: 'relative' },
  inputcliente: {
    borderWidth: 1,
    borderColor: '#cedaf0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: 'white',
    backgroundColor: '#232935',
  },
  inputSelecionado: { borderColor: '#10a2a7' },
  sugestaoLista: {
    marginTop: 8,
    borderRadius: 10,
    backgroundColor: '#1c1c1c',
  },
  sugestaoItem: { paddingHorizontal: 12, paddingVertical: 10 },
  sugestaoTexto: { color: 'white' },
})
