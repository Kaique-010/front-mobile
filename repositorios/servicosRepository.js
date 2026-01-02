import { isOnlineAsync } from '../services/conectividadeService'
import { apiGetComContexto } from '../utils/api'
import database from '../componentsOrdemServico/schemas/database'
import { Q } from '@nozbe/watermelondb'
import { handleApiError } from '../utils/errorHandler'

export async function buscarServicos({ termo, empresaId }) {
  const online = await isOnlineAsync()

  if (online) {
    try {
      const data = await apiGetComContexto(
        'produtos/produtos/busca/',
        {
          q: termo,
          tipo: 'S',
        },
        'prod_'
      )

      const resultados = data.results || data

      if (resultados && Array.isArray(resultados)) {
        persistirLocal(resultados, empresaId).catch((err) =>
          console.error('Erro ao persistir serviços:', err)
        )
        return resultados
      }
    } catch (error) {
      console.error('Erro ao buscar serviços online, tentando local:', error)
      if (
        error.code === 'ECONNABORTED' ||
        error.message === 'Network Error' ||
        error.message.includes('Network request failed')
      ) {
        console.log('🌐 Falha de conexão detectada. Usando fallback local.')
      }
    }
  }

  return buscarLocal(termo, empresaId)
}

async function persistirLocal(servicos, empresaIdDefault) {
  if (!servicos || servicos.length === 0) return

  const collection = database.collections.get('mega_produtos')
  const batchOperations = []

  await database.write(async () => {
    for (const servico of servicos) {
      const empId = servico.prod_empr || empresaIdDefault

      if (!servico.prod_codi) continue

      const existingRecords = await collection
        .query(
          Q.where('prod_codi', String(servico.prod_codi)),
          Q.where('prod_empr', empId)
        )
        .fetch()

      if (existingRecords.length > 0) {
        const record = existingRecords[0]
        batchOperations.push(
          record.prepareUpdate((r) => {
            r.prodNome = servico.prod_nome
            r.prodTipo = servico.prod_tipo || 'S' // ✅ Garantir que seja 'S'
            r.prodUnme = servico.prod_unme
            r.precoVista = servico.prod_preco_vista || 0
            r.saldoEstoque = servico.prod_saldo || 0
            r.marcaNome = servico.marca_nome || ''
          })
        )
      } else {
        batchOperations.push(
          collection.prepareCreate((r) => {
            r.prodCodi = servico.prod_codi
            r.prodEmpr = empId
            r.prodNome = servico.prod_nome
            r.prodTipo = servico.prod_tipo || 'S' // ✅ Garantir que seja 'S'
            r.prodUnme = servico.prod_unme
            r.precoVista = servico.prod_preco_vista || 0
            r.saldoEstoque = servico.prod_saldo || 0
            r.marcaNome = servico.marca_nome || ''
          })
        )
      }
    }

    if (batchOperations.length > 0) {
      await database.batch(...batchOperations)
      console.log(
        `📦 [SERVIÇOS] ${batchOperations.length} registros persistidos localmente`
      )
    }
  })
}

async function buscarLocal(termo, empresaId) {
  try {
    const collection = database.collections.get('mega_produtos')
    const conditions = []

    // conditions.push(Q.where('prod_tipo', 'S'))

    if (empresaId) {
      conditions.push(Q.where('prod_empr', empresaId))
    }

    if (termo) {
      conditions.push(
        Q.where('prod_nome', Q.like(`%${Q.sanitizeLikeString(termo)}%`))
      )
    }

    const resultados = await collection.query(...conditions).fetch()

    console.log(`💾 [SERVIÇOS LOCAL] Encontrados ${resultados.length} serviços`)

    return resultados.map((r) => {
      const saldoFinal =
        r.saldoEstoque !== null && r.saldoEstoque !== undefined
          ? r.saldoEstoque
          : r._getRaw('saldo') || 0

      return {
        prod_codi: r.prodCodi,
        prod_empr: r.prodEmpr,
        prod_nome: r.prodNome,
        prod_preco_vista: r.precoVista,
        prod_preco_normal: r.precoNormal,
        saldo_estoque: saldoFinal,
        prod_saldo: saldoFinal,
        marca_nome: r.marcaNome,
      }
    })
  } catch (error) {
    console.error('Erro ao buscar serviços localmente:', error)
    // handleApiError(error)
    return []
  }
}
