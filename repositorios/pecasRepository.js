import { isOnline } from '../services/conectividadeService'
import { apiGetComContexto } from '../utils/api'
import database from '../componentsOrdemServico/schemas/database'
import { Q } from '@nozbe/watermelondb'

export async function buscarPecas({ termo, empresaId }) {
  if (isOnline()) {
    try {
      const data = await apiGetComContexto(
        'produtos/produtos/',
        {
          search: termo,
          limit: 20, // Aumentei um pouco o limit
        },
        'prod_'
      )

      // A API pode retornar { results: [...] } ou direto [...] dependendo do endpoint/wrapper
      // No BuscaProdutoInput usava data.results
      const resultados = data.results || data

      if (resultados && Array.isArray(resultados)) {
        persistirLocal(resultados, empresaId).catch((err) =>
          console.error('Erro ao persistir peças:', err)
        )
        return resultados
      }
    } catch (error) {
      console.error('Erro ao buscar peças online, tentando local:', error)
    }
  }

  return buscarLocal(termo, empresaId)
}

async function persistirLocal(produtos, empresaIdDefault) {
  if (!produtos || produtos.length === 0) return

  const collection = database.collections.get('mega_produtos')
  const batchOperations = []

  await database.write(async () => {
    for (const produto of produtos) {
      const empId = produto.prod_empr || empresaIdDefault

      // Filtrar inválidos como feito no componente original
      if (!produto.prod_codi || isNaN(Number(produto.prod_codi))) continue

      // Verifica se já existe
      const existingRecords = await collection
        .query(
          Q.where('prod_codi', produto.prod_codi),
          Q.where('prod_empr', empId)
        )
        .fetch()

      if (existingRecords.length > 0) {
        const record = existingRecords[0]
        batchOperations.push(
          record.prepareUpdate((r) => {
            r.prodNome = produto.prod_nome
            r.precoVista = produto.prod_preco_vista || 0
            r.saldo = produto.prod_saldo || 0
            r.marcaNome = produto.marca_nome || ''
            // r.imagemBase64 = produto.imagem_base64 // Se vier da API
          })
        )
      } else {
        batchOperations.push(
          collection.prepareCreate((r) => {
            r.prodCodi = produto.prod_codi
            r.prodEmpr = empId
            r.prodNome = produto.prod_nome
            r.precoVista = produto.prod_preco_vista || 0
            r.saldo = produto.prod_saldo || 0
            r.marcaNome = produto.marca_nome || ''
          })
        )
      }
    }

    if (batchOperations.length > 0) {
      await database.batch(...batchOperations)
      console.log(
        `📦 [PEÇAS] ${batchOperations.length} registros persistidos localmente`
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

    const resultados = await collection.query(...conditions).fetch()

    // Mapear para o formato esperado pelo componente (campos snake_case da API)
    return resultados.map((r) => ({
      prod_codi: r.prodCodi,
      prod_empr: r.prodEmpr,
      prod_nome: r.prodNome,
      prod_preco_vista: r.precoVista,
      prod_saldo: r.saldo,
      marca_nome: r.marcaNome,
    }))
  } catch (error) {
    console.error('Erro ao buscar peças localmente:', error)
    return []
  }
}
