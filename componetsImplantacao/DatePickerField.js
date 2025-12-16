import React, { useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import styles from '../styles/formStyles'

export default function DatePickerField({ date, setDate }) {
  const [showPicker, setShowPicker] = useState(false)

  const onChange = (event, selectedDate) => {
    setShowPicker(false)
    if (selectedDate) setDate(selectedDate)
  }

  const formatDate = (d) => {
    if (!d) return ''
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
  }

  return (
    <View style={styles.datePickerWrapper}>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowPicker(true)}>
        <Text style={styles.dateButtonText}>
          Data Implantação {formatDate(date)}
        </Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onChange}
          maximumDate={new Date()}
        />
      )}
    </View>
  )
}
