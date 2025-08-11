import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native'
import { MaterialIcons, Feather } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Picker } from '@react-native-picker/picker'
import { apiGetComContexto } from '../utils/api'
import BuscaVendedorInput from '../components/BuscaVendedorInput'

export default function ControleVisitaFilters({
  filters,
  onApply,
  onClear,
  onClose,
  etapas,
}) {
  const [localFilters, setLocalFilters] = useState(filters)
  const [showDatePicker, setShowDatePicker] = useState({
    field: null,
    show: false,
  })
  const [vendedores, setVendedores] = useState([])

  useEffect(() => {
    carregarVendedores()
  }, [])

  const carregarVendedores = async () => {
    try {
      const response = await apiGetComContexto('entidades/', {
        enti_tipo: 'V', // Vendedores
        limit: 100,
      })
      // Ensure vendedores is always an array
      const vendedoresData = response?.results || response || []
      setVendedores(Array.isArray(vendedoresData) ? vendedoresData : [])
    } catch (error) {
      console.error('Erro ao carregar vendedores:', error)
      setVendedores([]) // Set empty array on error
    }
  }

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker({ field: null, show: false })

    if (selectedDate && showDatePicker.field) {
      const formattedDate = selectedDate.toISOString().split('T')[0]
      setLocalFilters({
        ...localFilters,
        [showDatePicker.field]: formattedDate,
      })
    }
  }

  const showDatePickerModal = (field) => {
    setShowDatePicker({ field, show: true })
  }

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'Selecionar data'
    const date = new Date(dateString + 'T00:00:00')
    return date.toLocaleDateString('pt-BR')
  }

  const handleApply = () => {
    onApply(localFilters)
  }

  const handleClear = () => {
    const clearedFilters = {
      etapa: '',
      vendedor: '',
      data_inicio: '',
      data_fim: '',
      cliente_nome: '',
    }
    setLocalFilters(clearedFilters)
    onClear()
  }

  const handleVendedorSelect = (vendedor) => {
    setLocalFilters({
      ...localFilters,
      vendedor: vendedor?.enti_codigo || '',
    })
  }

  const getSelectedVendedorName = () => {
    if (!Array.isArray(vendedores) || vendedores.length === 0) {
      return ''
    }
    const vendedor = vendedores.find(v => v.enti_codigo === localFilters.vendedor)
    return vendedor?.enti_nome || ''
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Feather name="x" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Filtros</Text>
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Limpar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Filtro por Cliente */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Cliente</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Nome do cliente"
            placeholderTextColor="#666"
            value={localFilters.cliente_nome}
            onChangeText={(text) =>
              setLocalFilters({ ...localFilters, cliente_nome: text })
            }
          />
        </View>

        {/* Filtro por Etapa */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Etapa</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={localFilters.etapa}
              onValueChange={(value) =>
                setLocalFilters({ ...localFilters, etapa: value })
              }
              style={styles.picker}
              dropdownIconColor="#2ecc71">
              <Picker.Item label="Todas as etapas" value="" color="#666" />
              {etapas.map((etapa) => (
                <Picker.Item
                  key={etapa.value}
                  label={etapa.label}
                  value={etapa.value}
                  color="#fff"
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Filtro por Vendedor */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Vendedor</Text>
          <BuscaVendedorInput
            onVendedorSelect={handleVendedorSelect}
            placeholder="Selecionar vendedor"
            initialValue={getSelectedVendedorName()}
            style={styles.vendedorInput}
          />
        </View>

        {/* Filtro por Data de Início */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Data de Início</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => showDatePickerModal('data_inicio')}>
            <Feather name="calendar" size={20} color="#2ecc71" />
            <Text style={styles.dateButtonText}>
              {formatDateForDisplay(localFilters.data_inicio)}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filtro por Data de Fim */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Data de Fim</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => showDatePickerModal('data_fim')}>
            <Feather name="calendar" size={20} color="#2ecc71" />
            <Text style={styles.dateButtonText}>
              {formatDateForDisplay(localFilters.data_fim)}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Resumo dos Filtros Ativos */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Filtros Ativos</Text>
          {Object.entries(localFilters).map(([key, value]) => {
            if (!value) return null

            let displayValue = value
            if (key === 'etapa') {
              const etapa = etapas.find((e) => e.value === value)
              displayValue = etapa?.label || value
            } else if (key === 'vendedor') {
              displayValue = getSelectedVendedorName() || value
            } else if (key.includes('data')) {
              displayValue = formatDateForDisplay(value)
            }

            return (
              <View key={key} style={styles.summaryItem}>
                <Text style={styles.summaryKey}>
                  {key
                    .replace('_', ' ')
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                  :
                </Text>
                <Text style={styles.summaryValue}>{displayValue}</Text>
              </View>
            )
          })}
        </View>
      </ScrollView>

      {/* Botões de Ação */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
          <Text style={styles.applyButtonText}>Aplicar Filtros</Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
      {showDatePicker.show && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1421',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a3441',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#1a252f',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2a3441',
  },
  pickerContainer: {
    backgroundColor: '#1a252f',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a3441',
  },
  picker: {
    color: '#fff',
    backgroundColor: 'transparent',
  },
  vendedorInput: {
    backgroundColor: '#1a252f',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a3441',
  },
  dateButton: {
    backgroundColor: '#1a252f',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a3441',
  },
  dateButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 12,
  },
  summarySection: {
    backgroundColor: '#1a252f',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#2a3441',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2ecc71',
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  summaryKey: {
    fontSize: 14,
    color: '#666',
    minWidth: 100,
  },
  summaryValue: {
    fontSize: 14,
    color: '#fff',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#2a3441',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#2a3441',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#2ecc71',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
})
