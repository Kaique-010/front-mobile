export const getVendasMenu = (hasModulo) => ({
  name: 'Vendas',
  icon: 'shopping-cart',
  items: [
    {
      name: 'Contratos',
      route: 'Contratos',
      icon: 'file-text',
      condition: hasModulo('contratos'),
    },
    //{
    //name: 'Lista de Casamento',
    //route: 'ListaCasamento',
    //icon: 'heart-multiple',
    //iconType: 'MaterialCommunityIcons',
    // condition: hasModulo('listacasamento'),
    //},
    {
      name: 'Listas de Casamento',
      route: 'ListaCasamento',
      icon: 'heart-multiple',
      iconType: 'MaterialCommunityIcons',
      condition: hasModulo('listacasamento'),
    },

    {
      name: 'Orçamentos',
      route: 'Orcamentos',
      icon: 'shopping-bag',
      condition: hasModulo('Orcamentos'),
    },
    {
      name: 'Pedidos',
      route: 'Pedidos',
      icon: 'package',
      condition: hasModulo('Pedidos'),
    },
  ].sort((a, b) => a.name.localeCompare(b.name)),
})
