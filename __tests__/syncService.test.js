import {
  enqueueOperation,
  processSyncQueue,
  clearQueue,
} from '../componentsOrdemServico/services/syncService'

jest.mock('../componentsOrdemServico/schemas/database', () => {
  const items = []
  const fila = {
    query: () => ({
      sortBy: () => ({ fetch: async () => items.slice() }),
      fetch: async () => items.slice(),
    }),
    create: async (fn) => {
      const raw = {
        acao: '',
        tabelaAlvo: '',
        registroIdLocal: '',
        payloadJson: '',
        tentativas: 0,
        criadoEm: Date.now(),
      }
      const row = {
        update: async (u) => u(raw),
        destroyPermanently: async () => {
          const i = items.indexOf(row)
          if (i >= 0) items.splice(i, 1)
        },
        get payload() {
          try {
            return JSON.parse(raw.payloadJson)
          } catch {
            return null
          }
        },
        get acao() {
          return raw.acao
        },
        set acao(v) {
          raw.acao = v
        },
        get tabelaAlvo() {
          return raw.tabelaAlvo
        },
        set tabelaAlvo(v) {
          raw.tabelaAlvo = v
        },
        get registroIdLocal() {
          return raw.registroIdLocal
        },
        set registroIdLocal(v) {
          raw.registroIdLocal = v
        },
        get payloadJson() {
          return raw.payloadJson
        },
        set payloadJson(v) {
          raw.payloadJson = v
        },
        get tentativas() {
          return raw.tentativas
        },
        set tentativas(v) {
          raw.tentativas = v
        },
        get criadoEm() {
          return raw.criadoEm
        },
        set criadoEm(v) {
          raw.criadoEm = v
        },
      }
      fn(row)
      items.push(row)
    },
  }
  return {
    collections: {
      get: (name) =>
        name === 'fila_sincronizacao'
          ? fila
          : { find: async () => ({ update: async () => {} }) },
    },
    write: async (fn) => fn(),
  }
})

jest.mock('../utils/api', () => ({
  BASE_URL: 'http://localhost:8000',
  request: jest.fn(async () => ({
    data: {
      local_os_id: 'local1',
      remote_os_id: '1012',
      pecas_ids: [],
      servicos_ids: [],
      horas_ids: [],
    },
  })),
}))

global.fetch = jest.fn(async () => ({ ok: true }))

describe('syncService', () => {
  beforeEach(async () => {
    await clearQueue()
  })

  it('enqueueOperation deve criar item na fila', async () => {
    await enqueueOperation('Os/ordens/', 'post', { a: 1 }, 'local1')
    await processSyncQueue()
    expect(require('../utils/api').request).toHaveBeenCalled()
  })
})
