import uuid from 'react-native-uuid'
import database from '../schemas/database'
import { request, BASE_URL } from '../../utils/api'
import { Q } from '@nozbe/watermelondb'
import NetInfo from '@react-native-community/netinfo'
import { apiGetComContexto, apiGetComContextoSemFili } from '../../utils/api'

let syncIntervalId = null

export const enqueueOperation = async (
  endpointSemApi,
  method,
  payload,
  registroIdLocal = null
) => {
  await database.write(async () => {
    const filaCollection = database.collections.get('fila_sincronizacao')
    await filaCollection.create((fila) => {
      fila.acao = method.toUpperCase()
      fila.tabelaAlvo = endpointSemApi
      fila.registroIdLocal = registroIdLocal || ''
      fila.payloadJson = JSON.stringify(payload)
      fila.tentativas = 0
      fila.criadoEm = Date.now()
    })
  })
}

const isOnline = async () => {
  try {
    const res = await fetch(`${BASE_URL}/`, { method: 'HEAD' })
    return res && (res.ok || res.status < 500)
  } catch {
    return false
  }
}

export const processSyncQueue = async () => {
  const online = await isOnline()
  if (!online) return
  const filaCollection = database.collections.get('fila_sincronizacao')
  const itensFila = await filaCollection.query().sortBy('criado_em').fetch()
  if (!itensFila.length) return
  for (const item of itensFila) {
    try {
      const endpoint = item.tabelaAlvo
      const method = String(item.acao || 'POST').toLowerCase()
      const payload = item.payload
      const resp = await request({ method, endpoint, data: payload })
      const data = resp?.data || resp
      if (data?.local_os_id && data?.remote_os_id) {
        await mapIdsAndCleanQueue(item, data)
      } else {
        await database.write(async () => {
          await item.destroyPermanently()
        })
      }
    } catch (e) {
      await item.update((i) => {
        i.tentativas = (i.tentativas || 0) + 1
      })
    }
  }
}

export const startSyncLoop = (intervalMs = 5000) => {
  if (syncIntervalId) return syncIntervalId
  syncIntervalId = setInterval(() => {
    processSyncQueue()
  }, intervalMs)
  return syncIntervalId
}

export const stopSyncLoop = () => {
  if (syncIntervalId) {
    clearInterval(syncIntervalId)
    syncIntervalId = null
  }
}

export const startNetInfoBridge = () => {
  NetInfo.addEventListener((state) => {
    if (state.isConnected) {
      processSyncQueue()
    }
  })
}

export const clearQueue = async () => {
  await database.write(async () => {
    const filaCollection = database.collections.get('fila_sincronizacao')
    const itens = await filaCollection.query().fetch()
    for (const it of itens) await it.destroyPermanently()
  })
}

export const bootstrapMegaCache = async () => {
  try {
    const entidades = await apiGetComContexto('Os/entidades/mega/', {
      limit: 500,
    })
    const entResults = entidades?.results || entidades || []
    await database.write(async () => {
      const col = database.collections.get('mega_entidades')
      for (const cli of entResults) {
        const id = `${cli.enti_clie}-${cli.enti_empr}`
        const existentes = await col
          .query(
            Q.where('enti_clie', String(cli.enti_clie)),
            Q.where('enti_empr', String(cli.enti_empr))
          )
          .fetch()
        if (existentes.length) {
          await existentes[0].update((e) => {
            e.entiNome = cli.enti_nome
            e.entiTipoEnti = cli.enti_tipo_enti
            e.entiCpf = cli.enti_cpf || null
            e.entiCnpj = cli.enti_cnpj || null
            e.entiCida = cli.enti_cida || null
          })
        } else {
          await col.create((e) => {
            e._raw.id = id
            e.entiClie = String(cli.enti_clie)
            e.entiEmpr = String(cli.enti_empr)
            e.entiNome = cli.enti_nome
            e.entiTipoEnti = cli.enti_tipo_enti
            e.entiCpf = cli.enti_cpf || null
            e.entiCnpj = cli.enti_cnpj || null
            e.entiCida = cli.enti_cida || null
          })
        }
      }
    })
  } catch {}

  try {
    const produtos = await apiGetComContextoSemFili('Os/produtos/mega/', {
      limit: 500,
    })
    const prodResults = produtos?.results || produtos || []
    await database.write(async () => {
      const col = database.collections.get('mega_produtos')
      for (const p of prodResults) {
        const codigo = String(p.codigo || p.prod_codi)
        const empr = String(p.prod_empr || p.empr || '1')
        const id = `${codigo}-${empr}`
        const existentes = await col
          .query(Q.where('prod_codi', codigo), Q.where('prod_empr', empr))
          .fetch()
        if (existentes.length) {
          await existentes[0].update((row) => {
            row.prodNome = p.nome || p.prod_nome
            row.precoVista = Number(p.preco_vista ?? p.prod_preco_vista ?? 0)
            row.saldo = Number(p.saldo ?? 0)
            row.marcaNome = p.marca_nome || null
            row.imagemBase64 = p.imagem_base64 || null
          })
        } else {
          await col.create((row) => {
            row._raw.id = id
            row.prodCodi = codigo
            row.prodEmpr = empr
            row.prodNome = p.nome || p.prod_nome
            row.precoVista = Number(p.preco_vista ?? p.prod_preco_vista ?? 0)
            row.saldo = Number(p.saldo ?? 0)
            row.marcaNome = p.marca_nome || null
            row.imagemBase64 = p.imagem_base64 || null
          })
        }
      }
    })
  } catch {}
}

