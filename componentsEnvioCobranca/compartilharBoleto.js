import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import Toast from 'react-native-toast-message'
import styles from '../styles/cobrancasStyles'

export default async function compartilharBoleto(cobranca) {
  try {
    const fileName = `boleto_${cobranca.numero_titulo}_${cobranca.parcela}.pdf`
    const fileUri = FileSystem.documentDirectory + fileName

    await FileSystem.writeAsStringAsync(fileUri, cobranca.boleto_base64, {
      encoding: FileSystem.EncodingType.Base64,
    })

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
