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

export default function BuscaSetorInput({
  onSelect,
  placeholder = 'Buscar setor...',
  initialValue = '',
}) {
  const [termo, setTermo] = useState(
    typeof initialValue === 'string' ? initialValue : ''
  )
  const [setores, setSetores] = useState([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    if (typeof initialValue === 'string' && initialValue) {
      setTermo(initialValue)
    }
  }, [initialValue])

  const buscar = useCallback(
    debounce(async (texto) => {
      if (!texto || texto.length < 2) {
        setSetores([])
        setShowResults(false)
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const data = await apiGetComContexto('ordemdeservico/fase-setor/', {
          search: texto,
          limit: 10,
        })

        const resultados = (data?.results || []).filter(
          (p) => p?.osfs_codi && !isNaN(Number(p.osfs_codi))
        )
        setSetores(resultados)
        setShowResults(resultados.length > 0)
      } catch (err) {
        console.error('Erro ao buscar setores:', err?.message)
        setSetores([])
        setShowResults(false)
      } finally {
        setLoading(false)
      }
    }, 400),
    []
  )

  const selecionar = (item) => {
    const texto = `${item.osfs_codi} - ${item.osfs_nome}`
    setTermo(texto)
    onSelect(item)
    setSetores([])
    setShowResults(false)
    Keyboard.dismiss()
  }

  const limpar = () => {
    setTermo('')
    setSetores([])
    setShowResults(false)
    onSelect(null)
  }

  const isSelecionado =
    typeof termo === 'string' && termo.includes(' - ') && setores.length === 0

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
            setSetores([])
            setShowResults(false)
            if (text && text.length >= 2) buscar(text)
          }}
          placeholder={placeholder}
          placeholderTextColor="#aaa"
          onFocus={() => {
            if (setores.length > 0) setShowResults(true)
            else if (termo && termo.length >= 2 && !termo.includes(' - '))
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

      {showResults && setores.length > 0 && (
        <FlatList
          data={setores}
          keyExtractor={(item) => `setor-${item.osfs_codi}`}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          removeClippedSubviews={Platform.OS === 'android'}
          style={[styles.sugestaoLista, { maxHeight: 200 }]}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => selecionar(item)}
              style={styles.sugestaoItem}>
              <Text style={styles.sugestaoTexto}>
                {item.osfs_codi} - {item.osfs_nome}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  )
}
