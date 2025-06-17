import { BASE_URL } from '../utils/api'

class WebSocketService {
  constructor() {
    this.ws = null
    this.callbacks = []
  }

  connect(userId) {
    const wsUrl = BASE_URL.replace('http://', 'ws://').replace('https://', 'wss://')
    this.ws = new WebSocket(`${wsUrl}/ws/notificacoes/${userId}/`)

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      this.callbacks.forEach((callback) => callback(data))
    }

    this.ws.onclose = () => {
      // Reconectar após 3 segundos
      setTimeout(() => this.connect(userId), 3000)
    }
  }

  onNotificacao(callback) {
    this.callbacks.push(callback)
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
    }
  }
}

export default new WebSocketService()
