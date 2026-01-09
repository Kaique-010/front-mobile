import React from 'react'
import { View, Text, TextInput } from 'react-native'
import styles from '../styles/entidadeStyles'

export default function AbaContato({ formData, handleChange }) {
  return (
    <View style={styles.innerContainer}>
      <Text style={styles.label}>Telefone</Text>
      <TextInput
        style={styles.input}
        value={formData.enti_fone}
        onChangeText={(text) => handleChange('enti_fone', text)}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Celular</Text>
      <TextInput
        style={styles.input}
        value={formData.enti_celu}
        onChangeText={(text) => handleChange('enti_celu', text)}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={formData.enti_emai}
        onChangeText={(text) => handleChange('enti_emai', text)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
    </View>
  )
}
