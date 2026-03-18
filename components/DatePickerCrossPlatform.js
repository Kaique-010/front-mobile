import React, { useEffect, useMemo, useState } from 'react'
import {
  Modal,
  Platform,
  TouchableOpacity,
  Text,
  TextInput,
  View,
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'

const DatePickerCrossPlatform = ({
  value,
  onChange,
  style,
  textStyle,
  disabled = false,
  placeholder = 'Selecione uma data',
}) => {
  const [showPicker, setShowPicker] = useState(false)
  const [tempDate, setTempDate] = useState(null)

  const parseDate = (date) => {
    if (!date) return null
    // Se for string YYYY-MM-DD, cria data local (meia-noite) para evitar timezone
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const [y, m, d] = date.split('-').map(Number)
      return new Date(y, m - 1, d)
    }
    const d = new Date(date)
    return isNaN(d.getTime()) ? null : d
  }

  const formatDate = (date) => {
    const dateObj = parseDate(date)
    if (!dateObj) return ''
    return dateObj.toLocaleDateString('pt-BR')
  }

  const parsedValue = useMemo(() => parseDate(value), [value])

  useEffect(() => {
    if (!showPicker) return
    setTempDate(parsedValue || new Date())
  }, [showPicker, parsedValue])

  // Para web, usar input HTML nativo
  if (Platform.OS === 'web') {
    return (
      <TextInput
        style={[
          {
            backgroundColor: '#fff',
            padding: 15,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#ddd',
            color: '#333',
          },
          style,
        ]}
        value={
          value
            ? (() => {
                const dateObj = new Date(value)
                return !isNaN(dateObj.getTime())
                  ? dateObj.toISOString().split('T')[0]
                  : ''
              })()
            : ''
        }
        onChangeText={(dateString) => {
          if (dateString && onChange) {
            const date = new Date(dateString + 'T00:00:00')
            if (!isNaN(date.getTime())) {
              onChange(date)
            }
          }
        }}
        placeholder={placeholder}
        editable={!disabled}
        // Para web, usar o tipo date do HTML
        {...(Platform.OS === 'web' && { type: 'date', lang: 'pt-BR' })}
      />
    )
  }

  // Para mobile (iOS/Android)
  return (
    <View>
      <TouchableOpacity
        onPress={() => !disabled && setShowPicker(true)}
        style={[
          {
            backgroundColor: '#fff',
            padding: 15,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#ddd',
          },
          style,
        ]}
        disabled={disabled}>
        <Text style={[{ color: '#333' }, textStyle]}>
          {value ? formatDate(value) : placeholder}
        </Text>
      </TouchableOpacity>

      {showPicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={parsedValue || new Date()}
          mode="date"
          display="default"
          locale="pt-BR"
          onChange={(event, selectedDate) => {
            if (event?.type === 'dismissed') {
              setShowPicker(false)
              return
            }

            setShowPicker(false)
            if (
              selectedDate &&
              selectedDate instanceof Date &&
              !isNaN(selectedDate.getTime()) &&
              onChange
            ) {
              onChange(selectedDate)
            }
          }}
        />
      )}

      {showPicker && Platform.OS === 'ios' && (
        <Modal
          transparent
          visible={showPicker}
          animationType="fade"
          onRequestClose={() => setShowPicker(false)}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.55)',
              justifyContent: 'flex-end',
            }}>
            <View
              style={{
                backgroundColor: '#111827',
                paddingTop: 12,
                paddingHorizontal: 12,
                paddingBottom: 14,
                borderTopLeftRadius: 14,
                borderTopRightRadius: 14,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                }}>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Text style={{ color: '#E5E7EB', fontWeight: '600' }}>
                    Cancelar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    const d = tempDate || parsedValue || new Date()
                    setShowPicker(false)
                    if (onChange) onChange(d)
                  }}>
                  <Text style={{ color: '#93C5FD', fontWeight: '700' }}>
                    OK
                  </Text>
                </TouchableOpacity>
              </View>

              <DateTimePicker
                value={tempDate || parsedValue || new Date()}
                mode="date"
                display="spinner"
                locale="pt-BR"
                themeVariant="dark"
                onChange={(event, selectedDate) => {
                  if (
                    selectedDate &&
                    selectedDate instanceof Date &&
                    !isNaN(selectedDate.getTime())
                  ) {
                    setTempDate(selectedDate)
                  }
                }}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  )
}

export default DatePickerCrossPlatform
