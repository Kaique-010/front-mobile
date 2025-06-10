import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import Toast, { BaseToast } from 'react-native-toast-message'
import Login from './screens/Login'
import SelectEmpresa from './screens/SelectEmpresa'
import SelectFilial from './screens/SelectFilial'
import ProdutoForm from './screens/ProdutoForm'
import ProdutoPrecos from './componetsProdutos/ProdutoPrecos'
import EntidadeForm from './screens/EntidadeForm'
import Entidades from './screens/Entidades'
import DrawerNavigator from './navigation/DrawerNavigation'
import PedidosForm from './screens/PedidosForm'
import OrcamentosForm from './screens/OrcamentosForm'
import ListaCasamentoForm from './screens/ListaCasamentoForm'
import ItensListaModal from './screens/ItensListaModal'
import EntradasForm from './screens/EntradasForm'
import SaidasForm from './screens/SaidasForm'
import ImplantacaoForm from './screens/ImplantacaoForm'
import ContasPagarList from './screens/ContasPagarList'
import ContasReceberList from './screens/ContasReceberList'
import ContaPagarForm from './componentsContaPagar/ContaPagarForm'
import ContratosForm from './screens/ContratosForm'
import ContratosList from './screens/Contratos'
import PainelAcompanhamento from './screens/PainelOs'
import OrdemDetalhe from './screens/OrdemDetalhe'
import MoviCaixaScreen from './screens/MoviCaixa'
import OSCreateScreen from './componentsOs/OsCriacao'
import OsDetalhe from './screens/OSDetalhe'
import CriarOrdemServico from './componentsOrdemServico/OrdemCriacao'

const Stack = createNativeStackNavigator()

