import { AppState } from 'react-native'

class SmartPolling {
  constructor(service, intervals = { active: 120000, inactive: 3600000 }) {
    this.service = service
    this.intervals = intervals
    this.currentInterval = null
    this.isActive = true

    // Substituir document por AppState do React Native
    this.appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      this.isActive = nextAppState === 'active'
      this.adjustPolling()
    })
  }

  start(callback) {
    this.callback = callback
    this.adjustPolling()
  }

  adjustPolling() {
    if (this.currentInterval) {
      clearInterval(this.currentInterval)
    }

    const interval = this.isActive
      ? this.intervals.active
      : this.intervals.inactive

    this.currentInterval = setInterval(() => {
      this.service.listarNotificacoes().then(this.callback)
    }, interval)
  }

  stop() {
    if (this.currentInterval) {
      clearInterval(this.currentInterval)
    }
    // Limpar subscription
    if (this.appStateSubscription) {
      this.appStateSubscription.remove()
    }
  }
}

export default SmartPolling
