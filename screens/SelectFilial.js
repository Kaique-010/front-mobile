import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { BASE_URL, fetchSlugMap, safeSetItem } from '../utils/api'
import axios from 'axios'
import { getModulosComPermissao } from '../utils/modulosComPermissao'
import AsyncStorage from '@react-native-async-storage/async-storage'
import NetInfo from '@react-native-community/netinfo'
import Toast from 'react-native-toast-message'
import styles from '../styles/loginStyles'
import { FontAwesome } from '@expo/vector-icons'

const CACHE_DURATION = 12 * 60 * 60 * 1000 // 12 horas

export default function SelectFilial({ route, navigation }) {
  const { empresaId, empresaNome } = route.params
  const [filiais, setFiliais] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [botaoDesabilitado, setBotaoDesabilitado] = useState(false)
  const [error, setError] = useState(null)
  const [isOffline, setIsOffline] = useState(false)
  const [cacheAge, setCacheAge] = useState(null)

  const CACHE_KEY = `CACHED_FILIAIS_${empresaId}`
  const CACHE_TIMESTAMP_KEY = `CACHED_FILIAIS_${empresaId}_TIMESTAMP`

  useEffect(() => {
    // Monitor network status
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected)
    })

    fetchFiliais()

    return () => unsubscribe()
  }, [empresaId])

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

  const fetchFiliais = async (forceRefresh = false) => {
    try {
      setLoading(true)
      setError(null)

      console.log(`🔄 [FILIAIS] Carregando filiais para empresa ${empresaId}`)

      // Get stored data
      const accessToken = await AsyncStorage.getItem('access')
      const docu = await AsyncStorage.getItem('docu')
      const slug = await AsyncStorage.getItem('slug')

      if (!accessToken || !docu) {
        console.error('❌ [FILIAIS] Token ou CNPJ não encontrado')
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
        console.log('✅ [FILIAIS] Usando cache válido')
        const parsedData = JSON.parse(cachedData)
        setFiliais(parsedData)
        const age = await getCacheAge()
        setCacheAge(age)
        setLoading(false)

        // Try to update in background if online
        const netInfo = await NetInfo.fetch()
        if (netInfo.isConnected) {
          fetchFiliaisFromAPI(accessToken, docu, slug, true)
        }
        return
      }

      // Try to fetch from API
      const netInfo = await NetInfo.fetch()
      if (netInfo.isConnected) {
        await fetchFiliaisFromAPI(accessToken, docu, slug, false)
      } else {
        // Offline - use cache even if expired
        if (cachedData) {
          console.log('📴 [FILIAIS] Modo offline - usando cache')
          const parsedData = JSON.parse(cachedData)
          setFiliais(parsedData)
          const age = await getCacheAge()
          setCacheAge(age)
          Toast.show({
            type: 'info',
            text1: 'Modo Offline',
            text2: 'Exibindo filiais do cache',
          })
        } else {
          setError('Sem conexão e nenhum cache disponível.')
          Toast.show({
            type: 'error',
            text1: 'Sem Dados',
            text2: 'Conecte-se à internet para carregar filiais',
          })
        }
      }
    } catch (error) {
      console.error('❌ [FILIAIS] Erro:', error)

      // Try to use cache on error
      try {
        const cachedData = await AsyncStorage.getItem(CACHE_KEY)
        if (cachedData) {
          console.log('📦 [FILIAIS] Usando cache após erro')
          const parsedData = JSON.parse(cachedData)
          setFiliais(parsedData)
          const age = await getCacheAge()
          setCacheAge(age)
          setError('Usando dados em cache. Erro ao atualizar.')
          Toast.show({
            type: 'warning',
            text1: 'Dados em Cache',
            text2: 'Não foi possível atualizar',
          })
        } else {
          setError('Erro ao carregar filiais e sem cache disponível.')
        }
      } catch (cacheError) {
        console.error('❌ [FILIAIS] Erro ao ler cache:', cacheError)
        setError('Erro ao carregar filiais.')
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const fetchFiliaisFromAPI = async (
    accessToken,
    docu,
    slug,
    isBackground = false
  ) => {
    try {
      if (!isBackground) {
        console.log('🔄 [FILIAIS] Buscando do servidor...')
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
        `${BASE_URL}/api/${finalSlug}/licencas/filiais/?empresa_id=${empresaId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-CNPJ': docu,
          },
          timeout: 10000,
        }
      )

      if (response.data && Array.isArray(response.data)) {
        console.log(`✅ [FILIAIS] Carregadas ${response.data.length} filiais`)

        // Save to cache
        await AsyncStorage.multiSet([
          [CACHE_KEY, JSON.stringify(response.data)],
          [CACHE_TIMESTAMP_KEY, Date.now().toString()],
        ])

        setFiliais(response.data)
        setCacheAge({ age: 0, hours: 0, minutes: 0 })
        setError(null)

        if (!isBackground) {
          Toast.show({
            type: 'success',
            text1: 'Filiais Atualizadas',
            text2: `${response.data.length} filiais carregadas`,
            visibilityTime: 2000,
          })
        }
      } else {
        throw new Error('Resposta inválida do servidor')
      }
    } catch (error) {
      console.error('❌ [FILIAIS] Erro na API:', error.message)

      if (!isBackground) {
        // Only show error if not a background update
        throw error
      }
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchFiliais(true)
  }

  const handleSelectFilial = async (filialId, filialNome) => {
    if (botaoDesabilitado) return

    setBotaoDesabilitado(true)

    try {
      console.log(`📍 [FILIAIS] Selecionada: ${filialId} - ${filialNome}`)

      // Save empresa and filial data
      await AsyncStorage.multiSet([
        ['empresaId', empresaId.toString()],
        ['empresaNome', empresaNome],
        ['filialId', filialId.toString()],
        ['filialNome', filialNome],
      ])

      console.log('✅ [FILIAIS] Dados salvos')

      // Get permitted modules
      let modulosPermitidos = []
      try {
        modulosPermitidos = await getModulosComPermissao()
        console.log(
          `✅ [FILIAIS] Módulos carregados: ${modulosPermitidos?.length || 0}`
        )
      } catch (error) {
        console.error(
          '⚠️ [FILIAIS] Erro ao carregar módulos, usando cache:',
          error
        )
        // Try to get from cache
        const cachedModulos = await AsyncStorage.getItem('modulos')
        if (cachedModulos) {
          modulosPermitidos = JSON.parse(cachedModulos)
          console.log('📦 [FILIAIS] Usando módulos do cache')
        }
      }

      // Save modules
      await safeSetItem('modulos', JSON.stringify(modulosPermitidos || []))

      // Verify save
      const modulosSalvos = await AsyncStorage.getItem('modulos')
      console.log(
        `✅ [FILIAIS] Módulos salvos: ${modulosSalvos ? 'OK' : 'FALHOU'}`
      )

      Toast.show({
        type: 'success',
        text1: 'Filial Selecionada',
        text2: filialNome,
        visibilityTime: 2000,
      })

      // Navigate to main app
      setTimeout(() => {
        navigation.navigate('MainApp')
      }, 500)
    } catch (error) {
      console.error('❌ [FILIAIS] Erro ao salvar filial:', error)
      setError('Erro ao salvar filial. Tente novamente.')
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível selecionar a filial',
      })
      setBotaoDesabilitado(false)
    }
  }

  const renderHeader = () => (
    <View style={{ padding: 25, backgroundColor: '#182C39' }}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 16,
        }}>
        <FontAwesome name="chevron-left" size={16} color="#007AFF" />
        <Text style={{ color: '#007AFF', marginLeft: 8, fontSize: 12 }}>
          Voltar
        </Text>
      </TouchableOpacity>

      <Text
        style={[
          styles.text,
          { marginBottom: 8, fontSize: 12, color: '#a5a5a5ff' },
        ]}>
        Selecione a Filial
      </Text>
      <Text style={{ fontSize: 12, color: '#fff', marginBottom: 8 }}>
        Empresa: {empresaNome}
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
            backgroundColor: '#FFE5E5',
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
      <FontAwesome name="map-marker" size={48} color="#ccc" />
      <Text
        style={{
          marginTop: 16,
          fontSize: 16,
          color: '#666',
          textAlign: 'center',
        }}>
        Nenhuma filial encontrada
      </Text>
      {isOffline && (
        <Text
          style={{
            marginTop: 8,
            fontSize: 12,
            color: '#999',
            textAlign: 'center',
          }}>
          Conecte-se à internet para carregar filiais
        </Text>
      )}
    </View>
  )

  if (loading && filiais.length === 0) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center' },
        ]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 16, color: '#666' }}>
          Carregando filiais...
        </Text>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#182C39' }}>
      <FlatList
        data={filiais}
        keyExtractor={(item) =>
          item.empr_codi ? item.empr_codi.toString() : Math.random().toString()
        }
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        renderItem={({ item }) => (
          <TouchableOpacity
            disabled={botaoDesabilitado}
            onPress={() => handleSelectFilial(item.empr_codi, item.empr_nome)}
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
                width: 'auto', // Override styles.button width
              },
              botaoDesabilitado && { opacity: 0.5 },
            ]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <FontAwesome
                name="map-marker"
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
                <Text style={{ fontSize: 12, color: '#fff', marginTop: 4 }}>
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
        contentContainerStyle={{ paddingBottom: 15 }}
      />
    </View>
  )
}
