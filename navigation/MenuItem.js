import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/Feather'

export default function MenuItem({ name, route, icon, navigation, styles, condition = true }) {
  if (!condition) return null;

  return (
    <View style={styles.menuSection}>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate(route)}>
        <View style={styles.menuItemRow}>
          <Icon name={icon} size={18} color="#fff" />
          <Text style={styles.menuItemText}>{name}</Text>
        </View>
      </TouchableOpacity>
    </View>
  )
}