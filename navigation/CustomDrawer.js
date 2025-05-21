import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native'
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as ImagePicker from 'expo-image-picker'

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

  const escolherImagem = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert(
        'Permissão negada',
        'Permita acesso à galeria para mudar o avatar.'
      )
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: false,
    })

    if (!result.canceled) {
      const novoUsuario = { ...usuario, avatar: result.assets[0].uri }
      setUsuario(novoUsuario)
      await AsyncStorage.setItem('usuario', JSON.stringify(novoUsuario))
    }
  }

  const gerarAvatarUrl = (username) => {
    if (!username) return 'https://i.pravatar.cc/120?u=fake@pravatar.com'
    return `https://ui-avatars.com/api/?name=${username}&background=random&color=fff&size=120`
  }

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.header}>
        <TouchableOpacity onPress={escolherImagem}>
          <Image
            source={{
              uri: usuario?.avatar || gerarAvatarUrl(usuario?.username),
            }}
            style={styles.avatar}
          />
        </TouchableOpacity>
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
    backgroundColor: '#888',
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