export async function enqueueNewOs(
  dadosOs,
  pecas = [],
  servicos = [],
  horas = []
) {
  const osIdLocal = uuid.v4()
  const pecasComLocalId = pecas.map((p) => ({ ...p, peca_item: uuid.v4() }))
  const servicosComLocalId = servicos.map((s) => ({
    ...s,
    serv_item: uuid.v4(),
  }))
  const horasComLocalId = horas.map((h) => ({ ...h, os_hora_item: uuid.v4() }))
  const payloadCompleto = {
    os_os: osIdLocal,
    ...dadosOs,
    pecas: pecasComLocalId,
    servicos: servicosComLocalId,
    horas: horasComLocalId,
  }

  await database.write(async () => {
    const osCollection = database.collections.get('os_servico')
    const pecasCollection = database.collections.get('pecas_os')
    const servicosCollection = database.collections.get('servicos_os')
    const horasCollection = database.collections.get('os_hora')
    const filaCollection = database.collections.get('fila_sincronizacao')

    await osCollection.create((os) => {
      os._raw.id = osIdLocal
      os.osEmpr = dadosOs.os_empr
      os.osFili = dadosOs.os_fili
      os.osOs = osIdLocal
      os.osClie = dadosOs.os_clie || null
      os.osAssiClie = dadosOs.os_assi_clie || ''
      os.osAssiOper = dadosOs.os_assi_oper || ''
    })

    for (const pecaData of pecasComLocalId) {
      await pecasCollection.create((peca) => {
        peca._raw.id = pecaData.peca_item
        peca.pecaEmpr = dadosOs.os_empr
        peca.pecaFili = dadosOs.os_fili
        peca.pecaOs = osIdLocal
        peca.pecaProd = String(pecaData.peca_prod)
        peca.pecaQuan = Number(pecaData.peca_quan)
        peca.pecaUnit = Number(pecaData.peca_unit)
        peca.pecaTota = Number(pecaData.peca_quan) * Number(pecaData.peca_unit)
      })
    }

    for (const servData of servicosComLocalId) {
      await servicosCollection.create((serv) => {
        serv._raw.id = servData.serv_item
        serv.servEmpr = dadosOs.os_empr
        serv.servFili = dadosOs.os_fili
        serv.servOs = osIdLocal
        serv.servProd = String(servData.serv_prod)
        serv.servQuan = Number(servData.serv_quan)
        serv.servUnit = Number(servData.serv_unit)
        serv.servTota = Number(servData.serv_quan) * Number(servData.serv_unit)
      })
    }

    for (const horaData of horasComLocalId) {
      await horasCollection.create((oh) => {
        oh._raw.id = horaData.os_hora_item
        oh.osHoraEmpr = dadosOs.os_empr
        oh.osHoraFili = dadosOs.os_fili
        oh.osHoraOs = osIdLocal
        oh.osHoraData = horaData.os_hora_data || Date.now()
      })
    }

    await filaCollection.create((fila) => {
      fila.acao = 'POST'
      fila.tabelaAlvo = 'Os/ordens/'
      fila.registroIdLocal = osIdLocal
      fila.payloadJson = JSON.stringify(payloadCompleto)
      fila.tentativas = 0
      fila.criadoEm = Date.now()
    })
  })
}

async function mapIdsAndCleanQueue(itemFila, respostaDjango) {
  const {
    local_os_id,
    remote_os_id,
    pecas_ids = [],
    servicos_ids = [],
    horas_ids = [],
  } = respostaDjango
  await database.write(async () => {
    try {
      const osLocal = await database.collections
        .get('os_servico')
        .find(local_os_id)
      await osLocal.update((os) => {
        os.osOs = remote_os_id
      })
    } catch {}

    const updateItemIds = async (collectionName, idMappings, idFieldName) => {
      const collection = database.collections.get(collectionName)
      for (const mapping of idMappings) {
        try {
          const itemLocal = await collection.find(mapping.local_id)
          await itemLocal.update((item) => {
            item[idFieldName] = mapping.remote_id
          })
        } catch {}
      }
    }

    await updateItemIds('pecas_os', pecas_ids, 'pecaItem')
    await updateItemIds('servicos_os', servicos_ids, 'servItem')
    await updateItemIds('os_hora', horas_ids, 'osHoraItem')

    await itemFila.destroyPermanently()
  })
}
