export const getOsMenu = (hasModulo) => ({
  name: 'O.S',
  icon: 'tool',
  items: [
    {
      name: ' Painel Os',
      route: 'Painel Os',
      icon: 'settings',
      condition: hasModulo('O_S'),
    },
    {
      name: "Painel de O'S",
      route: 'PainelAcompanhamento',
      icon: 'clipboard',
      condition: hasModulo('OrdemdeServico'),
    },
    {
      name: "Painel de O'S Externa",
      route: 'PainelAcompanhamentoExterna',
      icon: 'clipboard',
      condition: hasModulo('osexterna'),
    },
    {
      name: 'Relação de O.S',
      route: 'Ordem de Serviço Geral',
      icon: 'tool',
      condition: hasModulo('O_S'),
    },
    {
      name: 'Relação de Ordens  ',
      route: 'DashOrdensEletro',
      icon: 'tool',
      condition: hasModulo('OrdemdeServico'),
    },
    {
      name: 'Configuração de Workflows',
      route: 'WorkflowConfig',
      icon: 'settings',
      condition: hasModulo('OrdemdeServico'),
    },
    {
      name: 'Histórico Workflow',
      route: 'HistoricoWorkflow',
      icon: 'bar-chart',
      condition: hasModulo('OrdemdeServico'),
    },
    {
      name: 'Ordens em Estoque',
      route: 'OrdensEmEstoque',
      icon: 'tool',
      condition: hasModulo('OrdemdeServico'),
    },
  ].sort((a, b) => a.name.localeCompare(b.name)),
})
