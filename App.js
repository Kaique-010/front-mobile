import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import Toast from 'react-native-toast-message'
import { NotificacaoProvider } from './notificacoes/NotificacaoContext'
import MainStackNavigator from './navigation/MainStackNavigator'
import NotificationOverlay from './components/NotificationOverlay'
import { toastConfig } from './config/toastConfig'

export default function App() {
  return (
    <NotificacaoProvider>
      <NavigationContainer>
        <MainStackNavigator />
        <NotificationOverlay />

        <Toast config={toastConfig} />
      </NavigationContainer>
    </NotificacaoProvider>
  )
}
