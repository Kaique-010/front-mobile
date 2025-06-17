import AsyncStorage from '@react-native-async-storage/async-storage'
import { getStoredData } from '../services/storageService'
import { BASE_URL } from '../utils/api'

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
  async ensureInitialized() {
    if (this.initialized) return

    try {
      const { slug } = await getStoredData()
      this.baseURL = `${BASE_URL}/api/${slug}/notificacoes/`
      this.token = await AsyncStorage.getItem('access')
      this.initialized = true
    } catch (e) {
      console.error('Erro na init:', e)
    }
  }

  async getHeaders() {
    await this.ensureInitialized()
    if (!this.token) this.token = await AsyncStorage.getItem('access')
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.token}`,
    }
  }

  async listarNotificacoes() {
    await this.ensureInitialized()
    try {
      // Verificar se há token antes de fazer a requisição
      if (!this.token) {
        throw new Error('Token de acesso não encontrado')
      }

      const headers = await this.getHeaders()
      const response = await fetch(`${this.baseURL}listar/`, {
        method: 'GET',
        headers,
      })

      if (!response.ok) throw new Error(`Erro HTTP ${response.status}`)
      const json = await response.json()
      return json.notificacoes || []
    } catch (error) {
      // Só logar erro se não for problema de autenticação
      if (
        !error.message.includes('Token de acesso') &&
        !error.message.includes('401')
      ) {
        console.error('Erro listar:', error)
      }
      throw error
    }
  }

  async marcarComoLida(id) {
    await this.ensureInitialized()
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

  // Gerar notificações de estoque baixo
  async gerarNotificacoesEstoque() {
    await this.ensureInitialized()
    try {
      const headers = await this.getHeaders()
      const response = await fetch(`${this.baseURL}estoque/`, {
        method: 'POST',
        headers,
      })

      if (!response.ok) throw new Error(`Erro HTTP ${response.status}`)
      return await response.json()
    } catch (error) {
      console.error('Erro ao gerar notificações de estoque:', error)
      throw error
    }
  }

  // Gerar notificações financeiras (contas a pagar/receber)
  async gerarNotificacoesFinanceiro() {
    await this.ensureInitialized()
    try {
      const headers = await this.getHeaders()
      const response = await fetch(`${this.baseURL}financeiro/`, {
        method: 'POST',
        headers,
      })

      if (!response.ok) throw new Error(`Erro HTTP ${response.status}`)
      return await response.json()
    } catch (error) {
      console.error('Erro ao gerar notificações financeiras:', error)
      throw error
    }
  }

  // Gerar notificações de vendas do dia
  async gerarNotificacoesVendas() {
    await this.ensureInitialized()
    try {
      const headers = await this.getHeaders()
      const response = await fetch(`${this.baseURL}vendas/`, {
        method: 'POST',
        headers,
      })

      if (!response.ok) throw new Error(`Erro HTTP ${response.status}`)
      return await response.json()
    } catch (error) {
      console.error('Erro ao gerar notificações de vendas:', error)
      throw error
    }
  }

  // Gerar notificações de resumo do dia
  async gerarNotificacoesResumo() {
    await this.ensureInitialized()
    try {
      const headers = await this.getHeaders()
      const response = await fetch(`${this.baseURL}resumo/`, {
        method: 'POST',
        headers,
      })

      if (!response.ok) throw new Error(`Erro HTTP ${response.status}`)
      return await response.json()
    } catch (error) {
      console.error('Erro ao gerar notificações de resumo:', error)
      throw error
    }
  }

  // Método para gerar todas as notificações de uma vez
  async gerarTodasNotificacoes() {
    try {
      const resultados = await Promise.allSettled([
        this.gerarNotificacoesEstoque(),
        this.gerarNotificacoesFinanceiro(),
        this.gerarNotificacoesVendas(),
        this.gerarNotificacoesResumo(),
      ])

      const sucessos = resultados.filter((r) => r.status === 'fulfilled')
      const erros = resultados.filter((r) => r.status === 'rejected')

      return {
        sucessos: sucessos.length,
        erros: erros.length,
        detalhes: resultados,
      }
    } catch (error) {
      console.error('Erro ao gerar todas as notificações:', error)
      throw error
    }
  }
}

export default new NotificacaoService()
