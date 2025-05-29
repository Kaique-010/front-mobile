import React, { useEffect, useState } from 'react'
import { createDrawerNavigator } from '@react-navigation/drawer'
import AsyncStorage from '@react-native-async-storage/async-storage'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Dashboard from '../dashboards/Dashboards'
import Home from '../screens/Home'
import Produtos from '../screens/Produtos'
import Pedidos from '../screens/Pedidos'
import Orcamentos from '../screens/Orcamentos'
import CustomDrawer from './CustomDrawer'
import Icon from 'react-native-vector-icons/Feather'
import Entidades from '../screens/Entidades'
import ListaCasamento from '../screens/ListaCasamento'
import EntradasEstoque from '../screens/EntradasEstoque'
import SaidasEstoque from '../screens/SaidasEstoque'
import ImplantacoesList from '../screens/ImplantacoesList'
import ContasPagarList from '../screens/ContasPagarList'
import ContasReceberList from '../screens//ContasReceberList'
import Contratos from '../screens/Contratos'
import PainelAcompanhamento from '../screens/PainelOs'

const Drawer = createDrawerNavigator()

export default function DrawerNavigator() {
  const [modulos, setModulos] = useState(null)

  useEffect(() => {
    const fetchModulos = async () => {
      const modulosStorage = await AsyncStorage.getItem('modulos')
      if (modulosStorage) {
        setModulos(JSON.parse(modulosStorage))
      }
    }
    fetchModulos()
  }, [])

  if (!modulos) return null

  const hasModulo = (mod) => modulos.includes(mod)

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: '#222' },
        headerTintColor: '#fff',
        drawerStyle: { backgroundColor: '#333' },
        drawerLabelStyle: { color: '#fff', fontSize: 15 },
      }}>
      <Drawer.Screen
        name="Home"
        component={Home}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="home" color={color} size={size} />
          ),
        }}
      />
      {hasModulo('contratos') && (
        <Drawer.Screen
          name="Contratos"
          component={Contratos}
          options={{
            drawerIcon: ({ color, size }) => (
              <Icon name="file-text" color={color} size={size} />
            ),
          }}
        />
      )}

      {hasModulo('entidades') && (
        <Drawer.Screen
          name="Entidades"
          component={Entidades}
          options={{
            drawerIcon: ({ color, size }) => (
              <Icon name="users" color={color} size={size} />
            ),
          }}
        />
      )}

      {hasModulo('entradasestoque') && (
        <Drawer.Screen
          name="Entradas de Estoque"
          component={EntradasEstoque}
          options={{
            drawerIcon: ({ color, size }) => (
              <Icon name="arrow-down-circle" color={color} size={size} />
            ),
          }}
        />
      )}

      {hasModulo('listacasamento') && (
        <Drawer.Screen
          name="Lista de Casamento"
          component={ListaCasamento}
          options={{
            drawerIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="ring" color={color} size={size} />
            ),
          }}
        />
      )}
      {hasModulo('orcamentos') && (
        <Drawer.Screen
          name="Orcamentos"
          component={Orcamentos}
          options={{
            drawerIcon: ({ color, size }) => (
              <Icon name="shopping-bag" color={color} size={size} />
            ),
          }}
        />
      )}

      <Drawer.Screen
        name="Painel de Acompanhamento de O'S"
        component={PainelAcompanhamento}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="users" color={color} size={size} />
          ),
        }}
      />

      {hasModulo('pedidos') && (
        <Drawer.Screen
          name="Pedidos"
          component={Pedidos}
          options={{
            drawerIcon: ({ color, size }) => (
              <Icon name="shopping-cart" color={color} size={size} />
            ),
          }}
        />
      )}

      {hasModulo('produtos') && (
        <Drawer.Screen
          name="Produtos"
          component={Produtos}
          options={{
            drawerIcon: ({ color, size }) => (
              <Icon name="box" color={color} size={size} />
            ),
          }}
        />
      )}

      {hasModulo('saidasestoque') && (
        <Drawer.Screen
          name="Saidas de Estoque"
          component={SaidasEstoque}
          options={{
            drawerIcon: ({ color, size }) => (
              <Icon name="arrow-up-circle" color={color} size={size} />
            ),
          }}
        />
      )}
      {hasModulo('dashboards') && (
        <Drawer.Screen
          name="Dashboard"
          component={Dashboard}
          options={{
            drawerIcon: ({ color, size }) => (
              <Icon name="bar-chart" color={color} size={size} />
            ),
          }}
        />
      )}
      {hasModulo('implantacao') && (
        <Drawer.Screen
          name="Implantações"
          component={ImplantacoesList}
          options={{
            drawerIcon: ({ color, size }) => (
              <Icon name="bar-chart" color={color} size={size} />
            ),
          }}
        />
      )}
      {hasModulo('Financeiro') && (
        <>
          <Drawer.Screen
            name="Contas a Pagar"
            component={ContasPagarList}
            options={{
              drawerLabel: () => null,
              drawerItemStyle: { height: 0 },
              drawerIcon: ({ color, size }) => (
                <Icon name="bar-chart" color={color} size={size} />
              ),
            }}
          />
          <Drawer.Screen
            name="Contas a Receber"
            component={ContasReceberList}
            options={{
              drawerLabel: () => null,
              drawerItemStyle: { height: 0 },
              drawerIcon: ({ color, size }) => (
                <Icon name="bar-chart" color={color} size={size} />
              ),
            }}
          />
        </>
      )}
    </Drawer.Navigator>
  )
}
