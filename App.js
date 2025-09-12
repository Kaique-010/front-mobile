import React, { useEffect } from 'react'
import { BackHandler, Platform } from 'react-native'
import { LogBox } from 'react-native'
LogBox.ignoreLogs(['Warning: ...'])
LogBox.ignoreAllLogs()

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
import * as ScreenOrientation from 'expo-screen-orientation'

export default function App() {
  useEffect(() => {
    async function setScreenOrientation() {
      if (Platform.isTV) {
        // CORREÇÃO: O valor correto é LANDSCAPE
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.LANDSCAPE
        )
      } else {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT_UP
        )
      }
    }

    setScreenOrientation()
  }, [])

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
