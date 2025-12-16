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

export default function BuscaVoltagemInput({
  onSelect,
  placeholder = 'Buscar voltagem...',
  initialValue = '',
}) {
  const [termo, setTermo] = useState(initialValue || '')
  const [voltagens, setVoltagens] = useState([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    if (initialValue && typeof initialValue === 'string') {
      setTermo(initialValue)
    }
  }, [initialValue])

  const buscar = useCallback(
    debounce(async (texto) => {
      if (!texto || texto.length < 2) {
        setVoltagens([])
        setShowResults(false)
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const data = await apiGetComContexto('ordemdeservico/voltagens/', {
          search: texto,
          limit: 10,
        })

        const resultados = (data?.results || []).filter(
          (v) => v?.osvo_codi && !isNaN(Number(v.osvo_codi))
        )
        setVoltagens(resultados)
        setShowResults(resultados.length > 0)
      } catch (err) {
        console.error('Erro ao buscar voltagens:', err?.message)
        setVoltagens([])
        setShowResults(false)
      } finally {
        setLoading(false)
      }
    }, 400),
    []
  )

  const selecionar = (item) => {
    const texto = `${item.osvo_codi} - ${item.osvo_nome}`
    setTermo(texto)
    onSelect(item)
    setVoltagens([])
    setShowResults(false)
    Keyboard.dismiss()
  }

  const limpar = () => {
    setTermo('')
    setVoltagens([])
    setShowResults(false)
    onSelect(null)
  }

  const isSelecionado =
    typeof termo === 'string' && termo.includes(' - ') && voltagens.length === 0

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
            setVoltagens([])
            setShowResults(false)
            if (text && text.length >= 2) buscar(text)
          }}
          placeholder={placeholder}
          placeholderTextColor="#aaa"
          onFocus={() => {
            if (voltagens.length > 0) setShowResults(true)
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

      {showResults && voltagens.length > 0 && (
        <FlatList
          data={voltagens}
          keyExtractor={(item) => `volt-${item.osvo_codi}`}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          removeClippedSubviews={Platform.OS === 'android'}
          style={[styles.sugestaoLista, { maxHeight: 200 }]}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => selecionar(item)}
              style={styles.sugestaoItem}>
              <Text style={styles.sugestaoTexto}>
                {item.osvo_codi} - {item.osvo_nome}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  )
}
