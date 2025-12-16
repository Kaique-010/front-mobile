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
import DRECaixaCards from './DRECaixaCards'
import DRECaixaDemonstrativo from './DRECaixaDemonstrativo'
import dreStyles from './DREStyles'

const DashDRECaixa = () => {
  const [startDate, setStartDate] = useState(new Date(2025, 0, 1))
  const [endDate, setEndDate] = useState(new Date(2025, 0, 31))
  const [showStartPicker, setShowStartPicker] = useState(false)
  const [showEndPicker, setShowEndPicker] = useState(false)
  const [dreCaixaData, setDreCaixaData] = useState(null)
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
          fetchDRECaixaData()
        }
      } catch (error) {
        console.log('Erro ao iniciar dados:', error)
      }
    }

    iniciar()
  }, [])

  const fetchDRECaixaData = async () => {
    if (!empresaId || !filialId) {
      console.log('⚠️ Empresa ou filial não definidas')
      return
    }

    setLoading(true)
    try {
      const token = await AsyncStorage.getItem('access')
      console.log('🔐 Token exists:', !!token)

      const params = {
        data_ini: formatDate(startDate),
        data_fim: formatDate(endDate),
      }

      console.log('🔍 Buscando DRE Caixa com parâmetros:', params)
      console.log('🏢 Empresa:', empresaId, 'Filial:', filialId)
      console.log('🌐 URL completa que será chamada:', 'dre/dre-caixa/')

      const response = await apiGetComContexto('dre/dre-caixa/', params)

      console.log('📊 Resposta da API DRE Caixa:', response)
      console.log('📊 Tipo da resposta:', typeof response)
      console.log('📊 Keys da resposta:', Object.keys(response || {}))

      if (response && typeof response === 'object') {
        const dadosComPeriodo = {
          ...response,
          data_ini: formatDate(startDate),
          data_fim: formatDate(endDate),
        }
        setDreCaixaData(dadosComPeriodo)
        console.log('📊 Dados DRE Caixa processados:', dadosComPeriodo)
      } else {
        console.log('📊 Resposta inválida:', response)
        setDreCaixaData(null)
      }
    } catch (error) {
      console.error('❌ Erro ao buscar DRE Caixa:', error)
      console.error('❌ Detalhes do erro:', error.response?.data)
      Alert.alert('Erro', 'Não foi possível carregar os dados do DRE Caixa')
      setDreCaixaData(null)
    } finally {
      setLoading(false)
    }
  }

  // Atualiza dados quando empresa/filial mudarem
  useEffect(() => {
    if (empresaId && filialId) {
      fetchDRECaixaData()
    }
  }, [empresaId, filialId])

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
        <Text style={dreStyles.title}>DRE Caixa </Text>

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
            <Text style={dreStyles.dateText}>{formatDateDisplay(endDate)}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={dreStyles.refreshButton}
            onPress={fetchDRECaixaData}
            disabled={loading}>
            <Feather
              name="refresh-cw"
              size={16}
              color={loading ? '#ccc' : '#007AFF'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {loading && (
        <View style={dreStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={dreStyles.loadingText}>Carregando DRE Caixa...</Text>
        </View>
      )}

      {!loading && dreCaixaData && typeof dreCaixaData === 'object' && (
        <>
          <DRECaixaCards dados={dreCaixaData} />
          <DRECaixaDemonstrativo dados={dreCaixaData} />
        </>
      )}

      {!loading && !dreCaixaData && (
        <View style={dreStyles.emptyContainer}>
          <Feather name="inbox" size={48} color="#ccc" />
          <Text style={dreStyles.emptyText}>
            Nenhum dado encontrado para o período selecionado
          </Text>
        </View>
      )}

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
    </ScrollView>
  )
}

export default DashDRECaixa
