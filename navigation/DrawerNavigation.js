import React, { useState, useEffect } from 'react'
import { createDrawerNavigator } from '@react-navigation/drawer'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Icon from 'react-native-vector-icons/Feather'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { MaterialIcons } from '@expo/vector-icons';
import * as Screens from './screenImports'
import CustomDrawer from './CustomDrawer'

import Home from '../screens/Home'

const Drawer = createDrawerNavigator()

export default function DrawerNavigator() {
  const [modulos, setModulos] = useState([])

  useEffect(() => {
    const fetchModulos = async () => {
      const modulosStorage = await AsyncStorage.getItem('modulos')
      setModulos(modulosStorage ? JSON.parse(modulosStorage) : [])
    }
    fetchModulos()
  }, [])

  const isDemoMode = true // Frisia Menu

  const hasModulo = (mod) => {
    if (!modulos || !Array.isArray(modulos)) {
      return false
    }

    // Se é um array de objetos (formato atual do backend)
    if (modulos.length > 0 && typeof modulos[0] === 'object') {
      const resultado = modulos.some((modulo) => {
        // Verificação mais restritiva para o campo ativo (igual ao CustomDrawer)
        const isAtivo =
          modulo.modu_ativ === true ||
          modulo.modu_ativ === 1 ||
          modulo.modu_ativ === 'S'

        // Verificar por nome ou código do módulo
        const nomeMatch = modulo.modu_nome === mod || modulo.nome === mod
        const codigoMatch = modulo.modu_codi === mod

        const temPermissao = (nomeMatch || codigoMatch) && isAtivo

        if (temPermissao) {
        }

        return temPermissao
      })

      if (!resultado) {
      }

      return resultado
    }

    // Fallback para array de strings (formato antigo)
    const resultado = modulos.includes(mod)

    return resultado
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
          {hasModulo('frisia') && (
            <Drawer.Screen
              name="Dashboard de Contratos"
              component={Screens.DashContratos}
              options={{
                drawerIcon: ({ color, size }) => (
                  <Icon name="bar-chart-2" color={color} size={size} />
                ),
              }}
            />
          )}

          {hasModulo('frisia') && (
            <Drawer.Screen
              name="Painel do Cooperado"
              component={Screens.PainelCooperado}
              options={{
                drawerLabel: () => null,
                drawerItemStyle: { height: 0 },
              }}
            />
          )}
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
              <Drawer.Screen
                name="DashboardFinanceiroGrafico"
                component={Screens.DashboardFinanceiroGrafico}
                options={{
                  drawerLabel: () => null,
                  drawerItemStyle: { height: 0 },
                }}
              />
            </>
          )}

          {/* DRE Caixa */}
          {hasModulo('CaixaDiario') && (
            <>
              <Drawer.Screen
                name="DashDRECaixa"
                component={Screens.DashDRECaixa}
                options={{
                  drawerLabel: () => null,
                  drawerItemStyle: { height: 0 },
                }}
              />
              <Drawer.Screen
                name="MoviCaixa"
                component={Screens.MoviCaixaScreen}
                options={{
                  drawerLabel: () => null,
                  drawerItemStyle: { height: 0 },
                }}
              />
            </>
          )}

          {/* Dashboards de Produtos */}
          {hasModulo('Produtos') && (
            <Drawer.Screen
              name="DashBalanceteEstoque"
              component={Screens.DashBalanceteEstoque}
              options={{
                drawerLabel: () => null,
                drawerItemStyle: { height: 0 },
              }}
            />
          )}

          {/* Dashboards de Pedidos */}
          {hasModulo('Pedidos') && (
            <Drawer.Screen
              name="DashPedidosVenda"
              component={Screens.DashPedidosVenda}
              options={{
                drawerLabel: () => null,
                drawerItemStyle: { height: 0 },
              }}
            />
          )}

          {/* Dashboards de Vendas */}
          {hasModulo('Vendas') && (
            <>
              <Drawer.Screen
                name="Dashvendas"
                component={Screens.Dashvendas}
                options={{
                  drawerLabel: () => null,
                  drawerItemStyle: { height: 0 },
                }}
              />
              <Drawer.Screen
                name="DashExtratoCaixa"
                component={Screens.DashExtratoCaixa}
                options={{
                  drawerLabel: () => null,
                  drawerItemStyle: { height: 0 },
                }}
              />
              <Drawer.Screen
                name="DashContratos"
                component={Screens.DashContratos}
                options={{
                  drawerLabel: () => null,
                  drawerItemStyle: { height: 0 },
                }}
              />
              <Drawer.Screen
                name="DashPedidosVendaGrafico"
                component={Screens.DashPedidosVendaGrafico}
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
              component={Screens.DashboardFinanceiro}
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
            <>
              <Drawer.Screen
                name="Entidades"
                component={Screens.Entidades}
                options={{
                  drawerLabel: () => null,
                  drawerItemStyle: { height: 0 },
                }}
              />
              <Drawer.Screen
                name="EntidadeForm"
                component={Screens.EntidadeForm}
                options={{
                  drawerLabel: () => null,
                  drawerItemStyle: { height: 0 },
                }}
              />
            </>
          )}

          {hasModulo('Produtos') && (
            <>
              <Drawer.Screen
                name="Produtos"
                component={Screens.Produtos}
                options={{
                  drawerLabel: () => null,
                  drawerItemStyle: { height: 0 },
                }}
              />
              <Drawer.Screen
                name="ProdutoForm"
                component={Screens.ProdutoForm}
                options={{
                  drawerLabel: () => null,
                  drawerItemStyle: { height: 0 },
                }}
              />
              <Drawer.Screen
                name="ProdutoPrecos"
                component={Screens.ProdutoPrecos}
                options={{
                  drawerLabel: () => null,
                  drawerItemStyle: { height: 0 },
                }}
              />
            </>
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

          {/* Entradas de Estoque */}
          {hasModulo('Entradas_Estoque') && (
            <>
              <Drawer.Screen
                name="EntradasEstoque"
                component={Screens.EntradasEstoque}
                options={{
                  drawerLabel: () => null,
                  drawerItemStyle: { height: 0 },
                }}
              />
              <Drawer.Screen
                name="EntradasForm"
                component={Screens.EntradasForm}
                options={{
                  drawerLabel: () => null,
                  drawerItemStyle: { height: 0 },
                }}
              />
            </>
          )}

          {hasModulo('Saidas_Estoque') && (
            <>
              <Drawer.Screen
                name="SaidasEstoque"
                component={Screens.SaidasEstoque}
                options={{
                  drawerLabel: () => null,
                  drawerItemStyle: { height: 0 },
                }}
              />
              <Drawer.Screen
                name="SaidasForm"
                component={Screens.SaidasForm}
                options={{
                  drawerLabel: () => null,
                  drawerItemStyle: { height: 0 },
                }}
              />
            </>
          )}

          {hasModulo('listacasamento') && (
            <>
              <Drawer.Screen
                name="Lista de Casamento"
                component={Screens.ListaCasamento}
                options={{
                  drawerLabel: () => null,
                  drawerItemStyle: { height: 0 },
                }}
              />
              <Drawer.Screen
                name="ListaCasamento"
                component={Screens.ListaCasamento}
                options={{
                  drawerLabel: () => null,
                  drawerItemStyle: { height: 0 },
                }}
              />
              <Drawer.Screen
                name="ListaCasamentoForm"
                component={Screens.ListaCasamentoForm}
                options={{
                  drawerLabel: () => null,
                  drawerItemStyle: { height: 0 },
                }}
              />
              <Drawer.Screen
                name="ItensListaModal"
                component={Screens.ItensListaModal}
                options={{
                  drawerLabel: () => null,
                  drawerItemStyle: { height: 0 },
                }}
              />
            </>
          )}

          {hasModulo('Orcamentos') && (
            <>
              <Drawer.Screen
                name="Orcamentos"
                component={Screens.Orcamentos}
                options={{
                  drawerLabel: () => null,
                  drawerItemStyle: { height: 0 },
                }}
              />
              <Drawer.Screen
                name="OrcamentosForm"
                component={Screens.OrcamentosForm}
                options={{
                  drawerLabel: () => null,
                  drawerItemStyle: { height: 0 },
                }}
              />
            </>
          )}

          {hasModulo('Pedidos') && (
            <>
              <Drawer.Screen
                name="Pedidos"
                component={Screens.Pedidos}
                options={{
                  drawerLabel: () => null,
                  drawerItemStyle: { height: 0 },
                }}
              />
              <Drawer.Screen
                name="PedidosForm"
                component={Screens.PedidosForm}
                options={{
                  drawerLabel: () => null,
                  drawerItemStyle: { height: 0 },
                }}
              />
            </>
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

          {hasModulo('frisia') && (
            <Drawer.Screen
              name="Dashboard de Contratos"
              component={Screens.DashContratos}
              options={{
                drawerIcon: ({ color, size }) => (
                  <Icon name="bar-chart-2" color={color} size={size} />
                ),
              }}
            />
          )}

          {hasModulo('frisia') && (
            <Drawer.Screen
              name="Painel do Cooperado"
              component={Screens.PainelCooperado}
              options={{
                drawerLabel: () => null,
                drawerItemStyle: { height: 0 },
              }}
            />
          )}

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

          {/* Telas de Parâmetros Admin */}
          {hasModulo('parametros_admin') && (
            <>
              <Drawer.Screen
                name="SistemaPermissoes"
                component={Screens.SistemaPermissoes}
                options={{
                  drawerLabel: () => null,
                  drawerItemStyle: { height: 0 },
                }}
              />
              <Drawer.Screen
                name="ParametrosMenu"
                component={Screens.ParametrosMenu}
                options={{
                  drawerLabel: () => null,
                  drawerItemStyle: { height: 0 },
                }}
              />
            </>
          )}
        </>
      )}

      {/* Comissões */}
      {hasModulo('SpsComissoes') && (
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
        </>
      )}

      {/* Telas de Gerencial */}
      {hasModulo('Gerencial') && (
        <>
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
