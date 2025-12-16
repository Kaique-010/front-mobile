import React from 'react'
import { Text, TextInput } from 'react-native'
import styles from '../styles/formStyles'

export default function ImplantadorInput({ implantador, setImplantador }) {
  return (
    <>
      <Text style={styles.label}>Implantador *</Text>
      <TextInput
        style={styles.input}
        value={implantador}
        onChangeText={setImplantador}
        placeholder="Nome do implantador"
      />
    </>
  )
}
