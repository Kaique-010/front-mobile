import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { BASE_URL } from '../utils/api'
import { getStoredData } from './storageService'

// Criar instância axios com session_id
const createClienteAxios = async () => {
  const session_id = await AsyncStorage.getItem('session_id')
  const banco = await AsyncStorage.getItem('banco')

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
    console.error('[ERROR] Erro ao buscar pedidos:', error)
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
    console.error('[ERROR] Erro ao buscar orçamentos:', error)
    return []
  }
}

// Buscar ordens de serviço do cliente
export const fetchClienteOrdensServico = async (params = {}) => {
  try {
    const api = await createClienteAxios()
    if (!api) return []

    const response = await api.get('entidades/ordem-servico/', { params })
    return response.data.results || []
  } catch (error) {
    console.error('[ERROR] Erro ao buscar ordens:', error)
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
    return null
  }
}
