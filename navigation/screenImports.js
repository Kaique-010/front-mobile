// Telas de autenticação
export { default as Login } from '../screens/Login'
export { default as SelectEmpresa } from '../screens/SelectEmpresa'
export { default as SelectFilial } from '../screens/SelectFilial'

// Telas principais
export { default as AppNavigator } from './AppNavigator'
export { default as HomeCliente } from '../screens/HomeCliente'
export { default as AuditoriaScreen } from '../screens/AuditoriaScreen'

// Componentes de usuários
export { default as AlterarSenhaScreen } from '../componentsUsuarios/AlterarSenhaScreen'
export { default as UsuariosList } from '../componentsUsuarios/UsuariosList'
export { default as UsuarioForm } from '../componentsUsuarios/UsuarioForm'

// Telas de produtos

export { default as ProdutoForm } from '../screens/ProdutoForm'
export { default as ProdutoPrecos } from '../componetsProdutos/ProdutoPrecos'
export { default as Produtos } from '../screens/Produtos'
export { default as ProdutosDetalhados } from '../componentsProdutosDetalhados/ProdutosDetalhados'

// Telas de entidades
export { default as EntidadeForm } from '../screens/EntidadeForm'
export { default as Entidades } from '../screens/Entidades'

// Telas de vendas

export { default as Contratos } from '../screens/Contratos'
export { default as ContratosForm } from '../screens/ContratosForm'
export { default as Pedidos } from '../screens/Pedidos'
export { default as PedidosForm } from '../screens/PedidosForm'
export { default as Orcamentos } from '../screens/Orcamentos'
export { default as OrcamentosForm } from '../screens/OrcamentosForm'

// Lista de casamento
export { default as ListaCasamentoForm } from '../screens/ListaCasamentoForm'
export { default as ListaCasamento } from '../screens/ListaCasamento'
export { default as ItensListaModal } from '../screens/ItensListaModal'

export { default as ListaCasamentoForm2 } from '../componentsListaCasamento/ListaCasamentoForm'
export { default as ListaCasamento2 } from '../componentsListaCasamento/ListaCasamento'
export { default as ItensListaModal2 } from '../componentsListaCasamento/ItensListaModal'

// Telas de estoque
export { default as EntradasForm } from '../screens/EntradasForm'
export { default as EntradasEstoque } from '../screens/EntradasEstoque'
export { default as SaidasForm } from '../screens/SaidasForm'
export { default as SaidasEstoque } from '../screens/SaidasEstoque'
export { default as ColetorEstoqueScreen } from '../coletorEstoque/ColetorEstoqueScreen'

// Telas financeiras
export { default as ContasPagarList } from '../screens/ContasPagarList'
export { default as ContasReceberList } from '../screens/ContasReceberList'
export { default as ContaPagarForm } from '../componentsContaPagar/ContaPagarForm'
export { default as ContaReceberForm } from '../componentsContaReceber/ContaReceberForm'
export { default as BaixaTituloForm } from '../screens/BaixaTituloForm'
export { default as MoviCaixaScreen } from '../screens/MoviCaixa'
export { default as CaixaGeralScreen } from '../screens/CaixaGeral'
export { default as CobrancasList } from '../screens/CobrancasList'

// Telas de notas fiscais
export { default as NotasFiscaisList } from '../screens/NotasFiscaisList'
export { default as NotaFiscalDetalhe } from '../screens/NotaFiscalDetalhe'
export { default as NotaFiscalXml } from '../screens/NotaFiscalXml'
export { default as EmissaoNFe } from '../componentsNotasFiscais/EmissaoNFe'

// Telas de comissão
export { default as ComissaoForm } from '../componentsComissao/ComissaoForm'
export { default as ComissaoList } from '../componentsComissao/ComissaoList'
export { default as DashComissao } from '../componentsComissao/DashComissao'

// Telas de controle de visitas
export { default as ControleVisitaDashboard } from '../screens/ControleVisitaDashboardScreen'
export { default as ControleVisitas } from '../screens/ControleVisitasScreen'
export { default as ControleVisitaForm } from '../screens/ControleVisitaFormScreen'
export { default as ControleVisitaDetalhes } from '../screens/ControleVisitaDetalhesScreen'
export { default as EtapasForm } from '../componentsControledeVisita/EtapasForm'
export { default as EtapasList } from '../componentsControledeVisita/EtapasList'

// Telas de ordem de serviço
export { default as PainelAcompanhamento } from '../screens/PainelOs'
export { default as PainelOs } from '../screens/PainelOs'
export { default as PainelOrdens } from '../screens/PainelOrdens'
export { default as OrdemDetalhe } from '../screens/OrdemDetalhe'
export { default as OSCreateScreen } from '../componentsOs/OsCriacao'
export { default as OsDetalhe } from '../screens/OSDetalhe'
export { default as CriarOrdemServico } from '../componentsOrdemServico/OrdemCriacao'
export { default as OrdemServicoGeral } from '../dashboards/DashOs'
export { default as DashOsGrafico } from '../dashboards/DasOsGrafico'
export { default as DashOs } from '../dashboards/DashOs'
export { default as WorkflowConfig } from '../screens/WorkflowConfig'
export { default as OrdensEletroGrafico } from '../componentsRelatoriosEletro/OrdensEletroGrafico'
export { default as DashOrdensEletro } from '../componentsRelatoriosEletro/DashOrdensEletro'
export { default as HistoricoWorkflow } from '../componentsRelatoriosEletro/HistoricoWorkflow'
export { default as OrdensEmEstoque } from '../componentsOs/OrdensEmEstoque'

