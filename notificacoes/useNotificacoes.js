// useNotificacoes.js
import { useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Service from './Service'
import websocketService from './websocketService'

export const useNotificacoes = (autoRefresh = true, interval = 30000) => {
  const [notificacoes, setNotificacoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [contadorNaoLidas, setContadorNaoLidas] = useState(0)

  const carregarNotificacoes = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const dados = await Service.listarNotificacoes()
      setNotificacoes(dados)

      const naoLidas = dados.filter((n) => !n.lida).length
      setContadorNaoLidas(naoLidas)
    } catch (err) {
      setError(err.message)
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
    }
  }, [])

  useEffect(() => {
    const initWebSocket = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken')
        const userId = await AsyncStorage.getItem('usuario_id')

        if (token && userId) {
          websocketService.connect(userId)
          websocketService.onNotificacao((novaNotificacao) => {
            setNotificacoes((prev) => [novaNotificacao, ...prev])
            setContadorNaoLidas((prev) => prev + 1)
          })
        } else {
          console.warn('Token ou userId não encontrado para WebSocket')
        }
      } catch (error) {
        console.error('Erro ao inicializar WebSocket:', error)
      }
    }

    initWebSocket()

    return () => {
      websocketService.disconnect()
    }
  }, [])

  useEffect(() => {
    const verificarTokenECarregar = async () => {
      try {
        const token = await AsyncStorage.getItem('access')
        if (token) {
          carregarNotificacoes()
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error('Erro ao verificar token:', error)
        setLoading(false)
      }
    }

    verificarTokenECarregar()

    if (autoRefresh) {
      const intervalId = setInterval(async () => {
        const token = await AsyncStorage.getItem('access')
        if (token) {
          carregarNotificacoes()
        }
      }, interval)
      return () => clearInterval(intervalId)
    }
  }, [carregarNotificacoes, autoRefresh, interval])

  return {
    notificacoes,
    loading,
    error,
    contadorNaoLidas,
    carregarNotificacoes,
    marcarComoLida,
  }
}
