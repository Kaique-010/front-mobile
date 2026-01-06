import { useState, useEffect } from 'react'
import {
  listarPontos,
  registrarPonto as registrarPontoService,
  bancoDeHoras as bancoDeHorasService,
  totalPorDia as totalPorDiaService,
} from '../services/servicePonto'
import { handleApiError } from '../../utils/errorHandler'

export function usePonto(colaboradorId) {
  const [pontos, setPontos] = useState([])
  const [loading, setLoading] = useState(false)
  const [bancoDeHoras, setBancoDeHoras] = useState(null)
  const [totalPorDia, setTotalPorDia] = useState(null)

  const carregarPontos = async () => {
    if (!colaboradorId) return

    setLoading(true)
    const hoje = new Date().toISOString().split('T')[0]

    try {
      const [pontosRes, bancoRes, totalRes] = await Promise.all([
        listarPontos(colaboradorId),
        bancoDeHorasService(colaboradorId, hoje),
        totalPorDiaService(colaboradorId, hoje),
      ])

      let listaPontos = []

      // Padrão de tratamento de resposta similar ao PainelOs.js
      if (Array.isArray(pontosRes)) {
        listaPontos = pontosRes
      } else if (pontosRes?.dados && Array.isArray(pontosRes.dados)) {
        listaPontos = pontosRes.dados
      } else if (pontosRes?.results && Array.isArray(pontosRes.results)) {
        listaPontos = pontosRes.results
      } else if (pontosRes && typeof pontosRes === 'object') {
        const possibleArrays = Object.values(pontosRes).filter(Array.isArray)
        if (possibleArrays.length > 0) listaPontos = possibleArrays[0]
      }

      setPontos(listaPontos)
      setBancoDeHoras(bancoRes)
      setTotalPorDia(totalRes)
    } catch (error) {
      handleApiError(error)
    } finally {
      setLoading(false)
    }
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
    bancoDeHoras,
    totalPorDia,
  }
}
