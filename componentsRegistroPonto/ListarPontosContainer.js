import React from 'react'
import { usePonto } from './hooks/usePonto'
import { handleApiError } from '../utils/errorHandler'
import ListarPontosView from './listarPontos'

export default function ListarPontosContainer({ entidade }) {
  const idFinal = entidade?.enti_clie ?? usuarioId

  if (!idFinal) {
    handleApiError('ID do colaborador é obrigatório.')
    return null
  }

  const { pontos, loading } = usePonto(idFinal)

  return <ListarPontosView pontos={pontos} loading={loading} />
}
