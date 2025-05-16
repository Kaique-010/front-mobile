import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import Toast from 'react-native-toast-message'
import Login from './screens/Login'
import SelectEmpresa from './screens/SelectEmpresa'
import SelectFilial from './screens/SelectFilial'
import ProdutoForm from './screens/ProdutoForm'
import EntidadeForm from './screens/EntidadeForm'
import Entidades from './screens/Entidades'
import DrawerNavigator from './navigation/DrawerNavigation'
import PedidosForm from './screens/PedidosForm'
import ListaCasamentoForm from './screens/ListaCasamentoForm'
import ItensListaModal from './screens/ItensListaModal'
import EntradasForm from './screens/EntradasForm'
import SaidasForm from './screens/SaidasForm'

const Stack = createNativeStackNavigator()

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
          name="Entidades"
          component={Entidades}
          options={{ title: 'Entidades' }}
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
          name="SaidasForm"
          component={SaidasForm}
          options={{
            title: 'Saidas de Estoque',
            headerStyle: { backgroundColor: '#182c39' },
            headerTintColor: '#ff0000',
            headerTitleStyle: { color: '#faebd7' },
          }}
        />
      </Stack.Navigator>
      <Toast />
    </NavigationContainer>
  )
}
