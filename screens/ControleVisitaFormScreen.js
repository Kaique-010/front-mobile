import React from 'react'
import { View, StyleSheet } from 'react-native'
import ControleVisitaForm from '../componentsControledeVisita/ControleVisitaForm'

export default function ControleVisitaFormScreen({ route, navigation }) {
  return (
    <View style={styles.container}>
      <ControleVisitaForm route={route} navigation={navigation} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1421',
  },
})