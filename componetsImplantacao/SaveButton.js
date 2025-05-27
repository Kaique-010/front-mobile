import React from 'react'
import { TouchableOpacity, Text } from 'react-native'
import styles from '../styles/formStyles'

export default function SaveButton({ onPress }) {
  return (
    <TouchableOpacity style={styles.saveButton} onPress={onPress}>
      <Text style={styles.saveButtonText}>Salvar Implantação</Text>
    </TouchableOpacity>
  )
}
