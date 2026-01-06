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
