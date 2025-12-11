import * as FileSystem from 'expo-file-system/legacy'
import * as Sharing from 'expo-sharing'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { BASE_URL, getAuthHeaders } from '../utils/api'
import { Linking, Platform } from 'react-native'

export async function gerarPdfServidor(os) {
  try {
    const slug = await AsyncStorage.getItem('slug')
    const token = await AsyncStorage.getItem('access')
    const headersExtras = await getAuthHeaders()
    const id = (os && (os.osex_codi ?? os.os_os))
    const url = `${BASE_URL}/api/${slug}/osexterna/ordens/${id}/imprimir/`

    const fileUri =
      (FileSystem.documentDirectory || FileSystem.cacheDirectory) +
      `osex_${id}.pdf`

    const downloaded = await FileSystem.downloadAsync(url, fileUri, {
      headers: {
        Authorization: `Bearer ${token}`,
        ...headersExtras,
      },
    })

    if (downloaded.status !== 200) {
      throw new Error('Erro ao gerar PDF no servidor')
    }

    if (Platform.OS === 'web') {
      try {
        const base64 = await FileSystem.readAsStringAsync(downloaded.uri, {
          encoding:
            (FileSystem.EncodingType && FileSystem.EncodingType.Base64) ||
            'base64',
        })
        const dataUrl = `data:application/pdf;base64,${base64}`
        const canOpen = await Linking.canOpenURL(dataUrl)
        if (canOpen) {
          await Linking.openURL(dataUrl)
        } else if (typeof window !== 'undefined' && window.open) {
          window.open(dataUrl, '_blank')
        } else {
          throw new Error('Compartilhamento não disponível no web')
        }
        return
      } catch (e) {
        throw new Error('Falha ao abrir PDF no navegador')
      }
    }

    await Sharing.shareAsync(downloaded.uri)
  } catch (e) {
    throw e
  }
}
