// components/BuscaClienteInput.js
import React, { useState } from 'react'
import {
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  View,
  Keyboard,
} from 'react-native'
import { apiGet } from '../utils/api'
import styles from '../styles/listaStyles'

export default function BuscaClienteInput({ onSelect }) {
  const [termo, setTermo] = useState('')
  const [clientes, setClientes] = useState([])

  const buscar = async (texto) => {
    setTermo(texto)
    if (!texto) return setClientes([])
    const data = await apiGet('/api/entidades/', { search: texto })
    setClientes(data)
  }

  return (
    <View>
      <TextInput
        style={(styles.inputcliente = { color: 'white' })}
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
                setClientes([])
                Keyboard.dismiss()
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
