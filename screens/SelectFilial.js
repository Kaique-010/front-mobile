import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert, // Importando Alert para mostrar mensagens de erro
} from 'react-native'
import { BASE_URL, fetchSlugMap } from '../utils/api'
import axios from 'axios'
import { getModulosComPermissao } from '../utils/modulosComPermissao'
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
        const docu = await AsyncStorage.getItem('docu')

        const slugMap = await fetchSlugMap()

        // Encontrando o objeto com o CNPJ correspondente
        const slugObj = slugMap.find((item) => item.cnpj === docu)

        if (!accessToken) {
          console.error('[ERROR] Token de acesso não encontrado.')
          return
        }

        if (!slugObj) {
          // Corrigindo a condição aqui
          console.error('[ERROR] Slug não encontrado para o CNPJ.')
          Alert.alert('Erro', 'CNPJ não encontrado no mapa de licenças.')
          setLoading(false)
          return
        }

        const slug = slugObj.slug

        // Ajuste na URL para refletir o parâmetro correto
        const response = await axios.get(
          `${BASE_URL}/api/${slug}/licencas/filiais/?empresa_id=${empresaId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'X-CNPJ': docu,
            },
          }
        )

        setFiliais(response.data)
      } catch (error) {
        console.error(
          'Erro ao carregar filiais:',
          error.response?.data || error.message
        )
        Alert.alert('Erro', 'Erro ao carregar filiais. Tente novamente.')
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

      // Carregar módulos específicos da filial selecionada
      console.log('📱 Carregando módulos permitidos...')
      const modulosPermitidos = await getModulosComPermissao()
      
      console.log('🔍 Módulos retornados pela API:')
      console.log('📊 Quantidade:', modulosPermitidos?.length || 0)
      console.log('📋 Lista completa:', JSON.stringify(modulosPermitidos, null, 2))
      
      if (modulosPermitidos && modulosPermitidos.length > 0) {
        await AsyncStorage.setItem('modulos', JSON.stringify(modulosPermitidos))
        console.log('✅ Módulos salvos no AsyncStorage:', modulosPermitidos.length)
        
        // Verificar se foram salvos corretamente
        const modulosSalvos = await AsyncStorage.getItem('modulos')
        console.log('🔍 Verificação - Módulos no AsyncStorage:', JSON.parse(modulosSalvos || '[]').length)
      } else {
        console.log('⚠️ Nenhum módulo permitido encontrado')
        await AsyncStorage.setItem('modulos', JSON.stringify([]))
      }

      navigation.navigate('MainApp')
    } catch (error) {
      console.error('Erro ao salvar filial selecionada:', error)
      Alert.alert('Erro', 'Erro ao salvar filial. Tente novamente.')
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
