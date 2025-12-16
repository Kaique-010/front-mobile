import React from 'react'
import { View, StyleSheet } from 'react-native'
import ControleVisitaDashboard from '../componentsControledeVisita/ControleVisitaDashboard'

export default function ControleVisitaDashboardScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <ControleVisitaDashboard navigation={navigation} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1421',
  },
})