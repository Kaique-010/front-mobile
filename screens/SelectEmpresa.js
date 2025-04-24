import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  ActivityIndicator,
} from 'react-native'
import axios from 'axios'
import { BASE_URL } from '../utils/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import styles from '../styles/loginStyles'

export default function SelectEmpresa({ navigation }) {
  const [empresas, setEmpresas] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEmpresa, setSelectedEmpresa] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchEmpresas() {
      try {
        // Recupera o token de acesso do AsyncStorage
        const accessToken = await AsyncStorage.getItem('access')

        if (!accessToken) {
          console.error('[ERROR] Token de acesso não encontrado.')
          setError('Token de acesso não encontrado.')
          return
        }

        // Faz a requisição com o token de acesso
        const response = await axios.get(`${BASE_URL}/api/auth/empresas/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        setEmpresas(response.data)
      } catch (error) {
        console.error(
          'Erro ao carregar empresas:',
          error.response || error.message
        )
        setError('Erro ao carregar empresas. Tente novamente.')
      } finally {
        setLoading(false)
      }
    }

    fetchEmpresas()
  }, [])

  const handleSelectEmpresa = async (item) => {
    const empresaId = item.empr_codi
    const empresaNome = item.empr_nome

    try {
      await AsyncStorage.setItem('empresaId', empresaId.toString())
      await AsyncStorage.setItem('empresaNome', empresaNome) // Salvando o nome também
      console.log('[STORAGE] Empresa salva:', empresaId)

      navigation.navigate('SelectFilial', {
        empresaId,
        empresaNome,
      })
    } catch (error) {
      console.error('Erro ao salvar empresa:', error)
      setError('Erro ao salvar a empresa. Tente novamente.')
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Selecione a Empresa</Text>
      {/* Exibindo erro, caso haja algum */}
      {error && <Text style={styles.errorText}>{error}</Text>}

      <FlatList
        data={empresas}
        keyExtractor={(item) => item.empr_codi.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleSelectEmpresa(item)}
            style={styles.button}>
            <Text style={styles.buttonText}>{item.empr_nome}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  )
}
