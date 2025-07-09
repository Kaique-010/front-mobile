import { useState, useEffect, useCallback } from 'react'
import {
  getModulosLiberados,
  getPermissoesUsuario,
  verificarPermissaoTela,
  getConfiguracaoCompleta,
} from '../services/parametrosService'
import { getStoredData } from '../services/storageService'

export const usePermissoes = () => {
  const [modulos, setModulos] = useState([])
  const [permissoes, setPermissoes] = useState({})
  const [configuracao, setConfiguracao] = useState({})
  const [loading, setLoading] = useState(true)
  const [empresaId, setEmpresaId] = useState('')
  const [filialId, setFilialId] = useState('')

  const carregarPermissoes = useCallback(async () => {
    try {
      setLoading(true)
      
      // Carregar dados da empresa/filial
      const { empresaId, filialId } = await getStoredData()
      setEmpresaId(empresaId)
      setFilialId(filialId)

      // Carregar dados em paralelo
      const [modulosResponse, permissoesResponse, configResponse] = await Promise.all([
        getModulosLiberados(),
        getPermissoesUsuario(),
        getConfiguracaoCompleta(),
      ])

      setModulos(modulosResponse?.data || [])
      setPermissoes(permissoesResponse?.data || {})
      setConfiguracao(configResponse?.data || {})
    } catch (error) {
      console.error('Erro ao carregar permissões:', error)
      // Em caso de erro, definir valores padrão
      setModulos([])
      setPermissoes({})
      setConfiguracao({})
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    carregarPermissoes()
  }, [carregarPermissoes])

  // Verificar se um módulo está liberado
  const moduloLiberado = useCallback((nomeModulo) => {
    const modulo = modulos.find(m => m.modu_nome === nomeModulo)
    return modulo?.perm_ativ || false
  }, [modulos])

  // Verificar se uma tela está liberada
  const telaLiberada = useCallback((codigoTela) => {
    return permissoes.telas?.[codigoTela] || false
  }, [permissoes])

  // Verificar se uma operação está liberada
  const operacaoLiberada = useCallback((codigoTela, operacao) => {
    return permissoes.operacoes?.[codigoTela]?.[operacao] || false
  }, [permissoes])

  // Verificar permissão específica de tela
  const verificarPermissao = useCallback(async (tela, operacao) => {
    try {
      const response = await verificarPermissaoTela(tela, operacao)
      return response?.data?.permitido || false
    } catch (error) {
      console.error('Erro ao verificar permissão:', error)
      return false
    }
  }, [])

  // Obter configuração de estoque
  const getConfigEstoque = useCallback(() => {
    return configuracao.estoque || {}
  }, [configuracao])

  // Obter configuração financeira
  const getConfigFinanceiro = useCallback(() => {
    return configuracao.financeiro || {}
  }, [configuracao])

  // Verificar se pedidos movimentam estoque
  const pedidosMovimentamEstoque = useCallback(() => {
    return getConfigEstoque().conf_pedi_move_esto || false
  }, [getConfigEstoque])

  // Verificar se orçamentos movimentam estoque
  const orcamentosMovimentamEstoque = useCallback(() => {
    return getConfigEstoque().conf_orca_move_esto || false
  }, [getConfigEstoque])

  // Verificar se permite estoque negativo
  const permiteEstoqueNegativo = useCallback(() => {
    return getConfigEstoque().conf_esto_nega || false
  }, [getConfigEstoque])

  // Verificar se permite desconto em pedidos
  const permiteDescontoPedidos = useCallback(() => {
    return getConfigFinanceiro().conf_perm_desc_pedi || false
  }, [getConfigFinanceiro])

  // Obter desconto máximo permitido
  const getDescontoMaximo = useCallback(() => {
    return getConfigFinanceiro().conf_desc_maxi_pedi || 0
  }, [getConfigFinanceiro])

  // Verificar se permite vendas a prazo
  const permiteVendasPrazo = useCallback(() => {
    return getConfigFinanceiro().conf_perm_vend_praz || false
  }, [getConfigFinanceiro])

  // Obter prazo máximo para vendas
  const getPrazoMaximoVendas = useCallback(() => {
    return getConfigFinanceiro().conf_praz_maxi_vend || 0
  }, [getConfigFinanceiro])

  // Lista de módulos liberados
  const modulosLiberados = useCallback(() => {
    return modulos.filter(m => m.perm_ativ).map(m => m.modu_nome)
  }, [modulos])

  // Lista de módulos bloqueados
  const modulosBloqueados = useCallback(() => {
    return modulos.filter(m => !m.perm_ativ).map(m => m.modu_nome)
  }, [modulos])

  // Verificar se usuário tem permissão administrativa
  const isAdmin = useCallback(() => {
    return permissoes.admin || false
  }, [permissoes])

  // Verificar se módulo está vencido
  const moduloVencido = useCallback((nomeModulo) => {
    const modulo = modulos.find(m => m.modu_nome === nomeModulo)
    if (!modulo?.perm_data_venc) return false
    
    return new Date() > new Date(modulo.perm_data_venc)
  }, [modulos])

  // Obter data de vencimento do módulo
  const getDataVencimentoModulo = useCallback((nomeModulo) => {
    const modulo = modulos.find(m => m.modu_nome === nomeModulo)
    return modulo?.perm_data_venc || null
  }, [modulos])

  return {
    // Estados
    modulos,
    permissoes,
    configuracao,
    loading,
    empresaId,
    filialId,
    
    // Funções de carregamento
    carregarPermissoes,
    
    // Verificações de permissão
    moduloLiberado,
    telaLiberada,
    operacaoLiberada,
    verificarPermissao,
    
    // Configurações de estoque
    getConfigEstoque,
    pedidosMovimentamEstoque,
    orcamentosMovimentamEstoque,
    permiteEstoqueNegativo,
    
    // Configurações financeiras
    getConfigFinanceiro,
    permiteDescontoPedidos,
    getDescontoMaximo,
    permiteVendasPrazo,
    getPrazoMaximoVendas,
    
    // Listas
    modulosLiberados,
    modulosBloqueados,
    
    // Verificações especiais
    isAdmin,
    moduloVencido,
    getDataVencimentoModulo,
  }
}