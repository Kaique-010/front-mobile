import { 
  apiGetComContexto, 
  apiPostComContexto, 
  apiPatchComContexto 
} from '../utils/api'

class NotificacaoService {
  constructor() {
    console.log('✅ [DEBUG] Serviço de notificações inicializado usando funções padronizadas da API')
  }

  async listarNotificacoes() {
    try {
      console.log('🔍 [DEBUG] Listando notificações usando apiGetComContexto')
      
      const response = await apiGetComContexto('notificacoes/listar/')
      return response.notificacoes || []
    } catch (error) {
      if (error.response?.status === 404) {
        console.error('❌ [DEBUG] Endpoint de notificações não encontrado (404)')
        throw new Error('Endpoint de notificações não encontrado. Verifique se o serviço está disponível.')
      }
      if (error.response?.status === 401) {
        throw new Error('Não autorizado - verifique suas credenciais')
      }
      
      console.error('Erro ao listar notificações:', error)
      throw error
    }
  }

  async marcarComoLida(id) {
    try {
      console.log('🔍 [DEBUG] Marcando notificação como lida:', id)
      
      const response = await apiPatchComContexto(`notificacoes/marcar-lida/${id}/`)
      return response
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error)
      throw error
    }
  }

  async buscarNaoLidas() {
    const todas = await this.listarNotificacoes()
    return todas.filter((n) => !n.lida)
  }

  async contarNaoLidas() {
    const naoLidas = await this.buscarNaoLidas()
    return naoLidas.length
  }

  async gerarNotificacoesEstoque() {
    try {
      console.log('🔍 [DEBUG] Gerando notificações de estoque')
      
      const response = await apiPostComContexto('notificacoes/estoque/')
      return response
    } catch (error) {
      console.error('Erro ao gerar notificações de estoque:', error)
      throw error
    }
  }

  async gerarNotificacoesFinanceiro() {
    try {
      console.log('🔍 [DEBUG] Gerando notificações financeiras')
      
      const response = await apiPostComContexto('notificacoes/financeiro/')
      return response
    } catch (error) {
      console.error('Erro ao gerar notificações financeiras:', error)
      throw error
    }
  }

  async gerarNotificacoesVendas() {
    try {
      console.log('🔍 [DEBUG] Gerando notificações de vendas')
      
      const response = await apiPostComContexto('notificacoes/vendas/')
      return response
    } catch (error) {
      console.error('Erro ao gerar notificações de vendas:', error)
      throw error
    }
  }

  async gerarNotificacoesResumo() {
    try {
      console.log('🔍 [DEBUG] Gerando notificações de resumo')
      
      const response = await apiPostComContexto('notificacoes/resumo/')
      return response
    } catch (error) {
      console.error('Erro ao gerar notificações de resumo:', error)
      throw error
    }
  }

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