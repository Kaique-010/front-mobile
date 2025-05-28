// DashboardEstoqueTopProdutos.js
import ViewShot from 'react-native-view-shot'
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
        flex: 1,
        backgroundGradientFrom: '#ffe5e5',
        backgroundGradientTo: '#256',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(25,50,100, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        barPercentage: 0.7,
        propsForLabels: {
          dx: -6,
          fontSize: 12,
          fontWeight: 'bold',
        },
        propsForBackgroundLines: {
          strokeWidth: 0,
        },
        style: {
          paddingLeft: -10,
        },
      }}
      style={{ marginVertical: 10, marginLeft: 10 }}
    />
  )
}
