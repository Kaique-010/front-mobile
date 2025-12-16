import { PieChart } from 'react-native-chart-kit'
import { Dimensions } from 'react-native'

const screenWidth = Dimensions.get('window').width
const COLORS = [
  '#8e9fff', // azul médio moderno
  '#5C6BC0', // azul arroxeado
  '#7E57C2', // roxo mais suave
  '#89239b', // roxo claro elegante
]

export default function PedidosChart({ data, chartConfig }) {
  const topData = data.sort((a, b) => b.total - a.total).slice(0, 10)

  const pieData = topData.map((item, index) => ({
    name: item.cliente,
    population: Number(item.total),
    color: COLORS[index % COLORS.length],
    legendFontColor: '#fff',
    legendFontSize: 10,
  }))

  return (
    <PieChart
      data={pieData}
      width={screenWidth - 64}
      height={220}
      chartConfig={chartConfig}
      accessor="population"
      backgroundColor="transparent"
      paddingLeft="15"
      style={{ marginBottom: 20, borderRadius: 16 }}
    />
  )
}
