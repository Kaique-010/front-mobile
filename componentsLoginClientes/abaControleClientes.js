import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import styles from '../styles/entidadeStyles'

export default function AbaControleClientes({
  abaAtual,
  formData,
  handleChange,
}) {
  const [mostrarSenha, setMostrarSenha] = useState(false)

  if (abaAtual !== 'clientes') return null

  return (
    <View style={styles.innerContainer}>
      <Text style={styles.label}>Usuário de Cliente</Text>
      <TextInput
        style={styles.input}
        value={formData.enti_mobi_usua}
        onChangeText={(text) => handleChange('enti_mobi_usua', text)}
        keyboardType="default"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Senha de Cliente</Text>
      <View style={{ position: 'relative', justifyContent: 'center' }}>
        <TextInput
          style={[styles.input, { paddingRight: 50 }]}
          value={formData.enti_mobi_senh}
          onChangeText={(text) => handleChange('enti_mobi_senh', text)}
          keyboardType="default"
          secureTextEntry={!mostrarSenha}
        />
        <TouchableOpacity
          style={{
            position: 'absolute',
            right: 10,
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 5,
          }}
          onPress={() => setMostrarSenha(!mostrarSenha)}>
          <Ionicons
            name={mostrarSenha ? 'eye-off' : 'eye'}
            size={24}
            color="#deb887"
          />
        </TouchableOpacity>
      </View>
    </View>
  )
}
