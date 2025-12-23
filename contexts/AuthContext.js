import React, { createContext, useState, useEffect, useContext } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import NetInfo from '@react-native-community/netinfo'
import {
  checkAndSyncMegaData,
  startSyncLoop,
  stopSyncLoop,
  startNetInfoBridge,
} from '../componentsOrdemServico/services/syncService'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isOfflineMode, setIsOfflineMode] = useState(false)

  useEffect(() => {
    loadStorageData()
    startNetInfoBridge()

    // Monitor network status
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOfflineMode(!state.isConnected)
      console.log(
        `📡 [Auth] Network: ${state.isConnected ? 'Online' : 'Offline'}`
      )
    })

    return () => {
      stopSyncLoop()
      unsubscribe()
    }
  }, [])

  const loadStorageData = async () => {
    try {
      console.log('🔄 [Auth] Loading stored session...')

      // Check for saved session
      const [token, userData, userType, slug, docu] =
        await AsyncStorage.multiGet([
          'access',
          'usuario',
          'userType',
          'slug',
          'docu',
        ])

      if (token[1] && userData[1]) {
        console.log('✅ [Auth] Session found in storage')

        // Parse user data
        const parsedUser = JSON.parse(userData[1])

        // Reconstruct full user object
        const fullUserData = {
          ...parsedUser,
          token: token[1],
          type: userType[1] || 'funcionario',
          slug: slug[1],
          docu: docu[1],
        }

        setUser(fullUserData)

        // Start Sync Loop
        startSyncLoop()

        // Trigger background sync for Mega Data (respecting 12h cache)
        checkAndSyncMegaData().catch((err) => {
          console.error('[Auth] Sync error:', err)
        })
      } else {
        console.log('ℹ️ [Auth] No session found')
      }
    } catch (error) {
      console.error('❌ [Auth] Error loading session:', error)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (sessionData) => {
    try {
      console.log('🔐 [Auth] Signing in...', {
        username: sessionData.username,
        userType: sessionData.userType,
        isOffline: sessionData.isOffline,
      })

      // Validate required data
      if (!sessionData.access || !sessionData.usuario) {
        throw new Error('Invalid session data: missing access or usuario')
      }

      // Save ALL session data to AsyncStorage (critical for offline mode)
      const storageData = [
        ['access', sessionData.access],
        ['refresh', sessionData.refresh],
        ['usuario', JSON.stringify(sessionData.usuario)],
        ['usuario_id', sessionData.usuario_id?.toString() || ''],
        ['username', sessionData.username || ''],
        ['setor', sessionData.setor || ''],
        ['docu', sessionData.docu || ''],
        ['slug', sessionData.slug || ''],
        ['modulos', JSON.stringify(sessionData.modulos || [])],
        ['userType', sessionData.userType || 'funcionario'],
      ]

      await AsyncStorage.multiSet(storageData)
      console.log('✅ [Auth] Session data saved to AsyncStorage')

      // Build complete user object
      const fullUserData = {
        ...sessionData.usuario,
        token: sessionData.access,
        type: sessionData.userType || 'funcionario',
        slug: sessionData.slug,
        docu: sessionData.docu,
        modulos: sessionData.modulos,
        isOffline: sessionData.isOffline || false,
      }

      // Update state
      setUser(fullUserData)
      console.log('✅ [Auth] User state updated')

      // Only start sync if online
      if (!sessionData.isOffline) {
        console.log('🔄 [Auth] Starting sync loop...')
        startSyncLoop()

        // Trigger Mega Data sync
        checkAndSyncMegaData().catch((err) => {
          console.error('[Auth] Sync error:', err)
        })
      } else {
        console.log('📴 [Auth] Offline mode - skipping sync')
      }

      return true
    } catch (error) {
      console.error('❌ [Auth] Error in signIn:', error)
      return false
    }
  }

  const signOut = async () => {
    try {
      console.log('🚪 [Auth] Signing out...')

      stopSyncLoop()

      // Clear all auth-related data
      await AsyncStorage.multiRemove([
        'access',
        'refresh',
        'usuario',
        'usuario_id',
        'username',
        'setor',
        'docu',
        'slug',
        'modulos',
        'userType',
        'last_password', // Also clear saved password
      ])

      setUser(null)
      console.log('✅ [Auth] Signed out successfully')
    } catch (error) {
      console.error('❌ [Auth] Error signing out:', error)
    }
  }

  // Helper to check if user is authenticated
  const isAuthenticated = () => {
    return !!user && !!user.token
  }

  // Helper to refresh session data (useful for offline recovery)
  const refreshSession = async () => {
    console.log('🔄 [Auth] Refreshing session...')
    await loadStorageData()
  }

  return (
    <AuthContext.Provider
      value={{
        signed: !!user,
        user,
        loading,
        signIn,
        signOut,
        isOfflineMode,
        isAuthenticated,
        refreshSession,
      }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
