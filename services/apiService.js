import axios from 'axios'
import { getStoredData } from '../services/storageService'

export const fetchDashboardData = async () => {
  const stored = await getStoredData()

  const params = {
    empresa_id: stored?.empresaId || null,
    filial_id: stored?.filialId || null,
    usuario_id: stored?.user?.usuario_id || null,
  }

  const response = await axios.get('http://192.168.20.50:8000/api/dashboard/', {
    params,
  })
  return response.data
}
