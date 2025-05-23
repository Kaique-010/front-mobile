import React from 'react'
import { View } from 'react-native'
import { BarChart } from 'react-native-chart-kit'
import { Dimensions } from 'react-native'

const screenWidth = Dimensions.get('window').width

export default function DashboardVendasStatusPedidos({
  totalPedidos,
  totalFaturado,
  ticketMedio,
}) {
  const data = {
    labels: ['Pedidos', 'Faturado (R$)', 'Ticket Médio (R$)'],
    datasets: [
      {
        data: [totalPedidos, totalFaturado, ticketMedio],
      },
    ],
  }

  return (
    <View style={{ marginVertical: 16 }}>
      <BarChart
        data={data}
        width={screenWidth - 32}
        height={220}
        fromZero
        formatYLabel={(value) => {
          if (value === totalPedidos.toString()) return value
          return `R$ ${parseFloat(value).toFixed(2)}`
        }}
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          barPercentage: 0.6,
        }}
        style={{
          borderRadius: 8,
          marginLeft: 16,
        }}
      />
    </View>
  )
}
