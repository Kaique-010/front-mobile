import React, { useState, useEffect } from 'react'
import { createDrawerNavigator } from '@react-navigation/drawer'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Icon from 'react-native-vector-icons/Feather'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import * as Screens from './screenImports'
import CustomDrawer from './CustomDrawer'

import Home from '../screens/Home'

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

  const hasModulo = (mod) => {
    if (!modulos || !Array.isArray(modulos)) {
      return false
    }

    // Se é um array de objetos (formato atual do backend)
    if (modulos.length > 0 && typeof modulos[0] === 'object') {
      return modulos.some(
        (modulo) => modulo.nome === mod && modulo.ativo === true
      )
    }

    // Fallback para array de strings (formato antigo)
    return modulos.includes(mod)
  }

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
          {hasModulo('Financeiro') && (
            <>
              <Drawer.Screen
                name="DashboardFinanceiro"
                component={Screens.DashboardFinanceiro}
                options={{
                  drawerLabel: () => null,
                  drawerItemStyle: { height: 0 },
                }}
              />
              <Drawer.Screen
                name="DashRealizado"
                component={Screens.DashRealizado}
                options={{
                  drawerLabel: () => null,
                  drawerItemStyle: { height: 0 },
                }}
              />
              <Drawer.Screen
                name="DashDRE"
                component={Screens.DashDRE}
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
              component={Screens.Dashboard}
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
              component={Screens.Contratos}
              options={{
                drawerLabel: () => null,
                drawerItemStyle: { height: 0 },
              }}
            />
          )}

          {/* Cadastros */}
          {hasModulo('Entidades') && (
            <Drawer.Screen
              name="Entidades"
              component={Screens.Entidades}
              options={{
                drawerLabel: () => null,
                drawerItemStyle: { height: 0 },
              }}
            />
          )}

          {hasModulo('Produtos') && (
            <Drawer.Screen
              name="Produtos"
              component={Screens.Produtos}
              options={{
                drawerLabel: () => null,
                drawerItemStyle: { height: 0 },
              }}
            />
          )}

          {hasModulo('Produtos') && (
            <Drawer.Screen
              name="ProdutosDetalhados"
              component={Screens.ProdutosDetalhados}
              options={{
                drawerLabel: () => null,
                drawerItemStyle: { height: 0 },
              }}
            />
          )}

          {hasModulo('Saidas_Estoque') && (
            <Drawer.Screen
              name="Saidas de Estoque"
              component={Screens.SaidasEstoque}
              options={{
                drawerLabel: () => null,
                drawerItemStyle: { height: 0 },
              }}
            />
          )}

          {hasModulo('listacasamento') && (
            <Drawer.Screen
              name="Lista de Casamento"
              component={Screens.ListaCasamento}
              options={{
                drawerLabel: () => null,
                drawerItemStyle: { height: 0 },
              }}
            />
          )}

          {hasModulo('Orcamentos') && (
            <Drawer.Screen
              name="Orcamentos"
              component={Screens.Orcamentos}
              options={{
                drawerLabel: () => null,
                drawerItemStyle: { height: 0 },
              }}
            />
          )}

          {hasModulo('Pedidos') && (
            <Drawer.Screen
              name="Pedidos"
              component={Screens.Pedidos}
              options={{
                drawerLabel: () => null,
                drawerItemStyle: { height: 0 },
              }}
            />
          )}

          {hasModulo('Financeiro') && (
            <Drawer.Screen
              name="Caixa"
              component={Screens.CaixaGeralScreen}
              options={{
                drawerLabel: () => null,
                drawerItemStyle: { height: 0 },
              }}
            />
          )}

          <Drawer.Screen
            name="Extrato de Caixa"
            component={Screens.DashExtratoCaixa}
            options={{
              drawerLabel: () => null,
              drawerItemStyle: { height: 0 },
            }}
          />

          {hasModulo('OrdemdeServico') && (
            <Drawer.Screen
              name="Painel de Acompanhamento de O'S"
              component={Screens.PainelAcompanhamento}
              options={{
                drawerLabel: () => null,
                drawerItemStyle: { height: 0 },
              }}
            />
          )}

          {hasModulo('implantacao') && (
            <Drawer.Screen
              name="Implantações"
              component={Screens.ImplantacaoForm}
              options={{
                drawerLabel: () => null,
                drawerItemStyle: { height: 0 },
              }}
            />
          )}

          {hasModulo('Financeiro') && (
            <>
              <Drawer.Screen
                name="Contas a Pagar"
                component={Screens.ContasPagarList}
                options={{
                  drawerLabel: () => null,
                  drawerItemStyle: { height: 0 },
                }}
              />
              <Drawer.Screen
                name="Contas a Receber"
                component={Screens.ContasReceberList}
                options={{
                  drawerLabel: () => null,
                  drawerItemStyle: { height: 0 },
                }}
              />
              <Drawer.Screen
                name="Lista de Cobranças a vencer"
                component={Screens.CobrancasList}
                options={{
                  drawerLabel: () => null,
                  drawerItemStyle: { height: 0 },
                }}
              />
            </>
          )}

          <Drawer.Screen
            name="Dashboard de Contratos"
            component={Screens.DashContratos}
            options={{
              drawerIcon: ({ color, size }) => (
                <Icon name="bar-chart-2" color={color} size={size} />
              ),
            }}
          />
          <Drawer.Screen
            name="Painel do Cooperado"
            component={Screens.PainelCooperado}
            options={{
              drawerLabel: () => null,
              drawerItemStyle: { height: 0 },
            }}
          />

          <Drawer.Screen
            name="Auditoria"
            component={Screens.AuditoriaScreen}
            options={{
              drawerLabel: () => null,
              drawerItemStyle: { height: 0 },
            }}
          />

          <Drawer.Screen
            name="AlterarSenha"
            component={Screens.AlterarSenhaScreen}
            options={{
              drawerLabel: () => null,
              drawerItemStyle: { height: 0 },
            }}
          />
        </>
      )}

      {/* Comissões */}
      {hasModulo('comissoes') && (
        <>
          <Drawer.Screen
            name="ComissaoList"
            component={Screens.ComissaoList}
            options={{
              drawerLabel: 'Lista de comissões',
              drawerIcon: ({ color, size }) => (
                <Icon name="list" color={color} size={size} />
              ),
              drawerItemStyle: { height: 0 },
            }}
          />
          <Drawer.Screen
            name="DashComissao"
            component={Screens.DashComissao}
            options={{
              drawerLabel: () => null,
              drawerItemStyle: { height: 0 },
            }}
          />
        </>
      )}

      {/* Ordem de Produção */}
      {hasModulo('OrdemProducao') && (
        <>
          <Drawer.Screen
            name="ListagemOrdensProducao"
            component={Screens.ListagemOrdensProducao}
            options={{
              title: 'Ordens de Produção',
              drawerLabel: () => null,
              drawerItemStyle: { height: 0 },
            }}
          />
          <Drawer.Screen
            name="DetalhesOrdemProducao"
            component={Screens.DetalhesOrdemProducao}
            options={{
              title: 'Detalhes da Ordem',
              drawerLabel: () => null,
              drawerItemStyle: { height: 0 },
            }}
          />
          <Drawer.Screen
            name="CriarOrdemProducao"
            component={Screens.FormOrdemProducao}
            options={{
              title: 'Nova Ordem de Produção',
              drawerLabel: () => null,
              drawerItemStyle: { height: 0 },
            }}
          />
          <Drawer.Screen
            name="EditarOrdemProducao"
            component={Screens.FormOrdemProducao}
            options={{
              title: 'Editar Ordem de Produção',
              drawerLabel: () => null,
              drawerItemStyle: { height: 0 },
            }}
          />

          {/* Telas de Gerencial */}
          <Drawer.Screen
            name="DespesasPrevistas"
            component={Screens.DespesasPrevistas}
            options={{
              title: 'Despesas Previstas',
              drawerLabel: () => null,
              drawerItemStyle: { height: 0 },
            }}
          />
          <Drawer.Screen
            name="LucroPrevisto"
            component={Screens.LucroPrevisto}
            options={{
              title: 'Lucro Previsto',
              drawerLabel: () => null,
              drawerItemStyle: { height: 0 },
            }}
          />
          <Drawer.Screen
            name="FluxoCaixaPrevisto"
            component={Screens.FluxoCaixaPrevisto}
            options={{
              title: 'Fluxo Caixa Previsto',
              drawerLabel: () => null,
              drawerItemStyle: { height: 0 },
            }}
          />
        </>
      )}
    </Drawer.Navigator>
  )
}
