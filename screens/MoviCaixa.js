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
    movi_clie_nome: '',
    movi_vend: '',
    movi_vend_nome: '',
    movi_nume_vend: null,
    total: 0,
  })

  const [produtos, setProdutos] = useState([])
  const [index, setIndex] = useState(0)
  const [routes] = useState([
    { key: 'venda', title: 'Venda' },
    { key: 'produtos', title: 'Produtos' },
    { key: 'processamento', title: 'Processamento' },
  ])

  const handleAvancarVenda = () => {
    if (index < routes.length - 1) {
      setIndex(index + 1)
    }
  }

  const handleFinalizarVenda = () => {
    setMov({
      movi_empr: caixa.caix_empr || '',
      movi_fili: caixa.caix_fili || '',
      movi_caix: caixa.caix_caix || '',
      movi_data: new Date().toISOString().slice(0, 10),
      movi_clie: '',
      movi_clie_nome: '',
      movi_vend: '',
      movi_vend_nome: '',
      movi_nume_vend: null,
      total: 0,
    })
    setProdutos([])
    setIndex(0)
    navigation.navigate('CaixaGeral')
  }

  return (
    <View style={styles.container}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={SceneMap({
          venda: () => (
            <AbaVenda
              mov={mov}
              setMov={setMov}
              onAvancar={handleAvancarVenda}
            />
          ),
          produtos: () => (
            <AbaProdutos
              produtos={produtos}
              setProdutos={setProdutos}
              mov={mov}
              onAvancar={handleAvancarVenda}
            />
          ),
          processamento: () => (
            <AbaProcessamento
              venda={{
                ...mov,
                total: produtos.reduce((acc, p) => acc + p.iped_tota, 0),
              }}
              onFinalizarVenda={handleFinalizarVenda}
            />
          ),
        })}
        onIndexChange={setIndex}
        initialLayout={{ width: Dimensions.get('window').width }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            style={{ backgroundColor: '#283541' }}
            indicatorStyle={{ backgroundColor: '#10a2a7' }}
            activeColor="#10a2a7"
            inactiveColor="#999"
          />
        )}
        swipeEnabled={false}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a2f3d',
  },
})
