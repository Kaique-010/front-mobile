import { launchCamera } from 'react-native-image-picker'
import * as Location from 'expo-location'
import { apiPostComContexto, apiGetComContexto } from '../utils/api'
import { PermissionsAndroid, Platform, Alert } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

/*/solicitar as permissões*/
const requestCameraPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Permissão da Câmera',
          message:
            'Este aplicativo precisa de acesso à câmera para tirar fotos.',
          buttonNeutral: 'Perguntar depois',
          buttonNegative: 'Cancelar',
          buttonPositive: 'OK',
        }
      )
      return granted === PermissionsAndroid.RESULTS.GRANTED
    } catch (err) {
      console.warn('Erro ao solicitar permissão da câmera:', err)
      return false
    }
  }
  return true
}

export const tirarFotoComGeo = () =>
  new Promise(async (resolve, reject) => {
    const hasPermission = await requestCameraPermission()

    if (!hasPermission) {
      return reject('Permissão da câmera é necessária para tirar fotos')
    }

    launchCamera(
      {
        mediaType: 'photo',
        includeBase64: true,
        quality: 0.5,
        maxWidth: 800,
        maxHeight: 800,
      },
      (response) => {
        if (response.didCancel) {
          console.log('❌ Usuário cancelou a foto')
          return reject('Foto cancelada pelo usuário')
        }

        if (response.errorMessage) {
          console.log('❌ Erro na câmera:', response.errorMessage)
          return reject(`Erro na câmera: ${response.errorMessage}`)
        }

        if (!response.assets?.[0]?.base64) {
          console.log('❌ Foto inválida ou sem base64')
          return reject('Foto inválida ou sem dados')
        }

        Location.requestForegroundPermissionsAsync()
          .then(({ status }) => {
            if (status !== 'granted') {
              resolve({
                imagem_base64: response.assets[0].base64,
                latitude: null,
                longitude: null,
              })
              return
            }

            Location.getCurrentPositionAsync({
              enableHighAccuracy: true,
              timeout: 3000,
            })
              .then((position) => {
                resolve({
                  imagem_base64: response.assets[0].base64,
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                })
              })
              .catch((locationError) => {
                console.log('❌ Erro ao obter localização:', locationError)
                // Mesmo sem localização, vamos enviar a foto
                resolve({
                  imagem_base64: response.assets[0].base64,
                  latitude: null,
                  longitude: null,
                })
              })
          })
          .catch((permissionError) => {
            console.log(
              '❌ Erro ao solicitar permissão de localização:',
              permissionError
            )

            resolve({
              imagem_base64: response.assets[0].base64,
              latitude: null,
              longitude: null,
            })
          })
      }
    )
  })

export const enviarFotoEtapa = async ({
  etapa,
  ordemId,
  codTecnico,
  observacao,
  data,
}) => {
  const endpoint = `ordemdeservico/imagens/${etapa}/`
  const empresaId = await AsyncStorage.getItem('empresaId')
  const filialId = await AsyncStorage.getItem('filialId')

  const camposEtapa = {
    antes: {
      iman_orde: ordemId,
      iman_empr: empresaId,
      iman_fili: filialId,
    },
    durante: {
      imdu_orde: ordemId,
      imdu_empr: empresaId,
      imdu_fili: filialId,
    },
    depois: {
      imde_orde: ordemId,
      imde_empr: empresaId,
      imde_fili: filialId,
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
      imagem_upload: data.imagem_base64,
      img_latitude: latitudeLimitada,
      img_longitude: longitudeLimitada,
    },
    durante: {
      imagem_upload: data.imagem_base64,
      img_latitude: latitudeLimitada,
      img_longitude: longitudeLimitada,
    },
    depois: {
      imagem_upload: data.imagem_base64,
      img_latitude: latitudeLimitada,
      img_longitude: longitudeLimitada,
    },
  }

  const payload = {
    ...camposEtapa[etapa],
    ...camposImagem[etapa],
    codi: codTecnico,
    observacao,
  }

  return await apiPostComContexto(endpoint, payload)
}

export const fetchFotos = async (etapa, ordemId) => {
  try {
    const empresaId = await AsyncStorage.getItem('empresaId')
    const filialId = await AsyncStorage.getItem('filialId')
    const endpoint = `ordemdeservico/imagens/${etapa}/`
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
