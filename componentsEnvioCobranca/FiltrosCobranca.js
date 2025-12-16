import React from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import styles from '../styles/cobrancasStyles'

export default function filtrosCobranca({
  dataIni,
  setDataIni,
  dataFim,
  setDataFim,
  showDatePicker,
  setShowDatePicker,
  searchText,
  setSearchText,
  filtroStatus,
  setFiltroStatus,
  incluirBoleto,
  setIncluirBoleto,
  buscarCobrancas,
  limparFiltros,
}) {
  const formatarData = (data) => new Date(data).toLocaleDateString('pt-BR')

  const onDateChange = (event, selectedDate) => {
    if (selectedDate) {
      if (showDatePicker.type === 'ini') setDataIni(selectedDate)
      else setDataFim(selectedDate)
    }
    setShowDatePicker({ show: false, type: '' })
  }

  return (
    <View style={styles.filtrosContainer}>
      <View style={styles.dateContainer}>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker({ show: true, type: 'ini' })}>
          <Text style={styles.dateButtonText}>
            Data Inicial: {formatarData(dataIni)}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker({ show: true, type: 'fim' })}>
          <Text style={styles.dateButtonText}>
            Data Final: {formatarData(dataFim)}
          </Text>
        </TouchableOpacity>
      </View>
      {showDatePicker.show && (
        <DateTimePicker
          value={showDatePicker.type === 'ini' ? dataIni : dataFim}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar por cliente ou título..."
        value={searchText}
        onChangeText={setSearchText}
      />
      <View style={styles.filtrosRow}>
        <Text style={styles.filtroLabel}>Status:</Text>
        <View style={styles.statusButtons}>
          {['todos', 'vencidos', 'a_vencer'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusButton,
                filtroStatus === status && styles.statusButtonActive,
              ]}
              onPress={() => setFiltroStatus(status)}>
              <Text
                style={[
                  styles.statusButtonText,
                  filtroStatus === status && styles.statusButtonTextActive,
                ]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.checkboxContainer}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setIncluirBoleto(!incluirBoleto)}>
          <Text style={styles.checkboxText}>
            {incluirBoleto ? '☑️' : '☐'} Incluir Boleto
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.buscarButton} onPress={buscarCobrancas}>
          <Text style={styles.buscarButtonText}>Buscar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.limparButton} onPress={limparFiltros}>
          <Text style={styles.limparButtonText}>Limpar</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
