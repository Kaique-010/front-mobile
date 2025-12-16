import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/Feather'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'

const MenuCategory = ({ categoria, navigation, styles }) => {
  const { name, icon, expanded, setExpanded, items } = categoria;
  // Função para renderizar ícone
  const renderIcon = (iconName, iconType = 'Feather', color = '#ccc', size = 16) => {
    if (iconType === 'MaterialCommunityIcons') {
      return <MaterialCommunityIcons name={iconName} size={size} color={color} style={{ marginRight: 8 }} />
    }
    return <Icon name={iconName} size={size} color={color} style={{ marginRight: 8 }} />
  }

  if (items.length === 0) return null

  return (
    <View style={styles.menuSection}>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => setExpanded(!expanded)}>
        <View style={styles.menuItemRow}>
          <Icon name={icon} size={18} color="#fff" />
          <Text style={styles.menuItemText}>{name}</Text>
          <MaterialIcons
            name={expanded ? 'expand-less' : 'expand-more'}
            size={20}
            color="#fff"
            style={{ marginLeft: 'auto' }}
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.subMenu}>
          {items.map((item) => {
            const IconComponent = item.iconType === 'MaterialCommunityIcons' ? MaterialCommunityIcons : Icon;
            return (
              <TouchableOpacity
                key={item.route}
                style={styles.subMenuItem}
                onPress={() => {
                  navigation.navigate(item.route)
                  setExpanded(false)
                }}>
                <View style={styles.subMenuItemRow}>
                  <IconComponent
                    name={item.icon}
                    size={16}
                    color="#ccc"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.subMenuText}>{item.name}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  )
}

export default MenuCategory