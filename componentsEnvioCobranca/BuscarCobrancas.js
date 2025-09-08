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
}) => {
  setLoading(true)
  try {
    const dataIniFormatted = dataIni.toISOString().split('T')[0]
    const dataFimFormatted = dataFim.toISOString().split('T')[0]
    let apiUrl = `enviar-cobranca/enviar-cobranca/?data_ini=${dataIniFormatted}&data_fim=${dataFimFormatted}`

    if (incluirBoleto) {
      apiUrl += `&incluir_boleto=true`
    }
    const response = await apiGetComContexto(apiUrl)

    let cobrancasData = []

    if (response.data && response.data.results) {
      console.log('✅ Usando response.data.results:', response.data.results)
      cobrancasData = response.data.results
    } else if (Array.isArray(response.data)) {
      console.log('✅ Usando response.data diretamente:', response.data)
      cobrancasData = response.data
    } else if (Array.isArray(response)) {
      console.log('✅ Usando response.direamente:', response)
      cobrancasData = response
    } else {
      console.log('❌ Formato de dados não reconhecido')
      console.log('🔍 Tentando extrair dados...')
      const possibleData =
        response?.data?.data || response?.results || response || []
      console.log('🎯 Dados extraídos:', possibleData)
      cobrancasData = Array.isArray(possibleData) ? possibleData : []
    }

    console.log('🎯 Final cobrancasData:', cobrancasData)
    console.log('📏 Final length:', cobrancasData.length)
    setCobrancasOriginais(cobrancasData)
    setCobrancas(cobrancasData)

    Toast.show({
      type: 'info',
      text1: 'Busca Concluída',
      text2: `${cobrancasData.length} cobrança(s) encontrada(s)`,
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
        setCobrancasOriginais,
        setCobrancas,
      })
    }
  }, [dataIni, dataFim, incluirBoleto, autoLoad])
}

export default buscarCobrancasAPI
