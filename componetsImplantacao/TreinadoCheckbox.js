import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import styles from '../styles/formStyles'

export default function TreinadoCheckbox({ treinado, setTreinado }) {
  return (
    <TouchableOpacity
      style={styles.checkboxContainer}
      onPress={() => setTreinado(!treinado)}>
      <View style={[styles.checkbox, treinado && styles.checkboxChecked]} />
      <Text style={styles.label}>Treinado</Text>
    </TouchableOpacity>
  )
}
