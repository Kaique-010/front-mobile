import React, { useState, useEffect, useRef } from 'react'
import {
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  View,
  Keyboard,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { apiGet } from '../utils/api'
import { getStoredData } from '../services/storageService'
import styles from '../styles/listaStyles'

function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

export default function BuscaClienteInput({
  onSelect,
  placeholder = 'Buscar...',
  tipo = null,
  value = '',
  isEdit = false,
}) {
  const [termo, setTermo] = useState(value)
  const [clientes, setClientes] = useState([])
  const [slug, setSlug] = useState('')
  const digitando = useRef(false)
  const debouncedTermo = useDebounce(termo, 400)

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
      setClientes([])
      digitando.current = false
    } else {
      if (!digitando.current && value) {
        if (!value.includes(' - ')) {
          setTermo(value)
        }
      } else if (!value) {
        setTermo('')
        setClientes([])
      }
    }
  }, [value, isEdit])

  useEffect(() => {
    if (!slug || isEdit || debouncedTermo.length < 3) {
      setClientes([])
      return
    }
    buscar(debouncedTermo)
  }, [debouncedTermo, slug, isEdit])

  const buscar = async (texto) => {
    digitando.current = true

    if (!texto) {
      setClientes([])
      return
    }

    try {
      const data = await apiGet(`/api/${slug}/entidades/entidades/`, {
        search: texto,
      })

      let resultados = data.results

      if (tipo === 'cliente') {
        resultados = resultados.filter((e) => e.enti_tipo_enti === 'Cl')
      } else if (tipo === 'vendedor') {
        resultados = resultados.filter((e) => e.enti_tipo_enti === 'Ve')
      }

      setClientes(resultados)

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
    setClientes([])
    Keyboard.dismiss()
  }

  const limpar = () => {
    setTermo('')
    setClientes([])
    digitando.current = false
  }

  const isSelecionado = termo.includes(' - ') && clientes.length === 0

  return (
    <View>
      
      <TextInput
        style={[
          styles.inputcliente,
          isSelecionado ? styles.inputSelecionado : null,
        ]}
        value={termo}
        editable={!isSelecionado}
        onChangeText={(text) => {
          if (!isEdit) setTermo(text)
        }}
        placeholder={placeholder}
        placeholderTextColor="#aaa"
      />

      {isSelecionado && (
        <TouchableOpacity onPress={limpar} style={{ marginVertical: 5 }}>
          <Text style={{ color: 'red' }}>Limpar</Text>
        </TouchableOpacity>
      )}

      {clientes.length > 0 && (
        <FlatList
          data={clientes}
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
