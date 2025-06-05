import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  View,
  Keyboard,
  ActivityIndicator,
} from 'react-native'
import { apiGet } from '../utils/api'
import { getStoredData } from '../services/storageService'
import styles from '../styles/listaStyles'
import debounce from 'lodash/debounce'

export default function BuscaCaixa({
  onSelect,
  placeholder = 'Buscar Caixas...',
  tipo = '',
  value = '',
  isEdit = false,
}) {
  const [termo, setTermo] = useState(typeof value === 'string' ? value : '')
  const [caixa, setCaixa] = useState([])
  const [slug, setSlug] = useState('')
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const digitando = useRef(false)

  useEffect(() => {
    getStoredData()
      .then(({ slug }) => slug && setSlug(slug))
      .catch((err) => console.error('Erro ao carregar slug:', err.message))
  }, [])

  useEffect(() => {
    if (!slug) return

    if (isEdit || (!digitando.current && value)) {
      const deveBuscar =
        typeof value === 'string' && value && !value.includes(' - ')
      if (deveBuscar) buscar(value)
      else if (typeof value === 'string') setTermo(value)
    }

    if (!value) {
      setTermo('')
      setCaixa([])
      setShowResults(false)
    }
  }, [value, isEdit, slug])

  const buscar = useCallback(
    debounce(async (texto) => {
      setTermo(texto)
      digitando.current = true

      if (!slug || !texto || texto.length < 3) {
        setCaixa([])
        setLoading(false)
        return
      }

      setLoading(true)

      try {
        const { results } = await apiGet(`/api/${slug}/entidades/entidades/`, {
          search: texto,
        })

        let resultadosFiltrados = results
        if (tipo === 'caixa') {
          resultadosFiltrados = resultadosFiltrados.filter(
            (e) => e.enti_tipo_enti === ''
          )
        }

        setCaixa(resultadosFiltrados)
        setShowResults(true)

        if (
          resultadosFiltrados.length === 1 &&
          resultadosFiltrados[0].enti_clie === texto
        ) {
          selecionar(resultadosFiltrados[0])
        }
      } catch (err) {
        console.error('Erro ao buscar entidades:', err.message)
      } finally {
        setLoading(false)
      }
    }, 400),
    [slug, tipo]
  )

  const selecionar = (item) => {
    const texto = `${item.enti_clie} - ${item.enti_nome}`
    setTermo(texto)
    digitando.current = false

    onSelect({
      id: item.enti_clie,
      ...item,
    })

    setCaixa([])
    setShowResults(false)
    Keyboard.dismiss()
  }

  const isSelecionado =
    typeof termo === 'string' && termo.includes(' - ') && caixa.length === 0

  return (
    <View>
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.inputcliente,
            isSelecionado ? styles.inputSelecionado : null,
          ]}
          value={termo}
          editable={!isSelecionado}
          onChangeText={(text) => {
            if (!isEdit) buscar(text)
          }}
          placeholder={placeholder}
          placeholderTextColor="#aaa"
          onFocus={() => setShowResults(true)}
        />
        {loading && (
          <ActivityIndicator
            size="small"
            color="#10a2a7"
            style={{ position: 'absolute', right: 10 }}
          />
        )}
      </View>

      {showResults && caixa.length > 0 && (
        <FlatList
          data={caixa}
          keyExtractor={(item) =>
            `${item.enti_clie}-${item.enti_fili}-${item.enti_empr}`
          }
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => selecionar(item)}
              style={styles.sugestaoItem}>
              <Text style={styles.sugestaoTexto}>
                {item.enti_clie} - {item.enti_nome}
              </Text>
            </TouchableOpacity>
          )}
          style={styles.sugestaoLista}
        />
      )}
    </View>
  )
}
