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
import DashContratos from '../dashsVendas/DashContratos'
import PainelCooperado from '../screens/PainelCooperado'
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

  const isDemoMode = false // Frisia Menu

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
      {/* Modo demonstração - apenas as  telas  da Frisia*/}
      {isDemoMode ? (
        <>
          <Drawer.Screen
            name="Home"
            component={Home}
            options={{
              drawerIcon: ({ color, size }) => (
                <Icon name="home" color={color} size={size} />
              ),
            }}
          />
          <Drawer.Screen
            name="Dashboard de Contratos"
            component={DashContratos}
            options={{
              drawerIcon: ({ color, size }) => (
                <Icon name="bar-chart-2" color={color} size={size} />
              ),
            }}
          />
          <Drawer.Screen
            name="Painel do Cooperado"
            component={PainelCooperado}
            options={{
              drawerIcon: ({ color, size }) => (
                <Icon name="user" color={color} size={size} />
              ),
            }}
          />
        </>
      ) : (
        <>
          {/* Menu normal - todas as telas existentes */}
          <Drawer.Screen
            name="Home"
            component={Home}
            options={{
              drawerIcon: ({ color, size }) => (
                <Icon name="home" color={color} size={size} />
              ),
            }}
          />

          {/* Todas as telas agora são escondidas e acessadas via CustomDrawer */}

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
              options={{
                drawerLabel: () => null,
                drawerItemStyle: { height: 0 },
              }}
            />
          )}

          {/* Contratos */}
          {hasModulo('contratos') && (
            <Drawer.Screen
              name="Contratos"
              component={Contratos}
              options={{
                drawerLabel: () => null,
                drawerItemStyle: { height: 0 },
              }}
            />
          )}

          {/* Cadastros */}
          {hasModulo('entidades') && (
            <Drawer.Screen
              name="Entidades"
              component={Entidades}
              options={{
                drawerLabel: () => null,
                drawerItemStyle: { height: 0 },
              }}
            />
          )}

          {hasModulo('entradasestoque') && (
            <Drawer.Screen
              name="Entradas de Estoque"
              component={EntradasEstoque}
              options={{
                drawerLabel: () => null,
                drawerItemStyle: { height: 0 },
              }}
            />
          )}

          {hasModulo('produtos') && (
            <Drawer.Screen
              name="Produtos"
              component={Produtos}
              options={{
                drawerLabel: () => null,
                drawerItemStyle: { height: 0 },
              }}
            />
          )}

          {hasModulo('saidasestoque') && (
            <Drawer.Screen
              name="Saidas de Estoque"
              component={SaidasEstoque}
              options={{
                drawerLabel: () => null,
                drawerItemStyle: { height: 0 },
              }}
            />
          )}

          {/* Vendas */}
          {hasModulo('listacasamento') && (
            <Drawer.Screen
              name="Lista de Casamento"
              component={ListaCasamento}
              options={{
                drawerLabel: () => null,
                drawerItemStyle: { height: 0 },
              }}
            />
          )}

          {hasModulo('orcamentos') && (
            <Drawer.Screen
              name="Orcamentos"
              component={Orcamentos}
              options={{
                drawerLabel: () => null,
                drawerItemStyle: { height: 0 },
              }}
            />
          )}

          {hasModulo('pedidos') && (
            <Drawer.Screen
              name="Pedidos"
              component={Pedidos}
              options={{
                drawerLabel: () => null,
                drawerItemStyle: { height: 0 },
              }}
            />
          )}

          {/* Financeiro */}
          {hasModulo('financeiro') && (
            <Drawer.Screen
              name="Caixa"
              component={CaixaGeralScreen}
              options={{
                drawerLabel: () => null,
                drawerItemStyle: { height: 0 },
              }}
            />
          )}

          <Drawer.Screen
            name="Extrato de Caixa"
            component={DashExtratoCaixa}
            options={{
              drawerLabel: () => null,
              drawerItemStyle: { height: 0 },
            }}
          />

          {/* O.S */}
          {hasModulo('ordemdeservico') && (
            <Drawer.Screen
              name="Painel de Acompanhamento de O'S"
              component={PainelAcompanhamento}
              options={{
                drawerLabel: () => null,
                drawerItemStyle: { height: 0 },
              }}
            />
          )}

          {hasModulo('os') && (
            <Drawer.Screen
              name="Ordens de Serviço"
              component={PainelOrdens}
              options={{
                drawerLabel: () => null,
                drawerItemStyle: { height: 0 },
              }}
            />
          )}

          {/* Outros */}
          {hasModulo('implantacao') && (
            <Drawer.Screen
              name="Implantações"
              component={ImplantacoesList}
              options={{
                drawerLabel: () => null,
                drawerItemStyle: { height: 0 },
              }}
            />
          )}

          {/* Contas financeiras - escondidas, acessíveis via submenu */}
          {hasModulo('financeiro') && (
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

          {/* Contratos e Cooperado */}
          <Drawer.Screen
            name="Dashboard de Contratos"
            component={DashContratos}
            options={{
              drawerLabel: () => null,
              drawerItemStyle: { height: 0 },
            }}
          />
          <Drawer.Screen
            name="Painel do Cooperado"
            component={PainelCooperado}
            options={{
              drawerLabel: () => null,
              drawerItemStyle: { height: 0 },
            }}
          />

          <Drawer.Screen
            name="Auditoria"
            component={AuditoriaScreen}
            options={{
              drawerLabel: () => null,
              drawerItemStyle: { height: 0 },
            }}
          />
        </>
      )}
    </Drawer.Navigator>
  )
}
