import React from 'react'
import { Text, TextInput } from 'react-native'
import styles from '../styles/formStyles'

export default function ClienteInput({ cliente, setCliente }) {
  return (
    <>
      <Text style={styles.label}>Cliente *</Text>
      <TextInput
        style={styles.input}
        value={cliente}
        onChangeText={setCliente}
        placeholder="Nome do cliente"
      />
    </>
  )
}
