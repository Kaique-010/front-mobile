import React, { useState, useEffect, useCallback } from 'react'
import {
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  View,
  Keyboard,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { apiGet } from '../utils/api'
import { getStoredData } from '../services/storageService'
import styles from '../styles/listaStyles'
import debounce from 'lodash/debounce'

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
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    const carregarSlug = async () => {
      try {
        const data = await getStoredData()
        if (data && data.slug) {
          setSlug(data.slug)
        } else {
          console.warn('Slug não encontrado')
        }
      } catch (err) {
        console.error('Erro ao carregar slug:', err.message)
      }
    }
    carregarSlug()
  }, [])

  useEffect(() => {
    setTermo(value || '')
    if (!value || value === '') {
      setClientes([])
      setShowResults(false)
    }
  }, [value])

  const buscar = useCallback(
    debounce(async (texto) => {
      if (!slug || !texto || texto.length < 3) {
        setClientes([])
        setLoading(false)
        setShowResults(false)
        return
      }

      setLoading(true)
      setShowResults(false)

      try {
        const data = await apiGet(`/api/${slug}/entidades/entidades/`, {
          search: texto,
        })

        let resultados = data.results || []

        if (tipo === 'fornecedor') {
          resultados = resultados.filter((e) => e.enti_tipo_enti === 'FO')
        } else if (tipo === 'vendedor') {
          resultados = resultados.filter((e) => e.enti_tipo_enti === 'VE')
        } else if (tipo === 'cliente') {
          resultados = resultados.filter((e) => e.enti_tipo_enti === 'CL')
        }

        setClientes(resultados)
        if (resultados.length > 0) {
          setShowResults(true)
        }
      } catch (err) {
        console.error('Erro ao buscar entidades:', err.message)
        setClientes([])
        setShowResults(false)
      } finally {
        setLoading(false)
      }
    }, 500),
    [slug, tipo]
  )

  const selecionar = (item) => {
    const texto = `${item.enti_clie} - ${item.enti_nome}`
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
          keyExtractor={(item) =>
            `${item.enti_clie}-${item.enti_fili}-${item.enti_empr}`
          }
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
          style={[styles.sugestaoLista, { maxHeight: 200 }]}
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
        />
      )}
    </View>
  )
}
