// App.js COMPLETO ATUALIZADO
import React, { useEffect } from 'react'
import { BackHandler, Platform, StatusBar, NativeModules } from 'react-native'
import { LogBox } from 'react-native'
LogBox.ignoreLogs(['Warning: ...'])
LogBox.ignoreAllLogs()

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
import { AuthProvider } from './contexts/AuthContext'
import MainStackNavigator from './navigation/MainStackNavigator'
import NotificationOverlay from './components/NotificationOverlay'
import { toastConfig } from './config/toastConfig'
import AsyncStorage from '@react-native-async-storage/async-storage'
import database from './componentsOrdemServico/schemas/database'
import schema from './componentsOrdemServico/schemas/schemas'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

export default function App() {
  console.log('[Boot] App montou')

  // ✅ SUBSTITUIR O useEffect DE INICIALIZAÇÃO
  useEffect(() => {
    async function checkDatabaseVersion() {
      try {
        const currentVersion = schema.version
        const storedVersion = await AsyncStorage.getItem('db_version')

        if (storedVersion !== String(currentVersion)) {
          console.log(
            `[DB] Versão mudou: ${
              storedVersion || 'nenhuma'
            } → ${currentVersion}`
          )
          console.log('[DB] Resetando banco...')

          await database.write(async () => {
            await database.unsafeResetDatabase()
          })

          await AsyncStorage.setItem('db_version', String(currentVersion))
          console.log(`[DB] ✅ Banco resetado para v${currentVersion}`)
        } else {
          console.log(`[DB] ✅ Já está na v${currentVersion}`)
        }
      } catch (err) {
        console.error('[DB] ❌ Erro:', err?.message || err)
      }
    }
    checkDatabaseVersion()
  }, [])

  // ❌ REMOVER ESTE useEffect ANTIGO:
  // useEffect(() => {
  //   async function initDatabaseIfNeeded() { ... }
  //   initDatabaseIfNeeded()
  // }, [])

  // ... resto do código permanece igual
  useEffect(() => {
    async function setScreenOrientation() {
      try {
        const hasOrientationModule = !!NativeModules.ExpoScreenOrientation
        if (!hasOrientationModule) {
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
        console.log(
          '[Orientation] módulo indisponível, seguindo sem lock:',
          err?.message || err
        )
      }
    }

    setScreenOrientation()
  }, [])

  useEffect(() => {
    async function sqliteSanityCheck() {
      try {
        const key = 'db_sanity_v1'
        const done = await AsyncStorage.getItem(key)
        if (done) {
          return
        }
        const col = database.collections.get('fila_sincronizacao')
        const rows = await col.query().fetch()
        console.log('[DB Sanity] itens na fila_sincronizacao:', rows.length)
        await AsyncStorage.setItem(key, '1')
      } catch (err) {
        console.log('[DB Sanity] erro:', err?.message || err)
      }
    }
    sqliteSanityCheck()
  }, [])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <PaperProvider>
          <NativeBaseProvider>
            <NotificacaoProvider
              config={{
                enableWebSocket: false,
                autoRefresh: false,
                interval: 360000,
              }}>
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
      </AuthProvider>
    </GestureHandlerRootView>
  )
}
