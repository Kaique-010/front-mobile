import React, { useState, useEffect, useRef } from 'react'
import {
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  View,
  Keyboard,
} from 'react-native'
import { apiGet } from '../utils/api'
import { getStoredData } from '../services/storageService'
import styles from '../styles/caixaStyle'

export default function BuscaCaixa({
  onSelect,
  placeholder = 'Buscar Caixas...',
  tipo = '',
  value = '',
  isEdit = false,
}) {
  const [termo, setTermo] = useState('')
  const [caixa, setCaixa] = useState([])
  const [slug, setSlug] = useState('')
  const digitando = useRef(false)

  useEffect(() => {
    getStoredData()
      .then(({ slug }) => slug && setSlug(slug))
      .catch((err) => console.error('Erro ao carregar slug:', err.message))
  }, [])

  useEffect(() => {
    if (!slug) return

    if (isEdit || (!digitando.current && value)) {
      const deveBuscar = value && !value.includes(' - ')
      if (deveBuscar) buscar(value)
      else setTermo(value)
    }

    if (!value) {
      setTermo('')
      setCaixa([])
    }
  }, [value, isEdit, slug])

  const buscar = async (texto) => {
    setTermo(texto)
    digitando.current = true

    if (!slug || !texto) {
      setCaixa([])
      return
    }

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

      if (
        resultadosFiltrados.length === 1 &&
        resultadosFiltrados[0].enti_clie === texto
      ) {
        selecionar(resultadosFiltrados[0])
      }
    } catch (err) {
      console.error('Erro ao buscar entidades:', err.message)
    }
  }

  const selecionar = (item) => {
    const texto = `${item.enti_clie} - ${item.enti_nome}`
    setTermo(texto)
    digitando.current = false

    onSelect({
      id: item.enti_clie,
      ...item,
    })

    setCaixa([])
    Keyboard.dismiss()
  }

  return (
    <View>
      <TextInput
        style={styles.inputcaixa}
        value={termo}
        onChangeText={buscar}
        placeholder={placeholder}
        placeholderTextColor="#aaa"
      />
      {caixa.length > 0 && (
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
