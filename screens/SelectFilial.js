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
  const { empresaId, empresaNome } = route.params
  const [filiais, setFiliais] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFiliais() {
      try {
        const accessToken = await AsyncStorage.getItem('access')

        if (!accessToken) {
          console.error('[ERROR] Token de acesso não encontrado.')
          return
        }

        // Ajuste na URL para refletir o parâmetro correto
        const response = await axios.get(
          `${BASE_URL}/api/auth/filiais/?empresa_id=${empresaId}`, // Aqui mudamos para empresa_id
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )

        setFiliais(response.data)
      } catch (error) {
        console.error(
          'Erro ao carregar filiais:',
          error.response?.data || error.message
        )
      } finally {
        setLoading(false)
      }
    }

    fetchFiliais()
  }, [empresaId])

  const handleSelectFilial = async (filialId, filialNome) => {
    try {
      await AsyncStorage.multiSet([
        ['empresaId', empresaId.toString()],
        ['empresaNome', empresaNome],
        ['filialId', filialId.toString()],
        ['filialNome', filialNome],
      ])
      console.log('[STORAGE] Filial salva:', filialId, filialNome)

      navigation.navigate('MainApp') // Redireciona após salvar a filial
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
        keyExtractor={(item) =>
          item.empr_codi ? item.empr_codi.toString() : 'default-key'
        } // Verificando se existe empr_codi
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
