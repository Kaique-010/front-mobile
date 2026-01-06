import { useState, useEffect } from 'react'
import {
  listarPontos,
  registrarPonto as registrarPontoService,
} from '../services/servicePonto'
import { handleApiError } from '../../utils/errorHandler'

export function usePonto(colaboradorId) {
  const [pontos, setPontos] = useState([])
  const [loading, setLoading] = useState(false)

  const carregarPontos = () => {
    if (!colaboradorId) return

    setLoading(true)
    listarPontos(colaboradorId)
      .then((response) => {
        let listaPontos = []

        // Padrão de tratamento de resposta similar ao PainelOs.js
        if (Array.isArray(response)) {
          listaPontos = response
        } else if (response?.dados && Array.isArray(response.dados)) {
          listaPontos = response.dados
        } else if (response?.results && Array.isArray(response.results)) {
          listaPontos = response.results
        } else if (response && typeof response === 'object') {
          const possibleArrays = Object.values(response).filter(Array.isArray)
          if (possibleArrays.length > 0) listaPontos = possibleArrays[0]
        }

        setPontos(listaPontos)
        setLoading(false)
      })
      .catch((error) => {
        handleApiError(error)
        setLoading(false)
      })
  }

  const registrarPonto = (dados) => {
    setLoading(true)
    registrarPontoService(dados)
      .then((response) => {
        carregarPontos()
        setLoading(false)
      })
      .catch((error) => {
        handleApiError(error)
        setLoading(false)
      })
  }

  useEffect(() => {
    carregarPontos()
  }, [colaboradorId])

  return {
    pontos,
    loading,
    carregarPontos,
    registrarPonto,
  }
}
