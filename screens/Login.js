import React, { useState, useEffect } from 'react'
import {
  View,
  TextInput,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
} from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { BASE_URL, fetchSlugMap, safeSetItem } from '../utils/api'
import { useFonts, FaunaOne_400Regular } from '@expo-google-fonts/fauna-one'
import styles from '../styles/loginStyles'
import { MotiView, MotiText } from 'moti'
import useClienteAuth from '../hooks/useClienteAuth'
import Toast from 'react-native-toast-message'
import { useAuth } from '../contexts/AuthContext'
import { handleApiError } from '../utils/errorHandler'

// Cache para dados de empresas
const EMPRESAS_CACHE_KEY = 'empresas_login_cache'
const EMPRESAS_CACHE_DURATION = 12 * 60 * 60 * 1000 // 12 horas

// Função para buscar empresas com cache (rota nova com slug)
const buscarEmpresasComCache = async () => {
  try {
    // Resolve slug a partir do CNPJ salvo
    const docu = await AsyncStorage.getItem('docu')
    const slugMap = await fetchSlugMap()
    const slug = slugMap?.[docu]

    if (!slug) {
      throw new Error('Slug não encontrado para o CNPJ informado')
      Toast.show({
        type: 'error',
        text1: 'Erro ao buscar empresas',
        text2: 'Slug não encontrado para o CNPJ informado',
      })
    }

    const response = await fetch(`${BASE_URL}/api/${slug}/licencas/empresas/`)
    const empresas = await response.json()

    // Salvar no cache
    const cacheData = {
      empresas,
      timestamp: Date.now(),
    }
    await safeSetItem(EMPRESAS_CACHE_KEY, JSON.stringify(cacheData))
    console.log(
      `💾 [CACHE-LOGIN] Salvadas ${empresas.length} empresas no cache`
    )
    Toast.show({
      type: 'success',
      text1: 'Empresas carregadas com sucesso',
    })

    return empresas
  } catch (error) {
    console.log('❌ Erro ao buscar empresas:', error)

    // Tentar recuperar do cache em caso de erro
    try {
      const cachedData = await AsyncStorage.getItem(EMPRESAS_CACHE_KEY)
      if (cachedData) {
        const { empresas } = JSON.parse(cachedData)
        console.log(
          `💾 [CACHE-LOGIN] Recuperado do cache: ${empresas.length} empresas`
        )
        Toast.show({
          type: 'info',
          text1: 'Modo Offline',
          text2: 'Empresas carregadas do cache.',
        })
        return empresas
      }
    } catch (cacheError) {
      console.log('❌ Erro ao ler cache de empresas:', cacheError)
    }

    handleApiError(error, 'Erro ao buscar empresas')
    Toast.show({
      type: 'error',
      text1: 'Erro ao buscar empresas',
      text2: error.message,
    })
    return []
  }
}
export default function Login({ navigation }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [docu, setDocu] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState('')
  const [modulos, setModulos] = useState([])
  const [isClienteLogin, setIsClienteLogin] = useState(false) // Checkbox para cliente
  const [documento, setDocumento] = useState('') // Para login de cliente
  const [usuario, setUsuario] = useState('') // Para login de cliente
  const [senha, setSenha] = useState('') // Para login de cliente
  const [setor, setSetor] = useState('') // Setor do usuário
  const {
    login: clienteLogin,
    loading: clienteAuthLoading,
    error: clienteAuthError,
  } = useClienteAuth()

  const { signIn } = useAuth()

  // Debug: Verificar se signIn está definido
  useEffect(() => {
    if (!signIn) {
      console.error('CRITICAL: signIn function is undefined in Login.js')
      Toast.show({
        type: 'error',
        text1: 'Erro de Configuração',
        text2: 'Função de login não disponível. Contate o suporte.',
      })
    }
  }, [signIn])

  useEffect(() => {
    const carregarDadosSalvos = async () => {
      try {
        const docuSalvo = await AsyncStorage.getItem('docu')
        const usernameSalvo = await AsyncStorage.getItem('username')
        const documentoSalvo = await AsyncStorage.getItem('documento')
        const usuarioSalvo = await AsyncStorage.getItem('usuario')
        const senhaSalvo = await AsyncStorage.getItem('senha')
        const setorSalvo = await AsyncStorage.getItem('setor')

        if (docuSalvo) setDocu(docuSalvo)
        if (usernameSalvo) setUsername(usernameSalvo)
        if (documentoSalvo) setDocumento(documentoSalvo)
        if (usuarioSalvo) setUsuario(usuarioSalvo)
        if (senhaSalvo) setSenha(senhaSalvo)
        if (setorSalvo) setSetor(setorSalvo)
      } catch (e) {
        console.error('Erro ao carregar dados salvos do AsyncStorage', e)
      }
    }

    carregarDadosSalvos()
  }, [])

  const [fontsLoaded] = useFonts({
    FaunaOne_400Regular,
  })

  if (!fontsLoaded) return null

  const handleDocuChange = (text) => {
    setDocu(text.replace(/\D/g, ''))
  }

  const handleDocumentoChange = (text) => {
    setDocumento(text.replace(/\D/g, ''))
  }

  const handleLoginFuncionario = async () => {
    const startTime = Date.now()
    if (!docu || !username || !password) {
      setError('Preencha todos os campos.')
      Toast.show({
        type: 'error',
        text1: 'Campos vazios',
        text2: 'Preencha CNPJ, Usuário e Senha.',
      })
      return
    }

    setIsLoading(true)
    Toast.show({
      type: 'info',
      text1: 'Conectando',
      text2: 'Iniciando login...',
      visibilityTime: 2000,
    })
    setLoadingStep('Verificando dados...')

    try {
      // Log: Salvando dados no AsyncStorage
      const asyncStartTime = Date.now()

      await AsyncStorage.multiSet([
        ['docu', docu],
        ['username', username],
        ['setor', setor],
      ])
      // Log: Buscando SlugMap (agora otimizado)
      setLoadingStep('Buscando configurações...')
      const slugStartTime = Date.now()
      const slugMap = await fetchSlugMap() // Usando função otimizada
      const slug = slugMap[docu]

      if (!slug) {
        setError('CNPJ não encontrado.')
        setIsLoading(false)
        setLoadingStep('')
        return
      }

      // Log: Fazendo requisição de login
      setLoadingStep('Conectando ao servidor...')
      const loginStartTime = Date.now()
      const response = await axios.post(
        `${BASE_URL}/api/${slug}/licencas/login/`,
        {
          username,
          password,
          docu,
          setor,
        },
        {
          headers: {
            'X-CNPJ': docu,
            'X-Username': username,
          },
          timeout: 15000, // 15 segundos de timeout (reduzido de 30s)
        }
      )

      setModulos(response.data.modulos)
      const { access, refresh, usuario } = response.data

      // Log: Salvando dados da sessão
      setLoadingStep('Salvando sessão...')
      const sessionStartTime = Date.now()

      const sessionData = {
        access,
        refresh,
        usuario,
        usuario_id: usuario.usuario_id.toString(),
        username: usuario.username,
        setor,
        docu,
        slug,
        modulos: response.data.modulos,
        userType: 'funcionario',
      }

      await AsyncStorage.multiSet([
        ['access', access],
        ['refresh', refresh],
        ['usuario', JSON.stringify(usuario)],
        ['usuario_id', usuario.usuario_id.toString()],
        ['username', usuario.username],
        ['setor', setor],
        ['docu', docu],
        ['slug', slug],
        ['modulos', JSON.stringify(response.data.modulos)],
        ['userType', 'funcionario'],
        ['last_password', password], // Salva senha para login offline
      ])

      // Update Context
      if (signIn) {
        signIn(sessionData)
      } else {
        console.error('SignIn function missing')
      }

      navigation.navigate('SelectEmpresa')
    } catch (error) {
      console.error(`❌ [LOGIN-TIMING] Erro após: ${Date.now() - startTime}ms`)
      console.error(`❌ [LOGIN-TIMING] Detalhes do erro:`, error)

      // TENTATIVA DE LOGIN OFFLINE
      if (
        !error.response ||
        error.code === 'ECONNABORTED' ||
        error.message === 'Network Error'
      ) {
        try {
          const savedUser = await AsyncStorage.getItem('username')
          const savedPass = await AsyncStorage.getItem('last_password')
          const savedSessionStr = await AsyncStorage.getItem('usuario')
          const savedModulosStr = await AsyncStorage.getItem('modulos')
          const savedSetor = await AsyncStorage.getItem('setor')
          const savedDocu = await AsyncStorage.getItem('docu')
          const savedSlug = await AsyncStorage.getItem('slug')
          const savedAccess = await AsyncStorage.getItem('access')
          const savedRefresh = await AsyncStorage.getItem('refresh')

          if (
            savedUser &&
            savedPass &&
            savedSessionStr &&
            savedUser.toLowerCase() === username.toLowerCase() &&
            savedPass === password
          ) {
            console.log('[LOGIN] Entrando em modo offline')
            Toast.show({
              type: 'info',
              text1: 'Modo Offline',
              text2: 'Logando com dados em cache...',
              visibilityTime: 2000,
            })

            const usuario = JSON.parse(savedSessionStr)
            const modulos = savedModulosStr ? JSON.parse(savedModulosStr) : []

            const sessionData = {
              access: savedAccess,
              refresh: savedRefresh,
              usuario,
              usuario_id: usuario.usuario_id.toString(),
              username: savedUser,
              setor: savedSetor,
              docu: savedDocu,
              slug: savedSlug,
              modulos,
              userType: 'funcionario',
            }

            if (signIn) {
              signIn(sessionData)
              navigation.navigate('SelectEmpresa')
              setIsLoading(false)
              setLoadingStep('')
              return
            }
          }
        } catch (offlineError) {
          console.error('Erro ao tentar login offline:', offlineError)
        }
      }

      console.log(`🔍 [DEBUG] Senha digitada: "${password}"`) // Debug da senha

      if (error.code === 'ECONNABORTED') {
        setError('Timeout na conexão. Verifique sua internet.')
      } else if (error.response) {
        console.error(`❌ [LOGIN-TIMING] Status HTTP: ${error.response.status}`)
        console.error(
          `❌ [LOGIN-TIMING] Dados da resposta:`,
          error.response.data
        )

        // Toast específico para senha incorreta
        if (
          error.response.status === 401 &&
          error.response.data?.error === 'Senha incorreta.'
        ) {
          Toast.show({
            type: 'error',
            text1: 'Senha Incorreta',
            text2: `Senha informada: "${password}"`,
            visibilityTime: 4000,
          })
          setError('Senha incorreta')
        } else {
          setError(`Erro do servidor: ${error.response.status}`)
        }
      } else if (error.request) {
        console.error(`❌ [LOGIN-TIMING] Sem resposta do servidor`)
        setError('Sem resposta do servidor. Verifique sua conexão.')
      } else {
        setError('Erro inesperado no login.')
      }
    } finally {
      setIsLoading(false)
      setLoadingStep('')
    }
  }

  const handleLoginCliente = async () => {
    if (!documento || !usuario || !senha) {
      setError('Preencha todos os campos.')
      return
    }

    console.log('[LOGIN CLIENTE]', { documento, usuario })
    setIsLoading(true)

    try {
      const success = await clienteLogin(documento, usuario, senha)

      if (success) {
        console.log('Login cliente sucesso')
        navigation.navigate('HomeCliente')
      } else {
        setError('Credenciais inválidas')
      }
    } catch (err) {
      console.error('[LOGIN CLIENTE ERROR]', err)
      setError('Erro no login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = () => {
    if (isClienteLogin) {
      handleLoginCliente()
    } else {
      handleLoginFuncionario()
    }
  }

  const renderCheckbox = () => (
    <MotiView
      from={{ opacity: 0, translateY: -10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: 300 }}
      style={styles.checkboxContainer}>
      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={() => {
          setIsClienteLogin(!isClienteLogin)
          setError('')
        }}>
        <View
          style={[styles.checkbox, isClienteLogin && styles.checkboxActive]}>
          {isClienteLogin && (
            <FontAwesome name="check" size={14} color="#fff" />
          )}
        </View>
        <Text style={styles.checkboxLabel}>Login como Cliente</Text>
      </TouchableOpacity>
    </MotiView>
  )

  const renderFuncionarioFields = () => [
    [
      'CNPJ',
      docu,
      handleDocuChange,
      'building',
      '00.000.000/0001-00',
      'number-pad',
    ],
    [
      'Usuário',
      username,
      (text) => setUsername(text.toLowerCase()),
      'user',
      'Digite seu usuário',
      'default',
    ],
    ['Senha', password, setPassword, 'lock', '••••••••', 'default', true],
  ]

  const renderClienteFields = () => [
    [
      'CPF/CNPJ',
      documento,
      handleDocumentoChange,
      'id-card',
      '000.000.000-00',
      'number-pad',
    ],
    [
      'Usuário',
      usuario,
      (text) => setUsuario(text.toLowerCase()),
      'user',
      'Digite seu usuário',
      'default',
    ],
    ['Senha', senha, setSenha, 'lock', '••••••••', 'default', true],
  ]

  const fieldsToRender = isClienteLogin
    ? renderClienteFields()
    : renderFuncionarioFields()

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
      keyboardVerticalOffset={100}>
      {/* Logo animada com bounce */}
      <MotiView
        from={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', delay: 200 }}>
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </MotiView>

      {/* Título */}
      <MotiText
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 400 }}
        style={styles.title}>
        SPARTACUS MOBILE
      </MotiText>

      {/* Checkbox para login de cliente */}
      {renderCheckbox()}

      {/* Campos com animação */}
      {fieldsToRender.map(
        ([label, value, onChange, icon, placeholder, keyboard, secure], i) => (
          <MotiView
            key={`${isClienteLogin ? 'cliente' : 'funcionario'}-${label}`}
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 600 + i * 100 }}
            style={styles.inputContainer}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.inputBox}>
              <FontAwesome
                name={icon}
                size={20}
                color="#ccc"
                style={styles.icon}
              />
              <TextInput
                value={value}
                onChangeText={(text) => {
                  onChange(text)
                  setError('') // Limpa o erro ao digitar
                }}
                placeholder={placeholder}
                placeholderTextColor="#aaa"
                keyboardType={keyboard}
                secureTextEntry={secure}
                autoCapitalize="none"
                style={styles.input}
              />
            </View>
          </MotiView>
        )
      )}

      {/* Botão animado */}
      <MotiView
        from={{ scale: 0.95 }}
        animate={{ scale: isLoading ? 0.95 : 1 }}
        transition={{ type: 'timing', duration: 150 }}
        style={{ width: '70%', alignItems: 'center' }}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={isLoading}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>
                {loadingStep || 'Fazendo login...'}
              </Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>
              {isClienteLogin ? 'Login Cliente' : 'Login'}
            </Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={{ marginTop: 10 }}
          onPress={() => Linking.openURL('https://mobile-sps.site/')}>
          <Text style={styles.linkText}>Spartacus Mobile 2025 ©</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ marginTop: 10 }}
          onPress={() => Linking.openURL('https://l1nq.com/i8Hdg')}>
          <Text style={styles.linkText2}>Atualize o App</Text>
        </TouchableOpacity>
      </MotiView>

      {/* Erro */}
      {error ? (
        <MotiText
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 300 }}
          style={styles.error}>
          {error}
        </MotiText>
      ) : null}
    </KeyboardAvoidingView>
  )
}
