import { Linking } from 'react-native'
import Toast from 'react-native-toast-message'
import compartilharBoleto from './compartilharBoleto'
import { criarMensagemCobranca } from './CriarMensagem'

export default async function processarEnviosMultiplos({
  cobrancasSelecionadas,
  incluirBoleto,
  setEnviandoLote,
  setProgressoEnvio,
  setSelecionadas
}) {
  setEnviandoLote(true)
  setProgressoEnvio({ atual: 0, total: cobrancasSelecionadas.length })

  let sucessos = 0
  let falhas = 0

  for (let i = 0; i < cobrancasSelecionadas.length; i++) {
    const cobranca = cobrancasSelecionadas[i]
    setProgressoEnvio({ atual: i + 1, total: cobrancasSelecionadas.length })

    try {
      const numeroRaw =
        cobranca.cliente_celular || cobranca.cliente_telefone || ''
      const numeroLimpo = numeroRaw.replace(/\D/g, '')

      if (!numeroLimpo || numeroLimpo.length < 10 || numeroLimpo.length > 11) {
        console.log(`❌ Número inválido para ${cobranca.cliente_nome}`)
        falhas++
        continue
      }

      let numeroZap =
        numeroLimpo.length === 10 ? `5511${numeroLimpo}` : `55${numeroLimpo}`

      if (incluirBoleto && cobranca.boleto_base64) {
        // ENVIO MÚLTIPLO: APENAS BOLETO (mais eficiente)
        const compartilhado = await compartilharBoleto(cobranca)
        if (compartilhado) {
          sucessos++
        } else {
          falhas++
        }
      } else {
        // ENVIO MÚLTIPLO: APENAS TEXTO (se não tem boleto)
        const mensagem = criarMensagemCobranca(cobranca)
        const url = `https://wa.me/${numeroZap}?text=${encodeURIComponent(
          mensagem
        )}`

        const canOpen = await Linking.canOpenURL(url)
        if (canOpen) {
          await Linking.openURL(url)
          sucessos++
        } else {
          falhas++
        }
      }

      // Delay anti-spam mais inteligente
      const delay = incluirBoleto ? 2000 : 1500
      if (i < cobrancasSelecionadas.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    } catch (error) {
      console.error(`Erro ao enviar para ${cobranca.cliente_nome}:`, error)
      falhas++
    }
  }

  setEnviandoLote(false)
  setProgressoEnvio({ atual: 0, total: 0 })
  setSelecionadas([])

  // Resultado final
  Toast.show({
    type: sucessos > 0 ? 'success' : 'error',
    text1: 'Envio Concluído',
    text2: `✅ ${sucessos} sucessos | ❌ ${falhas} falhas`,
    visibilityTime: 5000,
  })
}
