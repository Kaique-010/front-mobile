import { useState } from 'react'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getStoredData } from '../services/storageService'
// NetInfo removido - não está instalado

export const BASE_URL = 'https://mobile-sps.site' //'http://168.75.73.117'//'https://mobile-sps.site' //'http://192.168.10.16:8000' //'http://192.168.0.39:8000' //http://192.168.10.59:8000
import licencasLocal from '../licencas.json'

// Função para renovar o token
const refreshToken = async () => {
  const refresh = await AsyncStorage.getItem('refresh')

  if (!refresh) throw new Error('Refresh token não encontrado')

  const { slug, userType } = await getStoredData()

  try {
    let endpoint
    let headers = {}

    if (userType === 'cliente') {
      endpoint = `${BASE_URL}/api/${slug}/entidades/refresh/`
    } else {
      endpoint = `${BASE_URL}/api/${slug}/auth/token/refresh/`
      headers = await getAuthHeaders()
    }

    const response = await axios.post(endpoint, { refresh }, { headers })

    const newAccess = response.data.access

    if (!newAccess) {
      throw new Error('Access token não retornado pela API')
    }

    if (response.data.refresh) {
      await safeSetItem('refresh', response.data.refresh)
      console.log('✅ Refresh token também renovado')
    }

    await safeSetItem('access', newAccess)
    console.log('✅ Token renovado com sucesso')
    return newAccess
  } catch (error) {
    console.log(
      '❌ Erro ao renovar token:',
      error.response?.data || error.message
    )
    throw error
  }
}

export const getAuthHeaders = async () => {
  try {
    const empresaId = await AsyncStorage.getItem('empresaId')
    const filialId = await AsyncStorage.getItem('filialId')
    const docu = await AsyncStorage.getItem('docu')
    const usuario_id = await AsyncStorage.getItem('usuario_id')
    const username = await AsyncStorage.getItem('username')
    const cliente_id = await AsyncStorage.getItem('cliente_id')

    console.log('🔍 [AUTH-HEADERS] empresaId:', empresaId)
    console.log('🔍 [AUTH-HEADERS] filialId:', filialId)

    const headers = {
      'X-Empresa': empresaId || '1',
      'X-Filial': filialId || '1',
      'X-Docu': docu || '',
    }

    console.log('🔍 [AUTH-HEADERS] Headers enviados:', headers)

    return headers
  } catch (error) {
    console.error('Erro ao obter headers de autenticação:', error)
    return {
      'X-Empresa': '1',
      'X-Filial': '1',
      'X-Docu': '',
    }
  }
}

// Função principal de requisição melhorada
// Verificar conectividade antes das requisições
const checkConnectivity = async () => {
  const netInfo = await NetInfo.fetch()
  if (!netInfo.isConnected) {
    throw new Error('Sem conexão com a internet')
  }
  return netInfo
}

// Função checkConnectivity removida

