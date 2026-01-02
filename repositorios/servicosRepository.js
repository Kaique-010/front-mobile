import { isOnline } from '../services/conectividadeService'
import { apiGetComContexto } from '../utils/api'
import database from '../componentsOrdemServico/schemas/database'
import { Q } from '@nozbe/watermelondb'

export async function buscarServicos({ termo, empresaId }) {
  if (isOnline()) {
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
          Q.where('prod_codi', servico.prod_codi),
          Q.where('prod_empr', empId)
        )
        .fetch()

      if (existingRecords.length > 0) {
        const record = existingRecords[0]
        batchOperations.push(
          record.prepareUpdate((r) => {
            r.prodNome = servico.prod_nome
            r.precoVista = servico.prod_preco_vista || 0
            // Serviços geralmente não tem saldo ou marca, mas mantemos compatibilidade
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

    if (empresaId) {
      conditions.push(Q.where('prod_empr', empresaId))
    }

    if (termo) {
      conditions.push(
        Q.where('prod_nome', Q.like(`%${Q.sanitizeLikeString(termo)}%`))
      )
    }

    conditions.push(
      Q.or(
        Q.where('prod_tipo', 'S'),
        Q.where('prod_tipo', null),
        Q.where('prod_tipo', '')
      )
    )

    const resultados = await collection.query(...conditions).fetch()

    // Tentar pegar saldoEstoque, se não existir tentar saldo (antigo)
    const saldoFinal =
      r.saldoEstoque !== null && r.saldoEstoque !== undefined
        ? r.saldoEstoque
        : r._getRaw('saldo') || 0

    return {
      prod_codi: r.prodCodi,
      prod_empr: r.prodEmpr,
      prod_nome: r.prodNome,
      prod_preco_vista: r.precoVista,
      prod_saldo: saldoFinal,
      marca_nome: r.marcaNome,
    }
  } catch (error) {
    console.error('Erro ao buscar serviços localmente:', error)
    return []
  }
}
