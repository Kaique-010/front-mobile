import { Alert } from 'react-native'

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

  if (cobrancasSelecionadas.length <= 1) {
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
    Alert.alert(
      'Envio Concluído',
      `${enviados} e-mail(s) enviados com sucesso!`
    )
    setSelecionadas([])
    return
  }

  const primeira = cobrancasSelecionadas[0]
  const emailLote = primeira?.cliente_email || ''
  if (!emailLote) {
    Alert.alert('Erro', 'Nenhum e-mail válido encontrado para envio em lote')
    return
  }
  const linhas = cobrancasSelecionadas.map(
    (c) =>
      `Título ${c.numero_titulo}, parcela ${
        c.parcela
      }, vencimento ${formatarData(c.vencimento)}, valor ${formatarValor(
        c.valor
      )}`
  )
  const corpoLote = `
    Prezado(a),
    
    Seguem boletos referentes às cobranças selecionadas:\n\n${linhas.join(
      '\n'
    )}\n\nAtt,\nEquipe Financeira
  `
  const anexos = cobrancasSelecionadas.map((c) => c.url_boleto).filter(Boolean)
  const dadosEmailLote = {
    assunto: `Cobranças - Boletos em Lote (${cobrancasSelecionadas.length})`,
    corpo: corpoLote,
    anexos,
    boletoBase64: null,
  }
  try {
    await enviarEmail(emailLote, dadosEmailLote)
    Alert.alert('Envio Concluído', `E-mail em lote enviado com sucesso!`)
    setSelecionadas([])
  } catch (err) {
    console.error('Erro ao enviar lote:', err.message)
    Alert.alert('Erro', 'Falha ao enviar e-mail em lote')
  }
}