const apiFetch = async (
  endpoint,
  method = 'get',
  data = null,
  params = null,
  retryCount = 0
) => {
  const maxRetries = 1

  try {
    // Verificação de conectividade removida

    let currentToken = await AsyncStorage.getItem('access')
    let currentRefreshToken = await AsyncStorage.getItem('refresh')

    // LOGS DETALHADOS
    console.log(
      '🔍 [DEBUG] Token lido do AsyncStorage:',
      currentToken ? 'Token encontrado' : 'Token não encontrado'
    )
    console.log(
      '🔍 [DEBUG] Refresh token:',
      currentRefreshToken ? 'Refresh encontrado' : 'Refresh não encontrado'
    )
    console.log('🔍 [DEBUG] Endpoint:', endpoint)
    console.log('🔍 [DEBUG] Method:', method)

    if (currentToken) {
      console.log('🔍 [DEBUG] Token completo:', currentToken)
      console.log('🔍 [DEBUG] Authorization header:', `Bearer ${currentToken}`)
    }

    if (!currentToken) {
      console.error('❌ Token de autenticação não encontrado!')
      throw new Error('Token de autenticação não encontrado')
    }

    const headersExtras = await getAuthHeaders()

    const config = {
      method,
      url: `${BASE_URL}/${
        endpoint.startsWith('/') ? endpoint.substring(1) : endpoint
      }`,
      headers: {
        Authorization: `Bearer ${currentToken}`,
        ...headersExtras,
      },
      ...(data && { data }),
      ...(params && { params }),
    }

    // Log do header Authorization para debug
    console.log(
      '🔍 [DEBUG] Authorization header:',
      config.headers.Authorization
    )

    const response = await axios(config)
    return response
  } catch (error) {
    // Se for erro 401 (token expirado) e ainda não tentamos renovar
    if (error.response?.status === 401 && retryCount < maxRetries) {
      console.log('🔄 Token expirado, tentando renovar...')
      try {
        const newToken = await refreshToken()
        console.log('✅ Token renovado com sucesso')
        const headersExtras = await getAuthHeaders()
        const newConfig = {
          method,
          url: `${BASE_URL}${endpoint}`,
          headers: {
            Authorization: `Bearer ${newToken}`,
            ...headersExtras,
          },
          timeout: 10000,
          ...(data && { data }),
          ...(params && { params }),
        }

        console.log(
          '🔍 [DEBUG] Retry com novo token:',
          newConfig.headers.Authorization
        )
        const retryResponse = await axios(newConfig)
        return retryResponse
      } catch (refreshError) {
        console.error('❌ Erro ao renovar token:', refreshError.message)
        // Limpar tokens inválidos
        await AsyncStorage.multiRemove(['access', 'refresh'])
        throw new Error('Sessão expirada. Faça login novamente.')
      }
    }

    // Para outros erros ou se já tentamos renovar o token
    throw error
  }
}

// Exportar a função
export { apiFetch }

// Funções auxiliares
export const apiGet = async (endpoint, params = {}) => {
  const response = await apiFetch(endpoint, 'get', null, params)
  return response.data
}

export const apiPost = async (endpoint, data) => {
  const response = await apiFetch(endpoint, 'post', data)
  return response.data
}

export const apiPut = async (endpoint, data) => {
  const response = await apiFetch(endpoint, 'put', data)
  return response.data
}

export const apiDelete = async (endpoint, params = {}) => {
  const response = await apiFetch(endpoint, 'delete', null, params)
  return response.data
}

// Função para adicionar contexto de empresa/filial no corpo da requisição
export const addContexto = async (obj = {}, prefixo = '') => {
  const empresaId = await AsyncStorage.getItem('empresaId')
  const filialId = await AsyncStorage.getItem('filialId')
  const usuario_id = await AsyncStorage.getItem('usuario_id')

  return {
    ...obj,
    // Formato antigo (compatibilidade)
    ...(empresaId && { [`${prefixo}empr`]: empresaId }),
    ...(filialId && { [`${prefixo}fili`]: filialId }),
    ...(usuario_id && { [`${prefixo}usua`]: usuario_id }),
    // Formato novo (padrão)
    ...(empresaId && { [`${prefixo}empresa_id`]: empresaId }),
    ...(filialId && { [`${prefixo}filial_id`]: filialId }),
    ...(usuario_id && { [`${prefixo}usuario_id`]: usuario_id }),
  }
}

export const addContextoSemFili = async (obj = {}, prefixo = '') => {
  const empresaId = await AsyncStorage.getItem('empresaId')
  const usuario_id = await AsyncStorage.getItem('usuario_id')

  return {
    ...obj,
    // Formato antigo (compatibilidade)
    ...(empresaId && { [`${prefixo}empr`]: empresaId }),
    ...(usuario_id && { [`${prefixo}usua`]: usuario_id }),
    // Formato novo (padrão)
    ...(empresaId && { [`${prefixo}empresa_id`]: empresaId }),
    ...(usuario_id && { [`${prefixo}usuario_id`]: usuario_id }),
  }
}

export const apiGetComContextoos = async (
  endpointSemApi,
  params = {},
  prefixo = ''
) => {
  console.log('[apiGetComContextoos] Chamando', endpointSemApi, params)
  const slug = await getSlug()
  const fullEndpoint = `/api/${slug}/${endpointSemApi}`
  const paramsComContexto = await addContexto(params, prefixo)
  const response = await apiFetch(fullEndpoint, 'get', null, paramsComContexto)
  return response.data
}

