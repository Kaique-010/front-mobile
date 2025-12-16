import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { apiGetComContexto } from '../utils/api'
import DRECards from './DRECards'
import DREDemonstrativo from './DREDemonstrativo'
import dreStyles from './DREStyles'

const DashDRE = () => {
  const [startDate, setStartDate] = useState(new Date(2025, 0, 1))
  const [endDate, setEndDate] = useState(new Date(2025, 0, 31))
  const [showStartPicker, setShowStartPicker] = useState(false)
  const [showEndPicker, setShowEndPicker] = useState(false)
  const [dreData, setDreData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [empresaId, setEmpresaId] = useState('')
  const [filialId, setFilialId] = useState('')

  const formatDate = (date) => {
    if (!date || isNaN(date.getTime())) {
      return new Date().toISOString().split('T')[0]
    }
    return date.toISOString().split('T')[0]
  }

  const formatDateDisplay = (date) => {
    if (!date || isNaN(date.getTime())) {
      return 'Data inválida'
    }
    return date.toLocaleDateString('pt-BR')
  }

  useEffect(() => {
    const iniciar = async () => {
      try {
        const empresa = (await AsyncStorage.getItem('empresaId')) || ''
        const filial = (await AsyncStorage.getItem('filialId')) || ''

        setEmpresaId(empresa)
        setFilialId(filial)
        if (empresa && filial) {
          fetchDREData()
        }
      } catch (error) {
        console.log('Erro ao iniciar dados:', error)
      }
    }

    iniciar()
  }, [])

  const fetchDREData = async () => {
    if (!empresaId || !filialId) {
      console.log('⚠️ Empresa ou filial não definidas')
      return
    }

    setLoading(true)
    try {
      // Add authentication debugging
      const token = await AsyncStorage.getItem('access') // ✅ CORRIGIDO
      console.log('🔐 Token exists:', !!token)
      console.log('🔐 Token preview:', token ? token.substring(0, 20) + '...' : 'NO TOKEN')
      
      const params = {
        data_ini: formatDate(startDate),
        data_fim: formatDate(endDate),
      }

      console.log('🔍 Buscando DRE com parâmetros:', params)
      console.log('🏢 Empresa:', empresaId, 'Filial:', filialId)
      console.log('🌐 URL completa que será chamada:', 'dre/dre_gerencial/')
      console.log('📋 Parâmetros completos enviados:', params)
      
      const response = await apiGetComContexto('dre/dre_gerencial/', params) // ✅ DEFINIR ANTES DE USAR
      
      // Add response status debugging
      console.log('📡 Response status:', response?.status || 'No status')
      console.log('📡 Response headers:', response?.headers || 'No headers')
      
      // LOGS DETALHADOS DA RESPOSTA:
      console.log('📊 Resposta da API DRE (RAW):', response)
      console.log('📊 Tipo da resposta:', typeof response)
      console.log('📊 Keys da resposta:', Object.keys(response || {}))
      console.log('📊 Response stringified:', JSON.stringify(response, null, 2))

      // VERIFICAR SE É PAGINADO OU DIRETO:
      if (response && typeof response === 'object') {
        if ('results' in response) {
          console.log('📄 Resposta PAGINADA detectada')
          console.log('📊 Count:', response.count)
          console.log('📊 Results length:', response.results?.length)
          console.log('📊 Results content:', response.results)
        } else {
          console.log('📄 Resposta DIRETA detectada')
          console.log('📊 Campos disponíveis:', Object.keys(response))
        }
      }

      // Verifica se a resposta tem o formato paginado
      if (response && response.results) {
        if (response.results.length > 0) {
          const dadosComPeriodo = {
            ...response.results[0],
            data_ini: formatDate(startDate),
            data_fim: formatDate(endDate)
          }
          setDreData(dadosComPeriodo)
          console.log('📊 Dados processados:', dadosComPeriodo)
        } else {
          console.log('📊 Results vazio:', response.results)
          setDreData(null)
        }
      } else if (
        response &&
        typeof response === 'object' &&
        !Array.isArray(response)
      ) {
        // Resposta direta (não paginada)
        const dadosComPeriodo = {
          ...response,
          data_ini: formatDate(startDate),
          data_fim: formatDate(endDate)
        }
        setDreData(dadosComPeriodo)
        console.log('📊 Dados processados (direto):', dadosComPeriodo)
      } else {
        console.log('📊 Resposta inválida:', response)
        setDreData(null)
      }
    } catch (error) {
      console.error('❌ Erro ao buscar DRE:', error)
      console.error('❌ Detalhes do erro:', error.response?.data)
      Alert.alert('Erro', 'Não foi possível carregar os dados do DRE')
      setDreData(null)
    } finally {
      setLoading(false)
      console.log('📊 Resposta da API DRE:', response)
      console.log('📊 Tipo da resposta:', typeof response)
      console.log('📊 Keys da resposta:', Object.keys(response || {}))

      // Adicione também antes do if (response && response.results)
      if (response) {
        console.log('📊 Response existe:', !!response)
        console.log('📊 Response.results existe:', !!response.results)
        console.log('📊 Response.results length:', response.results?.length)
        console.log('📊 Response completa:', JSON.stringify(response, null, 2))
      }
    }
  }

  // Atualiza dados quando empresa/filial mudarem
  useEffect(() => {
    if (empresaId && filialId) {
      fetchDREData()
    }
  }, [empresaId, filialId])
  // Adicione este log no DashDRE.js
  console.log('🏢 EmpresaId:', empresaId, 'FilialId:', filialId)
  console.log('📅 Datas:', formatDate(startDate), 'até', formatDate(endDate))

  const onStartDateChange = (event, selectedDate) => {
    setShowStartPicker(false)
    if (selectedDate && !isNaN(selectedDate.getTime())) {
      setStartDate(selectedDate)
    }
  }

  const onEndDateChange = (event, selectedDate) => {
    setShowEndPicker(false)
    if (selectedDate && !isNaN(selectedDate.getTime())) {
      setEndDate(selectedDate)
    }
  }

  return (
    <ScrollView style={dreStyles.container}>
      <View style={dreStyles.header}>
        <Text style={dreStyles.title}>DRE - Demonstração do Resultado</Text>

        <View style={dreStyles.dateContainer}>
          <TouchableOpacity
            style={dreStyles.dateButton}
            onPress={() => setShowStartPicker(true)}>
            <Feather name="calendar" size={16} color="#666" />
            <Text style={dreStyles.dateText}>
              {formatDateDisplay(startDate)}
            </Text>
          </TouchableOpacity>

          <Text style={dreStyles.dateLabel}>até</Text>

          <TouchableOpacity
            style={dreStyles.dateButton}
            onPress={() => setShowEndPicker(true)}>
            <Feather name="calendar" size={16} color="#666" />
            <Text style={dreStyles.dateText}>
              {formatDateDisplay(endDate)}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={dreStyles.updateButton}
          onPress={fetchDREData}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Feather name="refresh-cw" size={16} color="#fff" />
              <Text style={dreStyles.updateButtonText}>Atualizar</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={onStartDateChange}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={onEndDateChange}
        />
      )}

      {loading ? (
        <View style={dreStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={dreStyles.loadingText}>Carregando dados...</Text>
        </View>
      ) : dreData && typeof dreData === 'object' ? (
        <>
          <DRECards dados={dreData} />
          <DREDemonstrativo dados={dreData} />
        </>
      ) : (
        <View style={dreStyles.noDataContainer}>
          <Feather name="bar-chart-2" size={48} color="#ccc" />
          <Text style={dreStyles.noDataText}>
            Nenhum dado encontrado para o período selecionado
          </Text>
          <Text style={dreStyles.noDataSubtext}>
            Tente selecionar um período diferente ou verifique se há dados
            cadastrados no sistema
          </Text>
        </View>
      )}
    </ScrollView>
  )
}

export default DashDRE
