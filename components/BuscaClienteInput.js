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

export default function BuscaClienteInput({ onSelect }) {
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
      setClientes(data.results)
    } catch (err) {
      console.error('Erro ao buscar clientes:', err.message)
    }
  }

  return (
    <View>
      <TextInput
        style={styles.inputcliente} // Atribuição direta ao estilo, sem mutação
        value={termo}
        onChangeText={buscar}
        placeholder="Buscar cliente..."
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
              onPress={() => {
                onSelect(item)
                setClientes([]) // Limpa os resultados ao selecionar
                Keyboard.dismiss() // Fecha o teclado
              }}
              style={styles.sugestaoItem}>
              <Text style={styles.sugestaoTexto}>
                {item.enti_clie}-{item.enti_nome} —{' '}
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
