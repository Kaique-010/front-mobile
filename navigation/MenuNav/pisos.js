export const getPisosMenu = (hasModulo) => ({
  name: 'Pisos',
  icon: 'folder',
  items: [
    {
      name: 'Pedidos de Pisos',
      route: 'PedidosPisos',
      icon: 'file-text',
      condition: hasModulo('Pisos'),
    },
    {
      name: 'Consulta de Produtos',
      route: 'ConsultaProdutos',
      icon: 'search',
      condition: hasModulo('Produtos'),
    },
    {
      name: 'Dashboard Pedido Pisos',
      route: 'DashPedidosPisos',
      icon: 'bar-chart-2',
      condition: hasModulo('Pisos'),
    },
    {
      name: 'Orçamentos de Pisos',
      route: 'OrcamentosPisos',
      icon: 'file-text',
      condition: hasModulo('Pisos'),
    },

    {
      name: 'Resumo Orçamento Pisos',
      route: 'ResumoOrcamentoPisos',
      icon: 'file-text',
      condition: hasModulo('Pisos'),
    },
    {
      name: 'Resumo Pedido Pisos',
      route: 'ResumoPedidoPisos',
      icon: 'file-text',
      condition: hasModulo('Pisos'),
    },
  ].sort((a, b) => a.name.localeCompare(b.name)),
})
