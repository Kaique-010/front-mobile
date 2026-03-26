import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { BASE_URL } from '../utils/api'
import { handleApiError } from '../utils/errorHandler'
import { getStoredData } from './storageService'

// Criar instância axios com session_id
const createClienteAxios = async () => {
  const session_id = await AsyncStorage.getItem('session_id')
  const banco = await AsyncStorage.getItem('banco')

  console.log('[DEBUG] createClienteAxios:', { session_id, banco })

  if (!session_id || !banco) {
    console.error('[ERROR] Session ID ou banco não encontrado')
    return null
  }

  return axios.create({
    baseURL: `${BASE_URL}/api/${banco}`,
    headers: {
      'X-Session-ID': session_id,
      'Content-Type': 'application/json',
    },
  })
}

// Buscar informações do cliente
export const fetchClienteInfo = async () => {
  try {
    const api = await createClienteAxios()
    if (!api) return null

    const cliente_id = await AsyncStorage.getItem('cliente_id')
    const response = await api.get(`entidades/entidades/${cliente_id}/`)
    return response.data
  } catch (error) {
    console.error('[ERROR] Erro ao buscar cliente:', error)
    return null
  }
}

// Buscar pedidos do cliente
export const fetchClientePedidos = async (params = {}) => {
  try {
    const api = await createClienteAxios()
    if (!api) return []

    const response = await api.get('entidades/pedidos/', { params })
    return response.data.results || []
  } catch (error) {
    handleApiError(error)
    return []
  }
}

// Buscar orçamentos do cliente
export const fetchClienteOrcamentos = async (params = {}) => {
  try {
    const api = await createClienteAxios()
    if (!api) return []

    const response = await api.get('entidades/orcamentos/', { params })
    return response.data.results || []
  } catch (error) {
    handleApiError(error)
    return []
  }
}

// Buscar ordens de serviço do cliente
export const fetchClienteOrdensServico = async (params = {}) => {
  try {
    const api = await createClienteAxios()
    if (!api) return []

    const response = await api.get('entidades/ordem-servico/', { params })
    console.log(
      'Ordem Servico Response:',
      JSON.stringify(response.data, null, 2),
    )
    return response.data
  } catch (error) {
    handleApiError(error)
    return []
  }
}

export const fetchClienteOrdensServicoEmEstoque = async (params = {}) => {
  try {
    const api = await createClienteAxios()
    if (!api) return []

    const response = await api.get('entidades/ordem-servico/em-estoque/', {
      params,
    })

    console.log(
      'Motores em Estoque Response:',
      JSON.stringify(response.data, null, 2),
    )

    if (Array.isArray(response.data)) {
      return response.data
    }

    // Check common wrapper fields including Portuguese 'dados'
    const listData =
      response.data.results ||
      response.data.data ||
      response.data.result ||
      response.data.dados ||
      response.data.items ||
      response.data.response ||
      response.data.payload ||
      []

    return Array.isArray(listData) ? listData : []
  } catch (error) {
    console.error('[fetchClienteOrdensServicoEmEstoque] Error:', error)
    handleApiError(error)
    return []
  }
}

export const fetchClienteOrdensTodas = async (params = {}) => {
  try {
    const api = await createClienteAxios()
    if (!api) return []

    const response = await api.get('entidades/ordem-servico/todas_ordens/', {
      params,
    })

    console.log(
      'Ordens Servico Response:',
      JSON.stringify(response.data, null, 2),
    )

    if (Array.isArray(response.data)) {
      return response.data
    }

    // Check common wrapper fields including Portuguese 'dados'
    const listData =
      response.data.results ||
      response.data.data ||
      response.data.result ||
      response.data.dados ||
      response.data.items ||
      response.data.response ||
      response.data.payload ||
      []

    return Array.isArray(listData) ? listData : []
  } catch (error) {
    console.error('[fetchClienteOrdensTodas] Error:', error)
    handleApiError(error)
    return []
  }
}

