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
      setTermo(value || '')
      setClientes([])
      digitando.current = false
    } else {
      if (!digitando.current && value) {
        if (typeof value === 'string' && !value.includes(' - ')) {
          setTermo(value)
        }
      } else if (!value) {
        setTermo('')
        setClientes([])
      }
    }
  }, [value, isEdit])

  const buscar = useCallback(
    debounce(async (texto) => {
      if (!slug || isEdit || texto.length < 3) {
        setClientes([])
        setLoading(false)
        return
      }

      digitando.current = true
      setLoading(true)

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
        setShowResults(true)

        if (resultados.length === 1 && resultados[0].enti_clie === texto) {
          selecionar(resultados[0])
        }
      } catch (err) {
        console.error('Erro ao buscar entidades:', err.message)
      } finally {
        setLoading(false)
      }
    }, 400),
    [slug, isEdit, tipo]
  )

  const selecionar = (item) => {
    const texto = `${item.enti_clie} - ${item.enti_nome}`
    setTermo(texto)
    digitando.current = false
    onSelect(item)
    setClientes([])
    setShowResults(false)
    Keyboard.dismiss()
  }

  const limpar = () => {
    setTermo('')
    setClientes([])
    digitando.current = false
    setShowResults(false)
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
          editable={!isSelecionado}
          onChangeText={(text) => {
            if (!isEdit) {
              setTermo(text)
              buscar(text)
            }
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

      {isSelecionado && (
        <TouchableOpacity onPress={limpar} style={{ marginVertical: 5 }}>
          <Text style={{ color: 'red' }}>Limpar</Text>
        </TouchableOpacity>
      )}

      {showResults && clientes.length > 0 && (
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
