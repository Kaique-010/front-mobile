import {
  apiGetComContexto,
  apiPostComContexto,
  apiPutComContexto,
  apiDeleteComContexto,
  apiPatchComContexto,
} from '../utils/api'

export const transporteService = {
  listarMdfes(params = {}) {
    return apiGetComContexto('transportes/mdfe/', params)
  },

  buscarMdfe(id) {
    return apiGetComContexto(`transportes/mdfe/${id}/`)
  },

  criarMdfe(data) {
    return apiPostComContexto('transportes/mdfe/', data)
  },

  atualizarMdfe(id, data) {
    return apiPatchComContexto(`transportes/mdfe/${id}/`, data)
  },

  emitirMdfe(id) {
    return apiPostComContexto(`transportes/mdfe/${id}/emitir/`)
  },

  encerrarMdfe(id, data = {}) {
    return apiPostComContexto(`transportes/mdfe/${id}/encerrar/`, data)
  },

  listarDocumentosMdfe(id) {
    return apiGetComContexto(`transportes/mdfe/${id}/documentos/`)
  },

  salvarDocumentosMdfe(id, documentos) {
    return apiPostComContexto(`transportes/mdfe/${id}/documentos/`, {
      documentos,
    })
  },

  listarCtes(params = {}) {
    return apiGetComContexto('transportes/cte/', params)
  },

  buscarCte(id) {
    return apiGetComContexto(`transportes/cte/${id}/`)
  },

  criarCte(data) {
    return apiPostComContexto('transportes/cte/', data)
  },

  atualizarCte(id, data) {
    return apiPatchComContexto(`transportes/cte/${id}/`, data)
  },

  salvarCte(id, data) {
    if (id) {
      return this.atualizarCte(id, data)
    }

    return this.criarCte(data)
  },

  emitirCte(id) {
    return apiPostComContexto(`transportes/cte/${id}/emitir/`)
  },

  calcularImpostosCte(id, cfop) {
    return apiGetComContexto(`transportes/cte/${id}/calcular-impostos/`, {
      cfop,
    })
  },

  deletarMdfe(id) {
    return apiDeleteComContexto(`transportes/mdfe/${id}/`)
  },

  deletarCte(id) {
    return apiDeleteComContexto(`transportes/cte/${id}/`)
  },
}
