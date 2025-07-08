import React from 'react'
import { BackHandler } from 'react-native'

// Polyfill for BackHandler compatibility
if (!BackHandler.removeEventListener) {
  BackHandler.removeEventListener = (eventType, handler) => {
    const subscription = BackHandler.addEventListener(eventType, handler)
    return () => subscription?.remove()
  }
}

import { NavigationContainer } from '@react-navigation/native'
import Toast from 'react-native-toast-message'
import { NativeBaseProvider } from 'native-base'
import { NotificacaoProvider } from './notificacoes/NotificacaoContext'
import MainStackNavigator from './navigation/MainStackNavigator'
import NotificationOverlay from './components/NotificationOverlay'
import { toastConfig } from './config/toastConfig'

export default function App() {
  return (
    <NativeBaseProvider>
      <NotificacaoProvider>
        <NavigationContainer>
          <MainStackNavigator />
          <NotificationOverlay />

          <Toast config={toastConfig} />
        </NavigationContainer>
      </NotificacaoProvider>
    </NativeBaseProvider>
  )
}
