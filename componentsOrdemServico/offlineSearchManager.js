import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import NetInfo from '@react-native-community/netinfo'
import { BASE_URL } from './api'

/**
 * Sistema de cache para buscas offline
 * Suporta múltiplos tipos de dados com expiração configurável
 */

const CACHE_CONFIG = {
  clientes: {
    key: 'CACHE_CLIENTES',
    timestamp: 'CACHE_CLIENTES_TS',
    duration: 24 * 60 * 60 * 1000, // 24 horas
  },
  produtos: {
    key: 'CACHE_PRODUTOS',
    timestamp: 'CACHE_PRODUTOS_TS',
    duration: 12 * 60 * 60 * 1000, // 12 horas
  },
  servicos: {
    key: 'CACHE_SERVICOS',
    timestamp: 'CACHE_SERVICOS_TS',
    duration: 12 * 60 * 60 * 1000, // 12 horas
  },
  tecnicos: {
    key: 'CACHE_TECNICOS',
    timestamp: 'CACHE_TECNICOS_TS',
    duration: 24 * 60 * 60 * 1000, // 24 horas
  },
  equipamentos: {
    key: 'CACHE_EQUIPAMENTOS',
    timestamp: 'CACHE_EQUIPAMENTOS_TS',
    duration: 6 * 60 * 60 * 1000, // 6 horas
  },
}

class OfflineSearchManager {
  /**
   * Busca dados com suporte offline
   * @param {string} type - Tipo de dados (clientes, produtos, servicos, tecnicos, equipamentos)
   * @param {string} endpoint - Endpoint da API
   * @param {object} params - Parâmetros da requisição
   * @param {boolean} forceRefresh - Forçar atualização do cache
   * @returns {Promise<{data: Array, fromCache: boolean, cacheAge: number}>}
   */
  async search(type, endpoint, params = {}, forceRefresh = false) {
    try {
      console.log(`🔍 [SEARCH] Buscando ${type}...`)

      const config = CACHE_CONFIG[type]
      if (!config) {
        throw new Error(`Tipo de cache não configurado: ${type}`)
      }

      // Get authentication data
      const [accessToken, docu, slug] = await AsyncStorage.multiGet([
        'access',
        'docu',
        'slug',
      ])

      const token = accessToken[1]
      const cnpj = docu[1]
      const slugValue = slug[1]

      if (!token || !cnpj || !slugValue) {
        throw new Error('Dados de autenticação não encontrados')
      }

      // Check cache first
      if (!forceRefresh) {
        const cachedResult = await this.getFromCache(type)
        if (cachedResult.data) {
          console.log(`✅ [SEARCH] ${type} encontrado no cache`)

          // Try to update in background if online
          NetInfo.fetch().then((state) => {
            if (state.isConnected) {
              this.fetchAndCache(
                type,
                endpoint,
                params,
                token,
                cnpj,
                slugValue,
                true
              )
            }
          })

          return cachedResult
        }
      }

      // Check network
      const netInfo = await NetInfo.fetch()
      if (!netInfo.isConnected) {
        console.log(`📴 [SEARCH] Offline - usando cache para ${type}`)
        // Return cache even if expired
        const cachedResult = await this.getFromCache(type, true)
        if (cachedResult.data) {
          return { ...cachedResult, isOffline: true }
        }
        throw new Error('Sem conexão e nenhum cache disponível')
      }

      // Fetch from API
      return await this.fetchAndCache(
        type,
        endpoint,
        params,
        token,
        cnpj,
        slugValue,
        false
      )
    } catch (error) {
      console.error(`❌ [SEARCH] Erro ao buscar ${type}:`, error)

      // Try cache as fallback
      const cachedResult = await this.getFromCache(type, true)
      if (cachedResult.data) {
        console.log(`📦 [SEARCH] Usando cache como fallback para ${type}`)
        return { ...cachedResult, hasError: true, error: error.message }
      }

      throw error
    }
  }

  /**
   * Busca dados do cache
   */
  async getFromCache(type, ignoreExpiration = false) {
    try {
      const config = CACHE_CONFIG[type]
      const [cachedData, timestamp] = await AsyncStorage.multiGet([
        config.key,
        config.timestamp,
      ])

      const data = cachedData[1] ? JSON.parse(cachedData[1]) : null
      const ts = timestamp[1] ? parseInt(timestamp[1]) : null

      if (!data || !ts) {
        return { data: null, fromCache: false, cacheAge: 0 }
      }

      const age = Date.now() - ts
      const isExpired = age > config.duration

      if (isExpired && !ignoreExpiration) {
        console.log(
          `⏰ [CACHE] ${type} expirado (${Math.floor(age / 1000 / 60)}min)`
        )
        return { data: null, fromCache: false, cacheAge: age }
      }

      return {
        data,
        fromCache: true,
        cacheAge: age,
        isExpired,
      }
    } catch (error) {
      console.error(`❌ [CACHE] Erro ao ler cache de ${type}:`, error)
      return { data: null, fromCache: false, cacheAge: 0 }
    }
  }

