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
import { AuthProvider } from './contexts/AuthContext'
import MainStackNavigator from './navigation/MainStackNavigator'
import NotificationOverlay from './components/NotificationOverlay'
import { toastConfig } from './config/toastConfig'
import AsyncStorage from '@react-native-async-storage/async-storage'
import database from './componentsOrdemServico/schemas/database'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

export default function App() {
  console.log('[Boot] App montou')
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
        console.log(
          '[Orientation] módulo indisponível, seguindo sem lock:',
          err?.message || err
        )
      }
    }

    setScreenOrientation()
  }, [])

  useEffect(() => {
    async function initDatabaseIfNeeded() {
      try {
        const key = 'db_initialized_v4'
        const initialized = await AsyncStorage.getItem(key)
        if (!initialized) {
          console.log('[DB Init] flag ausente, iniciando reset do banco...')
          await database.write(async () => {
            await database.unsafeResetDatabase()
          })
          console.log('[DB Init] reset concluído, salvando flag...')
          await AsyncStorage.setItem(key, '1')
          console.log('[DB Init] banco inicializado com sucesso (v3)')
        } else {
          console.log('[DB Init] flag encontrada, não será feito reset')
        }
      } catch (err) {
        console.log(
          '[DB Init] falha ao inicializar banco:',
          err?.message || err
        )
      }
    }
    initDatabaseIfNeeded()
  }, [])

  useEffect(() => {
    async function sqliteSanityCheck() {
      try {
        const key = 'db_sanity_v1'
        const done = await AsyncStorage.getItem(key)
        if (done) {
          return
        }
        await database.write(async () => {
          const col = database.collections.get('fila_sincronizacao')
          await col.create((r) => {
            r.acao = 'TEST'
            r.tabelaAlvo = 'sanity'
            r.registroIdLocal = `sanity-${Date.now()}`
            r.payloadJson = JSON.stringify({ ok: true })
            r.tentativas = 0
            r.criadoEm = Date.now()
          })
        })
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
