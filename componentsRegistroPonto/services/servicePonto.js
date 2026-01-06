import { apiGetComContexto, apiPostComContexto } from '../../utils/api'

export const listarPontos = async (colaboradorId) => {
  const response = await apiGetComContexto(
    `controledePonto/pontos/?colaborador_id=${colaboradorId}`
  )
  return response
}

export const registrarPonto = async (dados) => {
  return await apiPostComContexto('controledePonto/pontos/', dados)
}

export const bancoDeHoras = async (colaboradorId, data) => {
  const response = await apiGetComContexto(
    `controledePonto/pontos/banco-de-horas/?colaborador_id=${colaboradorId}&data=${data}`
  )
  return response
}

export const totalPorDia = async (colaboradorId, data) => {
  const res = await apiGetComContexto(
    `controledePonto/pontos/total-por-dia/?colaborador_id=${colaboradorId}&data=${data}`
  )
  return res
}
