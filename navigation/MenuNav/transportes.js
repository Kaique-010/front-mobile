export const getTransporteMenu = (hasModulo) => ({
  name: 'Transporte',
  icon: 'truck',
  items: [
    {
      name: 'CT-e',
      route: 'CteList',
      icon: 'truck',
      condition: hasModulo('Financeiro'),
    },
    {
      name: 'MDF-e',
      route: 'MdfeList',
      icon: 'file-text',
      condition: hasModulo('Financeiro'),
    },
    {
      name: 'NCMs',
      route: 'NcmList',
      icon: 'file-text',
      condition: hasModulo('Financeiro'),
    },
  ].sort((a, b) => a.name.localeCompare(b.name)),
})
