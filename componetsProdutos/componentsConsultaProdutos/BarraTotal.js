import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

const BarraTotal = ({ total, quantidadeItens }) => {
  // if (quantidadeItens === 0) return null

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.label}>
          Itens: <Text style={styles.value}>{quantidadeItens}</Text>
        </Text>
        <Text style={styles.label}>
          Total: <Text style={styles.totalValue}>R$ {total.toFixed(2)}</Text>
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  value: {
    color: '#333',
    fontWeight: 'bold',
  },
  totalValue: {
    color: '#CFA96E',
    fontWeight: 'bold',
    fontSize: 18,
  },
})

export default BarraTotal
