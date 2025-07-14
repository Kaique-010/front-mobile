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

export const createParametroGeral = (data) => {
  return apiPostComContexto('parametros-admin/parametros-gerais/', data)
}

export const updateParametroGeral = (id, data) => {
  return apiPutComContexto(`parametros-admin/parametros-gerais/${id}/`, data)
}

export const deleteParametroGeral = (id) => {
  return apiDeleteComContexto(`parametros-admin/parametros-gerais/${id}/`)
}

export const importarParametrosPadrao = (data) => {
  return apiPostComContexto(
    'parametros-admin/parametros-gerais/importar_padrao/',
    data
  )
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

export const sincronizarLicenca = (data) => {
  return apiPostComContexto(
    'parametros-admin/permissoes-modulos/sincronizar_licenca/',
    data
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

export const getPermissoesUsuario = () => {
  return apiGetComContexto('parametros-admin/permissoes-usuario/')
}

export const verificarPermissaoTela = (tela, operacao) => {
  return apiGetComContexto(
    `parametros-admin/verificar-permissao/${tela}/${operacao}/`
  )
}

export const getConfiguracaoCompleta = () => {
  return apiGetComContexto('parametros-admin/configuracao-completa/')
}


// Parâmetros por Módulo
export const getParametrosPorModulo = (params = {}) => {
  return apiGetComContexto('parametros-admin/parametros-por-modulo/', params)
}

export const updateParametrosPorModulo = (data) => {
  return apiPatchComContexto('parametros-admin/parametros-por-modulo/', data)
}
