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
import styles from '../styles/listaStyles'

export default function BuscaVendedorInput({
  onSelect,
  placeholder = 'Buscar vendedor...',
  tipo = null,
  value = '',
  isEdit = false,
}) {
  const [termo, setTermo] = useState(typeof value === 'string' ? value : '')
  const [vendedores, setVendedores] = useState([])
  const [slug, setSlug] = useState('')
  const digitando = useRef(false)

  useEffect(() => {
    const carregarSlug = async () => {
      try {
        const { slug } = await getStoredData()
        if (slug) setSlug(slug)
        else console.warn('Slug não encontrado')
      } catch (err) {
        console.error('Erro ao carregar slug:', err.message)
      }
    }
    carregarSlug()
  }, [])

  useEffect(() => {
    if (isEdit) {
      setTermo(value)

      if (typeof value === 'string' && !value.includes(' - ')) {
        buscar(value)
      }

      setVendedores([])
      digitando.current = false
    } else {
      if (!digitando.current && value) {
        if (!value.includes(' - ')) {
          buscar(value)
        } else {
          setTermo(value)
        }
      } else if (!value) {
        setTermo('')
        setVendedores([])
      }
    }
  }, [value, isEdit])

  const buscar = async (texto) => {
    digitando.current = true
    setTermo(texto)

    if (!texto) {
      setVendedores([])
      return
    }

    try {
      const data = await apiGet(`/api/${slug}/entidades/entidades/`, {
        search: texto,
      })

      let resultados = data.results

      if (tipo === 'vendedor') {
        resultados = resultados.filter((e) => e.enti_tipo_enti === 'VE')
      }

      setVendedores(resultados)

      if (resultados.length === 1 && resultados[0].enti_clie === texto) {
        selecionar(resultados[0])
      }
    } catch (err) {
      console.error('Erro ao buscar entidades:', err.message)
    }
  }

  const selecionar = (item) => {
    const texto = `${item.enti_clie} - ${item.enti_nome}`
    setTermo(texto)
    digitando.current = false
    onSelect(item)
    setVendedores([])
    Keyboard.dismiss()
  }

  return (
    <View>
      <TextInput
        style={styles.inputcliente}
        value={termo}
        onChangeText={(text) => {
          buscar(text)
        }}
        placeholder={placeholder}
        placeholderTextColor="#aaa"
      />
      {vendedores.length > 0 && (
        <FlatList
          data={vendedores}
          keyExtractor={(item) =>
            `${item.enti_clie}-${item.enti_fili}-${item.enti_empr}`
          }
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => selecionar(item)}
              style={styles.sugestaoItem}>
              <Text style={styles.sugestaoTexto}>
                {item.enti_clie} - {item.enti_nome} —{' '}
                {item.enti_cpf || item.enti_cnpj}
              </Text>
            </TouchableOpacity>
          )}
          style={styles.sugestaoLista}
        />
      )}
    </View>
  )
}
