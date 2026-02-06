export const getDashboardsMenu = (hasModulo) => ({
  name: 'Dashboards',
  icon: 'bar-chart-2',
  items: [
    {
      name: 'Dashboard CRM',
      route: 'ControleVisitaDashboard',
      icon: 'users',
      condition: hasModulo('Gerencial'),
    },
    {
      name: 'Dashboard de Comissões',
      route: 'DashComissao',
      icon: 'percent',
      condition: hasModulo('SpsComissoes'),
    },
    {
      name: 'Dashboard de Contratos',
      route: 'DashContratos',
      icon: 'file-text',
      condition: hasModulo('contratos'),
    },

    {
      name: 'Dashboard Geral',
      route: 'DashboardFinanceiro',
      icon: 'bar-chart-2',
      condition: hasModulo('dash'),
    },
    {
      name: 'Dashboard Realizado',
      route: 'DashRealizado',
      icon: 'trending-up',
      condition: hasModulo('dash'),
    },
    {
      name: 'Balancete de Estoque',
      route: 'DashBalanceteEstoque',
      icon: 'package',
      condition: hasModulo('Produtos'),
    },
    {
      name: 'Notas Fiscais',
      route: 'DashNotasFiscais',
      icon: 'file-text',
      condition: hasModulo('Gerencial'),
    },
    {
      name: 'Pedidos de Venda',
      route: 'DashPedidosVenda',
      icon: 'shopping-cart',
      condition: hasModulo('Pedidos'),
    },
  ].sort((a, b) => a.name.localeCompare(b.name)),
})
