import React from 'react'
import { View, Text, Dimensions } from 'react-native'
import { BarChart } from 'react-native-chart-kit'

const screenWidth = Dimensions.get('window').width

export default function DashboardVendasStatusPedidos({
  totalFaturado,
  ticketMedio,
}) {
  const data = {
    labels: ['Faturado (R$)', 'Ticket Médio (R$)'],
    datasets: [{ data: [totalFaturado, ticketMedio] }],
  }

  return (
    <View style={{ marginVertical: 8, marginLeft: 10 }}>
      <View style={{ position: 'relative' }}>
        <BarChart
          data={data}
          width={screenWidth - 32}
          height={220}
          fromZero
          chartConfig={{
            flex: 1,
            backgroundGradientFrom: '#ffe5e5',
            backgroundGradientTo: '#256',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(90, 80, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            barPercentage: 0.6,
            propsForLabels: {
              dx: 10,
              fontSize: 12,
              fontWeight: 'bold',
            },
          }}
          verticalLabelRotation={5}
          style={{
            borderRadius: 8,
            marginLeft: 8,
          }}
        />

        {/* Texto acima da segunda barra */}
        <Text
          style={{
            position: 'absolute',
            top: 150,
            left: (screenWidth - 32) * 0.65, 
            color: 'black',
            fontWeight: 'bold',
          }}>
          R$ {ticketMedio.toFixed(2)}
        </Text>
      </View>
    </View>
  )
}
