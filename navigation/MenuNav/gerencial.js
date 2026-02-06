export const getGerencialMenu = (hasModulo) => ({
  name: 'Gerencial',
  icon: 'trending-up',
  items: [
    {
      name: 'Despesas Previstas',
      route: 'Despesas Previstas', // Corrigido para corresponder ao screenConfig
      icon: 'trending-down',
      condition: hasModulo('Gerencial'),
    },
    {
      name: 'Previsão de Lucro',
      route: 'Lucro Previsto',
      icon: 'dollar-sign',
      condition: hasModulo('Gerencial'),
    },
    {
      name: 'Fluxo de Caixa Previsto',
      route: 'Fluxo Caixa Previsto',
      icon: 'activity',
      condition: hasModulo('Gerencial'),
    },
  ].sort((a, b) => a.name.localeCompare(b.name)),
})
