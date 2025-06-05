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

export default function BuscaVendedorInput({
  onSelect,
  placeholder = 'Buscar vendedor...',
  tipo = 'vendedor',
  value = '',
  isEdit = false,
}) {
  const [termo, setTermo] = useState(typeof value === 'string' ? value : '')
  const [vendedores, setVendedores] = useState([])
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
    if (!value) {
      setTermo('')
      setVendedores([])
      return
    }

    setTermo(value)
    if (typeof value === 'string' && !value.includes(' - ')) {
      buscar(value)
    }
  }, [value])

  const buscar = useCallback(
    debounce(async (texto) => {
      if (!texto || texto.length < 2) {
        setVendedores([])
        setLoading(false)
        return
      }

      digitando.current = true
      setLoading(true)

      try {
        const data = await apiGet(`/api/${slug}/entidades/entidades/`, {
          search: texto,
          tipo: 'VE', // Filtro direto na API
        })

        const resultados = data.results.filter(
          (e) => e.enti_tipo_enti === 'VE' || e.enti_tipo_enti === 'Ve'
        )

        setVendedores(resultados)
        setShowResults(true)

        if (resultados.length === 1) {
          selecionar(resultados[0])
        }
      } catch (err) {
        console.error('Erro ao buscar vendedores:', err.message)
      } finally {
        setLoading(false)
      }
    }, 400),
    [slug]
  )

  const selecionar = (item) => {
    const texto = `${item.enti_clie} - ${item.enti_nome}`
    setTermo(texto)
    digitando.current = false
    onSelect(item)
    setVendedores([])
    setShowResults(false)
    Keyboard.dismiss()
  }

  const limpar = () => {
    setTermo('')
    setVendedores([])
    digitando.current = false
    setShowResults(false)
    onSelect(null)
  }

  const isSelecionado =
    typeof termo === 'string' &&
    termo.includes(' - ') &&
    vendedores.length === 0

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
            setTermo(text)
            buscar(text)
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

      {showResults && vendedores.length > 0 && (
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
