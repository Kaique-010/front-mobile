import { useState } from 'react'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getStoredData } from '../services/storageService'
export const BASE_URL = 'http://192.168.10.39:8000' //'https://mobile-sps.fly.dev' //'https://mobile-sps.onrender.com' //'http://192.168.0.39:8000' //http://192.168.10.59:8000

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

    // ✅ CORREÇÃO: Backend retorna 'access' para ambos os tipos
    const newAccess = response.data.access

    if (!newAccess) {
      throw new Error('Access token não retornado pela API')
    }

    // ✅ Salvar novo refresh token se fornecido
    if (response.data.refresh) {
      await AsyncStorage.setItem('refresh', response.data.refresh)
      console.log('✅ Refresh token também renovado')
    }

    await AsyncStorage.setItem('access', newAccess)
    console.log('✅ Token renovado com sucesso')
    return newAccess
  } catch (error) {
    console.log(
      '❌ Erro ao renovar token:',
      error.response?.data || error.message
    )

    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['access', 'refresh', 'slug', 'userType'])
      throw new Error('Sessão expirada. Faça login novamente.')
    }

    throw error
  }
}

const getAuthHeaders = async () => {
  const empresaId = await AsyncStorage.getItem('empresaId')
  const filialId = await AsyncStorage.getItem('filialId')
  const docu = await AsyncStorage.getItem('docu')
  const usuario_id = await AsyncStorage.getItem('usuario_id')
  const username = await AsyncStorage.getItem('username')
  const cliente_id = await AsyncStorage.getItem('cliente_id')


  return {
    'X-Empresa': empresaId || '',
    'X-Filial': filialId || '',
    'X-Docu': docu || '',
    'X-Usuario-Id': usuario_id || '',
    'X-Username': username || '',
    'X-Cliente-Id': cliente_id || '',
  }
}

// Função principal de requisição melhorada
const apiFetch = async (
  endpoint,
  method = 'get',
  data = null,
  params = null,
  retryCount = 0
) => {
  const maxRetries = 1

  try {
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
      url: `${BASE_URL}${endpoint}`,
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
    ...(empresaId && { [`${prefixo}empr`]: empresaId }),
    ...(filialId && { [`${prefixo}fili`]: filialId }),
    ...(usuario_id && { [`${prefixo}usua`]: usuario_id }),
  }
}

export const addContextoSemFili = async (obj = {}, prefixo = '') => {
  const empresaId = await AsyncStorage.getItem('empresaId')
  const usuario_id = await AsyncStorage.getItem('usuario_id')

  return {
    ...obj,
    ...(empresaId && { [`${prefixo}empr`]: empresaId }),
    ...(usuario_id && { [`${prefixo}usua`]: usuario_id }),
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

export async function fetchSlugMap() {
  try {
    const response = await axios.get(`${BASE_URL}/api/licencas/mapa/`)

    return response.data
  } catch (error) {
    throw error
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
