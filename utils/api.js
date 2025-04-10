import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const BASE_URL = 'http://192.168.10.35:8000'

// Função para tentar renovar o access token
const refreshToken = async () => {
  const refresh = await AsyncStorage.getItem('refresh')

  if (!refresh) {
    throw new Error('Refresh token não encontrado')
  }

  try {
    const response = await axios.post(`${BASE_URL}/api/token/refresh/`, {
      refresh: refresh,
    })

    const newAccess = response.data.access
    await AsyncStorage.setItem('access', newAccess)
    return newAccess
  } catch (error) {
    console.log(
      '❌ Erro ao tentar renovar o token:',
      error.response?.data || error.message
    )
    throw error
  }
}

// Função principal de requisição com verificação automática do token
export const apiFetch = async (url, method = 'get', data = null) => {
  let token = await AsyncStorage.getItem('access')

  try {
    const config = {
      method,
      url,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }

    if (data) {
      config.data = data
    }

    return await axios(config)
  } catch (error) {
    // Verifica se o erro foi de token expirado
    if (error.response?.status === 401) {
      console.log('🔄 Token expirado, tentando renovar...')

      try {
        token = await refreshToken()

        // Tenta novamente a requisição original com o novo token
        const retryConfig = {
          method,
          url,
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }

        if (data) {
          retryConfig.data = data
        }

        return await axios(retryConfig)
      } catch (refreshError) {
        console.log('🚫 Não foi possível renovar o token. Logout necessário.')
        throw refreshError
      }
    }

    throw error
  }
}

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
})

// GET: listar ou buscar dados com query params
export const apiGet = async (endpoint, params = {}) => {
  try {
    const response = await api.get(endpoint, { params })
    return response.data
  } catch (error) {
    throw error
  }
}

// POST: criar novo registro
export const apiPost = async (endpoint, data = {}) => {
  try {
    const response = await api.post(endpoint, data)
    return response.data
  } catch (error) {
    throw error
  }
}

// PUT: atualizar registro existente (por ID ou similar)
export const apiPut = async (endpoint, data = {}) => {
  try {
    const response = await api.put(endpoint, data)
    return response.data
  } catch (error) {
    throw error
  }
}

// DELETE: remover registro
export const apiDelete = async (endpoint) => {
  try {
    const response = await api.delete(endpoint)
    return response.data
  } catch (error) {
    throw error
  }
}
