// DashboardEstoqueTopProdutos.js
import React from 'react'
import { BarChart } from 'react-native-chart-kit'
import { Dimensions } from 'react-native'

const screenWidth = Dimensions.get('window').width

export default function DashboardEstoqueTopProdutos({ dados }) {
  const labels = dados.map((item) => String(item.said_prod))
  const data = dados.map((item) => item.total)

  return (
    <BarChart
      data={{ labels, datasets: [{ data }] }}
      width={screenWidth - 32}
      height={220}
      chartConfig={{
        backgroundColor: '#fff',
        backgroundGradientFrom: '#fff',
        backgroundGradientTo: '#fff',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(0,0,0, ${opacity})`,
      }}
      style={{ marginVertical: 8 }}
    />
  )
}
