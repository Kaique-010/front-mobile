import React, { useState, useEffect } from 'react'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import ProdutoDados from '../componetsProdutos/ProdutoDados'
import ProdutoPrecos from '../componetsProdutos/ProdutoPrecos'
import ProdutoPisos from '../componetsProdutos/ProdutoPisos'
import ProdutoServicos from '../componetsProdutos/ProdutoServicos'
import { apiGetComContexto } from '../utils/api'
import AsyncStorage from '@react-native-async-storage/async-storage'

const Tab = createMaterialTopTabNavigator()

export default function ProdutoFormTabs({ route, navigation }) {
  const produtoInicial = route.params?.produto || {}
  const slug = route.params?.slug || produtoInicial.slug || ''
  const [produto, setProduto] = useState(produtoInicial)

  useEffect(() => {
    const fetchProdutoDetalhes = async () => {
      if (!produtoInicial?.prod_codi) return

      try {
        const empresaId = await AsyncStorage.getItem('empresaId')
        const empresa = empresaId ? parseInt(empresaId) : 1
        // Endpoint para buscar detalhes completos do produto
        const endpoint = `produtos/produtos/${empresa}/${produtoInicial.prod_codi}/`
        
        console.log('🔄 [ProdutoForm] Buscando detalhes do produto:', endpoint)
        const data = await apiGetComContexto(endpoint)
        
        if (data) {
          console.log('✅ [ProdutoForm] Detalhes recebidos e atualizados')
          setProduto((prev) => ({ ...prev, ...data }))
        }
      } catch (error) {
        console.error('❌ [ProdutoForm] Erro ao buscar detalhes:', error)
      }
    }

    fetchProdutoDetalhes()
  }, [produtoInicial?.prod_codi])

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
