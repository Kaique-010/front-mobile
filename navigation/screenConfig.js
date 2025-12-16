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
  {
    name: 'HomeCliente',
    component: Screens.HomeCliente,
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
  {
    name: 'UsuariosList',
    component: Screens.UsuariosList,
    options: createHeaderOptions('Usuários do Sistema'),
  },
  {
    name: 'UsuarioForm',
    component: Screens.UsuarioForm,
    options: createHeaderOptions('Cadastro de Usuário'),
  },

  // Telas de produtos
  {
    name: 'Produtos',
    component: Screens.Produtos,
    options: createHeaderOptions('Produtos'),
  },

  {
    name: 'ProdutoPrecos',
    component: Screens.ProdutoPrecos,
    options: createHeaderOptions('Preços dos Itens'),
  },
  {
    name: 'ProdutoForm',
    component: Screens.ProdutoForm,
    options: createHeaderOptions('Produtos'),
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
    options: createHeaderOptions('Entidades'),
  },

  // Telas de vendas

  {
    name: 'Contratos',
    component: Screens.Contratos,
    options: createHeaderOptions('Contratos'),
  },
  {
    name: 'ContratosForm',
    component: Screens.ContratosForm,
    options: createHeaderOptions('Contratos'),
  },
  {
    name: 'ListaCasamento',
    component: Screens.ListaCasamento,
    options: createHeaderOptions('Lista de Casamento'),
  },

  {
    name: 'Pedidos',
    component: Screens.Pedidos,
    options: createHeaderOptions('Pedidos'),
  },

  {
    name: 'PedidosForm',
    component: Screens.PedidosForm,
    options: createHeaderOptions('Pedido de Venda'),
  },
  {
    name: 'Orcamentos',
    component: Screens.Orcamentos,
    options: createHeaderOptions('Orçamentos'),
  },
  {
    name: 'OrcamentosForm',
    component: Screens.OrcamentosForm,
    options: createHeaderOptions('Orçamentos'),
  },
  {
    name: 'ListaCasamentoForm',
    component: Screens.ListaCasamentoForm,
    options: createHeaderOptions('Listas de Casamento'),
  },
  {
    name: 'ItensListaModal',
    component: Screens.ItensListaModal,
    options: createHeaderOptions('Adicionar Itens à Lista'),
  },
  {
    name: 'ListaCasamento2',
    component: Screens.ListaCasamento2,
    options: createHeaderOptions('Listas de Casamento'),
  },

  {
    name: 'ListaCasamentoForm2',
    component: Screens.ListaCasamentoForm2,
    options: createHeaderOptions('Listas de Casamento'),
  },
  {
    name: 'ItensListaModal2',
    component: Screens.ItensListaModal2,
    options: createHeaderOptions('Adicionar Itens à Lista'),
  },

  // Telas de estoque
  {
    name: 'EntradasEstoque',
    component: Screens.EntradasEstoque,
    options: createHeaderOptions('Entradas de Estoque'),
  },

  {
    name: 'EntradasForm',
    component: Screens.EntradasForm,
    options: createHeaderOptions('Entradas de Estoque'),
  },

  {
    name: 'SaidasEstoque',
    component: Screens.SaidasEstoque,
    options: createHeaderOptions('Saidas de Estoque'),
  },
  {
    name: 'SaidasForm',
    component: Screens.SaidasForm,
    options: createHeaderOptions('Saidas de Estoque'),
  },
  {
    name: 'ColetorEstoque',
    component: Screens.ColetorEstoqueScreen,
    options: createHeaderOptions('Coletor de Estoque'),
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

  // Telas de notas fiscais
  {
    name: 'NotasFiscaisList',
    component: Screens.NotasFiscaisList,
    options: createHeaderOptions('Notas Fiscais'),
  },
  {
    name: 'NotaFiscalDetalhe',
    component: Screens.NotaFiscalDetalhe,
    options: createHeaderOptions('Detalhes da Nota Fiscal'),
  },
  {
    name: 'NotaFiscalXml',
    component: Screens.NotaFiscalXml,
    options: createHeaderOptions('XML da Nota Fiscal'),
  },
  {
    name: 'EmissaoNFe',
    component: Screens.EmissaoNFe,
    options: createHeaderOptions('Emissão de NFe'),
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

  // Telas de controle de visitas
  {
    name: 'ControleVisitaDashboard',
    component: Screens.ControleVisitaDashboard,
    options: createHeaderOptions('Dashboard CRM'),
  },
  {
    name: 'ControleVisitas',
    component: Screens.ControleVisitas,
    options: createHeaderOptions('Controle de Visitas'),
  },
  {
    name: 'ControleVisitaForm',
    component: Screens.ControleVisitaForm,
    options: createHeaderOptions('Cadastro de Visita'),
  },
  {
    name: 'ControleVisitaDetalhes',
    component: Screens.ControleVisitaDetalhes,
    options: createHeaderOptions('Detalhes da Visita'),
  },
  {
    name: 'EtapasForm',
    component: Screens.EtapasForm,
    options: createHeaderOptions('Cadastro de Etapa'),
  },
  {
    name: 'EtapasList',
    component: Screens.EtapasList,
    options: createHeaderOptions('Listagem de Etapas'),
  },

  // Telas de Propriedade
  {
    name: 'PropriedadeList',
    component: Screens.PropriedadeList,
    options: createHeaderOptions('Propriedades'),
  },
  {
    name: 'PropriedadeForm',
    component: Screens.PropriedadeForm,
    options: createHeaderOptions('Propriedade'),
  },

  // Telas de ordem de serviço florestal
  {
    name: 'OrdensFlorestalList',
    component: Screens.OrdemListagem,
    options: createHeaderOptions('Ordens Florestal'),
  },
  {
    name: 'OrdemFlorestalCriacao',
    component: Screens.OrdemFlorestalCriacao,
    options: createHeaderOptions('Abertura O.F'),
  },
  {
    name: 'OrdemFlorestalDetalhe',
    component: Screens.OrdemFlorestalDetalhe,
    options: createHeaderOptions('Detalhes da O.F'),
  },

  // Telas de fluxo de caixa
  {
    name: 'FluxoDeCaixa',
    component: Screens.FluxoDeCaixa,
    options: createHeaderOptions('Fluxo de Caixa'),
  },
  {
    name: 'DashboardFluxo',
    component: Screens.DashboardFluxo,
    options: createHeaderOptions('Dashboard - Fluxo de Caixa'),
  },
  // Telas de ordem de serviço
  {
    name: 'PainelAcompanhamento',
    component: Screens.PainelAcompanhamento,
    options: { title: 'Painel OS' },
    options: createHeaderOptions('Painel Acompanhamento de Ordens de Serviço'),
  },
  {
    name: 'Painel Os',
    component: Screens.PainelOrdens,
    options: createHeaderOptions('Painel Ordens de serviço'),
  },
  {
    name: 'OrdemCriacaoExterna',
    component: Screens.OrdemCriacaoExterna,
    options: createHeaderOptions('Abertura O.S Externa'),
  },
  {
    name: 'OrdemDetalheExterna',
    component: Screens.OrdemDetalheExterna,
    options: createHeaderOptions('Detalhes da O.S Externa'),
  },
  {
    name: 'PainelAcompanhamentoExterna',
    component: Screens.PainelAcompanhamentoExterna,
    options: createHeaderOptions('Painel Ordens de Serviço Externa'),
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
  {
    name: 'WorkflowConfig',
    component: Screens.WorkflowConfig,
    options: createHeaderOptions('Configuração de Workflows'),
  },
  {
    name: 'OrdensEletroGrafico',
    component: Screens.OrdensEletroGrafico,
    options: createHeaderOptions('Gráficos de O.E'),
  },
  {
    name: 'DashOrdensEletro',
    component: Screens.DashOrdensEletro,
    options: createHeaderOptions('Relação de Ordens'),
  },
  {
    name: 'HistoricoWorkflow',
    component: Screens.HistoricoWorkflow,
    options: createHeaderOptions('Histórico Workflow'),
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
  {
    name: 'ConsultaScreen',
    component: Screens.ConsultaScreen,
    options: createHeaderOptions('Consulta Inteligente'),
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
    name: 'DashboardFinanceiro',
    component: Screens.DashboardFinanceiro,
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
    name: 'DashNotasFiscais',
    component: Screens.DashNotasFiscais,
    options: createHeaderOptions('Dashboard de Notas Fiscais'),
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

  //telas de pisos
  {
    name: 'DashPedidosPisos',
    component: Screens.DashPedidosPisos,
    options: createHeaderOptions('Dashboard de Pedidos de Pisos'),
  },
  {
    name: 'DashPedidosPisosGrafico',
    component: Screens.DashPedidosPisosGrafico,
    options: createHeaderOptions('Gráficos de Pedidos de Pisos'),
  },
  {
    name: 'PedidosPisos',
    component: Screens.PedidosPisos,
    options: createHeaderOptions('Pedidos de Pisos'),
  },
  {
    name: 'PedidosPisosForm',
    component: Screens.PedidosPisosForm,
    options: createHeaderOptions('Pedidos de Pisos'),
  },
  {
    name: 'OrcamentosPisos',
    component: Screens.OrcamentosPisos,
    options: createHeaderOptions('Orçamentos de Pisos'),
  },
  {
    name: 'OrcamentosPisosForm',
    component: Screens.OrcamentosPisosForm,
    options: createHeaderOptions('Orçamentos de Pisos'),
  },
  {
    name: 'ResumoOrcamentoPisos',
    component: Screens.ResumoOrcamentoPisos,
    options: createHeaderOptions('Resumo Orçamento Pisos'),
  },

  // Telas de parâmetros
  {
    name: 'SistemaPermissoes',
    component: Screens.SistemaPermissoes,
    options: createHeaderOptions('Sistema de Permissões'),
  },
  {
    name: 'ParametrosMenu',
    component: Screens.ParametrosMenu,
    options: createHeaderOptions('Parâmetros do Sistema'),
  },

  {
    name: 'LogParametrosList',
    component: Screens.LogParametrosList,
    options: createHeaderOptions('Logs de Parâmetros'),
  },
  {
    name: 'Modulos',
    component: Screens.Modulos,
    options: createHeaderOptions('Módulos do Sistema'),
  },
  {
    name: 'Parametros',
    component: Screens.Parametros,
    options: createHeaderOptions('Parâmetros do Sistema'),
  },
  {
    name: 'ParametrosVendas',
    component: Screens.ParametrosVendas,
    options: createHeaderOptions('Parâmetros de Vendas'),
  },
  {
    name: 'ParametrosCompras',
    component: Screens.ParametrosCompras,
    options: createHeaderOptions('Parâmetros de Compras'),
  },
  {
    name: 'ParametrosEstoque',
    component: Screens.ParametrosEstoque,
    options: createHeaderOptions('Parâmetros de Estoque'),
  },
  {
    name: 'ParametrosFinanceiro',
    component: Screens.ParametrosFinanceiro,
    options: createHeaderOptions('Parâmetros Financeiro'),
  },
  // ... Telas de Cliente
  {
    name: 'ClientePedidosList',
    component: Screens.ClientePedidosList,
    options: createHeaderOptions('Meus Pedidos'),
  },
  {
    name: 'ClientePedidosDetalhes',
    component: Screens.ClientePedidosDetalhes,
    options: createHeaderOptions('Detalhes do Pedido'),
  },
  {
    name: 'ClienteOrcamentosList',
    component: Screens.ClienteOrcamentosList,
    options: createHeaderOptions('Meus Orçamentos'),
  },
  {
    name: 'ClienteOrcamentosDetalhes',
    component: Screens.ClienteOrcamentosDetalhes,
    options: createHeaderOptions('Detalhes do Orçamento'),
  },
  {
    name: 'ClienteOrdensServicoList',
    component: Screens.ClienteOrdensServicoList,
    options: createHeaderOptions('Minhas Ordens de Serviço'),
  },
  {
    name: 'ClienteOrdensServicoDetalhes',
    component: Screens.ClienteOrdensServicoDetalhes,
    options: createHeaderOptions('Detalhes da Ordem de Serviço'),
  },
]