  /**
   * Busca da API e salva no cache
   */
  async fetchAndCache(
    type,
    endpoint,
    params,
    token,
    cnpj,
    slug,
    isBackground = false
  ) {
    try {
      if (!isBackground) {
        console.log(`🔄 [API] Buscando ${type} do servidor...`)
      }

      const config = CACHE_CONFIG[type]
      const url = `${BASE_URL}/api/${slug}${endpoint}`

      const response = await axios.get(url, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
          'X-CNPJ': cnpj,
        },
        timeout: 10000,
      })

      const data = response.data

      if (!data || (Array.isArray(data) && data.length === 0)) {
        console.log(`ℹ️ [API] Nenhum resultado para ${type}`)
      }

      // Save to cache
      await AsyncStorage.multiSet([
        [config.key, JSON.stringify(data)],
        [config.timestamp, Date.now().toString()],
      ])

      console.log(
        `✅ [API] ${type} salvo no cache (${
          Array.isArray(data) ? data.length : 1
        } itens)`
      )

      return {
        data,
        fromCache: false,
        cacheAge: 0,
        isBackground,
      }
    } catch (error) {
      console.error(`❌ [API] Erro ao buscar ${type}:`, error.message)

      if (!isBackground) {
        throw error
      }

      return null
    }
  }

  /**
   * Busca local no cache (para autocomplete/filtros)
   */
  async searchLocal(type, query, field = 'nome') {
    try {
      const cachedResult = await this.getFromCache(type, true)

      if (!cachedResult.data || !Array.isArray(cachedResult.data)) {
        return []
      }

      const lowerQuery = query.toLowerCase().trim()

      return cachedResult.data.filter((item) => {
        const value = item[field]
        if (!value) return false
        return value.toLowerCase().includes(lowerQuery)
      })
    } catch (error) {
      console.error(`❌ [SEARCH LOCAL] Erro:`, error)
      return []
    }
  }

  /**
   * Limpa cache de um tipo específico
   */
  async clearCache(type) {
    try {
      const config = CACHE_CONFIG[type]
      await AsyncStorage.multiRemove([config.key, config.timestamp])
      console.log(`🗑️ [CACHE] ${type} limpo`)
      return true
    } catch (error) {
      console.error(`❌ [CACHE] Erro ao limpar ${type}:`, error)
      return false
    }
  }

  /**
   * Limpa todo o cache
   */
  async clearAllCache() {
    try {
      const keys = Object.values(CACHE_CONFIG).flatMap((c) => [
        c.key,
        c.timestamp,
      ])
      await AsyncStorage.multiRemove(keys)
      console.log('🗑️ [CACHE] Todo cache limpo')
      return true
    } catch (error) {
      console.error('❌ [CACHE] Erro ao limpar todo cache:', error)
      return false
    }
  }

  /**
   * Pré-carrega dados essenciais
   */
  async preloadEssentialData() {
    console.log('🔄 [PRELOAD] Iniciando pré-carga de dados...')

    try {
      const netInfo = await NetInfo.fetch()
      if (!netInfo.isConnected) {
        console.log('📴 [PRELOAD] Offline - pulando pré-carga')
        return
      }

      // Pré-carrega dados essenciais em paralelo
      await Promise.allSettled([
        this.search('clientes', '/licencas/clientes/', {}, true),
        this.search('tecnicos', '/licencas/tecnicos/', {}, true),
        this.search('servicos', '/licencas/servicos/', {}, true),
      ])

      console.log('✅ [PRELOAD] Pré-carga concluída')
    } catch (error) {
      console.error('❌ [PRELOAD] Erro na pré-carga:', error)
    }
  }

  /**
   * Obtém estatísticas do cache
   */
  async getCacheStats() {
    const stats = {}

    for (const [type, config] of Object.entries(CACHE_CONFIG)) {
      const result = await this.getFromCache(type, true)
      stats[type] = {
        hasData: !!result.data,
        count: Array.isArray(result.data) ? result.data.length : 0,
        ageMinutes: Math.floor(result.cacheAge / 1000 / 60),
        isExpired: result.isExpired,
      }
    }

    return stats
  }
}

// Exportar instância singleton
export default new OfflineSearchManager()

// Exemplo de uso:
/*
import offlineSearch from './utils/offlineSearchManager'

// Buscar clientes
const { data, fromCache, cacheAge } = await offlineSearch.search(
  'clientes',
  '/licencas/clientes/',
  { search: 'João' }
)

// Busca local rápida (autocomplete)
const results = await offlineSearch.searchLocal('clientes', 'joão', 'nome')

// Limpar cache
await offlineSearch.clearCache('clientes')

// Pré-carregar dados essenciais (chamar após login)
await offlineSearch.preloadEssentialData()

// Obter estatísticas
const stats = await offlineSearch.getCacheStats()
console.log(stats)
*/
