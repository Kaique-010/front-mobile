import { Alert } from 'react-native'
import styles from '../styles/cobrancasStyles'

export default async function enviarMultiplosEmails({
  cobrancas,
  selecionadas,
  incluirBoleto,
  formatarData,
  formatarValor,
  enviarEmail,
  setSelecionadas,
}) {
  const cobrancasSelecionadas = cobrancas.filter((c) =>
    selecionadas.includes(c.id || c.numero_titulo)
  )

  let enviados = 0

  for (let cobranca of cobrancasSelecionadas) {
    const email = cobranca.cliente_email
    if (!email) continue

    let corpo = `
        Prezado(a) ${cobranca.cliente_nome},

        Segue cobrança referente ao título ${cobranca.numero_titulo}, parcela ${
      cobranca.parcela
    }, vencimento ${formatarData(cobranca.vencimento)}, valor ${formatarValor(
      cobranca.valor
    )}.
      `

    if (incluirBoleto && cobranca.boleto_base64) {
      corpo += `\n\nBoleto em anexo (base64).`
    }

    corpo += `\n\nAtt,\nEquipe Financeira`

    const dadosEmail = {
      assunto: `Cobrança - Título ${cobranca.numero_titulo}`,
      corpo,
      anexos: cobranca.url_boleto ? [cobranca.url_boleto] : [],
      boletoBase64: incluirBoleto ? cobranca.boleto_base64 : null,
    }

    try {
      await enviarEmail(email, dadosEmail)
      enviados++
    } catch (err) {
      console.error('Erro ao enviar:', cobranca.numero_titulo, err.message)
    }
  }

  Alert.alert('Envio Concluído', `${enviados} e-mails enviados com sucesso!`)
  setSelecionadas([])
}
