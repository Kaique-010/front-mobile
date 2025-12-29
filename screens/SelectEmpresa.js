import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import axios from 'axios'
import { BASE_URL, fetchSlugMap, safeSetItem } from '../utils/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import NetInfo from '@react-native-community/netinfo'
import Toast from 'react-native-toast-message'
import styles from '../styles/loginStyles'
import { FontAwesome } from '@expo/vector-icons'

const CACHE_KEY = 'CACHED_EMPRESAS'
const CACHE_TIMESTAMP_KEY = 'CACHED_EMPRESAS_TIMESTAMP'
const CACHE_DURATION = 12 * 60 * 60 * 1000 // 12 horas

export default function SelectEmpresa({ navigation }) {
  const [empresas, setEmpresas] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedEmpresa, setSelectedEmpresa] = useState(null)
  const [botaoDesabilitado, setBotaoDesabilitado] = useState(false)
  const [error, setError] = useState(null)
  const [isOffline, setIsOffline] = useState(false)
  const [cacheAge, setCacheAge] = useState(null)

  useEffect(() => {
    // Monitor network status
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected)
    })

    fetchEmpresas()

    return () => unsubscribe()
  }, [])

  const getCacheAge = async () => {
    try {
      const timestamp = await AsyncStorage.getItem(CACHE_TIMESTAMP_KEY)
      if (timestamp) {
        const age = Date.now() - parseInt(timestamp)
        const hours = Math.floor(age / (1000 * 60 * 60))
        const minutes = Math.floor((age % (1000 * 60 * 60)) / (1000 * 60))
        return { age, hours, minutes }
      }
    } catch (error) {
      console.error('Erro ao verificar idade do cache:', error)
    }
    return null
  }

  const fetchEmpresas = async (forceRefresh = false) => {
    try {
      setLoading(true)
      setError(null)

      // Get stored data
      const accessToken = await AsyncStorage.getItem('access')
      const docu = await AsyncStorage.getItem('docu')
      const slug = await AsyncStorage.getItem('slug')

      if (!accessToken || !docu) {
        console.error('❌ [EMPRESAS] Token ou CNPJ não encontrado')
        setError('Sessão expirada. Faça login novamente.')
        return
      }

      // Check cache first
      const cachedData = await AsyncStorage.getItem(CACHE_KEY)
      const cacheTimestamp = await AsyncStorage.getItem(CACHE_TIMESTAMP_KEY)
      const cacheValid =
        cacheTimestamp && Date.now() - parseInt(cacheTimestamp) < CACHE_DURATION

      // If cache is valid and we're not force refreshing, use cache
      if (cachedData && cacheValid && !forceRefresh) {
        console.log('✅ [EMPRESAS] Usando cache válido')
        setEmpresas(JSON.parse(cachedData))
        const age = await getCacheAge()
        setCacheAge(age)
        setLoading(false)

        // Try to update in background if online
        const netInfo = await NetInfo.fetch()
        if (netInfo.isConnected) {
          fetchEmpresasFromAPI(accessToken, docu, slug, true)
        }
        return
      }

      // Try to fetch from API
      const netInfo = await NetInfo.fetch()
      if (netInfo.isConnected) {
        await fetchEmpresasFromAPI(accessToken, docu, slug, false)
      } else {
        // Offline - use cache even if expired
        if (cachedData) {
          console.log('📴 [EMPRESAS] Modo offline - usando cache')
          setEmpresas(JSON.parse(cachedData))
          const age = await getCacheAge()
          setCacheAge(age)
          Toast.show({
            type: 'info',
            text1: 'Modo Offline',
            text2: 'Exibindo empresas do cache',
          })
        } else {
          setError('Sem conexão e nenhum cache disponível.')
          Toast.show({
            type: 'error',
            text1: 'Sem Dados',
            text2: 'Conecte-se à internet para carregar empresas',
          })
        }
      }
    } catch (error) {
      console.error('❌ [EMPRESAS] Erro:', error)

      // Try to use cache on error
      try {
        const cachedData = await AsyncStorage.getItem(CACHE_KEY)
        if (cachedData) {
          console.log('📦 [EMPRESAS] Usando cache após erro')
          setEmpresas(JSON.parse(cachedData))
          const age = await getCacheAge()
          setCacheAge(age)
          setError('Usando dados em cache. Erro ao atualizar.')
          Toast.show({
            type: 'warning',
            text1: 'Dados em Cache',
            text2: 'Não foi possível atualizar',
          })
        } else {
          setError('Erro ao carregar empresas e sem cache disponível.')
        }
      } catch (cacheError) {
        console.error('❌ [EMPRESAS] Erro ao ler cache:', cacheError)
        setError('Erro ao carregar empresas.')
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const fetchEmpresasFromAPI = async (
    accessToken,
    docu,
    slug,
    isBackground = false
  ) => {
    try {
      if (!isBackground) {
        console.log('🔄 [EMPRESAS] Buscando do servidor...')
      }

      // If no slug in storage, fetch it
      let finalSlug = slug
      if (!finalSlug) {
        const slugMap = await fetchSlugMap()
        finalSlug = slugMap[docu]
        if (finalSlug) {
          await AsyncStorage.setItem('slug', finalSlug)
        }
      }

      if (!finalSlug) {
        throw new Error('Slug não encontrado para o CNPJ')
      }

      const response = await axios.get(
        `${BASE_URL}/api/${finalSlug}/licencas/empresas/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-CNPJ': docu,
          },
          timeout: 10000,
        }
      )

      if (response.data && Array.isArray(response.data)) {
        console.log(`✅ [EMPRESAS] Carregadas ${response.data.length} empresas`)

        // Save to cache
        await AsyncStorage.multiSet([
          [CACHE_KEY, JSON.stringify(response.data)],
          [CACHE_TIMESTAMP_KEY, Date.now().toString()],
        ])

        setEmpresas(response.data)
        setCacheAge({ age: 0, hours: 0, minutes: 0 })
        setError(null)

        if (!isBackground) {
          Toast.show({
            type: 'success',
            text1: 'Empresas Atualizadas',
            text2: `${response.data.length} empresas carregadas`,
            visibilityTime: 2000,
          })
        }
      } else {
        throw new Error('Resposta inválida do servidor')
      }
    } catch (error) {
      console.error('❌ [EMPRESAS] Erro na API:', error.message)

      if (!isBackground) {
        // Only show error if not a background update
        throw error
      }
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchEmpresas(true)
  }

  const handleSelectEmpresa = async (item) => {
    if (botaoDesabilitado) return

    const empresaId = item.empr_codi
    const empresaNome = item.empr_nome
    setBotaoDesabilitado(true)

    try {
      console.log(`📍 [EMPRESAS] Selecionada: ${empresaId} - ${empresaNome}`)

      // Save selected empresa
      await AsyncStorage.multiSet([
        ['empresaId', empresaId.toString()],
        ['empresaNome', empresaNome],
      ])

      console.log('✅ [EMPRESAS] Dados salvos, navegando para SelectFilial')

      // Navigate to next screen
      navigation.navigate('SelectFilial', {
        empresaId,
        empresaNome,
      })
    } catch (error) {
      console.error('❌ [EMPRESAS] Erro ao salvar empresa:', error)
      setError('Erro ao salvar a empresa. Tente novamente.')
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível selecionar a empresa',
      })
    } finally {
      setBotaoDesabilitado(false)
    }
  }

  const renderHeader = () => (
    <View style={{ padding: 16, backgroundColor: '#182C39', color: '#fff' }}>
      <Text
        style={{
          color: '#fff',
          fontSize: 12,
          textAlign: 'center',
          verticalAlign: 'middle',
        }}>
        Selecione a Empresa
      </Text>

      {/* Offline indicator */}
      {isOffline && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#FF9500',
            padding: 8,
            borderRadius: 8,
            marginTop: 8,
          }}>
          <FontAwesome
            name="wifi"
            size={16}
            color="#fff"
            style={{ marginRight: 8 }}
          />
          <Text style={{ color: '#fff', fontSize: 12 }}>Modo Offline</Text>
        </View>
      )}

      {/* Cache age indicator */}
      {cacheAge && cacheAge.hours > 0 && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#E8F4F8',
            padding: 8,
            borderRadius: 8,
            marginTop: 8,
          }}>
          <FontAwesome
            name="clock-o"
            size={14}
            color="#007AFF"
            style={{ marginRight: 8 }}
          />
          <Text style={{ color: '#007AFF', fontSize: 11 }}>
            Cache: {cacheAge.hours}h {cacheAge.minutes}m atrás
          </Text>
        </View>
      )}

      {/* Error message */}
      {error && (
        <View
          style={{
            backgroundColor: '#182C39',
            padding: 12,
            borderRadius: 8,
            marginTop: 8,
            borderLeftWidth: 4,
            borderLeftColor: '#FF3B30',
          }}>
          <Text style={{ color: '#FF3B30', fontSize: 12 }}>{error}</Text>
        </View>
      )}
    </View>
  )

  const renderEmpty = () => (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
      }}>
      <FontAwesome name="building-o" size={48} color="#ccc" />
      <Text
        style={{
          marginTop: 16,
          fontSize: 16,
          color: '#666',
          textAlign: 'center',
        }}>
        Nenhuma empresa encontrada
      </Text>
      {isOffline && (
        <Text
          style={{
            marginTop: 8,
            fontSize: 12,
            color: '#999',
            textAlign: 'center',
          }}>
          Conecte-se à internet para carregar empresas
        </Text>
      )}
    </View>
  )

  if (loading && empresas.length === 0) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center' },
        ]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 16, color: '#fffefeff' }}>
          Carregando empresas...
        </Text>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#072436ff' }}>
      <FlatList
        data={empresas}
        keyExtractor={(item) => item.empr_codi.toString()}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        renderItem={({ item }) => (
          <TouchableOpacity
            disabled={botaoDesabilitado}
            onPress={() => handleSelectEmpresa(item)}
            style={[
              styles.button,
              {
                marginHorizontal: 16,
                marginVertical: 6,
                backgroundColor: '#182C39',
                borderWidth: 1,
                borderColor: '#000000ff',
                borderRadius: 12,
                padding: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
                width: 'auto', // Override width: 100% from styles.button to allow margins to work properly if needed, or keep 100% and margins work too?
                // With width: '100%' and marginHorizontal, it might overflow or shrink. 
                // In RN, width: '100%' + margin causes overflow. 
                // Better to remove width: '100%' or set it to auto/undefined since it's a flex item (kinda) or block.
                // styles.button has width: '100%'. 
                // Let's override width to undefined so it respects margins.
              },
              botaoDesabilitado && { opacity: 0.5 },
            ]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <FontAwesome
                name="building"
                size={20}
                color="#007AFF"
                style={{ marginRight: 12 }}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.buttonText,
                    { fontSize: 16, fontWeight: '600' },
                  ]}>
                  {item.empr_nome}
                </Text>
                <Text
                  style={{ fontSize: 12, color: '#ffffffff', marginTop: 4 }}>
                  Código: {item.empr_codi}
                </Text>
              </View>
              <FontAwesome name="chevron-right" size={16} color="#ccc" />
            </View>
          </TouchableOpacity>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </View>
  )
}
