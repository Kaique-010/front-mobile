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
import {
  apiGetComContexto,
  apiGetComContextoSemFili,
  safeSetItem,
} from '../utils/api'
import { getStoredData } from '../services/storageService'
import AsyncStorage from '@react-native-async-storage/async-storage'
import styles from '../styles/listaStyles'
import debounce from 'lodash/debounce'
import database from '../componentsOrdemServico/schemas/database'
import { Q } from '@nozbe/watermelondb'
import { buscarEntidades } from '../repositorios/entidadeRepository'

// Cache para clientes
const CLIENTES_CACHE_KEY = 'clientes_cache'
const CLIENTES_CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

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
  const [empresaId, setEmpresaId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    const carregarDadosIniciais = async () => {
      try {
        const data = await getStoredData()
        if (data) {
          if (data.slug) setSlug(data.slug)
          if (data.empresaId) setEmpresaId(data.empresaId)
        } else {
          console.warn('Dados iniciais não encontrados')
        }
      } catch (err) {
        console.error('Erro ao carregar dados iniciais:', err.message)
      }
    }
    carregarDadosIniciais()
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
      if (!texto || texto.length < 3) {
        setClientes([])
        setShowResults(false)
        return
      }

      setLoading(true)

      try {
        const resultados = await buscarEntidades({
          termo: texto,
          tipo,
          empresaId,
        })

        setClientes(resultados)
        setShowResults(resultados.length > 0)
      } catch {
        setClientes([])
        setShowResults(false)
      } finally {
        setLoading(false)
      }
    }, 500),
    [tipo]
  )

  const selecionar = (item) => {
    const texto = `${item.enti_clie} - ${item.enti_nome} - ${item.enti_cida}`
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
          keyExtractor={(item) => `${item.enti_clie}-${item.enti_empr}`}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
          style={[styles.sugestaoLista, { maxHeight: 200 }]}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => selecionar(item)}
              style={styles.sugestaoItem}>
              <Text style={styles.sugestaoTexto}>
                {item.enti_clie} - {item.enti_nome} —{' '}
                {item.enti_cpf || item.enti_cnpj} — {item.enti_cida}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  )
}
