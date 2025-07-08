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
          condition: hasModulo('entidades'),
        },
        {
          name: 'Entradas de Estoque',
          route: 'Entradas de Estoque',
          icon: 'arrow-down-circle',
          condition: hasModulo('entradasestoque'),
        },
        {
          name: 'Produtos',
          route: 'Produtos',
          icon: 'box',
          condition: hasModulo('produtos'),
        },
        {
          name: 'Produtos Detalhados',
          route: 'ProdutosDetalhados',
          icon: 'box',
          condition: hasModulo('produtos'),
        },

        {
          name: 'Saídas de Estoque',
          route: 'Saidas de Estoque',
          icon: 'arrow-up-circle',
          condition: hasModulo('saidasestoque'),
        },
      ]
        .filter((item) => item.condition)
        .sort((a, b) => a.name.localeCompare(b.name)),
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
        {
          name: 'Lista de Casamento',
          route: 'Lista de Casamento',
          icon: 'ring',
          iconType: 'MaterialCommunityIcons',
          condition: hasModulo('listacasamento'),
        },
        {
          name: 'Orçamentos',
          route: 'Orcamentos',
          icon: 'shopping-bag',
          condition: hasModulo('orcamentos'),
        },
        {
          name: 'Pedidos',
          route: 'Pedidos',
          icon: 'package',
          condition: hasModulo('pedidos'),
        },
      ]
        .filter((item) => item.condition)
        .sort((a, b) => a.name.localeCompare(b.name)),
    },
    financeiro: {
      name: 'Financeiro',
      icon: 'dollar-sign',
      items: [
        {
          name: 'Caixa',
          route: 'Caixa',
          icon: 'credit-card',
          condition: hasModulo('financeiro'),
        },
        {
          name: 'Cobranças',
          route: 'Lista de Cobranças a vencer',
          icon: 'receipt',
          condition: hasModulo('financeiro'),
        },
        {
          name: 'Comissões',
          route: 'Lista de Comissões',
          icon: 'percent',
          condition: hasModulo('comissoes'),
        },
        {
          name: 'Contas a Pagar',
          route: 'Contas a Pagar',
          icon: 'credit-card',
          condition: hasModulo('financeiro'),
        },
        {
          name: 'Contas a Receber',
          route: 'Contas a Receber',
          icon: 'dollar-sign',
          condition: hasModulo('financeiro'),
        },
        {
          name: 'DRE Gerencial',
          route: 'DashDRE',
          icon: 'trending-up',
          condition: hasModulo('financeiro'),
        },
        {
          name: 'DRE Caixa',
          route: 'DashDRECaixa',
          icon: 'dollar-sign',
          condition: hasModulo('financeiro'),
        },
        {
          name: 'Extrato de Caixa',
          route: 'Extrato de Caixa',
          icon: 'file-text',
          condition: true,
        },
      ]
        .filter((item) => item.condition)
        .sort((a, b) => a.name.localeCompare(b.name)),
    },
    os: {
      name: 'O.S',
      icon: 'tool',
      items: [
        {
          name: 'Ordens de Serviço',
          route: 'Ordens de Serviço',
          icon: 'settings',
          condition: hasModulo('os'),
        },
        {
          name: "Painel de O'S",
          route: "Painel de Acompanhamento de O'S",
          icon: 'clipboard',
          condition: hasModulo('ordemdeservico'),
        },
        {
          name: 'Relação de O.S',
          route: 'Ordem de Serviço Geral',
          icon: 'tool',
          condition: hasModulo('os'),
        },
      ]
        .filter((item) => item.condition)
        .sort((a, b) => a.name.localeCompare(b.name)),
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
          name: 'Parâmetros do Sistema',
          route: 'ParametrosMenu',
          icon: 'settings',
          condition: hasModulo('implantacao'),
        },
        {
          name: 'Implantações',
          route: 'Implantações',
          icon: 'settings',
          condition: hasModulo('implantacao'),
        },
        {
          name: 'Logs do Sistema',
          route: 'Auditoria',
          icon: 'clock',
          condition: true,
        },
      ]
        .filter((item) => item.condition)
        .sort((a, b) => a.name.localeCompare(b.name)),
    },
    dashboards: {
      name: 'Dashboards',
      icon: 'bar-chart-2',
      items: [
        {
          name: 'Dashboard de Comissões',
          route: 'DashComissao',
          icon: 'percent',
          condition: hasModulo('comissoes'),
        },
        {
          name: 'Dashboard de Contratos',
          route: 'Dashboard de Contratos',
          icon: 'file-text',
          condition: hasModulo('contratos'),
        },
        {
          name: 'Dashboard Financeiro',
          route: 'DashboardFinanceiro',
          icon: 'dollar-sign',
          condition: hasModulo('financeiro'),
        },
        {
          name: 'Dashboard Geral',
          route: 'Dashboard',
          icon: 'bar-chart-2',
          condition: hasModulo('dash'),
        },
        {
          name: 'Dashboard Realizado',
          route: 'DashRealizado',
          icon: 'trending-up',
          condition: hasModulo('financeiro'),
        },
        {
          name: 'Balancete de Estoque',
          route: 'DashBalanceteEstoque',
          icon: 'package',
          condition: (modulos) => hasModulo(modulos, 'Dash'),
        },
        {
          name: 'Pedidos de Venda',
          route: 'DashPedidosVenda',
          icon: 'shopping-cart',
          condition: hasModulo('dash'),
        },
      ]
        .filter((item) => item.condition)
        .sort((a, b) => a.name.localeCompare(b.name)),
    },
    gerencial: {
      name: 'Gerencial',
      icon: 'trending-up',
      items: [
        {
          name: 'Despesas Previstas',
          route: 'Despesas Previstas', // Corrigido para corresponder ao screenConfig
          icon: 'trending-down',
          condition: hasModulo('financeiro'),
        },
        {
          name: 'Previsão de Lucro',
          route: 'Lucro Previsto', // Corrigido para corresponder ao screenConfig
          icon: 'dollar-sign',
          condition: hasModulo('financeiro'),
        },
        {
          name: 'Fluxo de Caixa Previsto',
          route: 'Fluxo Caixa Previsto', // Corrigido para corresponder ao screenConfig
          icon: 'activity',
          condition: hasModulo('financeiro'),
        },
      ]
        .filter((item) => item.condition)
        .sort((a, b) => a.name.localeCompare(b.name)),
    },
    producao: {
      name: 'Ordem de Produção',
      icon: 'codepen',
      items: [
        {
          name: 'Ordens de Produção',
          route: 'ListagemOrdensProducao',
          icon: 'codepen',
          condition: hasModulo('ordemproducao'),
        },
      ]
        .filter((item) => item.condition)
        .sort((a, b) => a.name.localeCompare(b.name)),
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
    return MENU_COMPLETO.filter(item => 
      modulosLiberados.includes(item.modulo) || item.publico
    )
  } catch (error) {
    console.error('Erro ao carregar módulos:', error)
    return MENU_BASICO // Menu mínimo em caso de erro
  }
}
