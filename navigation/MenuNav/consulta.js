export const getConsultaMenu = (hasModulo) => ({
  name: 'Consulta Inteligente',
  icon: 'check-circle',
  items: [
    {
      name: 'Consulta Inteligente',
      route: 'ConsultaScreen',
      icon: 'check-circle',
      condition: hasModulo('Financeiro'),
    },
  ].sort((a, b) => a.name.localeCompare(b.name)),
})
