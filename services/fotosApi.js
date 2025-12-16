import * as ImagePicker from 'expo-image-picker'
import * as Location from 'expo-location'
import { apiPostComContexto, apiGetComContexto } from '../utils/api'
import { Alert } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const tirarFotoComGeo = () =>
  new Promise(async (resolve, reject) => {
    try {
      // Solicitar permissão da câmera
      const { status } = await ImagePicker.requestCameraPermissionsAsync()
      
      if (status !== 'granted') {
        Alert.alert(
          'Permissão necessária',
          'É necessário permitir acesso à câmera para tirar fotos.'
        )
        return reject('Permissão da câmera é necessária para tirar fotos')
      }

      // Abrir câmera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.5,
        base64: true,
      })

      if (result.canceled) {
        console.log('❌ Usuário cancelou a foto')
        return reject('Foto cancelada pelo usuário')
      }

      if (!result.assets?.[0]?.base64) {
        console.log('❌ Foto inválida ou sem base64')
        return reject('Foto inválida ou sem dados')
      }

      // Solicitar permissão de localização
      const locationPermission = await Location.requestForegroundPermissionsAsync()
      
      if (locationPermission.status !== 'granted') {
        resolve({
          imagem_base64: result.assets[0].base64,
          latitude: null,
          longitude: null,
        })
        return
      }

      // Obter localização
      try {
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          timeout: 3000,
        })
        
        resolve({
          imagem_base64: result.assets[0].base64,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      } catch (locationError) {
        console.log('❌ Erro ao obter localização:', locationError)
        resolve({
          imagem_base64: result.assets[0].base64,
          latitude: null,
          longitude: null,
        })
      }
    } catch (error) {
      console.log('❌ Erro geral:', error)
      reject(`Erro ao tirar foto: ${error.message}`)
    }
  })

export const enviarFotoEtapa = async ({
  etapa,
  ordemId,
  codTecnico,
  observacao,
  data,
}) => {
  try {
    const endpoint = `ordemdeservico/imagens-${etapa}/`
    const empresaId = await AsyncStorage.getItem('empresaId')
    const filialId = await AsyncStorage.getItem('filialId')

    console.log('📤 Enviando foto:', { 
      etapa, 
      ordemId, 
      codTecnico, 
      empresaId, 
      filialId,
      hasImage: !!data?.imagem_base64,
      imageSize: data?.imagem_base64?.length || 0
    })

    // Validar dados obrigatórios
    if (!ordemId || !empresaId || !filialId) {
      throw new Error('Dados obrigatórios faltando: ordemId, empresaId ou filialId')
    }

    if (!data?.imagem_base64) {
      throw new Error('Imagem base64 não encontrada')
    }

    const camposEtapa = {
      antes: {
        iman_orde: String(ordemId),
        iman_empr: String(empresaId),
        iman_fili: String(filialId),
      },
      durante: {
        imdu_orde: String(ordemId),
        imdu_empr: String(empresaId),
        imdu_fili: String(filialId),
      },
      depois: {
        imde_orde: String(ordemId),
        imde_empr: String(empresaId),
        imde_fili: String(filialId),
      },
    }

    // Limitar precisão das coordenadas para 6 casas decimais
    const latitudeLimitada = data.latitude
      ? parseFloat(data.latitude.toFixed(6))
      : null
    const longitudeLimitada = data.longitude
      ? parseFloat(data.longitude.toFixed(6))
      : null

    const camposImagem = {
      antes: {
        imagem_upload: `data:image/jpeg;base64,${data.imagem_base64}`,
        img_latitude: latitudeLimitada,
        img_longitude: longitudeLimitada,
      },
      durante: {
        imagem_upload: `data:image/jpeg;base64,${data.imagem_base64}`,
        img_latitude: latitudeLimitada,
        img_longitude: longitudeLimitada,
      },
      depois: {
        imagem_upload: `data:image/jpeg;base64,${data.imagem_base64}`,
        img_latitude: latitudeLimitada,
        img_longitude: longitudeLimitada,
      },
    }

    const payload = {
      ...camposEtapa[etapa],
      ...camposImagem[etapa],
      codi: String(codTecnico || ''),
      observacao: String(observacao || ''),
    }

    console.log('📦 Payload estrutura:', {
      endpoint,
      campos: Object.keys(payload),
      tamanhoImagem: payload.imagem_upload?.length || 0,
      coordenadas: {
        latitude: payload.img_latitude,
        longitude: payload.img_longitude
      }
    })

    const result = await apiPostComContexto(endpoint, payload)
    console.log('✅ Foto enviada com sucesso:', result)
    return result

  } catch (error) {
    console.error('❌ Erro detalhado ao enviar foto:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      etapa,
      ordemId
    })
    throw error
  }
}

export const fetchFotos = async (etapa, ordemId) => {
  try {
    const empresaId = await AsyncStorage.getItem('empresaId')
    const filialId = await AsyncStorage.getItem('filialId')
    const endpoint = `ordemdeservico/imagens-${etapa}/`
    const params = {
      [`im${
        etapa === 'antes' ? 'an' : etapa === 'durante' ? 'du' : 'de'
      }_empr`]: empresaId,
      [`im${
        etapa === 'antes' ? 'an' : etapa === 'durante' ? 'du' : 'de'
      }_fili`]: filialId,
      [`im${
        etapa === 'antes' ? 'an' : etapa === 'durante' ? 'du' : 'de'
      }_orde`]: ordemId,
    }
    const res = await apiGetComContexto(endpoint, params)
    const fotos = res?.results || []

    if (fotos.length > 0) {
    }

    return fotos
  } catch (error) {
    console.error(`❌ Erro ao buscar fotos da etapa ${etapa}:`, error)
    return []
  }
}
