export const getFinanceiroMenu = (hasModulo) => ({
  name: 'Financeiro',
  icon: 'dollar-sign',
  items: [
    {
      name: 'Caixa',
      route: 'CaixaGeral',
      icon: 'credit-card',
      condition: hasModulo('Financeiro'),
    },
    {
      name: 'Cobranças',
      route: 'CobrancasList',
      icon: 'receipt',
      condition: hasModulo('Financeiro'),
    },
    {
      name: 'Comissões',
      route: 'Lista de Comissões',
      icon: 'percent',
      condition: hasModulo('SpsComissoes'),
    },
    {
      name: 'Contas a Pagar',
      route: 'ContasPagarList',
      icon: 'credit-card',
      condition: hasModulo('Financeiro'),
    },
    {
      name: 'Contas a Receber',
      route: 'ContasReceberList',
      icon: 'dollar-sign',
      condition: hasModulo('Financeiro'),
    },
    {
      name: 'DRE Gerencial',
      route: 'DashDRE',
      icon: 'trending-up',
      condition: hasModulo('Financeiro'),
    },
    {
      name: 'DRE Caixa',
      route: 'DashDRECaixa',
      icon: 'dollar-sign',
      condition: hasModulo('CaixaDiario'),
    },
    {
      name: 'Extrato de Caixa',
      route: 'Extrato de Caixa',
      icon: 'file-text',
      condition: hasModulo('Financeiro'),
    },
  ].sort((a, b) => a.name.localeCompare(b.name)),
})
