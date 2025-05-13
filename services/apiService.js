import axios from 'axios'
import { getStoredData } from '../services/storageService'
import { BASE_URL, fetchSlugMap } from '../utils/api'

export const fetchDashboardData = async () => {
  // Obtém os dados do storage
  const stored = await getStoredData()
  console.log('Stored data:', stored)

  // Tenta pegar o CNPJ de diferentes fontes no objeto
  const cnpj = stored?.docu || stored?.empr_docu || stored?.empresaDocu

  if (!cnpj) {
    console.error('[ERROR] CNPJ não encontrado no storage')
    return null
  }

  // Busca o slug no mapa usando o CNPJ
  const slugObj = (await fetchSlugMap()).find((item) => item.cnpj === cnpj)
  if (!slugObj) {
    console.error('[ERROR] Slug não encontrado para o CNPJ:', cnpj)
    return null
  }

  const slug = slugObj.slug
  console.log('[DEBUG] SLUG:', slug)
  console.log('[DEBUG] CNPJ:', cnpj)

  // Parâmetros para a requisição
  const params = {
    empresa_id: stored?.empresaId || null,
    filial_id: stored?.filialId || null,
    usuario_id: stored?.user?.usuario_id || null,
  }

  // Faz a requisição à API
  const response = await axios.get(
    `${BASE_URL}/api/${slug}/dashboards/dashboard/`,
    {
      params,
    }
  )
  console.log('[DEBUG] Dashboard response:', response.data)
  return response.data
}
