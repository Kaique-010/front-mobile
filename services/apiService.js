import axios from 'axios'

import { apiGetComContexto, BASE_URL, fetchSlugMap } from '../utils/api'
import { getStoredData } from '../services/storageService'

export const fetchDashboardData = async () => {
  // Obtém os dados do storage
  const stored = await getStoredData()

  // Tenta pegar o CNPJ de diferentes fontes no objeto
  const cnpj = stored?.docu || stored?.empr_docu || stored?.empresaDocu

  const { accessToken } = stored
  const { cliente_id } = stored
  const { userType } = stored
  const { refreshToken } = stored

  if (!cnpj) {
    console.error('[ERROR] CNPJ não encontrado no storage')
    return null
  }

  // Busca o slug no mapa usando o CNPJ
  const slugObj = (await fetchSlugMap()).find((item) => item.cnpj === cnpj)
  if (!slugObj) {
    console.error('[ERROR] Slug não encontrado para o CNPJ:', cnpj)
    return null
  }

  const slug = slugObj.slug

  // Parâmetros para a requisição
  const params = {
    empresa_id: stored?.empresaId || null,
    filial_id: stored?.filialId || null,
    usuario_id: stored?.user?.usuario_id || null,
    cliente_id: stored?.cliente_id || null,
    userType: stored?.userType || null,
    accessToken: stored?.accessToken || null,
    refreshToken: stored?.refreshToken || null,
  }
  console.log('params', params)

  // Faz a requisição à API
  const response = apiGetComContexto(`dashboards/dashboard/`, {
    params,
  })

  return response.data
}

// Métodos específicos para clientes, para buscar os dados da api para os cliente em específico
export const fetchClientePedidos = async () => {
  try {
    const stored = await getStoredData()
    const { slug, cliente_id, access } = stored

    if (!slug || !cliente_id) {
      console.error('[ERROR] Slug ou cliente_id não encontrado no storage:', {
        slug,
        cliente_id,
      })
      return []
    }

    const response = await apiGetComContexto(
      `pedidos/pedidos/`,
      {
        params: {
          cliente_id: cliente_id,
          limit: 10,
          ordering: '-data_pedido',
        },
      }
    )

    return response || [] // ✅ Removido .data
  } catch (error) {
    console.error('[ERROR] Erro ao buscar pedidos do cliente:', error)
    return []
  }
}

export const fetchClienteOrcamentos = async () => {
  try {
    const stored = await getStoredData()
    const { slug, cliente_id, access } = stored

    if (!slug || !cliente_id) {
      console.error('[ERROR] Slug ou cliente_id não encontrado no storage:', {
        slug,
        cliente_id,
      })
      return []
    }

    const response = await apiGetComContexto(`orcamentos/orcamentos/`, {
      params: {
        cliente_id: cliente_id,
        limit: 10,
        ordering: '-data_orcamento',
      },
    })

    return response || [] // ✅ Removido .data
  } catch (error) {
    console.error('[ERROR] Erro ao buscar orçamentos do cliente:', error)
    return []
  }
}

export const fetchClienteOrdensServico = async () => {
  try {
    const stored = await getStoredData()
    const { slug, cliente_id, access } = stored

    if (!slug || !cliente_id) {
      console.error('[ERROR] Slug ou cliente_id não encontrado no storage:', {
        slug,
        cliente_id,
      })
      return []
    }

    const response = await apiGetComContexto(`ordens-servico/ordens/`, {
      params: {
        cliente_id: cliente_id,
        limit: 10,
        ordering: '-data_abertura',
      },
    })

    return response || [] // ✅ Removido .data
  } catch (error) {
    console.error('[ERROR] Erro ao buscar ordens de serviço do cliente:', error)
    return []
  }
}

export const fetchClienteDashboard = async () => {
  try {
    const stored = await getStoredData()
    const { slug, cliente_id, access } = stored

    if (!slug || !cliente_id) {
      console.error('[ERROR] Slug ou cliente_id não encontrado no storage:', {
        slug,
        cliente_id,
      })
      return null
    }

    const response = await apiGetComContexto(`dashboards/cliente-dashboard/`, {
      params: {
        cliente_id: cliente_id,
      },
    })

    return response // ✅ Removido .data
  } catch (error) {
    console.error('[ERROR] Erro ao buscar dashboard do cliente:', error)
    return null
  }
}
