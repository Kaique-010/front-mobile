import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useContextoApp } from '../hooks/useContextoApp';
import CustomDrawerFrisia from './CustomDrawerFrisia';

// Screens
import Home from '../screens/Home';
import PainelCooperado from '../screens/PainelCooperado';
import Dashvendas from '../screens/Dashvendas';

const Drawer = createDrawerNavigator();

const DrawerNavigationFrisia = () => {
  const { hasModulo } = useContextoApp();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerFrisia {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: '#2c3e50',
          width: 280,
        },
        drawerActiveTintColor: '#3498db',
        drawerInactiveTintColor: '#bdc3c7',
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '500',
        },
      }}
    >
      {/* Home Screen */}
      <Drawer.Screen
        name="Home"
        component={Home}
        options={{
          drawerLabel: null,
          drawerItemStyle: { height: 0 },
        }}
      />

      {/* Painel do Cooperado - Conditional */}
      {hasModulo('frisia') && (
        <Drawer.Screen
          name="PainelCooperado"
          component={PainelCooperado}
          options={{
            drawerLabel: null,
            drawerItemStyle: { height: 0 },
          }}
        />
      )}

      {/* Dashvendas - Conditional */}
      {hasModulo('frisia') && (
        <Drawer.Screen
          name="Dashvendas"
          component={Dashvendas}
          options={{
            drawerLabel: null,
            drawerItemStyle: { height: 0 },
          }}
        />
      )}
    </Drawer.Navigator>
  );
};

export default DrawerNavigationFrisia;