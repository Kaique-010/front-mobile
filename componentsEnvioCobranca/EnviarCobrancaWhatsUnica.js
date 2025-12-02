import { Alert, Linking } from 'react-native'
import Toast from 'react-native-toast-message'
import { criarMensagemCobranca } from './CriarMensagem'
import compartilharBoleto from './compartilharBoleto'
import styles from '../styles/cobrancasStyles'

export default async function enviarCobrancaWhatsApp({
  selectedCobranca,
  incluirBoleto,
  setLoadingWhats,
  setModalVisible,
}) {
  setLoadingWhats(true)

  try {
    const numeroRaw =
      selectedCobranca.cliente_celular?.trim() ||
      selectedCobranca.cliente_telefone?.trim() ||
      ''
    const numeroLimpo = numeroRaw.replace(/\D/g, '')

    if (!numeroLimpo || numeroLimpo.length < 10 || numeroLimpo.length > 11) {
      Alert.alert('Erro', 'Cliente não possui número válido')
      return
    }

    let numeroZap =
      numeroLimpo.length === 10 ? `5511${numeroLimpo}` : `55${numeroLimpo}`
    const mensagem = criarMensagemCobranca(selectedCobranca)

    // ENVIO UNITÁRIO: SEMPRE envia texto + boleto (se disponível)
    const urlTexto = `https://wa.me/${numeroZap}?text=${encodeURIComponent(
      mensagem
    )}`
    await Linking.openURL(urlTexto)

    // Se tem boleto e foi solicitado, envia após o texto
    if (selectedCobranca.boleto_base64) {
      setTimeout(async () => {
        await compartilharBoleto(selectedCobranca)
      }, 3000)

      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Mensagem enviada! Boleto será compartilhado em seguida.',
      })
    } else {
      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Mensagem enviada com sucesso!',
      })
    }

    setModalVisible(false)
  } catch (error) {
    console.error('Erro ao enviar WhatsApp:', error)
    Toast.show({
      type: 'error',
      text1: 'Erro',
      text2: 'Falha ao enviar mensagem',
    })
  } finally {
    setLoadingWhats(false)
  }
}
