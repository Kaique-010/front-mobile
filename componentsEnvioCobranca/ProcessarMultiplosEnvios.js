import { Linking } from 'react-native'
import Toast from 'react-native-toast-message'
import compartilharBoleto, {
  compartilharBoletosEmLote,
} from './compartilharBoleto'
import { criarMensagemCobranca } from './CriarMensagem'
import { apiGetComContexto } from '../utils/api'

export default async function processarEnviosMultiplos({
  cobrancasSelecionadas,
  incluirBoleto,
  setEnviandoLote,
  setProgressoEnvio,
  setSelecionadas,
}) {
  setEnviandoLote(true)
  setProgressoEnvio({ atual: 0, total: cobrancasSelecionadas.length })

  let sucessos = 0
  let falhas = 0

  const obterNumeroZap = async (c) => {
    const numeroBase = (c.cliente_celular || c.cliente_telefone || '').replace(
      /\D/g,
      ''
    )
    const valido =
      numeroBase && (numeroBase.length === 10 || numeroBase.length === 11)
    if (valido) return `55${numeroBase}`
    try {
      if (c.cliente_id) {
        const entidade = await apiGetComContexto(
          `entidades/entidades/${c.cliente_id}/`
        )
        const raw = (entidade?.enti_celu || entidade?.enti_fone || '').replace(
          /\D/g,
          ''
        )
        if (raw && (raw.length === 10 || raw.length === 11)) return `55${raw}`
      }
    } catch (_) {}
    return null
  }

  if (cobrancasSelecionadas.length > 1) {
    console.log(
      `🚚 Envio em lote de ${cobrancasSelecionadas.length} cobranças (abrir chat e enviar boletos)`
    )
    const grupos = cobrancasSelecionadas.reduce((acc, c) => {
      const key = c.cliente_id || c.cliente_nome || 'sem-cliente'
      acc[key] = acc[key] || []
      acc[key].push(c)
      return acc
    }, {})

    const chaves = Object.keys(grupos)
    for (let gi = 0; gi < chaves.length; gi++) {
      const grupoKey = chaves[gi]
      const grupo = grupos[grupoKey]
      setProgressoEnvio({ atual: gi + 1, total: chaves.length })
      const numeroZap = await obterNumeroZap(grupo[0])
      if (!numeroZap) {
        console.log(`❌ Número não encontrado para grupo ${grupoKey}`)
        falhas += grupo.length
        continue
      }
      try {
        const chatUrl = `https://wa.me/${numeroZap}`
        const canOpen = await Linking.canOpenURL(chatUrl)
        if (canOpen) await Linking.openURL(chatUrl)
        for (let j = 0; j < grupo.length; j++) {
          const ok = await compartilharBoleto(grupo[j])
          if (ok) sucessos++
          else falhas++
          if (j < grupo.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 2000))
          }
        }
      } catch (error) {
        console.error(`Erro no grupo ${grupoKey}:`, error)
        falhas += grupo.length
      }
    }
  } else {
    console.log('📲 Envio único: mensagem + boleto se disponível')
    for (let i = 0; i < cobrancasSelecionadas.length; i++) {
      const cobranca = cobrancasSelecionadas[i]
      setProgressoEnvio({ atual: i + 1, total: cobrancasSelecionadas.length })

      try {
        const numeroZap = await obterNumeroZap(cobranca)
        if (!numeroZap) {
          console.log(`❌ Número inválido para ${cobranca.cliente_nome}`)
          falhas++
          continue
        }

        const mensagem = criarMensagemCobranca(cobranca)
        const url = `https://wa.me/${numeroZap}?text=${encodeURIComponent(
          mensagem
        )}`
        const canOpen = await Linking.canOpenURL(url)
        if (canOpen) {
          await Linking.openURL(url)
        }
        if (cobranca.boleto_base64) {
          const compartilhado = await compartilharBoleto(cobranca)
          if (canOpen || compartilhado) sucessos++
          else falhas++
        } else {
          if (canOpen) sucessos++
          else falhas++
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
