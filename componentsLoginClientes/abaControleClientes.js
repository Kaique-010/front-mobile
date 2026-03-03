import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import styles from '../styles/entidadeStyles'

export default function AbaControleClientes({
  abaAtual,
  formData,
  handleChange,
}) {
  const [mostrarSenha, setMostrarSenha] = useState(false)

  const handleTogglePreco = async (field, usuario) => {
    const newValue = !formData[field]
    handleChange(field, newValue)
  }

  const handleToggleFoto = async (field, usuario) => {
    const newValue = !formData[field]
    handleChange(field, newValue)
  }

  if (abaAtual !== 'clientes') return null

  return (
    <View style={styles.innerContainer}>
      <Text style={styles.label}>Usuário de Cliente nº1</Text>
      <TextInput
        style={styles.input}
        value={formData.enti_mobi_usua}
        onChangeText={(text) => handleChange('enti_mobi_usua', text)}
        keyboardType="default"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Senha de Cliente nº1</Text>
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

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          marginTop: 10,
          marginBottom: 40,
        }}>
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center' }}
          onPress={() => handleTogglePreco('enti_mobi_prec', 'mobi')}>
          <Ionicons
            name={formData.enti_mobi_prec ? 'checkbox' : 'square-outline'}
            size={24}
            color="#deb887"
          />
          <Text style={[styles.label, { marginLeft: 8, marginBottom: 0 }]}>
            Ver Preço
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center' }}
          onPress={() => handleToggleFoto('enti_mobi_foto', 'mobi')}>
          <Ionicons
            name={formData.enti_mobi_foto ? 'checkbox' : 'square-outline'}
            size={24}
            color="#deb887"
          />
          <Text style={[styles.label, { marginLeft: 8, marginBottom: 0 }]}>
            Ver Fotos
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Usuário de Cliente nº2</Text>
      <TextInput
        style={styles.input}
        value={formData.enti_usua_mobi}
        onChangeText={(text) => handleChange('enti_usua_mobi', text)}
        keyboardType="default"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Senha de Cliente nº2</Text>
      <View style={{ position: 'relative', justifyContent: 'center' }}>
        <TextInput
          style={[styles.input, { paddingRight: 50 }]}
          value={formData.enti_senh_mobi}
          onChangeText={(text) => handleChange('enti_senh_mobi', text)}
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

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          marginTop: 10,
          marginBottom: 60,
        }}>
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center' }}
          onPress={() => handleTogglePreco('enti_usua_prec', 'usua')}>
          <Ionicons
            name={formData.enti_usua_prec ? 'checkbox' : 'square-outline'}
            size={24}
            color="#deb887"
          />
          <Text style={[styles.label, { marginLeft: 8, marginBottom: 0 }]}>
            Ver Preço
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center' }}
          onPress={() => handleToggleFoto('enti_usua_foto', 'usua')}>
          <Ionicons
            name={formData.enti_usua_foto ? 'checkbox' : 'square-outline'}
            size={24}
            color="#deb887"
          />
          <Text style={[styles.label, { marginLeft: 8, marginBottom: 0 }]}>
            Ver Fotos
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
