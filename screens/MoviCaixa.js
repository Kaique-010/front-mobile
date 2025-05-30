import React, { useState } from 'react'
import { View, Button, StyleSheet, Dimensions } from 'react-native'
import { TabView, SceneMap, TabBar } from 'react-native-tab-view'

import AbaVenda from '../componentsCaixa/AbaVenda'
import AbaProdutos from '../componentsCaixa/AbaProdutos'
import AbaProcessamento from '../componentsCaixa/AbaProcessamento'

export default function MoviCaixaScreen({ route, navigation }) {
  const { caixa } = route.params

  const [mov, setMov] = useState({
    movi_empr: caixa.caix_empr || '',
    movi_fili: caixa.caix_fili || '',
    movi_caix: caixa.caix_caix || '',
    movi_data: new Date().toISOString().slice(0, 10),
    movi_clie: '',
    movi_vend: '',
  })

  const [produtos, setProdutos] = useState([])

  const [pagamento, setPagamento] = useState({
    forma_pagto: '',
    valor_pago: '',
  })

  const [index, setIndex] = useState(0)
  const [routes] = useState([
    { key: 'venda', title: 'Venda' },
    { key: 'produtos', title: 'Produtos' },
    { key: 'processamento', title: 'Processamento' },
  ])

  const registrarMovimento = async () => {
    try {
      const body = {
        ...mov,
        produtos,
        pagamento,
      }
      // POST fetch, axios, api client aqui
      alert('Salvar movimento - implementar envio ao backend')
    } catch (e) {
      alert('Erro ao salvar movimento')
    }
  }

  return (
    <View style={styles.container}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={SceneMap({
          venda: () => <AbaVenda mov={mov} setMov={setMov} />,
          produtos: () => (
            <AbaProdutos produtos={produtos} setProdutos={setProdutos} />
          ),
          processamento: () => (
            <AbaProcessamento
              pagamento={pagamento}
              setPagamento={setPagamento}
            />
          ),
        })}
        onIndexChange={setIndex}
        initialLayout={{ width: Dimensions.get('window').width }}
        renderTabBar={(props) => (
          <TabBar {...props} style={{ backgroundColor: '#283541' }} />
        )}
      />
      <View style={{ padding: 10 }}>
        <Button title="Registrar Movimento" onPress={registrarMovimento} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2a2a2a' },
})
