import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { apiGetComContexto } from '..//utils/api'

export const getDashboardEstoque = async (dataIni, dataFim) => {
  const response = await apiGetComContexto(`dashboards/estoque/`, {
    data_ini: dataIni,
    data_fim: dataFim,
  })
  return response
}

export const getDashboardVendas = async (dataIni, dataFim) => {
  const response = await apiGetComContexto(`dashboards/vendas/`, {
    data_ini: dataIni,
    data_fim: dataFim,
  })
  return response
}