const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#10a2a7' }}
      contentContainerStyle={{ backgroundColor: '#1a2f3d' }}
      text1Style={{ color: '#fff' }}
      text2Style={{ color: '#ddd' }}
    />
  ),
  error: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#ff0000' }}
      contentContainerStyle={{ backgroundColor: '#1a2f3d' }}
      text1Style={{ color: '#fff' }}
      text2Style={{ color: '#ddd' }}
    />
  ),
  warning: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#ffcc00' }}
      contentContainerStyle={{ backgroundColor: '#1a2f3d' }}
      text1Style={{ color: '#fff' }}
      text2Style={{ color: '#ddd' }}
    />
  ),
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SelectEmpresa"
          component={SelectEmpresa}
          options={{
            title: 'Seleção de Empresa',
            headerStyle: { backgroundColor: '#182c39' },
            headerTintColor: '#ff0000',
            headerTitleStyle: { color: '#faebd7' },
          }}
        />
        <Stack.Screen
          name="SelectFilial"
          component={SelectFilial}
          options={{
            title: 'Seleção de Filial',
            headerStyle: { backgroundColor: '#182c39' },
            headerTintColor: '#ff0000',
            headerTitleStyle: { color: '#faebd7' },
          }}
        />
        <Stack.Screen
          name="MainApp"
          component={DrawerNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ProdutoForm"
          component={ProdutoForm}
          options={{
            title: 'Produtos',
            headerStyle: { backgroundColor: '#182c39' },
            headerTintColor: '#ff0000',
            headerTitleStyle: { color: '#faebd7' },
          }}
        />
        <Stack.Screen
          name="ProdutoPrecos"
          component={ProdutoPrecos}
          options={{
            title: 'Preços dos Itens',
            headerStyle: { backgroundColor: '#182c39' },
            headerTintColor: '#ff0000',
            headerTitleStyle: { color: '#faebd7' },
          }}
        />
        <Stack.Screen
          name="MoviCaixa"
          component={MoviCaixaScreen}
          options={{
            title: 'Movimentações de Caixa',
            headerStyle: { backgroundColor: '#182c39' },
            headerTintColor: '#ff0000',
            headerTitleStyle: { color: '#faebd7' },
          }}
        />
        <Stack.Screen
          name="PedidosForm"
          component={PedidosForm}
          options={{
            title: 'Pedido de Venda',
            headerStyle: { backgroundColor: '#182c39' },
            headerTintColor: '#ff0000',
            headerTitleStyle: { color: '#faebd7' },
          }}
        />
        <Stack.Screen
          name="OrcamentosForm"
          component={OrcamentosForm}
          options={{
            title: 'Orçamentos',
            headerStyle: { backgroundColor: '#182c39' },
            headerTintColor: '#ff0000',
            headerTitleStyle: { color: '#faebd7' },
          }}
        />
        <Stack.Screen
          name="EntidadeForm"
          component={EntidadeForm}
          options={{
            title: 'Entidades',
            headerStyle: { backgroundColor: '#182c39' },
            headerTintColor: '#ff0000',
            headerTitleStyle: { color: '#faebd7' },
          }}
        />
        <Stack.Screen
          name="ContasPagarList"
          component={ContasPagarList}
          options={{
            title: 'Contas a Pagar',
            headerStyle: { backgroundColor: '#182c39' },
            headerTintColor: '#ff0000',
            headerTitleStyle: { color: '#faebd7' },
          }}
        />
        <Stack.Screen
          name="ContaPagarForm"
          component={ContaPagarForm}
          options={{
            title: 'Cadastro de Conta a Pagar',
            headerStyle: { backgroundColor: '#182c39' },
            headerTintColor: '#ff0000',
            headerTitleStyle: { color: '#faebd7' },
          }}
        />
        <Stack.Screen
          name="ContasReceberList"
          component={ContasReceberList}
          options={{
            title: 'Contas a receber',
            headerStyle: { backgroundColor: '#182c39' },
            headerTintColor: '#ff0000',
            headerTitleStyle: { color: '#faebd7' },
          }}
        />
        <Stack.Screen
          name="Entidades"
          component={Entidades}
          options={{ title: 'Entidades' }}
        />
        <Stack.Screen
          name="Contratos"
          component={ContratosList}
          options={{
            title: 'Lista de Contratos',
            headerStyle: { backgroundColor: '#182c39' },
            headerTintColor: '#ff0000',
            headerTitleStyle: { color: '#faebd7' },
          }}
        />
        <Stack.Screen
          name="ListaCasamentoForm"
          component={ListaCasamentoForm}
          options={{
            title: 'Lista de Casamento',
            headerStyle: { backgroundColor: '#182c39' },
            headerTintColor: '#ff0000',
            headerTitleStyle: { color: '#faebd7' },
          }}
        />
        <Stack.Screen
          name="ItensListaModal"
          component={ItensListaModal}
          options={{
            title: 'Adicionar Itens à Lista',
            headerStyle: { backgroundColor: '#182c39' },
            headerTintColor: '#ff0000',
            headerTitleStyle: { color: '#faebd7' },
          }}
        />
        <Stack.Screen
          name="EntradasForm"
          component={EntradasForm}
          options={{
            title: 'Entradas de Estoque',
            headerStyle: { backgroundColor: '#182c39' },
            headerTintColor: '#ff0000',
            headerTitleStyle: { color: '#faebd7' },
          }}
        />
        <Stack.Screen
          name="PainelAcompanhamento"
          component={PainelAcompanhamento}
          options={{ title: 'Painel OS' }}
        />
        <Stack.Screen
          name="OrdemDetalhe"
          component={OrdemDetalhe}
          options={{
            title: 'Detalhes da OS',
            headerStyle: { backgroundColor: '#182c39' },
            headerTintColor: '#ff0000',
            headerTitleStyle: { color: '#faebd7' },
          }}
        />
        <Stack.Screen
          name="OsDetalhe"
          component={OsDetalhe}
          options={{
            title: 'Detalhes da O.S',
            headerStyle: { backgroundColor: '#182c39' },
            headerTintColor: '#ff0000',
            headerTitleStyle: { color: '#faebd7' },
          }}
        />
        <Stack.Screen
          name="OsCriacao"
          component={OSCreateScreen}
          options={{
            title: 'Abertura O.S',
            headerStyle: { backgroundColor: '#182c39' },
            headerTintColor: '#ff0000',
            headerTitleStyle: { color: '#faebd7' },
          }}
        />
        <Stack.Screen
          name="OrdemCriacao"
          component={CriarOrdemServico}
          options={{
            title: 'Abertura O.S',
            headerStyle: { backgroundColor: '#182c39' },
            headerTintColor: '#ff0000',
            headerTitleStyle: { color: '#faebd7' },
          }}
        />
        <Stack.Screen
          name="SaidasForm"
          component={SaidasForm}
          options={{
            title: 'Saidas de Estoque',
            headerStyle: { backgroundColor: '#182c39' },
            headerTintColor: '#ff0000',
            headerTitleStyle: { color: '#faebd7' },
          }}
        />
        <Stack.Screen
          name="ImplantacaoForm"
          component={ImplantacaoForm}
          options={{
            title: 'Roteiro de Implantação',
            headerStyle: { backgroundColor: '#182c39' },
            headerTintColor: '#ff0000',
            headerTitleStyle: { color: '#faebd7' },
          }}
        />
        <Stack.Screen
          name="ContratosForm"
          component={ContratosForm}
          options={{
            title: 'Contratos de Venda',
            headerStyle: { backgroundColor: '#182c39' },
            headerTintColor: '#ff0000',
            headerTitleStyle: { color: '#faebd7' },
          }}
        />
      </Stack.Navigator>
      <Toast config={toastConfig} />
    </NavigationContainer>
  )
}
