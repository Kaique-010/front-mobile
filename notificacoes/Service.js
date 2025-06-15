import AsyncStorage from '@react-native-async-storage/async-storage'
import { getStoredData } from '../services/storageService'

export const getAccessToken = async () => {
  try {
    const accessToken = await AsyncStorage.getItem('access')
    if (!accessToken) throw new Error('Access token não encontrado')
    return accessToken
  } catch (error) {
    console.error('Erro ao buscar access token:', error)
    throw error
  }
}

class NotificacaoService {
  constructor() {
    this.baseURL = null
    this.token = null
    this.init()
  }

  async init() {
    try {
      const { slug } = await getStoredData()
      this.baseURL = `http://192.168.0.39:8000/api/${slug}/notificacoes/listar/`
      this.token = await AsyncStorage.getItem('authToken')
    } catch (e) {
      console.error('Erro na init:', e)
    }
  }

  async getHeaders() {
    if (!this.token) this.token = await AsyncStorage.getItem('authToken')
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.token}`,
    }
  }

  async listarNotificacoes() {
    try {
      const headers = await this.getHeaders()
      const response = await fetch(this.baseURL, {
        method: 'GET',
        headers,
      })

      if (!response.ok) throw new Error(`Erro HTTP ${response.status}`)

      return await response.json()
    } catch (error) {
      console.error('Erro listar:', error)
      throw error
    }
  }

  async marcarComoLida(id) {
    const headers = await this.getHeaders()
    const response = await fetch(`${this.baseURL}marcar-lida/${id}/`, {
      method: 'PATCH',
      headers,
    })
    if (!response.ok) throw new Error('Erro ao marcar como lida')
    return await response.json()
  }

  async buscarNaoLidas() {
    const todas = await this.listarNotificacoes()
    return todas.filter((n) => !n.lida)
  }

  async contarNaoLidas() {
    const naoLidas = await this.buscarNaoLidas()
    return naoLidas.length
  }
}

export default new NotificacaoService()
