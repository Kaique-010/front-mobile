import { Alert } from 'react-native'
import React, { useState, useEffect, useMemo } from 'react'
import Toast from 'react-native-toast-message'
import { apiGetComContexto } from '../utils/api'
import styles from '../styles/cobrancasStyles'

// Função utilitária para buscar cobranças
export const buscarCobrancasAPI = async ({
  dataIni,
  dataFim,
  incluirBoleto,
  setLoading,
  setCobrancasOriginais,
  setCobrancas,
  cliente_id,
  cliente_nome,
}) => {
  setLoading(true)
  try {
    const dataIniFormatted = dataIni.toISOString().split('T')[0]
    const dataFimFormatted = dataFim.toISOString().split('T')[0]
    let apiUrl = `enviar-cobranca/enviar-cobranca/?data_ini=${dataIniFormatted}&data_fim=${dataFimFormatted}`

    if (incluirBoleto) {
      apiUrl += `&incluir_boleto=true`
    }
    if (cliente_id) {
      apiUrl += `&cliente_id=${cliente_id}`
    }
    if (cliente_nome) {
      apiUrl += `&cliente_nome=${cliente_nome}`
    }
    const payload = await apiGetComContexto(apiUrl)

    let cobrancasData = []

    if (Array.isArray(payload)) {
      cobrancasData = payload
    } else if (Array.isArray(payload?.results)) {
      cobrancasData = payload.results
    } else if (Array.isArray(payload?.data)) {
      cobrancasData = payload.data
    } else if (Array.isArray(payload?.data?.results)) {
      cobrancasData = payload.data.results
    } else {
      console.log('❌ Formato de dados não reconhecido')
      console.log('🔍 Tentando extrair dados...')
      const arraysEncontradas = Object.values(payload || {}).find(Array.isArray)
      cobrancasData = arraysEncontradas || []
    }

    console.log('📏 Final length:', cobrancasData.length)
    const amostra = cobrancasData.slice(0, 3).map((c) => c.numero_titulo)
    console.log('🧪 Amostra de títulos:', amostra)
    cobrancasData = cobrancasData.map((c) => ({
      ...c,
      id: c.id || c.numero_titulo || `${c.cliente_id}-${c.numero_titulo}`,
    }))
    console.log('🔍 Amostra de IDs:', amostra)
    setCobrancasOriginais(cobrancasData)
    setCobrancas(cobrancasData)
    console.log('🔍 Amostra de IDs:', cobrancasData)

    Toast.show({
      type: 'info',
      text1: 'Busca Concluída',
      visibilityTime: 3000,
    })
  } catch (error) {
    console.error('❌ Erro completo:', error)
    Alert.alert('Erro', 'Falha ao buscar cobranças: ' + error.message)
  } finally {
    setLoading(false)
  }
}

// Hook personalizado para buscar cobranças automaticamente
export const useBuscarCobrancas = ({
  dataIni,
  dataFim,
  incluirBoleto,
  cliente_id,
  cliente_nome,
  setLoading,
  setCobrancasOriginais,
  setCobrancas,
  autoLoad = true,
}) => {
  useEffect(() => {
    if (autoLoad && dataIni && dataFim) {
      buscarCobrancasAPI({
        dataIni,
        dataFim,
        incluirBoleto,
        setLoading,
        cliente_id,
        cliente_nome,
        setCobrancasOriginais,
        setCobrancas,
      })
    }
  }, [dataIni, dataFim, incluirBoleto, autoLoad, cliente_id, cliente_nome])
}

export default buscarCobrancasAPI
