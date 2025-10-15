import React, { useState, useEffect } from 'react'
import {
  View,
  TextInput,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
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
  
  const {
    login: clienteLogin,
    loading: clienteAuthLoading,
    error: clienteAuthError,
  } = useClienteAuth()

  // ✅ Carregar apenas dados básicos salvos
  useEffect(() => {
    const carregarDadosSalvos = async () => {
      try {
        const docuSalvo = await AsyncStorage.getItem('docu')
        const usernameSalvo = await AsyncStorage.getItem('username')
        const documentoSalvo = await AsyncStorage.getItem('documento')
        const usuarioSalvo = await AsyncStorage.getItem('usuario')

        if (docuSalvo) setDocu(docuSalvo)
        if (usernameSalvo) setUsername(usernameSalvo)
        if (documentoSalvo) setDocumento(documentoSalvo)
        if (usuarioSalvo) setUsuario(usuarioSalvo)
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
    console.log(`🕐 [LOGIN-TIMING] Início do login: ${new Date().toISOString()}`)

    if (!docu || !username || !password) {
      setError('Preencha todos os campos.')
      return
    }

    setIsLoading(true)
    setLoadingStep('Verificando dados...')

    try {
      // Salvar apenas dados básicos ANTES do login
      const asyncStartTime = Date.now()
      console.log(`🕐 [LOGIN-TIMING] Salvando AsyncStorage: ${new Date().toISOString()}`)

      await AsyncStorage.multiSet([
        ['docu', docu],
        ['username', username],
      ])
      
      console.log(`🔑 [LOGIN-TIMING] Dados básicos salvos: docu=${docu}, username=${username}`)
      console.log(`⏱️ [LOGIN-TIMING] AsyncStorage salvo em: ${Date.now() - asyncStartTime}ms`)

      // Buscar SlugMap
      setLoadingStep('Buscando configurações...')
      const slugStartTime = Date.now()
      console.log(`🕐 [LOGIN-TIMING] Buscando SlugMap: ${new Date().toISOString()}`)

      const slugMap = await fetchSlugMap()
      const slug = slugMap[docu]

      console.log(`⏱️ [LOGIN-TIMING] SlugMap obtido em: ${Date.now() - slugStartTime}ms`)
      console.log(`🔍 [LOGIN-TIMING] Slug encontrado: ${slug}`)

      if (!slug) {
        setError('CNPJ não encontrado.')
        setIsLoading(false)
        setLoadingStep('')
        return
      }

      // Fazer requisição de login
      setLoadingStep('Conectando ao servidor...')
      const loginStartTime = Date.now()
      console.log(`🕐 [LOGIN-TIMING] Iniciando requisição login: ${new Date().toISOString()}`)
      console.log(`🔗 [LOGIN-TIMING] URL: ${BASE_URL}/api/${slug}/licencas/login/`)

      const response = await axios.post(
        `${BASE_URL}/api/${slug}/licencas/login/`,
        {
          username,
          password,
          docu,
        },
        {
          headers: {
            'X-CNPJ': docu,
            'X-Username': username,
          },
          timeout: 15000,
        }
      )

      console.log(`⏱️ [LOGIN-TIMING] Requisição login concluída em: ${Date.now() - loginStartTime}ms`)
      console.log(`📊 [LOGIN-TIMING] Status da resposta: ${response.status}`)

      // ✅ CORRIGIDO: Extrair dados do usuário da resposta
      const { access, refresh, usuario, modulos, licenca } = response.data
      
      // ✅ PEGAR O SETOR DO BACKEND
      const setorUsuario = usuario?.setor || usuario?.usua_seto || '0'
      
      console.log('📋 [LOGIN] Dados do usuário recebidos:', usuario)
      console.log('🏢 [LOGIN] Setor do usuário:', setorUsuario)
      console.log('📦 [LOGIN] Módulos recebidos:', modulos)

      // ✅ Salvar dados da sessão COM O SETOR DO BACKEND
      setLoadingStep('Salvando sessão...')
      const sessionStartTime = Date.now()
      console.log(`🕐 [LOGIN-TIMING] Salvando dados da sessão: ${new Date().toISOString()}`)

      await AsyncStorage.multiSet([
        ['access', access],
        ['refresh', refresh],
        ['usuario', JSON.stringify(usuario)],
        ['usuario_id', usuario.usuario_id?.toString() || '0'],
        ['username', usuario.username || username],
        ['setor', setorUsuario.toString()], // ✅ SALVAR SETOR DO BACKEND
        ['docu', docu],
        ['slug', slug],
        ['modulos', JSON.stringify(modulos || [])],
        ['userType', 'funcionario'],
      ])

      console.log(`✅ [LOGIN] Setor salvo no AsyncStorage: ${setorUsuario}`)
      console.log(`⏱️ [LOGIN-TIMING] Sessão salva em: ${Date.now() - sessionStartTime}ms`)
      console.log(`🎉 [LOGIN-TIMING] Login completo em: ${Date.now() - startTime}ms`)
      console.log(`🕐 [LOGIN-TIMING] Fim do login: ${new Date().toISOString()}`)

      setModulos(modulos || [])
      navigation.navigate('SelectEmpresa')

    } catch (error) {
      console.error(`❌ [LOGIN-TIMING] Erro após: ${Date.now() - startTime}ms`)
      console.error(`❌ [LOGIN-TIMING] Detalhes do erro:`, error)
      console.log(`🔍 [DEBUG] Senha digitada: "${password}"`)

      if (error.code === 'ECONNABORTED') {
        setError('Timeout na conexão. Verifique sua internet.')
      } else if (error.response) {
        console.error(`❌ [LOGIN-TIMING] Status HTTP: ${error.response.status}`)
        console.error(`❌ [LOGIN-TIMING] Dados da resposta:`, error.response.data)

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
    <View style={styles.container}>
      {/* Logo animada */}
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

      {/* Botão */}
      <MotiView
        from={{ scale: 0.95 }}
        animate={{ scale: isLoading ? 0.95 : 1 }}
        transition={{ type: 'timing', duration: 150 }}>
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
    </View>
  )
}