import { useState, useEffect } from 'react'
import { getPermissoesUsuario } from '../services/parametrosService'

export const usePermissoes = () => {
  const [permissoes, setPermissoes] = useState({
    modulos: [],
    estoque: {},
    financeiro: {},
    usuario: {}
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    carregarPermissoes()
  }, [])
  
  const carregarPermissoes = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await getPermissoesUsuario()
      setPermissoes(response.data)
    } catch (error) {
      console.error('Erro ao carregar permissões:', error)
      setError(error)
      
      // Fallback para permissões básicas
      setPermissoes({
        modulos: ['dashboard', 'pedidos'], // Módulos básicos
        estoque: {},
        financeiro: {},
        usuario: {}
      })
    } finally {
      setLoading(false)
    }
  }
  
  const podeAcessarModulo = (modulo) => {
    return permissoes.modulos.includes(modulo)
  }
  
  const podeOperacaoEstoque = (operacao) => {
    const mapeamento = {
      'pedido': 'conf_pedi_move_esto',
      'orcamento': 'conf_orca_move_esto',
      'os': 'conf_os_move_esto',
      'producao': 'conf_prod_move_esto'
    }
    
    const campo = mapeamento[operacao]
    return campo ? permissoes.estoque[campo] !== false : true
  }
  
  const podeOperacaoFinanceiro = (operacao) => {
    const mapeamento = {
      'desconto': 'conf_perm_desc_pedi',
      'acrescimo': 'conf_perm_acre_pedi',
      'prazo': 'conf_perm_vend_praz'
    }
    
    const campo = mapeamento[operacao]
    return campo ? permissoes.financeiro[campo] !== false : true
  }
  
  const getDescontoMaximo = () => {
    return permissoes.financeiro.conf_desc_maxi_pedi || 0
  }
  
  return {
    permissoes,
    loading,
    error,
    podeAcessarModulo,
    podeOperacaoEstoque,
    podeOperacaoFinanceiro,
    getDescontoMaximo,
    recarregar: carregarPermissoes
  }
}