export const apiGetComContexto = async (
  endpointSemApi,
  params = {},
  prefixo = ''
) => {
  const slug = await getSlug()
  const fullEndpoint = `/api/${slug}/${endpointSemApi}`
  const paramsComContexto = await addContexto(params, prefixo)
  const response = await apiFetch(fullEndpoint, 'get', null, paramsComContexto)
  return response.data
}
// Funções com contexto (empresa/filial)
export const apiGetComContextoSemFili = async (
  endpointSemApi,
  params = {},
  prefixo = ''
) => {
  const slug = await getSlug()
  const fullEndpoint = `/api/${slug}/${endpointSemApi}`
  const paramsComContexto = await addContextoSemFili(params, prefixo)
  const response = await apiFetch(fullEndpoint, 'get', null, paramsComContexto)
  return response.data
}

export const apiPostComContexto = async (
  endpointSemApi,
  params = {},
  prefixo = ''
) => {
  const slug = await getSlug()
  const fullEndpoint = `/api/${slug}/${endpointSemApi}`
  const paramsComContexto = await addContexto(params, prefixo)
  const response = await apiFetch(fullEndpoint, 'post', paramsComContexto)
  return response.data
}

//Aceitar listas no Post
export const apiPostComContextoList = async (
  endpointSemApi,
  lista = [],
  prefixo = ''
) => {
  if (!Array.isArray(lista)) {
    throw new Error('Payload deve ser uma lista')
  }

  const slug = await getSlug()
  const fullEndpoint = `/api/${slug}/${endpointSemApi}`

  const response = await apiFetch(fullEndpoint, 'post', payloadComContexto)
  return response.data
}

export const addContextoControleVisita = async (obj = {}) => {
  const empresaId = await AsyncStorage.getItem('empresaId')
  const filialId = await AsyncStorage.getItem('filialId')
  const usuario_id = await AsyncStorage.getItem('usuario_id')

  return {
    ...obj,
    ...(empresaId && { ctrl_empresa: parseInt(empresaId) }),
    ...(filialId && { ctrl_filial: parseInt(filialId) }),
    ...(usuario_id && { ctrl_usuario: parseInt(usuario_id) }),
  }
}
export const apiPostComContextoSemFili = async (
  endpointSemApi,
  params = {},
  prefixo = ''
) => {
  const slug = await getSlug()
  const fullEndpoint = `/api/${slug}/${endpointSemApi}`
  const paramsComContexto = await addContextoSemFili(params, prefixo)
  const response = await apiFetch(fullEndpoint, 'post', paramsComContexto)
  return response.data
}

export const apiPutComContexto = async (
  endpointSemApi,
  params = {},
  prefixo = ''
) => {
  const slug = await getSlug()
  const fullEndpoint = `/api/${slug}/${endpointSemApi}`
  const paramsComContexto = await addContexto(params, prefixo)
  const response = await apiFetch(fullEndpoint, 'put', paramsComContexto)
  return response.data
}

export const apiPutComContextoSemFili = async (
  endpointSemApi,
  params = {},
  prefixo = ''
) => {
  const slug = await getSlug()
  const fullEndpoint = `/api/${slug}/${endpointSemApi}`
  const paramsComContexto = await addContextoSemFili(params, prefixo)
  const response = await apiFetch(fullEndpoint, 'put', paramsComContexto)
  return response.data
}

export const apiDeleteComContexto = async (endpointSemApi) => {
  const slug = await getSlug()
  const fullEndpoint = `/api/${slug}/${endpointSemApi}`
  const paramsComContexto = await addContexto()
  const response = await apiFetch(
    fullEndpoint,
    'delete',
    null,
    paramsComContexto
  )
  return response.data
}

export const apiPostSemContexto = async (endpoint, data = {}) => {
  const response = await apiFetch(endpoint, 'post', data)
  return response.data
}

export const apiPatchComContexto = async (
  endpointSemApi,
  params = {},
  prefixo = ''
) => {
  const slug = await getSlug()
  const fullEndpoint = `/api/${slug}/${endpointSemApi}`
  const paramsComContexto = await addContexto(params, prefixo)
  const response = await apiFetch(fullEndpoint, 'patch', paramsComContexto)
  return response.data
}

