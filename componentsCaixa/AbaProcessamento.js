// components/AbaProcessamento.js
import React from 'react'
import { View, Text, TextInput, StyleSheet } from 'react-native'

export default function AbaProcessamento({ pagamento, setPagamento }) {
  return (
    <View style={styles.scene}>
      <Text style={styles.label}>Forma de Pagamento:</Text>
      <TextInput
        style={styles.input}
        value={pagamento.forma_pagto}
        onChangeText={(val) => setPagamento({ ...pagamento, forma_pagto: val })}
      />
      <Text style={styles.label}>Valor Pago:</Text>
      <TextInput
        keyboardType="numeric"
        style={styles.input}
        value={pagamento.valor_pago}
        onChangeText={(val) => setPagamento({ ...pagamento, valor_pago: val })}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  scene: { flex: 1, padding: 20 },
  input: {
    borderColor: '#aaa',
    borderWidth: 1,
    padding: 8,
    marginVertical: 10,
    borderRadius: 4,
    color: 'white',
  },
  label: { color: 'white' },
})
