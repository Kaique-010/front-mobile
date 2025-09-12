import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/Feather'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'

export default function MenuItem({ name, route, icon, iconType = 'Feather', navigation, styles, condition = true }) {
  if (!condition) return null;

  // Função para renderizar o ícone correto
  const renderIcon = () => {
    const iconProps = {
      name: icon,
      size: 18,
      color: '#fff',
      style: { marginRight: 8 }
    };

    switch (iconType) {
      case 'MaterialCommunityIcons':
        return <MaterialCommunityIcons {...iconProps} />;
      case 'MaterialIcons':
        return <MaterialIcons {...iconProps} />;
      default:
        return <Icon {...iconProps} />;
    }
  };

  return (
    <View style={styles.menuSection}>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate(route)}>
        <View style={styles.menuItemRow}>
          {renderIcon()}
          <Text style={styles.menuItemText}>{name}</Text>
        </View>
      </TouchableOpacity>
    </View>
  )
}