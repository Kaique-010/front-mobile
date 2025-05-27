import React from 'react'
import { Text, TextInput } from 'react-native'
import styles from '../styles/formStyles'

export default function ObservacoesInput({ observacoes, setObservacoes }) {
  return (
    <>
      <Text style={styles.label}>Observações</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        multiline
        value={observacoes}
        onChangeText={setObservacoes}
        placeholder="Observações adicionais"
      />
    </>
  )
}
