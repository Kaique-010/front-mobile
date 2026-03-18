import {
  apiGetComContexto,
  apiPostComContexto,
  apiPutComContexto,
  apiDeleteComContexto,
} from '../utils/api'
import { request } from '../utils/api'

/**
 * Serviço para gerenciar operações com Notas Fiscais
 */
export const notasFiscaisService = {
  /**
   * Busca lista de notas fiscais com filtros opcionais
   * @param {Object} filtros - Filtros para busca (status, data_inicio, data_fim, empresa, etc.)
   * @returns {Promise} Lista de notas fiscais
   */
  async buscarNotasFiscais(filtros = {}) {
    try {
      console.log('🔍 Buscando notas fiscais com filtros:', filtros)
      const endpoint = 'notasfiscais/notas-fiscais/notas/'
      const response = await apiGetComContexto(endpoint, filtros)

      // Debug da resposta
      console.log('📊 Resposta completa da API:', response)

      if (response && response.results) {
        console.log(`✅ Total de notas encontradas: ${response.results.length}`)
        console.log('📋 Primeiras 3 notas:', response.results.slice(0, 3))
        console.log('📈 Informações de paginação:', {
          count: response.count,
          next: response.next,
          previous: response.previous,
        })
      } else if (Array.isArray(response)) {
        console.log(`✅ Total de notas encontradas (array): ${response.length}`)
        console.log('📋 Primeiras 3 notas:', response.slice(0, 3))
      } else {
        console.log('⚠️ Formato de resposta inesperado:', typeof response)
      }

      return response
    } catch (error) {
      console.error('❌ Erro ao buscar notas fiscais:', error.message)
      console.error('❌ Detalhes do erro:', error)
      throw error
    }
  },

  /**
   * Busca uma nota fiscal específica por ID
   * @param {string} empresa - Código da empresa
   * @param {string} filial - Código da filial
   * @param {string} numero - Número da nota fiscal
   * @returns {Promise} Dados da nota fiscal
   */
  async buscarNotaFiscalPorId(empresa, filial, numero) {
    try {
      console.log(
        `🔍 Buscando nota fiscal: Empresa=${empresa}, Filial=${filial}, Numero=${numero}`,
      )
      const endpoint = `notasfiscais/notas-fiscais/notas/${empresa}/${filial}/${numero}/`
      console.log('🌐 Endpoint:', endpoint)

      const response = await apiGetComContexto(endpoint)
      console.log('✅ Nota Fiscal Encontrada:', response)
      console.log('📋 Dados da nota:', {
        numero: response?.numero,
        status: response?.status,
        empresa: response?.empresa,
        filial: response?.filial,
      })

      return response
    } catch (error) {
      console.error('❌ Erro ao buscar nota fiscal:', error.message)
      console.error('❌ Detalhes do erro:', error)
      throw error
    }
  },

  async buscarNotaFiscalPorPk(id) {
    const endpoint = `notasfiscais/notas-fiscais/notas/${id}/`
    const data = await apiGetComContexto(endpoint)
    return data
  },

  /**
   * Busca XML de uma nota fiscal específica
   * @param {string} empresa - Código da empresa
   * @param {string} filial - Código da filial
   * @param {string} numero - Número da nota fiscal
   * @returns {Promise} XML da nota fiscal
   */
  async buscarXmlNotaFiscal(empresa, filial, numero) {
    try {
      console.log(
        `🔍 Buscando XML: Empresa=${empresa}, Filial=${filial}, Numero=${numero}`,
      )

      // Validar parâmetros
      if (!empresa || !filial || !numero) {
        throw new Error(
          `Parâmetros inválidos: empresa=${empresa}, filial=${filial}, numero=${numero}`,
        )
      }

      const endpoint = `notasfiscais/notas-fiscais/notas/${empresa}/${filial}/${numero}/xml/`
      console.log('🌐 Endpoint XML:', endpoint)

      const response = await apiGetComContexto(endpoint)
      console.log('✅ XML encontrado com sucesso')
      return response
    } catch (error) {
      console.error('❌ Erro ao buscar XML da nota fiscal:', error.message)
      throw error
    }
  },

  /**
   * Busca o PDF da DANFE de uma nota fiscal específica
   * @param {string} empresa - ID da empresa
   * @param {string} filial - ID da filial
   * @param {string} numero - Número da nota fiscal
   * @returns {Promise} URL do PDF da DANFE
   */
  async buscarDanfeNotaFiscal(empresa, filial, numero) {
    try {
      console.log(
        `🔍 Buscando DANFE: Empresa=${empresa}, Filial=${filial}, Numero=${numero}`,
      )

      // Validar parâmetros
      if (!empresa || !filial || !numero) {
        throw new Error(
          `Parâmetros inválidos: empresa=${empresa}, filial=${filial}, numero=${numero}`,
        )
      }

      const endpoint = `notasfiscais/notas-fiscais/notas/${empresa}/${filial}/${numero}/danfe/`
      console.log('🌐 Endpoint DANFE:', endpoint)

      // Retornar URL completa para abrir no navegador
      const baseUrl = 'http://192.168.20.44:8000/api/casaa'
      const fullUrl = `${baseUrl}/${endpoint}`
      console.log('✅ URL DANFE gerada:', fullUrl)

      return fullUrl
    } catch (error) {
      console.error('❌ Erro ao buscar DANFE da nota fiscal:', error.message)
      throw error
    }
  },

  /**
   * Cria uma nova nota fiscal
   * @param {Object} dadosNotaFiscal - Dados da nota fiscal
   * @returns {Promise} Nota fiscal criada
   */
  async criarNotaFiscal(dadosNotaFiscal) {
    try {
      return await this.criarNotaFiscalV2(dadosNotaFiscal)
    } catch (error) {
      console.error('❌ Erro ao criar nota fiscal:', error.message)
      throw error
    }
  },

  async criarNotaFiscalV2(payload) {
    const response = await request({
      method: 'post',
      endpoint: 'notasfiscais/notas-fiscais/notas/',
      data: payload,
      params: {},
    })
    return response.data
  },

  /**
   * Atualiza uma nota fiscal existente
   * @param {string} empresa - Código da empresa
   * @param {string} filial - Código da filial
   * @param {string} numero - Número da nota fiscal
   * @param {Object} dadosAtualizacao - Dados para atualização
   * @returns {Promise} Nota fiscal atualizada
   */
  async atualizarNotaFiscal(empresa, filial, numero, dadosAtualizacao) {
    try {
      const endpoint = `notasfiscais/notas-fiscais/notas/${empresa}/${filial}/${numero}/`
      const response = await apiPutComContexto(endpoint, dadosAtualizacao)
      return response
    } catch (error) {
      console.error('❌ Erro ao atualizar nota fiscal:', error.message)
      throw error
    }
  },

  async atualizarNotaFiscalPorPk(id, payload, method = 'put') {
    const response = await request({
      method,
      endpoint: `notasfiscais/notas-fiscais/notas/${id}/`,
      data: payload,
      params: {},
    })
    return response.data
  },

  /**
   * Exclui uma nota fiscal
   * @param {string} empresa - Código da empresa
   * @param {string} filial - Código da filial
   * @param {string} numero - Número da nota fiscal
   * @returns {Promise} Confirmação da exclusão
   */
  async excluirNotaFiscal(empresa, filial, numero) {
    try {
      const endpoint = `Notas_Fiscais/notas/${empresa}/${filial}/${numero}/`
      const response = await apiDeleteComContexto(endpoint)
      return response
    } catch (error) {
      console.error('❌ Erro ao excluir nota fiscal:', error.message)
      throw error
    }
  },

  /**
   * Busca dashboard de notas fiscais
   * @returns {Promise} Dados do dashboard
   */
  async buscarDashboard() {
    try {
      const endpoint = 'Notas_Fiscais/dashboard/'
      const response = await apiGetComContexto(endpoint)
      return response
    } catch (error) {
      console.error('❌ Erro ao buscar dashboard:', error.message)
      throw error
    }
  },

  /**
   * Busca número da próxima nota fiscal
   * @returns {Promise} Próximo número disponível
   */
  async buscarProximoNumero() {
    try {
      const endpoint = 'Notas_Fiscais/numero_nota_fiscal/'
      const response = await apiGetComContexto(endpoint)
      return response
    } catch (error) {
      console.error('❌ Erro ao buscar próximo número:', error.message)
      throw error
    }
  },

  async transmitirNotaFiscalPorPk(id, payload = {}) {
    const endpoint = `notasfiscais/notas-fiscais/notas/${id}/transmitir/`
    const response = await request({
      method: 'post',
      endpoint,
      data: payload,
      params: {},
    })
    return response.data
  },

  async consultarNotaFiscalPorPk(id, payload = {}) {
    const endpoint = `notasfiscais/notas-fiscais/notas/${id}/consultar/`
    const response = await request({
      method: 'post',
      endpoint,
      data: payload,
      params: {},
    })
    return response.data
  },

  async inutilizarNotaFiscalPorPk(id, payload = {}) {
    const endpoint = `notasfiscais/notas-fiscais/notas/${id}/inutilizar/`
    console.log('🧾 [NF] Inutilizar (PK) ->', { id, endpoint, payload })
    const response = await request({
      method: 'post',
      endpoint,
      data: payload,
      params: {},
    })
    return response.data
  },

  async cancelarNotaFiscalPorPk(id, payload = {}) {
    const endpoint = `notasfiscais/notas-fiscais/notas/${id}/cancelar/`
    console.log('🧾 [NF] Cancelar (PK) ->', { id, endpoint, payload })
    const response = await request({
      method: 'post',
      endpoint,
      data: payload,
      params: {},
    })
    return response.data
  },
}

