import React, { useState } from 'react'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import ProdutoDados from '../componetsProdutos/ProdutoDados'
import ProdutoPrecos from '../componetsProdutos/ProdutoPrecos'
import ProdutoPisos from '../componetsProdutos/ProdutoPisos'
import ProdutoServicos from '../componetsProdutos/ProdutoServicos'

const Tab = createMaterialTopTabNavigator()

export default function ProdutoFormTabs({ route, navigation }) {
  const produtoInicial = route.params?.produto || {}
  const slug = route.params?.slug || produtoInicial.slug || ''
  const [produto, setProduto] = useState(produtoInicial)

  const atualizarProduto = (novosDados) =>
    setProduto((prev) => ({ ...prev, ...novosDados }))

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { backgroundColor: '#0B141A' },
        tabBarLabelStyle: { color: 'white', fontWeight: 'bold' },
        tabBarIndicatorStyle: { backgroundColor: '#0058A2' },
      }}>
      <Tab.Screen name="Dados">
        {(props) => (
          <ProdutoDados
            {...props}
            produto={produto}
            atualizarProduto={atualizarProduto}
            slug={slug}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Preços">
        {(props) => (
          <ProdutoPrecos
            {...props}
            produto={produto}
            atualizarProduto={atualizarProduto}
            slug={slug}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Serviço">
        {(props) => (
          <ProdutoServicos
            {...props}
            produto={produto}
            atualizarProduto={atualizarProduto}
            slug={slug}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Pisos">
        {(props) => (
          <ProdutoPisos
            {...props}
            produto={produto}
            atualizarProduto={atualizarProduto}
            slug={slug}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  )
}
