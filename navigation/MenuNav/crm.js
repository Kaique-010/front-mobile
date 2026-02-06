export const getCrmMenu = (hasModulo) => ({
  name: 'CRM',
  icon: 'users',
  items: [
    {
      name: 'Dashboard CRM',
      route: 'ControleVisitaDashboard',
      icon: 'bar-chart-2',
      condition: hasModulo('Gerencial'),
    },
    {
      name: 'Controle de Visitas',
      route: 'ControleVisitas',
      icon: 'map-pin',
      condition: hasModulo('Gerencial'),
    },
    {
      name: 'Nova Visita',
      route: 'ControleVisitaForm',
      icon: 'plus-circle',
      condition: hasModulo('Gerencial'),
    },
    {
      name: 'Etapas',
      route: 'EtapasForm',
      icon: 'plus-circle',
      condition: hasModulo('Gerencial'),
    },
    {
      name: 'Lista de Etapas',
      route: 'EtapasList',
      icon: 'plus-circle',
      condition: hasModulo('Gerencial'),
    },
  ].sort((a, b) => a.name.localeCompare(b.name)),
})
