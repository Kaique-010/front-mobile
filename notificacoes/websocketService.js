import { BASE_URL } from '../utils/api'

class WebSocketService {
  constructor() {
    this.ws = null
    this.callbacks = []
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 3000
    this.userId = null
  }

  connect(userId) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket já está conectado')
      return
    }

    this.userId = userId
    const wsUrl = BASE_URL.replace('http://', 'ws://').replace('https://', 'wss://')

    try {
      this.ws = new WebSocket(`${wsUrl}/ws/notificacoes/${userId}/`)

      this.ws.onopen = () => {
        console.log('WebSocket conectado com sucesso')
        this.reconnectAttempts = 0
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.callbacks.forEach((callback) => callback(data))
        } catch (error) {
          console.error('Erro ao processar mensagem WebSocket:', error)
        }
      }

      this.ws.onerror = (error) => {
        console.error('Erro no WebSocket:', error)
      }

      this.ws.onclose = (event) => {
        console.log('WebSocket desconectado', event.code, event.reason)
        this.handleReconnect()
      }
    } catch (error) {
      console.error('Erro ao conectar WebSocket:', error)
      this.handleReconnect()
    }
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = this.reconnectDelay * this.reconnectAttempts

      console.log(`Tentando reconectar WebSocket em ${delay}ms (tentativa ${this.reconnectAttempts})`)

      setTimeout(() => {
        if (this.userId) {
          this.connect(this.userId)
        }
      }, delay)
    } else {
      console.error('Número máximo de tentativas de reconexão atingido')
    }
  }

  onNotificacao(callback) {
    if (typeof callback === 'function') {
      this.callbacks.push(callback)
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.callbacks = []
    this.reconnectAttempts = 0
    this.userId = null
  }

  getConnectionState() {
    if (!this.ws) return 'CLOSED'
    
    const states = {
      [WebSocket.CONNECTING]: 'CONNECTING',
      [WebSocket.OPEN]: 'OPEN',
      [WebSocket.CLOSING]: 'CLOSING',
      [WebSocket.CLOSED]: 'CLOSED',
    }
    
    return states[this.ws.readyState] || 'UNKNOWN'
  }
}

export default new WebSocketService()