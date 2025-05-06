import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import Home from "../screens/Home";
import Produtos from "../screens/Produtos";
import Pedidos from "../screens/Pedidos";
import CustomDrawer from "./CustomDrawer";
import Icon from "react-native-vector-icons/Feather";
import Entidades from "../screens/Entidades";
import ListaCasamento from "../screens/ListaCasamento";

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: "#222" },
        headerTintColor: "#fff",
        drawerStyle: { backgroundColor: "#333" },
        drawerLabelStyle: { color: "#fff", fontSize: 15 },
      }}
    >
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
        name="Entidades"
        component={Entidades}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="users" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="Lista de Casamento"
        component={ListaCasamento}
        options={{
          drawerLabel: "Lista de Casamento",
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="ring" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="Pedidos"
        component={Pedidos}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="shopping-cart" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="Produtos"
        component={Produtos}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="box" color={color} size={size} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}
