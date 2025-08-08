import {
  apiGetComContexto,
  apiPostComContexto,
  apiPutComContexto,
  apiDeleteComContexto,
  apiPatchComContexto,
} from '../utils/api'

// Parâmetros Gerais
export const getParametrosGerais = (params = {}) => {
  return apiGetComContexto('parametros-admin/parametros-gerais/', params)
}

// Permissões de Módulos
export const getPermissoesModulos = (params = {}) => {
  return apiGetComContexto('parametros-admin/permissoes-modulos/', params)
}

export const createPermissaoModulo = (data) => {
  return apiPostComContexto('parametros-admin/permissoes-modulos/', data)
}

export const updatePermissaoModulo = (id, data) => {
  return apiPutComContexto(`parametros-admin/permissoes-modulos/${id}/`, data)
}

export const getModulosSistema = () => {
  return apiGetComContexto(
    'parametros-admin/permissoes-modulos/modulos_disponiveis/'
  )
}

// Configurações de Estoque
export const getConfiguracaoEstoque = (params = {}) => {
  return apiGetComContexto('parametros-admin/configuracao-estoque/', params)
}

export const updateConfiguracaoEstoque = (id, data) => {
  return apiPutComContexto(`parametros-admin/configuracao-estoque/${id}/`, data)
}

// Configurações Financeiras
export const getConfiguracaoFinanceiro = (params = {}) => {
  return apiGetComContexto('parametros-admin/configuracao-financeiro/', params)
}

export const updateConfiguracaoFinanceiro = (id, data) => {
  return apiPutComContexto(
    `parametros-admin/configuracao-financeiro/${id}/`,
    data
  )
}

// Logs
export const getLogsParametros = (params = {}) => {
  return apiGetComContexto('parametros-admin/logs/', params)
}

// Adicionar novos endpoints
export const getModulosLiberados = () => {
  return apiGetComContexto('parametros-admin/modulos-liberados/')
}

// NOVOS ENDPOINTS PARA PARÂMETROS DE DESCONTO

// Configurações de Desconto
export const getConfiguracaoDesconto = (params = {}) => {
  return apiGetComContexto('parametros-admin/configuracao-desconto/', params)
}

export const updateConfiguracaoDesconto = (id, data) => {
  return apiPutComContexto(
    `parametros-admin/configuracao-desconto/${id}/`,
    data
  )
}
