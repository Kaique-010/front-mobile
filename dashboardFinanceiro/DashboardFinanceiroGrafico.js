import React from 'react'
import { View, Text, Dimensions, StyleSheet, ScrollView } from 'react-native'
import { LineChart } from 'react-native-chart-kit'

export default function DashboardFinanceiroGrafico({ route }) {
  // Verificação de segurança para route.params
  if (!route?.params?.totaisPorMes) {
    return (
      <View style={styles.container}>
        <Text style={styles.titulo}>❌ Dados não encontrados</Text>
        <Text style={{ textAlign: 'center', padding: 20 }}>
          Volte ao dashboard e clique em "Ver Gráfico" novamente.
        </Text>
      </View>
    )
  }

  const { totaisPorMes } = route.params
  const screenWidth = Dimensions.get('window').width

  const meses = Object.keys(totaisPorMes)
  
  // Verificação adicional se há dados
  if (meses.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.titulo}>📊 Sem dados para exibir</Text>
      </View>
    )
  }

  const recebido = meses.map((mes) => totaisPorMes[mes].recebido)
  const pago = meses.map((mes) => totaisPorMes[mes].pago)
  const saldo = meses.map((mes) => totaisPorMes[mes].saldo)

  // Formatação dos labels dos meses para melhor visualização
  const labelsFormatados = meses.map((mes) => {
    const [ano, mesNum] = mes.split('-')
    const nomeMes = [
      'Jan',
      'Fev',
      'Mar',
      'Abr',
      'Mai',
      'Jun',
      'Jul',
      'Ago',
      'Set',
      'Out',
      'Nov',
      'Dez',
    ][parseInt(mesNum) - 1]
    return `${nomeMes}/${ano.slice(-2)}`
  })

  // Função para formatar valores em reais
  const formatarValor = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(valor)
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 25 }}>
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
        width={Dimensions.get('window').width - 0}
        height={400}
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 25,
    paddingLeft: 40,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
