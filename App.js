import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "./screens/Login";
import ProdutoForm from "./screens/ProdutoForm";
import EntidadeForm from "./screens/EntidadeForm";
import DrawerNavigator from "./navigation/DrawerNavigation";

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
          name="EntidadeForm"
          component={EntidadeForm}
          options={{ title: "Entidades" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
