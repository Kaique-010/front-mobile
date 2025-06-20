import React from 'react'
import { View, Text, Dimensions, StyleSheet, ScrollView } from 'react-native'
import { LineChart } from 'react-native-chart-kit'

export default function DashboardFinanceiroGrafico({ route }) {
  const { totaisPorMes } = route.params

  const meses = Object.keys(totaisPorMes)
  const recebido = meses.map((mes) => totaisPorMes[mes].recebido)
  const pago = meses.map((mes) => totaisPorMes[mes].pago)
  const saldo = meses.map((mes) => totaisPorMes[mes].saldo)

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.titulo}>📊 Evolução Financeira</Text>
      <LineChart
        data={{
          labels: meses,
          datasets: [
            {
              data: recebido,
              color: () => 'green',
              strokeWidth: 2,
            },
            {
              data: pago,
              color: () => 'red',
              strokeWidth: 2,
            },
            {
              data: saldo,
              color: () => 'blue',
              strokeWidth: 2,
            },
          ],
          legend: ['Recebido', 'Pago', 'Saldo'],
        }}
        width={Dimensions.get('window').width - 32}
        height={300}
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: () => '#333',
        }}
        style={{
          borderRadius: 8,
        }}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
})
