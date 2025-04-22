import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const BASE_URL = 'http://192.168.10.35:8000'

const refreshToken = async () => {
  const refresh = await AsyncStorage.getItem('refresh')
  if (!refresh) throw new Error('Refresh token não encontrado')

  try {
    const response = await axios.post(`${BASE_URL}/api/auth/token/refresh/`, {
      refresh,
    })
    const newAccess = response.data.access
    await AsyncStorage.setItem('access', newAccess)
    return newAccess
  } catch (error) {
    console.log(
      '❌ Erro ao tentar renovar token:',
      error.response?.data || error.message
    )
    throw error
  }
}

const getEmpresaFilialHeaders = async () => {
  const empresa = await AsyncStorage.getItem('empresa')
  const filial = await AsyncStorage.getItem('filial')
  return {
    'X-Empresa': empresa || '',
    'X-Filial': filial || '',
  }
}

export const apiFetch = async (
  endpoint,
  method = 'get',
  data = null,
  params = null
) => {
  let token = await AsyncStorage.getItem('access')
  const headersExtras = await getEmpresaFilialHeaders()

  const buildConfig = (tk) => ({
    method,
    url: `${BASE_URL}${endpoint}`,
    headers: {
      Authorization: `Bearer ${tk}`,
      'Content-Type': 'application/json',
      ...headersExtras,
    },
    ...(data && { data }),
    ...(params && { params }),
  })

  try {
    const config = buildConfig(token)
    return await axios(config)
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('🔄 Token expirado, tentando renovar...')
      try {
        token = await refreshToken()
        const retryConfig = buildConfig(token)
        return await axios(retryConfig)
      } catch (refreshError) {
        console.log('🚫 Não foi possível renovar o token.')
        throw refreshError
      }
    }
    throw error
  }
}

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

export const apiDelete = async (endpoint) => {
  const response = await apiFetch(endpoint, 'delete')
  return response.data
}

const addContexto = async (obj = {}) => {
  const empresa = await AsyncStorage.getItem('empresa')
  const filial = await AsyncStorage.getItem('filial')
  return {
    ...obj,
    ...(empresa && { empresa_id: empresa }),
    ...(filial && { filial_id: filial }),
  }
}

export const apiGetComContexto = async (endpoint, params = {}) => {
  const paramsComContexto = await addContexto(params)
  const response = await apiFetch(endpoint, 'get', null, paramsComContexto)
  return response.data
}

export const apiPostComContexto = async (endpoint, data = {}) => {
  const dataComContexto = await addContexto(data)
  const response = await apiFetch(endpoint, 'post', dataComContexto)
  return response.data
}

export const apiPutComContexto = async (endpoint, data = {}) => {
  const dataComContexto = await addContexto(data)
  const response = await apiFetch(endpoint, 'put', dataComContexto)
  return response.data
}

export const apiDeleteComContexto = async (endpoint) => {
  const paramsComContexto = await addContexto()
  const response = await apiFetch(endpoint, 'delete', null, paramsComContexto)
  return response.data
}
