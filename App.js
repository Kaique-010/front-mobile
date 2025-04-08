import React, { useState } from 'react'
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native'

export default function App() {
  const [ucusername, setUcusername] = useState('')
  const [ucpassword, setUcpassword] = useState('')

  const handleLogin = async () => {
    try {
      const response = await fetch('http://192.168.10.35:8000/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: ucusername, password: ucpassword }),
      })

      const data = await response.json()

      if (response.ok) {
        Alert.alert('Login OK', JSON.stringify(data))
        // aqui você pode salvar o token com AsyncStorage por exemplo
      } else {
        Alert.alert('Erro', data.error || 'Erro no login')
      }
    } catch (error) {
      Alert.alert('Erro de rede', error.message)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login de Teste</Text>

      <TextInput
        style={styles.input}
        placeholder="Usuário"
        value={ucusername}
        onChangeText={setUcusername}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={ucpassword}
        onChangeText={setUcpassword}
      />

      <Button title="Entrar" onPress={handleLogin} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
  },
})
