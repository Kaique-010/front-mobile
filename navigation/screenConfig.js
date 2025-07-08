import { createHeaderOptions } from '../config/headerConfig'
import * as Screens from './screenImports'

export const screenConfigs = [
  // Telas de autenticação
  {
    name: 'Login',
    component: Screens.Login,
    options: { headerShown: false },
  },
  {
    name: 'SelectEmpresa',
    component: Screens.SelectEmpresa,
    options: createHeaderOptions('Seleção de Empresa'),
  },
  {
    name: 'SelectFilial',
    component: Screens.SelectFilial,
    options: createHeaderOptions('Seleção de Filial'),
  },

  // Tela principal
  {
    name: 'MainApp',
    component: Screens.AppNavigator,
    options: { headerShown: false },
  },

  // Telas de sistema
  {
    name: 'Auditoria',
    component: Screens.AuditoriaScreen,
    options: createHeaderOptions('Logs do Sistema'),
  },
  {
    name: 'AlterarSenha',
    component: Screens.AlterarSenhaScreen,
    options: createHeaderOptions('Alterar Senha'),
  },

  // Telas de produtos
  {
    name: 'ProdutoForm',
    component: Screens.ProdutoForm,
    options: createHeaderOptions('Produtos'),
  },
  {
    name: 'ProdutoPrecos',
    component: Screens.ProdutoPrecos,
    options: createHeaderOptions('Preços dos Itens'),
  },
  {
    name: 'ProdutosDetalhados',
    component: Screens.ProdutosDetalhados,
    options: createHeaderOptions('Produtos Detalhados'),
  },

  // Telas de entidades
  {
    name: 'EntidadeForm',
    component: Screens.EntidadeForm,
    options: createHeaderOptions('Entidades'),
  },
  {
    name: 'Entidades',
    component: Screens.Entidades,
    options: { title: 'Entidades' },
  },

  // Telas de vendas
  {
    name: 'PedidosForm',
    component: Screens.PedidosForm,
    options: createHeaderOptions('Pedido de Venda'),
  },
  {
    name: 'OrcamentosForm',
    component: Screens.OrcamentosForm,
    options: createHeaderOptions('Orçamentos'),
  },
  {
    name: 'ListaCasamentoForm',
    component: Screens.ListaCasamentoForm,
    options: createHeaderOptions('Lista de Casamento'),
  },
  {
    name: 'ItensListaModal',
    component: Screens.ItensListaModal,
    options: createHeaderOptions('Adicionar Itens à Lista'),
  },

  // Telas de estoque
  {
    name: 'EntradasForm',
    component: Screens.EntradasForm,
    options: createHeaderOptions('Entradas de Estoque'),
  },
  {
    name: 'SaidasForm',
    component: Screens.SaidasForm,
    options: createHeaderOptions('Saidas de Estoque'),
  },

  // Telas financeiras
  {
    name: 'ContasPagarList',
    component: Screens.ContasPagarList,
    options: createHeaderOptions('Contas a Pagar'),
  },
  {
    name: 'ContaPagarForm',
    component: Screens.ContaPagarForm,
    options: createHeaderOptions('Cadastro de Conta a Pagar'),
  },
  {
    name: 'ContasReceberList',
    component: Screens.ContasReceberList,
    options: createHeaderOptions('Contas a receber'),
  },
  {
    name: 'ContaReceberForm',
    component: Screens.ContaReceberForm,
    options: createHeaderOptions('Cadastro de Conta a Receber'),
  },
  {
    name: 'BaixaTituloForm',
    component: Screens.BaixaTituloForm,
    options: createHeaderOptions('Baixa de Título'),
  },
  {
    name: 'MoviCaixa',
    component: Screens.MoviCaixaScreen,
    options: createHeaderOptions('Movimentações de Caixa'),
  },
  {
    name: 'CaixaGeral',
    component: Screens.CaixaGeralScreen,
    options: createHeaderOptions('Caixa Diário'),
  },
  {
    name: 'CobrancasList',
    component: Screens.CobrancasList,
    options: createHeaderOptions('Cobranças a Receber'),
  },

  // Telas de contratos
  {
    name: 'ContratosForm',
    component: Screens.ContratosForm,
    options: createHeaderOptions('Contratos de Venda'),
  },

  // Telas de comissão
  {
    name: 'ComissaoForm',
    component: Screens.ComissaoForm,
    options: createHeaderOptions('Comissão'),
  },
  {
    name: 'Lista de Comissões',
    component: Screens.ComissaoList,
    options: createHeaderOptions('Lista de Comissões'),
  },
  {
    name: 'DashComissao',
    component: Screens.DashComissao,
    options: createHeaderOptions('Dashboard de Comissões'),
  },

  // Telas de ordem de serviço
  {
    name: 'PainelAcompanhamento',
    component: Screens.PainelAcompanhamento,
    options: { title: 'Painel OS' },
  },
  {
    name: 'OrdemDetalhe',
    component: Screens.OrdemDetalhe,
    options: createHeaderOptions('Detalhes da OS'),
  },
  {
    name: 'OsDetalhe',
    component: Screens.OsDetalhe,
    options: createHeaderOptions('Detalhes da O.S'),
  },
  {
    name: 'OsCriacao',
    component: Screens.OSCreateScreen,
    options: createHeaderOptions('Abertura O.S'),
  },
  {
    name: 'OrdemCriacao',
    component: Screens.CriarOrdemServico,
    options: createHeaderOptions('Abertura O.S'),
  },
  {
    name: 'Ordem de Serviço Geral',
    component: Screens.OrdemServicoGeral,
    options: createHeaderOptions('Relação de O.S'),
  },
  {
    name: 'DashOsGrafico',
    component: Screens.DashOsGrafico,
    options: createHeaderOptions('Gráficos de OS'),
  },

  // Telas de Ordem de Produção
  {
    name: 'ListagemOrdensProducao',
    component: Screens.ListagemOrdensProducao,
    options: createHeaderOptions('Listagem de Ordens de Produção'),
  },
  {
    name: 'DetalhesOrdemProducao',
    component: Screens.DetalhesOrdemProducao,
    options: createHeaderOptions('Detalhes da Ordem de Produção'),
  },
  {
    name: 'FormOrdemProducao',
    component: Screens.FormOrdemProducao,
    options: createHeaderOptions('Ordem de Produção'),
  },

  // Telas de Gerencial

  {
    name: 'Despesas Previstas',
    component: Screens.DespesasPrevistas,
    options: createHeaderOptions('Despesas Previstas'),
  },
  {
    name: 'Lucro Previsto',
    component: Screens.LucroPrevisto,
    options: createHeaderOptions('Lucro Previsto'),
  },
  {
    name: 'Fluxo Caixa Previsto',
    component: Screens.FluxoCaixaPrevisto,
    options: createHeaderOptions('Fluxo Caixa Previsto'),
  },

  // Telas de implantação
  {
    name: 'ImplantacaoForm',
    component: Screens.ImplantacaoForm,
    options: createHeaderOptions('Roteiro de Implantação'),
  },

  // Dashboards financeiros
  {
    name: 'DashboardFinanceiroGrafico',
    component: Screens.DashboardFinanceiroGrafico,
    options: createHeaderOptions('Gráficos Financeiros'),
  },
  {
    name: 'DashRealizado',
    component: Screens.DashRealizado,
    options: createHeaderOptions('Dashboard Realizado'),
  },
  {
    name: 'DashBalanceteCC',
    component: Screens.DashBalanceteCC,
    options: createHeaderOptions('Balancete por Centro de Custos'),
  },
  {
    name: 'DashBalanceteEstoque',
    component: Screens.DashBalanceteEstoque,
    options: createHeaderOptions('Balancete de Estoque'),
  },
  {
    name: 'DashDRE',
    component: Screens.DashDRE,
    options: createHeaderOptions('DRE Gerencial'),
  },
  {
    name: 'DashDRECaixa',
    component: Screens.DashDRECaixa,
    options: createHeaderOptions('DRE Caixa'),
  },

  // Dashboards de vendas
  {
    name: 'Extrato de Caixa',
    component: Screens.DashExtratoCaixa,
    options: createHeaderOptions('Extrato de Caixa'),
  },
  {
    name: 'DashContratos',
    component: Screens.DashContratos,
    options: createHeaderOptions('Dashboard de Contratos'),
  },
  {
    name: 'DashPedidosVenda',
    component: Screens.DashPedidosVenda,
    options: createHeaderOptions('Pedidos de Venda'),
  },
  {
    name: 'DashPedidosVendaGrafico',
    component: Screens.DashPedidosVendaGrafico,
    options: createHeaderOptions('Gráficos de Vendas'),
  },
  {
    name: 'Dashvendas',
    component: Screens.Dashvendas,
    options: createHeaderOptions('Dashboard de Vendas'),
  },

  // Painéis
  {
    name: 'PainelCooperado',
    component: Screens.PainelCooperado,
    options: createHeaderOptions('Painel do Cooperado'),
  },
  // Telas de parâmetros
  {
    name: 'ParametrosMenu',
    component: Screens.ParametrosMenu,
    options: createHeaderOptions('Parâmetros do Sistema'),
  },
  {
    name: 'ParametrosGeraisList',
    component: Screens.ParametrosGeraisList,
    options: createHeaderOptions('Parâmetros Gerais'),
  },
  {
    name: 'ParametrosGeraisForm',
    component: Screens.ParametrosGeraisForm,
    options: createHeaderOptions('Parâmetro'),
  },
  {
    name: 'PermissoesModulosList',
    component: Screens.PermissoesModulosList,
    options: createHeaderOptions('Permissões de Módulos'),
  },
  {
    name: 'ConfiguracaoEstoqueForm',
    component: Screens.ConfiguracaoEstoqueForm,
    options: createHeaderOptions('Configuração de Estoque'),
  },
  {
    name: 'ConfiguracaoFinanceiroForm',
    component: Screens.ConfiguracaoFinanceiroForm,
    options: createHeaderOptions('Configuração Financeira'),
  },
  {
    name: 'LogParametrosList',
    component: Screens.LogParametrosList,
    options: createHeaderOptions('Logs de Parâmetros'),
  },
]
