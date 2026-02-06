export const getRegistroPontoMenu = (hasModulo) => ({
  name: 'Registro de Ponto',
  icon: 'clock',
  items: [
    {
      name: 'Registro de Ponto',
      route: 'PontoScreen',
      icon: 'clock',
      condition: hasModulo('controledePonto'),
    },
  ].sort((a, b) => a.name.localeCompare(b.name)),
})
