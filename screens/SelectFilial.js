// SelectFilial.js
import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native'
import { BASE_URL } from '../utils/api'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import styles from '../styles/loginStyles'

export default function SelectFilial({ route, navigation }) {
  const { empresaId } = route.params
  const [filiais, setFiliais] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFiliais() {
      try {
        const accessToken = await AsyncStorage.getItem('access')
        console.log('[DEBUG] Access Token:', accessToken) // <-- AQUI!

        if (!accessToken) {
          console.error('[ERROR] Token de acesso não encontrado.')
          return
        }

        const response = await axios.get(
          `${BASE_URL}/api/auth/filiais/?empresa=${empresaId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )
        setFiliais(response.data)
        setLoading(false)
      } catch (error) {
        console.error(
          'Erro ao carregar filiais:',
          error.response?.data || error.message
        )
        setLoading(false)
      }
    }
    fetchFiliais()
  }, [empresaId])
  const handleSelectFilial = async (filialId, filialNome) => {
    try {
      await AsyncStorage.multiSet([
        ['filial', filialId.toString()],
        ['filial_nome', filialNome],
      ])
      console.log('[STORAGE] Filial salva:', filialId)
      console.log('[STORAGE] Filial salva:', filialNome)

      navigation.navigate('MainApp')
    } catch (error) {
      console.error('Erro ao salvar filial selecionada:', error)
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
      <Text style={styles.text}>Selecione a Filial</Text>
      <FlatList
        data={filiais}
        keyExtractor={(item) => item.empr_codi.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleSelectFilial(item.empr_codi, item.empr_nome)}
            style={styles.button}>
            <Text style={styles.buttonText}>{item.empr_nome}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  )
}
