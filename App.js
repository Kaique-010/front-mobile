import React, { useEffect } from 'react'
import { BackHandler, Platform, StatusBar, NativeModules } from 'react-native'
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
import ErrorBoundary from './components/ErrorBoundary'
import Toast from 'react-native-toast-message'
import { NativeBaseProvider } from 'native-base'
import { PaperProvider } from 'react-native-paper'
import { NotificacaoProvider } from './notificacoes/NotificacaoContext'
import MainStackNavigator from './navigation/MainStackNavigator'
import NotificationOverlay from './components/NotificationOverlay'
import { toastConfig } from './config/toastConfig'
// Removido import direto de ScreenOrientation para evitar crash em binários
// que não possuem o módulo nativo; será carregado dinamicamente com guarda

export default function App() {
  useEffect(() => {
    async function setScreenOrientation() {
      try {
        const hasOrientationModule = !!NativeModules.ExpoScreenOrientation
        if (!hasOrientationModule) {
          // Módulo não presente no binário atual; segue sem aplicar lock
          return
        }

        const ScreenOrientation = await import('expo-screen-orientation')

        if (Platform.isTV) {
          await ScreenOrientation.lockAsync(
            ScreenOrientation.OrientationLock.LANDSCAPE
          )
        } else {
          await ScreenOrientation.lockAsync(
            ScreenOrientation.OrientationLock.PORTRAIT_UP
          )
        }
      } catch (err) {
        // Falha ao carregar/aplicar orientação — não bloqueia inicialização
        console.log('[Orientation] módulo indisponível, seguindo sem lock:', err?.message || err)
      }
    }

    setScreenOrientation()
  }, [])

  return (
    <PaperProvider>
      <NativeBaseProvider>
        <NotificacaoProvider
          config={{
            enableWebSocket: false,
            autoRefresh: false,
            interval: 360000,
          }}
        >
          <ErrorBoundary>
            <NavigationContainer>
              <MainStackNavigator />
              <NotificationOverlay />

              <Toast config={toastConfig} />
            </NavigationContainer>
          </ErrorBoundary>
        </NotificacaoProvider>
      </NativeBaseProvider>
    </PaperProvider>
  )
}
