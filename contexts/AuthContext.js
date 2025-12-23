import React, { createContext, useState, useEffect, useContext } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { 
  checkAndSyncMegaData, 
  startSyncLoop, 
  stopSyncLoop, 
  startNetInfoBridge 
} from '../componentsOrdemServico/services/syncService'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isOfflineMode, setIsOfflineMode] = useState(false)

  useEffect(() => {
    loadStorageData()
    startNetInfoBridge()
    return () => stopSyncLoop()
  }, [])

  const loadStorageData = async () => {
    try {
      // Check for saved session
      const [token, userData, userType] = await AsyncStorage.multiGet([
        'access',
        'usuario',
        'userType'
      ])

      if (token[1] && userData[1]) {
        // We have a session
        const parsedUser = JSON.parse(userData[1])
        setUser({
          ...parsedUser,
          token: token[1],
          type: userType[1] || 'funcionario'
        })
        
        // Start Sync Loop
        startSyncLoop()

        // Trigger background sync for Mega Data (respecting 12h cache)
        checkAndSyncMegaData().catch(console.error)
      }
    } catch (error) {
      console.log('[Auth] Error loading session:', error)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (data) => {
    // data should contain: access, refresh, usuario, etc.
    setUser(data.usuario)
    
    // Start Sync Loop
    startSyncLoop()

    // Trigger Sync
    checkAndSyncMegaData().catch(console.error)
  }

  const signOut = async () => {
    try {
      stopSyncLoop()
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
        'userType'
      ])
      setUser(null)
    } catch (error) {
      console.error('[Auth] Error signing out:', error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        signed: !!user,
        user,
        loading,
        signIn,
        signOut,
        isOfflineMode
      }}
    >
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
