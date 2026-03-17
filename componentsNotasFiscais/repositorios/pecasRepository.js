import { apiGetComContexto } from '../../utils/api'

export async function buscarPecas({ termo }) {
  const q = String(termo || '').trim()
  if (!q) return []
  const data = await apiGetComContexto(
    'notasfiscais/notas-fiscais/produtos-autocomplete/',
    {
      q,
    },
  )
  return Array.isArray(data) ? data : []
}

export async function buscarProdutoDetalhe({ codigo, destinatario }) {
  const cod = String(codigo || '').trim()
  if (!cod) return null
  const params = {}
  if (destinatario != null && String(destinatario).trim()) {
    params.destinatario = destinatario
  }
  return apiGetComContexto(
    'notasfiscais/notas-fiscais/produto-detalhe/' + cod + '/',
    params,
  )
}

export async function buscarCfopAutocomplete({ termo }) {
  const q = String(termo || '').trim()
  if (!q) return []
  const data = await apiGetComContexto(
    'notasfiscais/notas-fiscais/cfop-autocomplete/',
    {
      q,
    },
  )
  return Array.isArray(data) ? data : []
}

export async function buscarTransportadoras({ termo }) {
  const q = String(termo || '').trim()
  if (!q) return []
  const data = await apiGetComContexto(
    'notasfiscais/notas-fiscais/transportadoras-autocomplete/',
    { q },
  )
  return Array.isArray(data) ? data : []
}
