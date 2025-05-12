import React, { useState } from 'react'
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
import { BASE_URL } from '../utils/api'
import { useFonts, FaunaOne_400Regular } from '@expo-google-fonts/fauna-one'
import styles from '../styles/loginStyles'
import { MotiView, MotiText } from 'moti'

export default function Login({ navigation }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [docu, setDocu] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const [fontsLoaded] = useFonts({
    FaunaOne_400Regular,
  })

  if (!fontsLoaded) return null

  const handleDocuChange = (text) => {
    setDocu(text.replace(/\D/g, ''))
  }

  const fetchSlugMap = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/licencas/mapa/`)
      const map = {}
      response.data.forEach(({ cnpj, slug }) => {
        map[cnpj] = slug
      })
      return map
    } catch (e) {
      console.error('Erro ao buscar mapa de licenças', e)
      return {}
    }
  }

  const handleLogin = async () => {
    if (!docu || !username || !password) {
      setError('Preencha todos os campos.')
      return
    }

    console.log('[LOGIN ATTEMPT]', { docu, username, password })

    setIsLoading(true)
    try {
      const slugMap = await fetchSlugMap()
      const slug = slugMap[docu]

      if (!slug) {
        setError('CNPJ não encontrado.')
        setIsLoading(false)
        return
      }

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
        }
      )

      const { access, refresh, usuario } = response.data

      await AsyncStorage.multiSet([
        ['access', access],
        ['refresh', refresh],
        ['usuario', JSON.stringify(usuario)],
        ['docu', docu],
        ['slug', slug], // Armazena o slug
        ['user', JSON.stringify(usuario)],
      ])

      console.log('Login bem-sucedido, navegação para SelectEmpresa')
      navigation.navigate('SelectEmpresa')
    } catch (err) {
      console.error('[LOGIN ERROR]', err?.response?.data || err.message)
      setError('Login falhou. Verifique suas credenciais.')
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <View style={styles.container}>
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

      {/* Campos com animação */}
      {[
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
      ].map(
        ([label, value, onChange, icon, placeholder, keyboard, secure], i) => (
          <MotiView
            key={label}
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
        transition={{ type: 'timing', duration: 150 }}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
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
