// Configuração centralizada do menu do drawer
export const getMenuConfig = (hasModulo) => {
  return {
    cadastros: {
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
    },
    consulta: {
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
    },
    crm: {
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
    },
    dashboards: {
      name: 'Dashboards',
      icon: 'bar-chart-2',
      items: [
        {
          name: 'Dashboard CRM',
          route: 'ControleVisitaDashboard',
          icon: 'users',
          condition: hasModulo('Gerencial'),
        },
        {
          name: 'Dashboard de Comissões',
          route: 'DashComissao',
          icon: 'percent',
          condition: hasModulo('SpsComissoes'),
        },
        {
          name: 'Dashboard de Contratos',
          route: 'DashContratos',
          icon: 'file-text',
          condition: hasModulo('contratos'),
        },

        {
          name: 'Dashboard Geral',
          route: 'DashboardFinanceiro',
          icon: 'bar-chart-2',
          condition: hasModulo('dash'),
        },
        {
          name: 'Dashboard Realizado',
          route: 'DashRealizado',
          icon: 'trending-up',
          condition: hasModulo('dash'),
        },
        {
          name: 'Balancete de Estoque',
          route: 'DashBalanceteEstoque',
          icon: 'package',
          condition: hasModulo('Produtos'),
        },
        {
          name: 'Notas Fiscais',
          route: 'DashNotasFiscais',
          icon: 'file-text',
          condition: hasModulo('Gerencial'),
        },
        {
          name: 'Pedidos de Venda',
          route: 'DashPedidosVenda',
          icon: 'shopping-cart',
          condition: hasModulo('Pedidos'),
        },
      ].sort((a, b) => a.name.localeCompare(b.name)),
    },
    financeiro: {
      name: 'Financeiro',
      icon: 'dollar-sign',
      items: [
        {
          name: 'Caixa',
          route: 'CaixaGeral',
          icon: 'credit-card',
          condition: hasModulo('Financeiro'),
        },
        {
          name: 'Cobranças',
          route: 'CobrancasList',
          icon: 'receipt',
          condition: hasModulo('Financeiro'),
        },
        {
          name: 'Comissões',
          route: 'Lista de Comissões',
          icon: 'percent',
          condition: hasModulo('SpsComissoes'),
        },
        {
          name: 'Contas a Pagar',
          route: 'ContasPagarList',
          icon: 'credit-card',
          condition: hasModulo('Financeiro'),
        },
        {
          name: 'Contas a Receber',
          route: 'ContasReceberList',
          icon: 'dollar-sign',
          condition: hasModulo('Financeiro'),
        },
        {
          name: 'DRE Gerencial',
          route: 'DashDRE',
          icon: 'trending-up',
          condition: hasModulo('Financeiro'),
        },
        {
          name: 'DRE Caixa',
          route: 'DashDRECaixa',
          icon: 'dollar-sign',
          condition: hasModulo('CaixaDiario'),
        },
        {
          name: 'Extrato de Caixa',
          route: 'Extrato de Caixa',
          icon: 'file-text',
          condition: hasModulo('Financeiro'),
        },
      ].sort((a, b) => a.name.localeCompare(b.name)),
    },
    floresta: {
      name: 'Floresta',
      iconType: 'MaterialCommunityIcons',
      icon: 'command',
      items: [
        {
          name: 'Propriedade',
          route: 'PropriedadeList',
          icon: 'home-group',
          iconType: 'MaterialCommunityIcons',
          condition: hasModulo('Gerencial'),
        },
        {
          name: 'Fluxo de Caixa',
          route: 'FluxoDeCaixa',
          icon: 'activity',
          condition: hasModulo('Gerencial'),
        },
        {
          name: 'Ordens Florestal',
          route: 'OrdensFlorestalList',
          icon: 'tool',
          condition: hasModulo('OrdemdeServico'),
        },
      ].sort((a, b) => a.name.localeCompare(b.name)),
    },
    gerencial: {
      name: 'Gerencial',
      icon: 'trending-up',
      items: [
        {
          name: 'Despesas Previstas',
          route: 'Despesas Previstas', // Corrigido para corresponder ao screenConfig
          icon: 'trending-down',
          condition: hasModulo('Gerencial'),
        },
        {
          name: 'Previsão de Lucro',
          route: 'Lucro Previsto',
          icon: 'dollar-sign',
          condition: hasModulo('Gerencial'),
        },
        {
          name: 'Fluxo de Caixa Previsto',
          route: 'Fluxo Caixa Previsto',
          icon: 'activity',
          condition: hasModulo('Gerencial'),
        },
      ].sort((a, b) => a.name.localeCompare(b.name)),
    },
    notas: {
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
    },
    os: {
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
      ].sort((a, b) => a.name.localeCompare(b.name)),
    },
    pisos: {
      name: 'Pisos',
      icon: 'folder',
      items: [
        {
          name: 'Pedidos de Pisos',
          route: 'PedidosPisos',
          icon: 'file-text',
          condition: hasModulo('Pisos'),
        },

        {
          name: 'Dashboard Pisos',
          route: 'DashPedidosPisos',
          icon: 'bar-chart-2',
          condition: hasModulo('Pisos'),
        },
        {
          name: 'Gráfico Pisos',
          route: 'DashPedidosPisosGrafico',
          icon: 'bar-chart',
          condition: hasModulo('Pisos'),
        },
        {
          name: 'Orçamentos de Pisos',
          route: 'OrcamentosPisos',
          icon: 'file-text',
          condition: hasModulo('Pisos'),
        },

        {
          name: 'Resumo Orçamento Pisos',
          route: 'ResumoOrcamentoPisos',
          icon: 'file-text',
          condition: hasModulo('Pisos'),
        },
      ].sort((a, b) => a.name.localeCompare(b.name)),
    },
    producao: {
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
    },
    utilitarios: {
      name: 'Utilitários',
      icon: 'settings',
      items: [
        {
          name: 'Alterar Senha',
          route: 'AlterarSenha',
          icon: 'lock',
          condition: true,
        },
        {
          name: 'Usuários do Sistema',
          route: 'UsuariosList',
          icon: 'users',
          condition: hasModulo('parametros_admin'),
        },
        {
          name: 'Coletor de Estoque',
          route: 'ColetorEstoque',
          icon: 'barcode-scan',
          condition: hasModulo('Produtos'),
        },
        {
          name: 'Parâmetros do Sistema',
          route: 'ParametrosMenu',
          icon: 'settings',
          condition: hasModulo('parametros_admin'),
        },
        {
          name: 'Implantações',
          route: 'ImplantacaoForm',
          icon: 'settings',
          condition: hasModulo('implantacao'),
        },
        {
          name: 'Logs do Sistema',
          route: 'Auditoria',
          icon: 'clock',
          condition: true,
        },
      ].sort((a, b) => a.name.localeCompare(b.name)),
    },
    vendas: {
      name: 'Vendas',
      icon: 'shopping-cart',
      items: [
        {
          name: 'Contratos',
          route: 'Contratos',
          icon: 'file-text',
          condition: hasModulo('contratos'),
        },
        //{
        //name: 'Lista de Casamento',
        //route: 'ListaCasamento',
        //icon: 'heart-multiple',
        //iconType: 'MaterialCommunityIcons',
        // condition: hasModulo('listacasamento'),
        //},
        {
          name: 'Listas de Casamento',
          route: 'ListaCasamento',
          icon: 'heart-multiple',
          iconType: 'MaterialCommunityIcons',
          condition: hasModulo('listacasamento'),
        },

        {
          name: 'Orçamentos',
          route: 'Orcamentos',
          icon: 'shopping-bag',
          condition: hasModulo('Orcamentos'),
        },
        {
          name: 'Pedidos',
          route: 'Pedidos',
          icon: 'package',
          condition: hasModulo('Pedidos'),
        },
      ].sort((a, b) => a.name.localeCompare(b.name)),
    },
  }
}

