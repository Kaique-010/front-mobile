import React from 'react'
import { View, StyleSheet } from 'react-native'
import ControleVisitaDetalhes from '../componentsControledeVisita/ControleVisitaDetalhes'

export default function ControleVisitaDetalhesScreen({ route, navigation }) {
  return (
    <View style={styles.container}>
      <ControleVisitaDetalhes route={route} navigation={navigation} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1421',
  },
})