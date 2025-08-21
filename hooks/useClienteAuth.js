import { useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation } from '@react-navigation/native'
import { BASE_URL } from '../utils/api'

const useClienteAuth = () => {
  const [cliente, setCliente] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigation = useNavigation()

  // Carregar dados do cliente do AsyncStorage
  const loadClienteData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const session_id = await AsyncStorage.getItem('session_id')
      const cliente_nome = await AsyncStorage.getItem('cliente_nome')
      const documento = await AsyncStorage.getItem('documento')
      const cliente_id = await AsyncStorage.getItem('cliente_id')
      const banco = await AsyncStorage.getItem('banco')

      if (session_id && cliente_nome) {
        setCliente({
          session_id,
          cliente_nome,
          documento,
          cliente_id: cliente_id ? parseInt(cliente_id, 10) : null,
          banco,
        })
      } else {
        setCliente(null)
      }
    } catch (error) {
      console.error('Erro ao carregar dados do cliente:', error)
      setError('Falha ao carregar dados do cliente')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadClienteData()
  }, [loadClienteData])

  // Login simplificado
  const login = async (documento, usuario, senha) => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔐 [AUTH] Login cliente:', { documento, usuario })

      const response = await fetch(`${BASE_URL}/api/casaa/entidades/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documento, usuario, senha }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.erro || 'Erro no login')
      }

      const data = await response.json()
      console.log('🔐 [AUTH] Login sucesso:', data.session_id)

      // Salvar dados da sessão
      await AsyncStorage.multiSet([
        ['session_id', data.session_id],
        ['cliente_id', data.cliente_id.toString()],
        ['cliente_nome', data.cliente_nome],
        ['documento', data.documento],
        ['banco', data.banco],
        ['userType', 'cliente'],
      ])

      setCliente(data)
      return true
    } catch (error) {
      console.error('🔐 [AUTH] Erro:', error)
      setError(error.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Logout
  const logout = async () => {
    try {
      await AsyncStorage.multiRemove([
        'session_id', 'documento', 'userType',
        'cliente_id', 'cliente_nome', 'banco'
      ])
      setCliente(null)
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] })
    } catch (error) {
      console.error('Erro logout:', error)
    }
  }

  const isAuthenticated = !!cliente?.session_id

  return {
    cliente,
    loading,
    error,
    login,
    logout,
    isAuthenticated,
    refreshClienteData: loadClienteData,
  }
}

export default useClienteAuth
