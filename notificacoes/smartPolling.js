class SmartPolling {
  constructor(service, intervals = { active: 120000, inactive: 3600000 }) {
    this.service = service
    this.intervals = intervals
    this.currentInterval = null
    this.isActive = true

    document.addEventListener('visibilitychange', () => {
      this.isActive = !document.hidden
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
  }
}

export default SmartPolling
