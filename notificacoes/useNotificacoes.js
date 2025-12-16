import { useState, useEffect, useCallback, useRef } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AppState } from 'react-native'
import Service from './Service'
import websocketService from './websocketService'

export const useNotificacoes = ({ 
  enableWebSocket = false,  // ← Controla WebSocket
  autoRefresh = false,      // ← Controla polling
  interval = 60000 
} = {}) => {
  const [notificacoes, setNotificacoes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [contadorNaoLidas, setContadorNaoLidas] = useState(0)
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null)

  const intervalRef = useRef(null)
  const isAuthenticated = useRef(false)

  const carregarNotificacoes = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const dados = await Service.listarNotificacoes()
      setNotificacoes(dados)

      const naoLidas = dados.filter((n) => !n.lida).length
      setContadorNaoLidas(naoLidas)
      setUltimaAtualizacao(new Date())
      
      console.log('✅ Notificações carregadas:', {
        total: dados.length,
        naoLidas,
        ultimaAtualizacao: new Date().toLocaleTimeString()
      })
    } catch (err) {
      const errorMessage = err.message || 'Erro desconhecido ao carregar notificações'
      setError(errorMessage)
      
      // Log mais detalhado para diferentes tipos de erro
      if (err.message?.includes('404')) {
        console.error('❌ Endpoint de notificações não encontrado. Verifique se o módulo está ativo no backend.')
      } else if (err.message?.includes('401') || err.message?.includes('Não autorizado')) {
        console.error('❌ Token de acesso inválido ou expirado.')
      } else if (err.message?.includes('Slug')) {
        console.error('❌ Problema com dados de login/empresa.')
      } else {
        console.error('❌ Erro ao carregar notificações:', err)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const marcarComoLida = useCallback(async (id) => {
    try {
      await Service.marcarComoLida(id)
      setNotificacoes((prev) => prev.filter((notif) => notif.id !== id))
      setContadorNaoLidas((prev) => Math.max(0, prev - 1))
    } catch (err) {
      setError(err.message)
      console.error('Erro ao marcar como lida:', err)
    }
  }, [])

  // ========== WebSocket CONDICIONAL ==========
  // Só ativa se enableWebSocket = true
  useEffect(() => {
    if (!enableWebSocket) {
      console.log('🔌 WebSocket desabilitado para esta tela')
      return
    }

    const initWebSocket = async () => {
      try {
        const token = await AsyncStorage.getItem('access')
        const userId = await AsyncStorage.getItem('usuario_id')

        if (token && userId) {
          isAuthenticated.current = true
          console.log('🔌 WebSocket conectando...')
          websocketService.connect(userId)
          
          websocketService.onNotificacao((novaNotificacao) => {
            console.log('📩 Nova notificação via WebSocket:', novaNotificacao.titulo)
            setNotificacoes((prev) => [novaNotificacao, ...prev])
            setContadorNaoLidas((prev) => prev + 1)
          })
        } else {
          isAuthenticated.current = false
          console.warn('Token ou userId não encontrado para WebSocket')
        }
      } catch (error) {
        console.error('Erro ao inicializar WebSocket:', error)
      }
    }

    initWebSocket()

    return () => {
      console.log('🔌 WebSocket desconectando...')
      websocketService.disconnect()
    }
  }, [enableWebSocket]) // ← Reconecta se enableWebSocket mudar

  // ========== Polling CONDICIONAL ==========
  // Só ativa se autoRefresh = true
  useEffect(() => {
    if (!autoRefresh) {
      console.log('⏱️ Polling desabilitado para esta tela')
      return
    }

    const verificarTokenECarregar = async () => {
      try {
        const token = await AsyncStorage.getItem('access')
        if (token) {
          isAuthenticated.current = true
          console.log('⏱️ Iniciando polling a cada', interval / 1000, 'segundos')
          await carregarNotificacoes()
        } else {
          isAuthenticated.current = false
          setLoading(false)
        }
      } catch (error) {
        console.error('Erro ao verificar token:', error)
        setLoading(false)
      }
    }

    verificarTokenECarregar()

    // Polling inteligente baseado no estado do app
    const startPolling = (pollingInterval) => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }

      intervalRef.current = setInterval(async () => {
        if (isAuthenticated.current) {
          await carregarNotificacoes()
        }
      }, pollingInterval)
    }

    startPolling(interval)

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        startPolling(interval)
        if (isAuthenticated.current) {
          carregarNotificacoes()
        }
      } else if (nextAppState.match(/inactive|background/)) {
        startPolling(interval * 3) // Mais lento no background
      }
    })

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      subscription.remove()
    }
  }, [carregarNotificacoes, autoRefresh, interval])

  return {
    notificacoes,
    loading,
    error,
    contadorNaoLidas,
    ultimaAtualizacao,
    carregarNotificacoes, // ← Sempre expõe para refresh manual
    marcarComoLida,
  }
}
