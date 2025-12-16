// MELHORADO: Função para criar mensagem padrão
const formatarData = (data) => {
  try {
    const d = new Date(data)
    if (isNaN(d)) return String(data)
    return d.toLocaleDateString('pt-BR')
  } catch (_) {
    return String(data)
  }
}

const formatarValor = (valor) => {
  const num = Number(valor)
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(isNaN(num) ? 0 : num)
}

export function criarMensagemCobranca(cobranca) {
  return (
    `*Prezado Cliente ${cobranca.cliente_nome}*\n\n` +
    `📋 *Cobrança Pendente*\n\n` +
    `• Título: ${cobranca.numero_titulo}\n` +
    `• Parcela: ${cobranca.parcela}\n` +
    `• Vencimento: ${formatarData(cobranca.vencimento)}\n` +
    `• Valor: ${formatarValor(cobranca.valor)}\n\n` +
    (cobranca.linha_digitavel
      ? `💳 Código de Barras:\n${cobranca.linha_digitavel}\n\n`
      : '') +
    `⚠️ *Para evitar multa e juros, efetue o pagamento até a data de vencimento.*\n\n` +
    `📞 Em caso de dúvidas, entre em contato conosco.\n\n` +
    `Atenciosamente,\n*Equipe Financeira*`
  )
}
