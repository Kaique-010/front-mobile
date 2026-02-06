export const getProducaoMenu = (hasModulo) => ({
  name: 'Ordem de Produção',
  icon: 'codepen',
  items: [
    {
      name: 'Ordens de Produção',
      route: 'ListagemOrdensProducao',
      icon: 'codepen',
      condition: hasModulo('OrdemProducao'),
    },
  ].sort((a, b) => a.name.localeCompare(b.name)),
})
