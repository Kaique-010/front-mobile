import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function CustomDrawer(props) {
  const [usuario, setUsuario] = useState(null)

  useEffect(() => {
    const loadUser = async () => {
      const usuarioData = await AsyncStorage.getItem('usuario')
      if (usuarioData) {
        setUsuario(JSON.parse(usuarioData))
      }
    }
    loadUser()
  }, [])

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.header}>
        <Image
          source={{ uri: usuario?.avatar || 'https://i.pravatar.cc/150?img=1' }}
          style={styles.avatar}
        />
        <Text style={styles.usuarioName}>
          Olá, {usuario?.username || 'Visitante'}
        </Text>
      </View>

      <DrawerItemList {...props} />

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={async () => {
          await AsyncStorage.removeItem('usuario')
          props.navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          })
        }}>
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  )
}

const styles = StyleSheet.create({
  header: {
    padding: 20,
    backgroundColor: '#444',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  usuarioName: {
    color: '#fff',
    fontSize: 18,
  },
  logoutButton: {
    marginTop: 380,
    padding: 15,
    backgroundColor: '#e74c3c',
    alignItems: 'center',
    borderRadius: 10,
    marginHorizontal: 10,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
  },
})
