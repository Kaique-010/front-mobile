import { BarChart } from 'react-native-chart-kit'
import { Dimensions, ScrollView, TouchableOpacity } from 'react-native'
import Toast from 'react-native-toast-message'

export default function SaldosChart({ data, chartConfig }) {
  const labels = data.map((item) =>
    item.nome.length > 10 ? item.nome.slice(0, 10) + '...' : item.nome
  )

  const values = data.map((item) => Number(item.total))

  const fullNames = data.map((item) => item.nome)

  const chartWidth = Math.max(
    labels.length * 50,
    Dimensions.get('window').width
  )

  const chartData = {
    labels,
    datasets: [{ data: values }],
  }

  const handlePressBar = (index) => {
    Toast.show({
      type: 'info',
      text1: fullNames[index],
    })
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <BarChart
        data={chartData}
        width={chartWidth}
        height={220}
        chartConfig={{
          ...chartConfig,
          fillShadowGradient: 'rgba(137, 35, 155, 0.35)',
          fillShadowGradientOpacity: 1,
          propsForLabels: {
            fontSize: 10,
            fill: '#fff',
          },
        }}
        verticalLabelRotation={30}
        fromZero
        barPercentage={0.5}
        xLabelsOffset={-20}
        showBarTops={false}
        onDataPointClick={({ index }) => handlePressBar(index)}
        style={{ marginBottom: 20, borderRadius: 16 }}
      />
    </ScrollView>
  )
}