// Itens individuais do menu (não agrupados)
export const getIndividualMenuItems = (hasModulo) =>
  [{ name: 'Home', route: 'Home', icon: 'home', condition: true }].filter(
    (item) => item.condition
  )

// Itens específicos da Frisia (serão movidos para componentsFrisia)
export const getFrisiaMenuItems = (hasModulo) =>
  [
    {
      name: 'Painel do Cooperado',
      route: 'PainelCooperado',
      icon: 'users',
      condition: hasModulo('frisia'),
    },
    {
      name: 'Dashvendas',
      route: 'Dashvendas',
      icon: 'trending-up',
      condition: hasModulo('frisia'),
    },
  ].filter((item) => item.condition)

// Modificar para buscar módulos liberados da API
export const getMenuDinamico = async () => {
  try {
    const response = await getModulosLiberados()
    const modulosLiberados = response.data.modulos || []

    // Filtrar menu baseado nos módulos liberados
    return MENU_COMPLETO.filter(
      (item) => modulosLiberados.includes(item.modulo) || item.publico
    )
  } catch (error) {
    console.error('Erro ao carregar módulos:', error)
    return MENU_BASICO // Menu mínimo em caso de erro
  }
}

// Add to the appropriate section (likely 'vendas' or create a new 'pisos' section)
const menuConfig = {
  name: 'Pisos',
  icon: 'home-work',
  items: [
    {
      name: 'Pedidos Pisos',
      route: 'PedidosPisos',
      icon: 'list-alt',
      condition: (modulos) => modulos?.pisos,
    },
  ],
}
