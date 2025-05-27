import React from 'react'
import { Text, TouchableOpacity } from 'react-native'
import styles from '../styles/formStyles'

const STATUS_OPTIONS = ['nao_iniciado', 'em_andamento', 'finalizado']

export default function StatusSelector({ status, setStatus }) {
  return (
    <>
      <Text style={styles.label}>Status</Text>
      {STATUS_OPTIONS.map((s) => (
        <TouchableOpacity
          key={s}
          style={[
            styles.choiceButton,
            status === s && styles.choiceButtonSelected,
          ]}
          onPress={() => setStatus(s)}>
          <Text
            style={[
              styles.choiceButtonText,
              status === s && styles.choiceButtonTextSelected,
            ]}>
            {s.replace('_', ' ').toUpperCase()}
          </Text>
        </TouchableOpacity>
      ))}
    </>
  )
}
