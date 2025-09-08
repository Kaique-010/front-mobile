// MELHORADO: Função para criar mensagem padrão
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
