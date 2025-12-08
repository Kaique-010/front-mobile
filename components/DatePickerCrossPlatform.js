import React, { useState } from 'react'
import { Platform, TouchableOpacity, Text, TextInput, View } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'

const DatePickerCrossPlatform = ({ 
  value, 
  onChange, 
  style, 
  textStyle, 
  disabled = false,
  placeholder = "Selecione uma data"
}) => {
  const [showPicker, setShowPicker] = useState(false)

  const formatDate = (date) => {
    if (!date) return ''
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) return ''
    return dateObj.toLocaleDateString('pt-BR')
  }

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowPicker(false)
    }
    
    if (selectedDate && selectedDate instanceof Date && !isNaN(selectedDate.getTime()) && onChange) {
      onChange(selectedDate)
    }
  }

  // Para web, usar input HTML nativo
  if (Platform.OS === 'web') {
    return (
      <TextInput
        style={[{
          backgroundColor: '#fff',
          padding: 15,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#ddd',
          color: '#333',
        }, style]}
        value={value ? (() => {
          const dateObj = new Date(value)
          return !isNaN(dateObj.getTime()) ? dateObj.toISOString().split('T')[0] : ''
        })() : ''}
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
        {...(Platform.OS === 'web' && { type: 'date' })}
      />
    )
  }

  // Para mobile (iOS/Android)
  return (
    <View>
      <TouchableOpacity
        onPress={() => !disabled && setShowPicker(true)}
        style={[{
          backgroundColor: '#fff',
          padding: 15,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#ddd',
        }, style]}
        disabled={disabled}
      >
        <Text style={[{ color: '#333' }, textStyle]}>
          {value ? formatDate(value) : placeholder}
        </Text>
      </TouchableOpacity>
      
      {showPicker && (
        <DateTimePicker
          value={(() => {
            if (value) {
              const dateObj = new Date(value)
              return !isNaN(dateObj.getTime()) ? dateObj : new Date()
            }
            return new Date()
          })()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          onTouchCancel={() => setShowPicker(false)}
        />
      )}
    </View>
  )
}

export default DatePickerCrossPlatform
