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

  // Telas de contratos
  {
    name: 'ContratosForm',
    component: Screens.ContratosForm,
    options: createHeaderOptions('Contratos de Venda'),
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
    options: createHeaderOptions('Grafico Financeiro'),
  },
  {
    name: 'Dashboard Financeiro Realizado',
    component: Screens.DashRealizado,
    options: createHeaderOptions('Realizado Dash'),
  },
  {
    name: 'DashBalanceteCC',
    component: Screens.DashBalanceteCC,
    options: createHeaderOptions('Balancete por Centro de Custos'),
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
]