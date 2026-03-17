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
    {
      name: 'CFOPs',
      route: 'CfopList',
      icon: 'file-text',
      condition: hasModulo('Produtos'),
    },
    {
      name: 'NCMs',
      route: 'NcmList',
      icon: 'file-text',
      condition: hasModulo('Produtos'),
    },
  ].sort((a, b) => a.name.localeCompare(b.name)),
})
