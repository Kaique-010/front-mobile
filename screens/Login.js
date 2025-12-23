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

export default function Login({ navigation }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [docu, setDocu] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState('')
  const [modulos, setModulos] = useState([])
  const [isClienteLogin, setIsClienteLogin] = useState(false)
  const [documento, setDocumento] = useState('')
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [setor, setSetor] = useState('')

  const {
    login: clienteLogin,
    loading: clienteAuthLoading,
    error: clienteAuthError,
  } = useClienteAuth()

  const { signIn, isOfflineMode } = useAuth()

  // Show offline indicator
  useEffect(() => {
    if (isOfflineMode) {
      Toast.show({
        type: 'info',
        text1: '📴 Modo Offline',
        text2: 'Você pode fazer login com credenciais salvas',
        visibilityTime: 3000,
      })
    }
  }, [isOfflineMode])

  // Verificação crítica do AuthContext
  useEffect(() => {
    if (!signIn) {
      console.error('❌ CRITICAL: signIn function is undefined!')
      Toast.show({
        type: 'error',
        text1: 'Erro de Configuração',
        text2: 'AuthContext não inicializado. Reinicie o app.',
        visibilityTime: 5000,
      })
    } else {
      console.log('✅ [Login] signIn function loaded successfully')
    }
  }, [signIn])

  useEffect(() => {
    const carregarDadosSalvos = async () => {
      try {
        const [
          docuSalvo,
          usernameSalvo,
          documentoSalvo,
          usuarioSalvo,
          setorSalvo,
        ] = await AsyncStorage.multiGet([
          'docu',
          'username',
          'documento',
          'usuario',
          'setor',
        ])

        if (docuSalvo[1]) setDocu(docuSalvo[1])
        if (usernameSalvo[1]) setUsername(usernameSalvo[1])
        if (documentoSalvo[1]) setDocumento(documentoSalvo[1])
        if (usuarioSalvo[1]) {
          try {
            const parsed = JSON.parse(usuarioSalvo[1])
            setUsuario(parsed.username || '')
          } catch {
            setUsuario('')
          }
        }
        if (setorSalvo[1]) setSetor(setorSalvo[1])

        console.log('✅ [Login] Dados salvos carregados')
      } catch (e) {
        console.error('❌ [Login] Erro ao carregar dados salvos:', e)
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

  const tentarLoginOffline = async (username, password) => {
    try {
      console.log('🔄 [OFFLINE] Tentando login offline...')

      const [
        savedUser,
        savedPass,
        savedSessionStr,
        savedModulosStr,
        savedSetor,
        savedDocu,
        savedSlug,
        savedAccess,
        savedRefresh,
      ] = await AsyncStorage.multiGet([
        'username',
        'last_password',
        'usuario',
        'modulos',
        'setor',
        'docu',
        'slug',
        'access',
        'refresh',
      ])

      console.log('🔍 [OFFLINE] Dados encontrados:', {
        hasUser: !!savedUser[1],
        hasPass: !!savedPass[1],
        hasSession: !!savedSessionStr[1],
        username: savedUser[1],
        inputUsername: username,
      })

      if (
        savedUser[1] &&
        savedPass[1] &&
        savedSessionStr[1] &&
        savedUser[1].toLowerCase() === username.toLowerCase() &&
        savedPass[1] === password
      ) {
        console.log('✅ [OFFLINE] Credenciais válidas no cache')

        Toast.show({
          type: 'success',
          text1: '📴 Modo Offline',
          text2: 'Login realizado com dados salvos',
          visibilityTime: 3000,
        })

        const usuario = JSON.parse(savedSessionStr[1])
        const modulos = savedModulosStr[1] ? JSON.parse(savedModulosStr[1]) : []

        const sessionData = {
          access: savedAccess[1] || 'offline_token',
          refresh: savedRefresh[1] || 'offline_refresh',
          usuario: usuario,
          usuario_id: usuario.usuario_id?.toString() || '',
          username: savedUser[1],
          setor: savedSetor[1] || '',
          docu: savedDocu[1] || '',
          slug: savedSlug[1] || '',
          modulos: modulos,
          userType: 'funcionario',
          isOffline: true,
        }

        console.log('📦 [OFFLINE] SessionData preparado:', {
          hasAccess: !!sessionData.access,
          hasUsuario: !!sessionData.usuario,
          username: sessionData.username,
        })

        // IMPORTANTE: Chamar signIn e aguardar
        const success = await signIn(sessionData)

        if (success) {
          console.log('✅ [OFFLINE] signIn executado com sucesso')
          return true
        } else {
          console.error('❌ [OFFLINE] signIn falhou')
          return false
        }
      } else {
        console.log('❌ [OFFLINE] Credenciais não correspondem:', {
          userMatch: savedUser[1]?.toLowerCase() === username.toLowerCase(),
          passMatch: savedPass[1] === password,
        })
        return false
      }
    } catch (offlineError) {
      console.error('❌ [OFFLINE] Erro:', offlineError)
      return false
    }
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

    // Verificação crítica antes de prosseguir
    if (!signIn || typeof signIn !== 'function') {
      console.error('❌ signIn não disponível')
      setError('Erro de configuração. Reinicie o aplicativo.')
      Toast.show({
        type: 'error',
        text1: 'Erro Crítico',
        text2: 'Sistema de autenticação não inicializado',
        visibilityTime: 5000,
      })
      return
    }

    setIsLoading(true)
    setLoadingStep('Verificando dados...')
    setError('') // Limpa erros anteriores

    try {
      // Salvar dados básicos primeiro
      await AsyncStorage.multiSet([
        ['docu', docu],
        ['username', username],
        ['setor', setor],
      ])
      console.log('✅ [LOGIN] Dados básicos salvos')

      // Buscar slug
      setLoadingStep('Buscando configurações...')
      const slugMap = await fetchSlugMap()
      const slug = slugMap[docu]

      if (!slug) {
        throw new Error('CNPJ não encontrado no sistema')
      }

      console.log('✅ [LOGIN] Slug encontrado:', slug)

      // Tentar login online
      setLoadingStep('Conectando ao servidor...')
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
          timeout: 15000,
        }
      )

      console.log('✅ [LOGIN] Resposta recebida do servidor')

      const { access, refresh, usuario } = response.data
      setModulos(response.data.modulos)

      // Salvar sessão COMPLETA
      setLoadingStep('Salvando sessão...')

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
        ['last_password', password], // CRÍTICO para offline
      ])

      console.log('✅ [LOGIN] Todos os dados salvos no AsyncStorage')

      // Preparar sessionData
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
        isOffline: false,
      }

      console.log('📦 [LOGIN] SessionData preparado para signIn')

      // Atualizar contexto
      const signInSuccess = await signIn(sessionData)

      if (!signInSuccess) {
        throw new Error('Falha ao atualizar contexto de autenticação')
      }

      console.log(`✅ [LOGIN] Login completo em ${Date.now() - startTime}ms`)

      Toast.show({
        type: 'success',
        text1: 'Login realizado',
        text2: `Bem-vindo, ${usuario.username}!`,
        visibilityTime: 2000,
      })

      // Navegar após pequeno delay para o Toast aparecer
      setTimeout(() => {
        navigation.navigate('SelectEmpresa')
      }, 500)
    } catch (error) {
      console.error(`❌ [LOGIN] Erro após ${Date.now() - startTime}ms:`, error)

      // Verificar se é erro de rede
      const isNetworkError =
        !error.response ||
        error.code === 'ECONNABORTED' ||
        error.message === 'Network Error' ||
        error.code === 'ETIMEDOUT' ||
        error.message?.includes('Network request failed')

      if (isNetworkError) {
        console.log('🔄 [LOGIN] Erro de rede detectado, tentando offline...')
        setLoadingStep('Tentando modo offline...')

        const loginOfflineSuccess = await tentarLoginOffline(username, password)

        if (loginOfflineSuccess) {
          console.log('✅ [LOGIN] Login offline bem-sucedido')
          setTimeout(() => {
            navigation.navigate('SelectEmpresa')
          }, 500)
          return // Exit here on success
        } else {
          setError('Sem conexão e nenhuma sessão salva encontrada.')
          Toast.show({
            type: 'error',
            text1: 'Login Offline Falhou',
            text2: 'Faça login online pelo menos uma vez',
            visibilityTime: 4000,
          })
        }
      } else {
        // Erro de credenciais ou servidor
        if (error.response?.status === 401) {
          setError('Usuário ou senha incorretos')
          Toast.show({
            type: 'error',
            text1: 'Credenciais Inválidas',
            text2: 'Verifique seu usuário e senha',
            visibilityTime: 4000,
          })
        } else if (error.response?.status >= 500) {
          setError('Erro no servidor. Tente novamente.')
          Toast.show({
            type: 'error',
            text1: 'Erro no Servidor',
            text2: 'Tente novamente em alguns instantes',
          })
        } else {
          setError(error.message || 'Erro inesperado no login')
          Toast.show({
            type: 'error',
            text1: 'Erro',
            text2: error.message || 'Erro desconhecido',
          })
        }
      }
    } finally {
      setIsLoading(false)
      setLoadingStep('')
    }
  }

  const handleLoginCliente = async () => {
    if (!documento || !usuario || !senha) {
      setError('Preencha todos os campos.')
      Toast.show({
        type: 'error',
        text1: 'Campos vazios',
        text2: 'Preencha todos os dados',
      })
      return
    }

    console.log('[LOGIN CLIENTE]', { documento, usuario })
    setIsLoading(true)

    try {
      const success = await clienteLogin(documento, usuario, senha)

      if (success) {
        console.log('✅ Login cliente sucesso')
        Toast.show({
          type: 'success',
          text1: 'Login realizado',
          text2: 'Bem-vindo!',
        })
        navigation.navigate('HomeCliente')
      } else {
        setError('Credenciais inválidas')
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'Usuário ou senha incorretos',
        })
      }
    } catch (err) {
      console.error('[LOGIN CLIENTE ERROR]', err)
      setError('Erro no login')
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível fazer login',
      })
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

      <MotiText
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 400 }}
        style={styles.title}>
        SPARTACUS MOBILE
      </MotiText>

      {/* Indicador de modo offline */}
      {isOfflineMode && (
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            backgroundColor: '#FF9500',
            padding: 8,
            borderRadius: 8,
            marginBottom: 10,
          }}>
          <Text style={{ color: '#fff', textAlign: 'center', fontSize: 12 }}>
            📴 Sem conexão - Use credenciais salvas
          </Text>
        </MotiView>
      )}

      {renderCheckbox()}

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
                  setError('')
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