// Buscar dashboard do cliente
export const fetchClienteDashboard = async () => {
  try {
    const api = await createClienteAxios()
    if (!api) return null

    const response = await api.get('dashboards/cliente-dashboard/')
    return response.data
  } catch (error) {
    // Suppress 401 errors for dashboard to avoid user annoyance
    if (error.response && error.response.status === 401) {
      console.warn(
        '[fetchClienteDashboard] 401 Unauthorized - Dashboard access denied',
      )
      return null
    }
    handleApiError(error)
    return null
  }
}

// Buscar imagens antes da ordem de serviço
export const fetchClienteImagensAntes = async (orde_nume) => {
  try {
    const api = await createClienteAxios()
    if (!api) return []

    const response = await api.get('entidades/ordem-servico/imagensantes/', {
      params: { orde_nume },
    })

    // Tratamento para resposta encapsulada (ex: { dados: [...] })
    const data = response.data
    if (data && data.dados && Array.isArray(data.dados)) {
      return data.dados
    }

    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('[fetchClienteImagensAntes] Error:', error)
    return []
  }
}

// Buscar imagens durante a ordem de serviço
export const fetchClienteImagensDurante = async (orde_nume) => {
  try {
    const api = await createClienteAxios()
    if (!api) return []

    const response = await api.get('entidades/ordem-servico/imagensdurante/', {
      params: { orde_nume },
    })

    console.log(
      '[fetchClienteImagensDurante] Response data type:',
      typeof response.data,
    )
    console.log(
      '[fetchClienteImagensDurante] Response data keys:',
      response.data ? Object.keys(response.data) : 'null',
    )

    // Tratamento para resposta encapsulada (ex: { dados: [...] })
    const data = response.data
    if (data && data.dados && Array.isArray(data.dados)) {
      console.log(
        '[fetchClienteImagensDurante] Usando data.dados, tamanho:',
        data.dados.length,
      )
      return data.dados
    }

    if (Array.isArray(data)) {
      console.log(
        '[fetchClienteImagensDurante] Usando data direto, tamanho:',
        data.length,
      )
      return data
    }

    // Se for objeto mas não tiver dados, tenta ver se tem results (paginação do DRF)
    if (data && data.results && Array.isArray(data.results)) {
      console.log(
        '[fetchClienteImagensDurante] Usando data.results, tamanho:',
        data.results.length,
      )
      return data.results
    }

    console.warn(
      '[fetchClienteImagensDurante] Formato de resposta inesperado:',
      data,
    )
    return []
  } catch (error) {
    console.error('[fetchClienteImagensDurante] Error:', error)
    return []
  }
}

// Buscar imagens depois da ordem de serviço
export const fetchClienteImagensDepois = async (orde_nume) => {
  try {
    const api = await createClienteAxios()
    if (!api) return []

    const response = await api.get('entidades/ordem-servico/imagensdepois/', {
      params: { orde_nume },
    })

    console.log(
      '[fetchClienteImagensDepois] Response data type:',
      typeof response.data,
    )
    console.log(
      '[fetchClienteImagensDepois] Response data keys:',
      response.data ? Object.keys(response.data) : 'null',
    )

    // Tratamento para resposta encapsulada (ex: { dados: [...] })
    const data = response.data
    if (data && data.dados && Array.isArray(data.dados)) {
      console.log(
        '[fetchClienteImagensDepois] Usando data.dados, tamanho:',
        data.dados.length,
      )
      return data.dados
    }

    if (Array.isArray(data)) {
      console.log(
        '[fetchClienteImagensDepois] Usando data direto, tamanho:',
        data.length,
      )
      return data
    }

    // Se for objeto mas não tiver dados, tenta ver se tem results (paginação do DRF)
    if (data && data.results && Array.isArray(data.results)) {
      console.log(
        '[fetchClienteImagensDepois] Usando data.results, tamanho:',
        data.results.length,
      )
      return data.results
    }

    console.warn(
      '[fetchClienteImagensDepois] Formato de resposta inesperado:',
      data,
    )
    return []
  } catch (error) {
    console.error('[fetchClienteImagensDepois] Error:', error)
    return []
  }
}
