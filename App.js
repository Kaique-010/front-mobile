import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Toast from "react-native-toast-message";
import Login from "./screens/Login";
import SelectEmpresa from "./screens/SelectEmpresa";
import SelectFilial from "./screens/SelectFilial";
import ProdutoForm from "./screens/ProdutoForm";
import EntidadeForm from "./screens/EntidadeForm";
import Entidades from "./screens/Entidades";
import DrawerNavigator from "./navigation/DrawerNavigation";
import PedidosForm from "./screens/PedidosForm";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="SelectEmpresa" component={SelectEmpresa} />
        <Stack.Screen name="SelectFilial" component={SelectFilial} />
        <Stack.Screen
          name="MainApp"
          component={DrawerNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ProdutoForm"
          component={ProdutoForm}
          options={{ title: "Produtos" }}
        />
        <Stack.Screen
          name="PedidosForm"
          component={PedidosForm}
          options={{ title: "Pedidos" }}
        />
        <Stack.Screen
          name="EntidadeForm"
          component={EntidadeForm}
          options={{ title: "Entidades" }}
        />
        <Stack.Screen
          name="Entidades"
          component={Entidades}
          options={{ title: "Entidades" }}
        />
      </Stack.Navigator>
      <Toast />
    </NavigationContainer>
  );
}