// Cache para o slugMap
let slugMapCache = null
let slugMapCacheTime = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export async function fetchSlugMap() {
  const startTime = Date.now()
  console.log(
    `🕐 [SLUG-TIMING] Iniciando fetchSlugMap: ${new Date().toISOString()}`
  )

  // Verificar cache
  const now = Date.now()
  if (slugMapCache && now - slugMapCacheTime < CACHE_DURATION) {
    console.log(
      `⚡ [SLUG-TIMING] Usando cache válido em: ${Date.now() - startTime}ms`
    )
    return slugMapCache
  }

  try {
    console.log(
      `🌐 [SLUG-TIMING] Fazendo requisição para: ${BASE_URL}/api/licencas/mapa/`
    )

    const response = await axios.get(`${BASE_URL}/api/licencas/mapa/`, {
      timeout: 10000, // 10 segundos
    })

    const apiData = response.data

    // Converter array da API em objeto CNPJ -> slug
    const map = {}
    if (Array.isArray(apiData)) {
      apiData.forEach((item) => {
        if (item.cnpj && item.slug) {
          map[item.cnpj] = item.slug
        }
      })
    } else {
      // Se já for um objeto, usar diretamente
      Object.assign(map, apiData)
    }

    // Atualizar cache
    slugMapCache = map
    slugMapCacheTime = now

    console.log(
      `✅ [SLUG-TIMING] SlugMap obtido e cacheado em: ${
        Date.now() - startTime
      }ms`
    )
    console.log(`📊 [SLUG-TIMING] Total de slugs: ${Object.keys(map).length}`)
    console.log(
      `📄 [SLUG-MAP] CNPJs disponíveis na API: ${Object.keys(map).join(', ')}`
    )

    return map
  } catch (error) {
    console.error(
      `❌ [SLUG-TIMING] Erro no fetchSlugMap após: ${Date.now() - startTime}ms`
    )
    console.error(`❌ [SLUG-TIMING] Detalhes:`, error.message)

    // Fallback 1: Cache antigo
    if (slugMapCache) {
      console.log(`🔄 [SLUG-TIMING] Usando cache antigo como fallback`)
      return slugMapCache
    }

    // Fallback 2: Arquivo local licencas.json
    console.log(
      `📁 [SLUG-TIMING] Carregando mapa do arquivo local licencas.json`
    )

    try {
      // Criar mapa de CNPJ -> slug baseado no arquivo local
      const localMap = {}
      licencasLocal.forEach((licenca) => {
        if (licenca.cnpj && licenca.slug) {
          localMap[licenca.cnpj] = licenca.slug
        }
      })

      // Log dos CNPJs aptos do arquivo local
      console.log(
        `📄 [SLUG-MAP] CNPJs aptos carregados do licencas.json: ${Object.keys(
          localMap
        ).join(', ')}`
      )

      // Atualizar cache com o mapa local
      slugMapCache = localMap
      slugMapCacheTime = now

      return localMap
    } catch (localError) {
      console.error(
        `❌ [SLUG-TIMING] Erro ao carregar arquivo local:`,
        localError.message
      )

      // Fallback 3: Mapa vazio (comportamento original)
      console.log(`🔌 [SLUG-TIMING] Retornando mapa vazio como último recurso`)
      return {}
    }
  }
}

const getSlug = async () => {
  const slug = await AsyncStorage.getItem('slug')
  if (!slug) throw new Error('Slug não encontrado no AsyncStorage')
  return slug
}

export const request = async ({ method, endpoint, data = {}, params = {} }) => {
  try {
    const slug = await getSlug()
    const fullEndpoint = `/api/${slug}/${endpoint}`
    return await apiFetch(fullEndpoint, method, data, params)
  } catch (error) {
    throw error.response?.data || { message: 'Erro inesperado' }
  }
}

// Configuração otimizada do axios
axios.defaults.timeout = 30000 // 30 segundos em vez de 10
axios.defaults.headers.common['Content-Type'] = 'application/json'

// Configuração de retry automático
const MAX_RETRIES = 4
const RETRY_DELAY = 1000 // 1 segundo

// Função para delay entre tentativas
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Interceptor para logs de timing
axios.interceptors.request.use(
  (config) => {
    config.metadata = {
      startTime: Date.now(),
      retryCount: config.retryCount || 0,
    }
    console.log(
      `🚀 [AXIOS-TIMING] Iniciando requisição: ${config.method?.toUpperCase()} ${
        config.url
      } (Tentativa ${config.metadata.retryCount + 1})`
    )
    return config
  },
  (error) => {
    console.error('❌ [AXIOS-TIMING] Erro na requisição:', error)
    return Promise.reject(error)
  }
)

