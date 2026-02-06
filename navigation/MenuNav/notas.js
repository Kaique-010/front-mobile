export const getNotasMenu = (hasModulo) => ({
  name: 'Notas Fiscais',
  icon: 'file-text',
  items: [
    {
      name: 'Notas Fiscais',
      route: 'NotasFiscaisList',
      icon: 'file-text',
      condition: hasModulo('Financeiro'),
    },
  ].sort((a, b) => a.name.localeCompare(b.name)),
})
