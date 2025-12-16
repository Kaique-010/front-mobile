import React from 'react'
import { useContextoApp } from '../hooks/useContextoApp'
import DrawerNavigation from './DrawerNavigation'
import DrawerNavigationFrisia from '../componentsFrisia/DrawerNavigationFrisia'

const AppNavigator = () => {
  const { hasModulo, carregando } = useContextoApp()

  // Enquanto carrega, não renderiza nada
  if (carregando) {
    return null
  }

  // Se tem módulo frisia, usa o drawer específico da Frisia
  if (hasModulo('frisia')) {
    return <DrawerNavigationFrisia />
  }

  // Caso contrário, usa o drawer padrão
  return <DrawerNavigation />
}

export default AppNavigator
