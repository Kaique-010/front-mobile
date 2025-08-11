import React from 'react'
import { View, StyleSheet } from 'react-native'
import ControleVisitasList from '../componentsControledeVisita/ControleVisitasList'

export default function ControleVisitasScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <ControleVisitasList navigation={navigation} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1421',
  },
})