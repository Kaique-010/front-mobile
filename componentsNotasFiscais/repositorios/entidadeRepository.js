import { apiGetComContexto } from '../../utils/api'

export async function buscarEntidades({ termo }) {
  const q = String(termo || '').trim()
  if (!q) return []
  const data = await apiGetComContexto(
    'notasfiscais/notas-fiscais/entidades-autocomplete/',
    {
      q,
    },
  )
  return Array.isArray(data) ? data : []
}
