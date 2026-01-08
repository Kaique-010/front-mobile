import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native'
import { PieChart } from 'react-native-chart-kit'

const screenWidth = Dimensions.get('window').width

export default function EstoqueMarcasView({ data }) {
  console.log('EstoqueMarcasView received data:', JSON.stringify(data, null, 2))

  let items = []
  let totalGeral = 0

  if (Array.isArray(data)) {
    if (data.length > 0 && Array.isArray(data[0])) {
      items = data[0]
      totalGeral = data.length > 1 ? data[1] : 0
    } else {
      items = data
      totalGeral = items.reduce(
        (acc, item) => acc + (item.total ? parseFloat(item.total) : 0),
        0
      )
    }
  }

  // Format colors for chart
  const colors = [
    '#af1a3bff',
    '#376a8bff',
    '#a0843cff',
    '#4BC0C0',
    '#8372a5ff',
    '#FF9F40',
    '#bbc4d6ff',
    '#7a9253ff',
    '#9ac6e0ff',
    '#bfa6e2ff',
  ]

  const chartData = items.map((item, index) => {
    const rawValue = item.total ? parseFloat(item.total) : 0
    const logValue = rawValue > 0 ? Math.log10(rawValue + 10) : 0

    return {
      name: item.marca_nome,
      population: logValue,
      realValue: rawValue,
      color: colors[index % colors.length],
      legendFontColor: '#aaa',
      legendFontSize: 11,
    }
  })

  const formatMoney = (value) => {
    return value
      ? parseFloat(value)
          .toFixed(2)
          .replace('.', ',')
          .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
      : '0,00'
  }

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.marca} numberOfLines={1}>
        {item.marca_nome}
      </Text>
      <Text style={styles.valor}>R$ {formatMoney(item.total)}</Text>
    </View>
  )
  const renderCustomLegend = () => {
    return (
      <View style={styles.legendContainer}>
        {chartData.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: item.color }]}
            />
            <Text style={styles.legendText} numberOfLines={1}>
              {item.name}: R$ {formatMoney(item.realValue)}
            </Text>
          </View>
        ))}
      </View>
    )
  }
  return (
    <View style={styles.container}>
      {/* Card for Total Value */}
      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Valor Total em Estoque</Text>
        <Text style={styles.totalValue}>R$ {formatMoney(totalGeral)}</Text>
      </View>

      {/* Pie Chart */}
      {items.length > 0 && (
        <View style={styles.chartContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Top Marcas por custo</Text>
          </View>
          <PieChart
            data={chartData}
            width={screenWidth}
            height={220}
            chartConfig={chartConfig}
            accessor={'population'}
            backgroundColor={'transparent'}
            paddingLeft={'0'}
            center={[screenWidth / 4, 0]}
            absolute
            hasLegend={false}
          />
          {renderCustomLegend()}
        </View>
      )}

      {/* Grid of Brands - Show ALL items */}
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        scrollEnabled={false}
        numColumns={4}
        columnWrapperStyle={styles.row}
      />
    </View>
  )
}

const chartConfig = {
  backgroundGradientFrom: '#1E2923',
  backgroundGradientFromOpacity: 0,
  backgroundGradientTo: '#08130D',
  backgroundGradientToOpacity: 0.5,
  color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
}

const styles = StyleSheet.create({
  container: { width: '100%', paddingBottom: 20 },
  headerContainer: { marginBottom: 10, paddingHorizontal: 10 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#7a7575ff' },
  totalCard: {
    backgroundColor: '#1f1e1eff',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 10,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#5b8d8dff',
    shadowColor: '#accacaff',
    shadowOffset: { width: 4, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  totalLabel: {
    color: '#aaa',
    fontSize: 10,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  totalValue: { color: '#81f081ff', fontSize: 18, fontWeight: 'bold' },
  chartContainer: { alignItems: 'center', marginBottom: 20, width: '100%' },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
    paddingHorizontal: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 5,
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  legendText: {
    color: '#aaa',
    fontSize: 11,
  },
  row: { justifyContent: 'space-between', paddingHorizontal: 5 },
  card: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    margin: 3,
    borderRadius: 6,
    padding: 5,
    minHeight: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#5b8d8dff',
    shadowColor: '#accacaff',
    shadowOffset: { width: 4, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  marca: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 3,
  },
  valor: {
    color: '#00bfff',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
})
