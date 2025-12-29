// repositories/entidadeRepository.ts
import { isOnline } from '../services/conectividadeService'
import { apiGetComContexto } from '../utils/api'
import database from '../componentsOrdemServico/schemas/database'
import { Q } from '@nozbe/watermelondb'

export async function buscarEntidades({ termo, tipo, empresaId }) {
  if (isOnline()) {
    try {
      const data = await apiGetComContexto('entidades/entidades/', {
        search: termo,
        empresa: empresaId,
      })
      if (data && data.results) {
        // Persiste em background para não travar a UI
        persistirLocal(data.results, empresaId).catch((err) =>
          console.error('Erro ao persistir entidades:', err)
        )
        return data.results
      }
    } catch (error) {
      console.error('Erro ao buscar online, tentando local:', error)
    }
  }

  return buscarLocal(termo, tipo, empresaId)
}

async function persistirLocal(entidades, empresaIdDefault) {
  if (!entidades || entidades.length === 0) return

  const collection = database.collections.get('entidades')
  const batchOperations = []

  // Prepara operações em lote
  await database.write(async () => {
    for (const entidade of entidades) {
      // Garante que temos o ID da empresa
      const empId = entidade.enti_empr || empresaIdDefault

      if (!empId) continue // Pula se não tiver empresa vinculada

      // Verifica se já existe pelo código do cliente e empresa
      const existingRecords = await collection
        .query(
          Q.where('enti_clie', entidade.enti_clie),
          Q.where('enti_empr', empId)
        )
        .fetch()

      if (existingRecords.length > 0) {
        // Atualiza existente
        const record = existingRecords[0]
        batchOperations.push(
          record.prepareUpdate((r) => {
            r.entiNome = entidade.enti_nome
            r.entiCpf = entidade.enti_cpf
            r.entiCnpj = entidade.enti_cnpj
            r.entiCida = entidade.enti_cida
            r.entiTipoEnti = entidade.enti_tipo_enti
          })
        )
      } else {
        // Cria novo
        batchOperations.push(
          collection.prepareCreate((r) => {
            r.entiClie = entidade.enti_clie
            r.entiEmpr = empId
            r.entiNome = entidade.enti_nome
            r.entiCpf = entidade.enti_cpf
            r.entiCnpj = entidade.enti_cnpj
            r.entiCida = entidade.enti_cida
            r.entiTipoEnti = entidade.enti_tipo_enti
          })
        )
      }
    }

    if (batchOperations.length > 0) {
      await database.batch(...batchOperations)
      console.log(
        `📦 [ENTIDADES] ${batchOperations.length} registros persistidos localmente`
      )
    }
  })
}

async function buscarLocal(termo, tipo, empresaId) {
  try {
    const collection = database.collections.get('entidades')
    const conditions = []

    if (empresaId) {
      conditions.push(Q.where('enti_empr', empresaId))
    }

    if (termo) {
      // Busca case-insensitive e parcial no nome
      conditions.push(
        Q.where('enti_nome', Q.like(`%${Q.sanitizeLikeString(termo)}%`))
      )
    }

    if (tipo) {
      conditions.push(Q.where('enti_tipo_enti', tipo))
    }

    const query = collection.query(...conditions)
    const results = await query.fetch()

    console.log(
      `📴 [ENTIDADES] Busca local retornou ${results.length} registros`
    )

    // Mapeia de volta para o formato da API (snake_case)
    return results.map((r) => ({
      enti_clie: r.entiClie,
      enti_nome: r.entiNome,
      enti_empr: r.entiEmpr,
      enti_cpf: r.entiCpf,
      enti_cnpj: r.entiCnpj,
      enti_cida: r.entiCida,
      enti_tipo_enti: r.entiTipoEnti,
    }))
  } catch (error) {
    console.error('Erro ao buscar entidades localmente:', error)
    return []
  }
}
