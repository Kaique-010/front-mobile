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
import { apiGetComContexto } from '../utils/api'
import { getStoredData } from '../services/storageService'
import styles from '../styles/listaStyles'
import debounce from 'lodash/debounce'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function BuscaVendedorInput({
  onSelect,
  placeholder = 'Buscar vendedor...',
  tipo = 'vendedor',
  value = '',
  isEdit = false,
}) {
  const [termo, setTermo] = useState(value)
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
    if (isEdit) {
      setTermo(value || '')
      setVendedores([])
      digitando.current = false
    } else {
      if (!digitando.current && value) {
        if (typeof value === 'string' && !value.includes(' - ')) {
          setTermo(value)
        }
      } else if (!value) {
        setTermo('')
        setVendedores([])
      }
    }
  }, [value, isEdit])

  const buscar = useCallback(
    debounce(async (texto) => {
      if (!slug || isEdit || texto.length < 3) {
        setVendedores([])
        setLoading(false)
        return
      }

      digitando.current = true
      setLoading(true)

      try {
        const empresaId = await AsyncStorage.getItem('empresaId')

        const data = await apiGetComContexto(
          'entidades/entidades/',
          {
            search: texto,
            tipo: 'VE',
            empresa: empresaId || '1',
          },
          'enti_'
        )

        const resultados = data.results.filter(
          (e) => e.enti_tipo_enti === 'VE' || e.enti_tipo_enti === 'Ve'
        )

        setVendedores(resultados)
        setShowResults(true)

        if (resultados.length === 1 && resultados[0].enti_clie === texto) {
          selecionar(resultados[0])
        }
      } catch (err) {
        console.error('Erro ao buscar vendedores:', err.message)
      } finally {
        setLoading(false)
      }
    }, 400),
    [slug, isEdit]
  )

  const selecionar = (item) => {
    if (!item || !item.enti_clie) {
      console.warn('Item inválido selecionado:', item)
      return
    }

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
            if (!isEdit) {
              setTermo(text)
              setVendedores([])
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

      {showResults && vendedores.length > 0 && (
        <FlatList
          data={vendedores}
          keyExtractor={(item) =>
            `${item.enti_clie}-${item.enti_fili}-${item.enti_empr}`
          }
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
          style={styles.sugestaoLista}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => selecionar(item)}
              style={styles.sugestaoItem}>
              <Text style={styles.sugestaoTexto}>
                {item.enti_clie} - {item.enti_nome}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  )
}
