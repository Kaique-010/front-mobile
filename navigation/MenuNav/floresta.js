export const getFlorestaMenu = (hasModulo) => ({
  name: 'Floresta',
  iconType: 'MaterialCommunityIcons',
  icon: 'command',
  items: [
    {
      name: 'Propriedade',
      route: 'PropriedadeList',
      icon: 'home-group',
      iconType: 'MaterialCommunityIcons',
      condition: hasModulo('floresta'),
    },
    {
      name: 'Fluxo de Caixa',
      route: 'FluxoDeCaixa',
      icon: 'activity',
      condition: hasModulo('floresta'),
    },
    {
      name: 'Ordens Florestal',
      route: 'OrdensFlorestalList',
      icon: 'tool',
      condition: hasModulo('floresta'),
    },
  ].sort((a, b) => a.name.localeCompare(b.name)),
})
