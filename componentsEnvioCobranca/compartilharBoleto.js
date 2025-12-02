import * as FileSystem from 'expo-file-system/legacy'
import * as Sharing from 'expo-sharing'
import Toast from 'react-native-toast-message'
import styles from '../styles/cobrancasStyles'
import { Platform, Linking } from 'react-native'

export default async function compartilharBoleto(cobranca) {
  try {
    if (Platform.OS === 'web') {
      if (cobranca.boleto_base64) {
        const dataUrl = `data:application/pdf;base64,${cobranca.boleto_base64}`
        try {
          const canOpen = await Linking.canOpenURL(dataUrl)
          if (canOpen) {
            await Linking.openURL(dataUrl)
            return true
          }
        } catch (_) {}
        if (typeof window !== 'undefined' && window.open) {
          window.open(dataUrl, '_blank')
          return true
        }
        throw new Error('Compartilhamento não disponível no web')
      }
      if (cobranca.url_boleto) {
        await Linking.openURL(cobranca.url_boleto)
        return true
      }
      throw new Error('Boleto não disponível (sem base64 ou URL)')
    }
    const fileName = `boleto_${cobranca.numero_titulo}_${cobranca.parcela}.pdf`
    const fileUri = FileSystem.documentDirectory + fileName
    if (cobranca.boleto_base64) {
      await FileSystem.writeAsStringAsync(fileUri, cobranca.boleto_base64, {
        encoding:
          (FileSystem.EncodingType && FileSystem.EncodingType.Base64) ||
          'base64',
      })
    } else if (cobranca.url_boleto) {
      await FileSystem.downloadAsync(cobranca.url_boleto, fileUri)
    } else {
      throw new Error('Boleto não disponível (sem base64 ou URL)')
    }

    const fileInfo = await FileSystem.getInfoAsync(fileUri)
    if (!fileInfo.exists) throw new Error('Arquivo não criado')

    const isAvailable = await Sharing.isAvailableAsync()
    if (isAvailable) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Enviar Boleto PDF',
        UTI: 'com.adobe.pdf',
      })
      return true
    } else {
      throw new Error('Compartilhamento não disponível')
    }
  } catch (error) {
    console.error('Erro ao compartilhar boleto:', error)
    Toast.show({
      type: 'error',
      text1: 'Erro',
      text2: 'Falha ao compartilhar boleto: ' + error.message,
    })
    return false
  }
}

export async function compartilharBoletosEmLote(cobrancas) {
  try {
    if (!Array.isArray(cobrancas) || cobrancas.length === 0)
      return { sucessos: 0, falhas: 0 }
    let sucessos = 0
    let falhas = 0
    for (const c of cobrancas) {
      if (!c?.boleto_base64) {
        falhas++
        continue
      }
      const ok = await compartilharBoleto(c)
      if (ok) sucessos++
      else falhas++
    }
    return { sucessos, falhas }
  } catch (error) {
    console.error('Erro no compartilhamento em lote:', error)
    return { sucessos: 0, falhas: cobrancas?.length || 0 }
  }
}
