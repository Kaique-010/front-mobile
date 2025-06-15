class WebSocketService {
  constructor() {
    this.ws = null
    this.callbacks = []
  }

  connect(userId) {
    this.ws = new WebSocket(`ws://localhost:8000/ws/notificacoes/${userId}/`)

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
