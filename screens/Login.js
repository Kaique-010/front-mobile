import React, { useState } from 'react'
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native'
import { BASE_URL } from '../utils/api'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import styles from '../styles/loginStyles'

export default function Login({ navigation }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/login/`, {
        username,
        password,
      })

      const { access, refresh, user } = response.data

      // Armazena os tokens e dados do usuário no AsyncStorage
      await AsyncStorage.multiSet([
        ['access', access],
        ['refresh', refresh],
        ['user', JSON.stringify(user)],
      ])

      console.log('[LOGIN] Tokens armazenados com sucesso.')

      // Redireciona para a tela principal apenas após garantir que tudo foi salvo
      navigation.navigate('SelectEmpresa')
    } catch (err) {
      console.error('[LOGIN ERROR]', err?.response?.data || err.message)
      setError('Login falhou. Verifique suas credenciais.')
    }
  }

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/logo.png')} // substitua pelo caminho da sua logo
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.text}>Spartacus Sistemas</Text>
      <TextInput
        placeholder="Usuário"
        placeholderTextColor="#C0C0C0"
        value={username}
        onChangeText={(text) => setUsername(text.toLowerCase())}
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        placeholder="Senha"
        placeholderTextColor="#C0C0C0"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  )
}
