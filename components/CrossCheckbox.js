import React from 'react'
import { Platform, Switch } from 'react-native'

// Try to access core CheckBox if present (Android in some RN versions)
let CoreCheckBox
try {
  // eslint-disable-next-line global-require
  CoreCheckBox = require('react-native').CheckBox
} catch (e) {
  CoreCheckBox = undefined
}

export default function CrossCheckbox({ value, onValueChange, style, disabled, ...rest }) {
  const checked = !!value

  // On iOS, use Switch to avoid Native module null for core CheckBox
  if (Platform.OS === 'ios') {
    return (
      <Switch
        value={checked}
        onValueChange={onValueChange}
        disabled={disabled}
        style={style}
        {...rest}
      />
    )
  }

  // Prefer core CheckBox when available (e.g., Android)
  if (CoreCheckBox) {
    return (
      <CoreCheckBox
        value={checked}
        onValueChange={onValueChange}
        disabled={disabled}
        style={style}
        {...rest}
      />
    )
  }

  // Fallback: Switch on other platforms
  return (
    <Switch
      value={checked}
      onValueChange={onValueChange}
      disabled={disabled}
      style={style}
      {...rest}
    />
  )
}