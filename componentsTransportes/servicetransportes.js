import {
  apiGetComContexto,
  apiPostComContexto,
  apiPutComContexto,
  apiDeleteComContexto,
  apiPatchComContexto,
} from '../utils/api'

export const transporteService = {
  listarMdfes(params = {}) {
    return apiGetComContexto('transportes/mdfes/', params)
  },

  buscarMdfe(id) {
    return apiGetComContexto(`transportes/mdfes/${id}/`)
  },

  criarMdfe(data) {
    return apiPostComContexto('transportes/mdfes/', data)
  },

  atualizarMdfe(id, data) {
    return apiPatchComContexto(`transportes/mdfes/${id}/`, data)
  },

  emitirMdfe(id) {
    return apiPostComContexto(`transportes/mdfes/${id}/emitir/`)
  },

  encerrarMdfe(id, data = {}) {
    return apiPostComContexto(`transportes/mdfes/${id}/encerrar/`, data)
  },

  listarDocumentosMdfe(id) {
    return apiGetComContexto(`transportes/mdfes/${id}/documentos/`)
  },

  salvarDocumentosMdfe(id, documentos) {
    return apiPostComContexto(`transportes/mdfes/${id}/documentos/`, {
      documentos,
    })
  },

  listarCtes(params = {}) {
    return apiGetComContexto('transportes/ctes/', params)
  },

  buscarCte(id) {
    return apiGetComContexto(`transportes/ctes/${id}/`)
  },

  criarCte(data) {
    return apiPostComContexto('transportes/ctes/', data)
  },

  atualizarCte(id, data) {
    return apiPatchComContexto(`transportes/ctes/${id}/`, data)
  },

  salvarCte(id, data) {
    if (id) {
      return this.atualizarCte(id, data)
    }

    return this.criarCte(data)
  },

  emitirCte(id) {
    return apiPostComContexto(`transportes/ctes/${id}/emitir/`)
  },

  calcularImpostosCte(id, cfop) {
    return apiGetComContexto(`transportes/ctes/${id}/calcular-impostos/`, {
      cfop,
    })
  },

  deletarMdfe(id) {
    return apiDeleteComContexto(`transportes/mdfes/${id}/`)
  },

  deletarCte(id) {
    return apiDeleteComContexto(`transportes/ctes/${id}/`)
  },
}