/**
 * Utilitários para formatação de dados de notas fiscais
 */
export const notasFiscaisUtils = {
  /**
   * Formata valor monetário para exibição
   * @param {number} valor - Valor a ser formatado
   * @returns {string} Valor formatado
   */
  formatarMoeda(valor) {
    if (valor == null) return 'R$ 0,00'
    let n = 0
    if (typeof valor === 'number') {
      n = valor
    } else {
      const s = String(valor).trim()
      if (!s) return 'R$ 0,00'

      const soNumero = (txt) => txt.replace(/[^\d,.-]/g, '').replace(/\s/g, '')

      const t = soNumero(s)

      if (/^-?\d+(\.\d+)?$/.test(t)) {
        n = Number(t)
      } else if (/^-?\d+(,\d+)?$/.test(t)) {
        n = Number(t.replace(',', '.'))
      } else if (/^-?\d{1,3}(\.\d{3})*(,\d+)?$/.test(t)) {
        n = Number(t.replace(/\./g, '').replace(',', '.'))
      } else {
        n = Number(t.replace(/\./g, '').replace(',', '.'))
      }
    }

    if (!Number.isFinite(n)) return 'R$ 0,00'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(n)
  },

  /**
   * Formata data para exibição
   * @param {string} data - Data no formato ISO
   * @returns {string} Data formatada
   */
  formatarData(data) {
    if (!data) return '-'
    const date = new Date(data)
    return date.toLocaleDateString('pt-BR')
  },

  /**
   * Busca dados para o dashboard de notas fiscais
   * @param {Object} filtros - Filtros para busca (data_inicio, data_fim, empresa, filial, etc.)
   * @returns {Promise} Dados do dashboard
   */
  async buscarDashboardNotasFiscais(filtros = {}) {
    try {
      console.log(
        '📊 Buscando dados do dashboard de notas fiscais com filtros:',
        filtros,
      )
      const endpoint = 'Notas_Fiscais/notas/'
      const response = await apiGetComContexto(endpoint, filtros)

      console.log('📈 Dados do dashboard recebidos:', response)

      // Processar dados para o dashboard
      const dados = response.results || response

      // Calcular resumos
      const resumo = {
        total: dados.length,
        valorTotal: dados.reduce(
          (acc, nota) => acc + parseFloat(nota.valor_total || 0),
          0,
        ),
        autorizadas: dados.filter((nota) => nota.status_nfe === 100).length,
        rascunhos: dados.filter((nota) => nota.status_nfe === 0).length,
        canceladas: dados.filter(
          (nota) => nota.cancelada || nota.status_nfe === 101,
        ).length,
      }

      return {
        dados,
        resumo,
        count: response.count || dados.length,
      }
    } catch (error) {
      console.error('❌ Erro ao buscar dados do dashboard:', error.message)
      console.error('❌ Detalhes do erro:', error)
      throw error
    }
  },

  /**
   * Formata data e hora para exibição
   * @param {string} dataHora - Data/hora no formato ISO
   * @returns {string} Data/hora formatada
   */
  formatarDataHora(dataHora) {
    if (!dataHora) return '-'
    const date = new Date(dataHora)
    return date.toLocaleString('pt-BR')
  },

  /**
   * Retorna descrição do status da nota fiscal
   * @param {string} status - Código do status
   * @returns {string} Descrição do status
   */
  obterDescricaoStatus(status) {
    const statusMap = {
      0: 'Rascunho',
      100: 'Autorizada',
      101: 'Cancelada',
      102: 'Inutilizada',
      532: 'Denegada Erro Cliente',
      110: 'Denegada',
      301: 'Rejeitada',
      302: 'Inutilizada',
    }
    return statusMap[status] || 'Status desconhecido'
  },

  /**
   * Retorna cor do status para exibição
   * @param {string} status - Código do status
   * @returns {string} Cor hexadecimal
   */
  obterCorStatus(status) {
    const coresStatus = {
      0: '#FDE68A',
      100: '#BBF7D0',
      101: '#FECACA',
      102: '#E5E7EB',
      110: '#FED7AA',
      301: '#FECACA',
      302: '#E5E7EB',
    }
    return coresStatus[status] || '#E5E7EB'
  },
}
