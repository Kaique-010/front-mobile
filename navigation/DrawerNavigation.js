import React, { useState, useEffect } from 'react'
import { createDrawerNavigator } from '@react-navigation/drawer'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Icon from 'react-native-vector-icons/Feather'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

import CustomDrawer from './CustomDrawer'

import Home from '../screens/Home'
import Contratos from '../screens/Contratos'
import CaixaGeralScreen from '../screens/CaixaGeral'
import DashboardFinanceiro from '../dashboardFinanceiro/DashboardFinanceiro'
import Dashboard from '../dashboards/Dashboards'
import DashRealizado from '../dashboardFinanceiro/DashRealizado'
import DashExtratoCaixa from '../dashsVendas/DashExtratoCaixa'
import Entidades from '../screens/Entidades'
import EntradasEstoque from '../screens/EntradasEstoque'
import ListaCasamento from '../screens/ListaCasamento'
import Orcamentos from '../screens/Orcamentos'
import PainelAcompanhamento from '../screens/PainelOs'
import PainelOrdens from '../screens/PainelOrdens'
import Pedidos from '../screens/Pedidos'
import Produtos from '../screens/Produtos'
import SaidasEstoque from '../screens/SaidasEstoque'
import ImplantacoesList from '../screens/ImplantacoesList'
import ContasPagarList from '../screens/ContasPagarList'
import ContasReceberList from '../screens/ContasReceberList'
import AuditoriaScreen from '../screens/AuditoriaScreen'

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
        drawerActiveTintColor: '#10a2a7',
        drawerInactiveTintColor: '#ccc',
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

      {hasModulo('financeiro') && (
        <Drawer.Screen
          name="Caixa"
          component={CaixaGeralScreen}
          options={{
            drawerIcon: ({ color, size }) => (
              <Icon name="credit-card" color={color} size={size} />
            ),
          }}
        />
      )}

      {/* Dashboards - escondidos do menu principal, acessíveis via dropdown */}
      {hasModulo('financeiro') && (
        <>
          <Drawer.Screen
            name="DashboardFinanceiro"
            component={DashboardFinanceiro}
            options={{
              drawerLabel: () => null,
              drawerItemStyle: { height: 0 },
            }}
          />
          <Drawer.Screen
            name="DashRealizado"
            component={DashRealizado}
            options={{
              drawerLabel: () => null,
              drawerItemStyle: { height: 0 },
            }}
          />
        </>
      )}

      {hasModulo('dash') && (
        <Drawer.Screen
          name="Dashboard"
          component={Dashboard}
          options={{ drawerLabel: () => null, drawerItemStyle: { height: 0 } }}
        />
      )}

      <Drawer.Screen
        name="Extrato de Caixa"
        component={DashExtratoCaixa}
        options={{
          title: 'Extrato de Caixa',
          headerStyle: { backgroundColor: '#182c39' },
          headerTintColor: '#ff0000',
          headerTitleStyle: { color: '#faebd7' },
        }}
      />

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

      {hasModulo('ordemdeservico') && (
        <Drawer.Screen
          name="Painel de Acompanhamento de O'S"
          component={PainelAcompanhamento}
          options={{
            drawerIcon: ({ color, size }) => (
              <Icon name="clipboard" color={color} size={size} />
            ),
          }}
        />
      )}

      {hasModulo('os') && (
        <Drawer.Screen
          name="Ordens de Serviço"
          component={PainelOrdens}
          options={{
            drawerIcon: ({ color, size }) => (
              <Icon name="tool" color={color} size={size} />
            ),
          }}
        />
      )}

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

      {hasModulo('implantacao') && (
        <Drawer.Screen
          name="Implantações"
          component={ImplantacoesList}
          options={{
            drawerIcon: ({ color, size }) => (
              <Icon name="settings" color={color} size={size} />
            ),
          }}
        />
      )}

      {/* Contas financeiras - escondidas, acessíveis via submenu */}
      {hasModulo('Financeiro') && (
        <>
          <Drawer.Screen
            name="Contas a Pagar"
            component={ContasPagarList}
            options={{
              drawerLabel: () => null,
              drawerItemStyle: { height: 0 },
            }}
          />
          <Drawer.Screen
            name="Contas a Receber"
            component={ContasReceberList}
            options={{
              drawerLabel: () => null,
              drawerItemStyle: { height: 0 },
            }}
          />
        </>
      )}

      <Drawer.Screen
        name="Auditoria"
        component={AuditoriaScreen}
        options={{
          drawerLabel: 'Logs do Sistema',
          drawerIcon: ({ color }) => (
            <Icon name="clock" size={24} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  )
}