axios.interceptors.response.use(
  (response) => {
    const duration = Date.now() - response.config.metadata.startTime
    console.log(
      `✅ [AXIOS-TIMING] Resposta recebida em: ${duration}ms - ${response.config.method?.toUpperCase()} ${
        response.config.url
      }`
    )
    console.log(
      `📊 [AXIOS-TIMING] Status: ${response.status}, Tamanho: ${
        JSON.stringify(response.data).length
      } chars`
    )
    return response
  },
  async (error) => {
    const config = error.config

    if (config?.metadata) {
      const duration = Date.now() - config.metadata.startTime
      console.error(
        `❌ [AXIOS-TIMING] Erro após: ${duration}ms - ${config.method?.toUpperCase()} ${
          config.url
        }`
      )
    }

    // Lógica de retry para erros de rede
    if (
      config &&
      !config.__isRetryRequest &&
      (config.retryCount || 0) < MAX_RETRIES &&
      (error.code === 'ECONNABORTED' ||
        error.code === 'NETWORK_ERROR' ||
        error.message === 'Network Error' ||
        error.message.includes('Network request failed') ||
        !error.response)
    ) {
      config.__isRetryRequest = true
      config.retryCount = (config.retryCount || 0) + 1

      console.log(
        `🔄 [RETRY] Tentativa ${config.retryCount}/${MAX_RETRIES} em ${
          RETRY_DELAY * config.retryCount
        }ms`
      )

      await delay(RETRY_DELAY * config.retryCount) // Delay progressivo
      return axios(config)
    }

    if (error.code === 'ECONNABORTED') {
      console.error('⏰ [AXIOS-TIMING] Timeout na requisição')
    } else if (error.response) {
      console.error(
        `🔴 [AXIOS-TIMING] Erro HTTP ${error.response.status}: ${error.response.statusText}`
      )
    } else if (error.request) {
      console.error('📡 [AXIOS-TIMING] Sem resposta do servidor')
    }

    return Promise.reject(error)
  }
)

// Função melhorada para lidar com SQLITE_FULL
export const safeSetItem = async (key, value, retryCount = 0) => {
  try {
    await AsyncStorage.setItem(key, value)
    console.log(`✅ Item salvo: ${key}`)
  } catch (error) {
    if (
      error.message.includes('database or disk is full') ||
      error.code === 'SQLITE_FULL'
    ) {
      console.log('🧹 Storage cheio, limpando automaticamente...')

      if (retryCount < 2) {
        // Primeira tentativa: limpar apenas cache não essencial
        await clearNonEssentialCache()
        return safeSetItem(key, value, retryCount + 1)
      } else {
        // Segunda tentativa: limpar tudo exceto dados de login
        await clearAllExceptAuth()
        return safeSetItem(key, value, retryCount + 1)
      }
    }
    throw error
  }
}

// Limpar apenas cache não essencial
const clearNonEssentialCache = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys()
    const cacheKeys = keys.filter(
      (key) =>
        key.includes('_cache') ||
        key.includes('CACHE') ||
        key.includes('produtos') ||
        key.includes('pedidos') ||
        key.includes('balancete')
    )

    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys)
      console.log(`🧹 Removidos ${cacheKeys.length} itens de cache`)
    }
  } catch (error) {
    console.error('❌ Erro ao limpar cache:', error)
  }
}

// Limpar tudo exceto dados de autenticação
const clearAllExceptAuth = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys()
    const authKeys = [
      'access',
      'refresh',
      'empresaId',
      'filialId',
      'usuario_id',
      'username',
    ]
    const keysToRemove = keys.filter((key) => !authKeys.includes(key))

    if (keysToRemove.length > 0) {
      await AsyncStorage.multiRemove(keysToRemove)
      console.log(`🧹 Removidos ${keysToRemove.length} itens não essenciais`)
    }
  } catch (error) {
    console.error('❌ Erro ao limpar storage:', error)
  }
}

export const clearAllStorage = async () => {
  try {
    await AsyncStorage.clear()
    console.log('✅ Storage limpo com sucesso')
  } catch (error) {
    console.error('❌ Erro ao limpar storage:', error)
  }
}
