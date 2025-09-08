import { Alert } from 'react-native'
import Toast from 'react-native-toast-message'
import processarEnviosMultiplos from './ProcessarMultiplosEnvios'
import styles from '../styles/cobrancasStyles'

export default function enviarMultiplosWhatsapps({
  cobrancas,
  selecionadas,
  incluirBoleto,
  setEnviandoLote,
  setProgressoEnvio,
  setSelecionadas,
}) {
  const cobrancasSelecionadas = cobrancas.filter((c) =>
    selecionadas.includes(c.id || c.numero_titulo)
  )

  if (cobrancasSelecionadas.length === 0) {
    Toast.show({
      type: 'error',
      text1: 'Erro',
      text2: 'Nenhuma cobrança selecionada',
    })
    return
  }

  // Confirma o envio
  Alert.alert(
    'Confirmar Envio',
    `Enviar para ${cobrancasSelecionadas.length} cliente(s)?\n\n` +
      `${
        incluirBoleto
          ? '📎 APENAS BOLETOS serão enviados (sem texto)'
          : '📝 Apenas mensagens de texto serão enviadas'
      }`,
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Confirmar',
        onPress: () =>
          processarEnviosMultiplos({
            cobrancasSelecionadas,
            incluirBoleto,
            setEnviandoLote,
            setProgressoEnvio,
            setSelecionadas,
          }),
      },
    ]
  )
}
