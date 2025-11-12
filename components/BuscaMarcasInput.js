import React, { useState, useEffect, useCallback } from 'react'
import {
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  View,
  Keyboard,
  ActivityIndicator,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { apiGetComContexto } from '../utils/api'
import debounce from 'lodash/debounce'
import styles from '../styles/listaStyles'

export default function BuscaMarcasInput({
  onSelect,
  placeholder = 'Buscar marca...',
  initialValue = '',
}) {
  const [termo, setTermo] = useState(initialValue || '')
  const [marcas, setMarcas] = useState([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    if (initialValue && typeof initialValue === 'string') {
      setTermo(initialValue)
    }
  }, [initialValue])

  const buscar = useCallback(
    debounce(async (texto) => {
      if (!texto || texto.length < 3) {
        setMarcas([])
        setShowResults(false)
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const data = await apiGetComContexto('produtos/marcas/', {
          search: texto,
          limit: 10,
        })

        const resultados = (data?.results || []).filter(
          (m) => m?.codigo && !isNaN(Number(m.codigo))
        )
        setMarcas(resultados)
        setShowResults(resultados.length > 0)
      } catch (err) {
        console.error('Erro ao buscar marcas:', err?.message)
        setMarcas([])
        setShowResults(false)
      } finally {
        setLoading(false)
      }
    }, 400),
    []
  )

  const selecionar = (marca) => {
    const texto = `${marca.codigo} - ${marca.nome}`
    setTermo(texto)
    onSelect(marca)
    setMarcas([])
    setShowResults(false)
    Keyboard.dismiss()
  }

  const limpar = () => {
    setTermo('')
    setMarcas([])
    setShowResults(false)
    onSelect(null)
  }

  const isSelecionado =
    typeof termo === 'string' && termo.includes(' - ') && marcas.length === 0

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
            setMarcas([])
            setShowResults(false)
            if (text && text.length >= 3) buscar(text)
          }}
          placeholder={placeholder}
          placeholderTextColor="#aaa"
          onFocus={() => {
            if (marcas.length > 0) setShowResults(true)
            else if (termo && termo.length >= 3 && !termo.includes(' - '))
              buscar(termo)
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

      {showResults && marcas.length > 0 && (
        <FlatList
          data={marcas}
          keyExtractor={(item) => `marca-${item.codigo}`}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          removeClippedSubviews={Platform.OS === 'android'}
          style={[styles.sugestaoLista, { maxHeight: 200 }]}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => selecionar(item)}
              style={styles.sugestaoItem}>
              <Text style={styles.sugestaoTexto}>
                {item.codigo} - {item.nome}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  )
}