// Telas de ordem de serviço externa
export { default as PainelAcompanhamentoExterna } from '../componentsOrdemServicoExterna/PainelAcompanhamentoExterna'
export { default as OrdemDetalheExterna } from '../componentsOrdemServicoExterna/OrdemDetalheExterna'
export { default as OrdemCriacaoExterna } from '../componentsOrdemServicoExterna/OrdemCriacaoExterna'
export { default as DatabaseInspector } from '../screens/DatabaseInspector'

// Telas de implantação
export { default as ImplantacaoForm } from '../screens/ImplantacaoForm'

// Dashboards financeiros
export { default as DashboardFinanceiroGrafico } from '../dashboardFinanceiro/DashboardFinanceiroGrafico'
export { default as DashboardFinanceiro } from '../dashboardFinanceiro/DashboardFinanceiro'
export { default as DashRealizado } from '../dashboardFinanceiro/DashRealizado'
export { default as DashBalanceteCC } from '../dashboardFinanceiro/DashBalanceteCC'
export { default as DashBalanceteEstoque } from '../dashboardFinanceiro/DashBalanceteEstoque'
export { default as DashDRE } from '../componetsDRE/DashDRE'
export { default as DashDRECaixa } from '../componetsDRE/DashDRECaixa'

// Dashboards de vendas
export { default as DashExtratoCaixa } from '../dashsVendas/DashExtratoCaixa'
export { default as DashContratos } from '../dashsVendas/DashContratos'
export { default as DashPedidosVenda } from '../dashsVendas/DashPedidosVenda'
export { default as DashPedidosVendaGrafico } from '../dashsVendas/DashPedidosVendaGrafico'
export { default as DashNotasFiscais } from '../dashsVendas/DashNotasFiscais'
export { default as Dashvendas } from '../screens/Dashvendas'

// Painéis
export { default as PainelCooperado } from '../screens/PainelCooperado'

// Telas gerenciais
export { default as DespesasPrevistas } from '../componentsGerencial/DespesasPrevistas'
export { default as LucroPrevisto } from '../componentsGerencial/LucroPrevisto'
export { default as FluxoCaixaPrevisto } from '../componentsGerencial/FluxoCaixaPrevisto'

// Telas de Ordem de Produção
export { default as ListagemOrdensProducao } from '../componentsOrdemProducao/ListagemOrdensProducao'
export { default as DetalhesOrdemProducao } from '../componentsOrdemProducao/DetalhesOrdemProducao'
export { default as FormOrdemProducao } from '../componentsOrdemProducao/FormOrdemProducao'

// Parâmetros
export { default as SistemaPermissoes } from '../Parametros/SistemaPermissoes'
export { default as ParametrosMenu } from '../Parametros/ParametrosMenu'
export { default as LogParametrosList } from '../Parametros/LogParametrosList'
export { default as Modulos } from '../Parametros/Modulos'
export { default as Parametros } from '../Parametros/Parametros'
export { default as ParametrosVendas } from '../Parametros/Screens/ParametrosVendas'
export { default as ParametrosCompras } from '../Parametros/Screens/ParametrosCompras'
export { default as ParametrosEstoque } from '../Parametros/Screens/ParametrosEstoque'
export { default as ParametrosFinanceiro } from '../Parametros/Screens/ParametrosFinanceiro'

// Telas de MCP
export { default as ConsultaScreen } from '../componentsMCP/consultaMCP'

// Pisos
export { default as DashPedidosPisos } from '../componetsPisos/DashPedidosPisos'
export { default as DashPedidosPisosGrafico } from '../componetsPisos/DashPedidosPisosGrafico'
export { default as PedidosPisos } from '../componetsPisos/PedidosPisos'
export { default as PedidosPisosForm } from '../componetsPisos/PedidosPisosForm'
export { default as OrcamentosPisos } from '../componetsPisos/OrcamentoPisos'
export { default as OrcamentosPisosForm } from '../componetsPisos/OrcamentosPisosForm'
export { default as ResumoOrcamentoPisos } from '../componetsPisos/ResumoOrcamentoPisos'

// Telas de Cliente
export { default as ClientePedidosList } from '../componentsClients/ClientePedidosList'
export { default as ClientePedidosDetalhes } from '../componentsClients/ClientePedidosDetalhes'
export { default as ClienteOrcamentosList } from '../componentsClients/ClienteOrcamentosList'
export { default as ClienteOrcamentosDetalhes } from '../componentsClients/ClienteOrcamentosDetalhes'
export { default as ClienteOrdensServicoList } from '../componentsClients/ClienteOrdensServicoList'
export { default as ClienteOrdensServicoDetalhes } from '../componentsClients/ClienteOrdensServicoDetalhes'
export { default as ClienteMotoresEstoqueList } from '../componentsClients/ClienteMotoresEstoqueList'

// Telas de Propriedade
export { default as PropriedadeForm } from '../componentsFloresta/PropriedadeForm'
export { default as PropriedadeList } from '../componentsFloresta/PropriedadeList'
export { default as FluxoDeCaixa } from '../componentsFloresta/FluxoDeCaixa'
export { default as DashboardFluxo } from '../componentsFloresta/DashboardFluxo'

// Telas de Ordem de Serviço Florestal
export { default as OrdemFlorestalCriacao } from '../componentsFloresta/osFlorestal/OrdemFlorestalCriacao'
export { default as OrdemListagem } from '../componentsFloresta/osFlorestal/PainelOs'
export { default as OrdemFlorestalDetalhe } from '../componentsFloresta/osFlorestal/OrdemFlorestalDetalhe'

// Telas de Registro de Ponto
export { default as PontoScreen } from '../componentsRegistroPonto/screens/PontoScreen'
export { default as ListarPontos } from '../componentsRegistroPonto/listarPontos'
