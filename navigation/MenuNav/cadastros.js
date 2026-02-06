export const getCadastrosMenu = (hasModulo) => ({
  name: 'Cadastros',
  icon: 'folder',
  items: [
    {
      name: 'Entidades',
      route: 'Entidades',
      icon: 'users',
      condition: hasModulo('Entidades'),
    },
    // Na seção cadastros
    {
      name: 'Entradas de Estoque',
      route: 'EntradasEstoque',
      icon: 'arrow-down-circle',
      condition: hasModulo('Entradas_Estoque'),
    },
    //{
    //name: 'Entradas de Estoque',
    //route: 'EntradasForm',
    //icon: 'arrow-down-circle',
    //condition: hasModulo('Entradas_Estoque'),
    //},
    {
      name: 'Produtos',
      route: 'Produtos',
      icon: 'box',
      condition: hasModulo('Produtos'),
    },
    {
      name: 'Produtos Detalhados',
      route: 'ProdutosDetalhados',
      icon: 'box',
      condition: hasModulo('Produtos'),
    },
    {
      name: 'Saídas de Estoque',
      route: 'SaidasEstoque',
      icon: 'arrow-up-circle',
      condition: hasModulo('Saidas_Estoque'),
    },

    //{
    // name: 'Saídas de Estoque',
    //route: 'SaidasForm',
    //icon: 'arrow-up-circle',
    //condition: hasModulo('Saidas_Estoque'),
    //},
  ].sort((a, b) => a.name.localeCompare(b.name)),
})
