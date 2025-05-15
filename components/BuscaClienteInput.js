import React, { useState, useEffect } from 'react'
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

export default function BuscaClienteInput({
  onSelect,
  placeholder = 'Buscar...',
  tipo = null,
}) {
  const [termo, setTermo] = useState('')
  const [clientes, setClientes] = useState([])
  const [slug, setSlug] = useState('')

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

  const buscar = async (texto) => {
    setTermo(texto)
    if (!texto) return setClientes([])

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
    } catch (err) {
      console.error('Erro ao buscar entidades:', err.message)
    }
  }

  const selecionar = (item) => {
    onSelect(item)
    setClientes([])
    Keyboard.dismiss()
  }

  return (
    <View>
      <TextInput
        style={styles.inputcliente}
        value={termo}
        onChangeText={buscar}
        placeholder={placeholder}
        placeholderTextColor="#aaa"
      />
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
