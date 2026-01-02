import uuid from 'react-native-uuid'
import database from '../schemas/database'
import { request, BASE_URL } from '../../utils/api'
import { Q } from '@nozbe/watermelondb'
import NetInfo from '@react-native-community/netinfo'
import { apiGetComContexto, apiGetComContextoSemFili } from '../../utils/api'
import { Toast } from 'react-native-toast-message'
import { handleApiError } from '../../utils/errorHandler'

let syncIntervalId = null
let isSyncing = false

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
  const state = await NetInfo.fetch()
  return !!state.isConnected
}

export const processSyncQueue = async () => {
  if (isSyncing) {
    console.log('[Sync] Sincronização já em andamento. Ignorando chamada.')
    return
  }

  try {
    isSyncing = true
    const online = await isOnline()
    if (!online) return
    const filaCollection = database.collections.get('fila_sincronizacao')
    const itensFila = await filaCollection
      .query(Q.sortBy('criado_em', Q.asc))
      .fetch()
    if (!itensFila.length) return

    console.log(
      `[Sync] Iniciando processamento de ${itensFila.length} itens na fila`
    )

    for (const item of itensFila) {
      try {
        const endpoint = item.tabelaAlvo
        const method = String(item.acao || 'POST').toLowerCase()
        const payload = item.payload

        // Ignorar e limpar itens de "Sanity Check" ou métodos inválidos
        if (method === 'test' || endpoint === 'sanity') {
          console.log(`[Sync] Removendo item de teste/sanity: ${item.id}`)
          await database.write(async () => {
            await item.destroyPermanently()
          })
          continue
        }

        console.log(
          `[Sync] Processando item ${
            item.id
          }: ${method.toUpperCase()} ${endpoint}`
        )

        const resp = await request({ method, endpoint, data: payload })
        const data = resp?.data || resp

        console.log(`[Sync] Sucesso para item ${item.id}`)

        const localId = data?.local_os_id || item.registroIdLocal
        const remoteId = data?.remote_os_id || data?.os_os || data?.id

        if (localId && remoteId) {
          console.log(`[Sync] Mapeando IDs: ${localId} -> ${remoteId}`)
          // Passamos os IDs normalizados para a função de mapeamento
          await mapIdsAndCleanQueue(item, {
            ...data,
            local_os_id: localId,
            remote_os_id: remoteId,
          })
        } else {
          await database.write(async () => {
            await item.destroyPermanently()
          })
        }
      } catch (e) {
        console.error(`[Sync] Erro no item ${item.id}:`, e)

        // Verifica se é erro de estoque negativo
        const errorMsg =
          e.mensagem ||
          e.detail ||
          e.response?.data?.mensagem ||
          e.response?.data?.detail ||
          e.message ||
          JSON.stringify(e) ||
          ''
        if (
          errorMsg &&
          typeof errorMsg === 'string' &&
          (errorMsg.includes('estoque negativo') ||
            errorMsg.includes('negativo para o produto') ||
            errorMsg.includes(
              'duplicate key value violates unique constraint'
            ) ||
            errorMsg.includes('os_pkey'))
        ) {
          console.log(
            `[Sync] Erro fatal detectado (Estoque/Duplicidade). Removendo item ${item.id} da fila.`
          )
          await database.write(async () => {
            await item.destroyPermanently()
          })

          if (Toast && typeof Toast.show === 'function') {
            Toast.show({
              type: 'error',
              text1: 'Erro na Sincronização',
              text2: errorMsg.includes('duplicate')
                ? 'Registro já existe no servidor.'
                : errorMsg,
              visibilityTime: 6000,
            })
          }

          continue
        }

        // Verifica erro de conexão/offline
        const isNetwork =
          e.message === 'Network Error' ||
          e.code === 'ECONNABORTED' ||
          e.code === 'ERR_NETWORK' ||
          e.code === 'ERR_CONNECTION_REFUSED' ||
          e.message?.includes('Network request failed') ||
          (e.isAxiosError && !e.response)

        if (isNetwork) {
          console.log(
            `[Sync] Conexão perdida ao processar item ${item.id}. Pausando fila.`
          )

          break
        }

        handleApiError(e)

        await database.write(async () => {
          await item.update((i) => {
            i.tentativas = (i.tentativas || 0) + 1
          })
        })
      }
    }
  } catch (error) {
    console.error('[Sync] Erro fatal no processo de sincronização:', error)
  } finally {
    isSyncing = false
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

import AsyncStorage from '@react-native-async-storage/async-storage'

export const checkAndSyncMegaData = async () => {
  try {
    const lastSync = await AsyncStorage.getItem('last_mega_sync')
    const now = Date.now()
    const twelveHours = 12 * 60 * 60 * 1000

    // Verificar se o banco está vazio, independente do timestamp
    const countEntidades = await database.collections
      .get('mega_entidades')
      .query()
      .fetchCount()
    const countProdutos = await database.collections
      .get('mega_produtos')
      .query()
      .fetchCount()
    const isDbEmpty = countEntidades === 0 || countProdutos === 0

    if (isDbEmpty) {
      console.log(
        '[MegaCache] Banco local incompleto. Forçando sincronização...'
      )
    }

    if (isDbEmpty || !lastSync || now - Number(lastSync) > twelveHours) {
      console.log(
        '[MegaCache] Cache expirado, inexistente ou banco vazio. Iniciando sincronização...'
      )
      await bootstrapMegaCache()
      await AsyncStorage.setItem('last_mega_sync', String(now))
      console.log('[MegaCache] Sincronização concluída e timestamp atualizado.')
    } else {
      console.log(
        '[MegaCache] Cache válido. Última sincronização:',
        new Date(Number(lastSync)).toLocaleString()
      )
    }
  } catch (error) {
    console.error('[MegaCache] Erro ao verificar/sincronizar cache:', error)
    handleApiError(error)
  }
}

export const bootstrapMegaCache = async () => {
  try {
    // Fallback para endpoint padrão se o mega falhar ou for removido
    const entidades = await apiGetComContexto('entidades/entidades/', {
      limit: 500,
    })
    const entResults = entidades?.results || entidades || []
    await database.write(async () => {
      const col = database.collections.get('mega_entidades')
      for (const cli of entResults) {
        const clieId = cli.enti_clie || cli.id || cli.pk
        if (!clieId) continue

        const id = `${clieId}-${cli.enti_empr}`
        const existentes = await col
          .query(
            Q.where('enti_clie', String(clieId)),
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
            e.entiClie = String(clieId)
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
  } catch (error) {
    console.error('[MegaCache] Erro ao sincronizar entidades:', error)

    if (Toast && typeof Toast.show === 'function') {
      Toast.show({
        type: 'error',
        text1: 'Erro ao sincronizar entidades',
        text2: error.message,
      })
    }
  }

  try {
    // Usar produtosdetalhados que traz saldo e preços corretos
    const produtos = await apiGetComContextoSemFili(
      'produtos/produtosdetalhados/',
      {
        limit: 500,
      }
    )
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
            row.prodTipo = p.prod_tipo || p.tipo || null
            row.prodUnme = p.prod_unme || p.unme || null
            row.precoVista = Number(p.preco_vista ?? p.prod_preco_vista ?? 0)
            row.precoNormal = Number(p.preco_normal ?? 0)
            row.saldoEstoque = Number(p.saldo ?? p.saldo_estoque ?? 0)
            row.marcaNome = p.marca_nome || null
            row.imagemBase64 = p.imagem_base64 || null
            row.prodNcm = p.ncm || p.prod_ncm || null
          })
          console.log(
            `📦 [MegaCache] API retornou ${prodResults.length} produtos`
          )
        } else {
          await col.create((row) => {
            row._raw.id = id
            row.prodCodi = codigo
            row.prodEmpr = empr
            row.prodNome = p.nome || p.prod_nome
            row.prodTipo = p.prod_tipo || p.tipo || null
            row.prodUnme = p.prod_unme || p.unme || null
            row.precoVista = Number(p.preco_vista ?? p.prod_preco_vista ?? 0)
            row.precoNormal = Number(p.preco_normal ?? 0)
            row.saldoEstoque = Number(p.saldo ?? p.saldo_estoque ?? 0)
            row.marcaNome = p.marca_nome || null
            row.imagemBase64 = p.imagem_base64 || null
            row.prodNcm = p.ncm || p.prod_ncm || null
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
  const pecasComLocalId = pecas.map((p) => ({
    ...p,
    peca_item: uuid.v4(),
    peca_os: 0,
  }))
  const servicosComLocalId = servicos.map((s) => ({
    ...s,
    serv_item: uuid.v4(),
    serv_os: 0,
  }))
  const horasComLocalId = horas.map((h) => ({
    ...h,
    os_hora_item: uuid.v4(),
    os_hora_os: 0,
  }))
  const payloadCompleto = {
    ...dadosOs,
    os_os: osIdLocal,
    os_auto: osIdLocal,
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

  return osIdLocal
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

    // Buscar itens pendentes uma vez para processar substituições
    const filaCollection = database.collections.get('fila_sincronizacao')
    const itensPendentes = await filaCollection.query().fetch()

    const updateItemIds = async (collectionName, idMappings, idFieldName) => {
      const collection = database.collections.get(collectionName)
      for (const mapping of idMappings) {
        try {
          // Atualizar BD local
          const itemLocal = await collection.find(mapping.local_id)
          await itemLocal.update((item) => {
            item[idFieldName] = mapping.remote_id
          })

          // Atualizar IDs dos itens na fila
          for (const itemPendente of itensPendentes) {
            if (itemPendente.id === itemFila.id) continue

            let payloadStr = itemPendente.payloadJson
            if (payloadStr && payloadStr.includes(mapping.local_id)) {
              console.log(
                `[Sync] Atualizando Item ID ${mapping.local_id} -> ${mapping.remote_id} na fila ${itemPendente.id}`
              )
              const novoPayload = payloadStr
                .split(mapping.local_id)
                .join(mapping.remote_id)
              await itemPendente.update((i) => {
                i.payloadJson = novoPayload
              })
            }
          }
        } catch (e) {
          console.log(`[Sync] Erro ao atualizar item ${mapping.local_id}:`, e)
        }
      }
    }

    await updateItemIds('pecas_os', pecas_ids, 'pecaItem')
    await updateItemIds('servicos_os', servicos_ids, 'servItem')
    await updateItemIds('os_hora', horas_ids, 'osHoraItem')

    // 4. Atualizar itens pendentes na fila que referenciam o ID da OS local
    if (local_os_id && remote_os_id) {
      for (const itemPendente of itensPendentes) {
        if (itemPendente.id === itemFila.id) continue // Pula o próprio item

        let payloadStr = itemPendente.payloadJson
        if (payloadStr && payloadStr.includes(local_os_id)) {
          console.log(
            `[Sync] Atualizando dependência no item ${itemPendente.id}: ${local_os_id} -> ${remote_os_id}`
          )
          // Substituição segura: replaceAll
          const novoPayload = payloadStr.split(local_os_id).join(remote_os_id)
          await itemPendente.update((i) => {
            i.payloadJson = novoPayload
          })
        }
      }
    }

    await itemFila.destroyPermanently()
  })
}
