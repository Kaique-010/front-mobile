import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { DrawerContentScrollView } from '@react-navigation/drawer'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as ImagePicker from 'expo-image-picker'
import Icon from 'react-native-vector-icons/Feather'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import MenuCategory from './MenuCategory'
import MenuItem from './MenuItem'
import { getMenuConfig, getIndividualMenuItems } from './menuConfig'

export default function CustomDrawer(props) {
  const [usuario, setUsuario] = useState(null)
  const [expandedCategories, setExpandedCategories] = useState({})
  const [modulos, setModulos] = useState(null)

  useEffect(() => {
    const loadUser = async () => {
      const usuarioData = await AsyncStorage.getItem('usuario')
      if (usuarioData) {
        setUsuario(JSON.parse(usuarioData))
      }
    }
    loadUser()
  }, [])

  useEffect(() => {
    const fetchModulos = async () => {
      const modulosStorage = await AsyncStorage.getItem('modulos')
      console.log('Módulos lidos do AsyncStorage (raw):', modulosStorage)
      if (modulosStorage) {
        const modulosParsed = JSON.parse(modulosStorage)
        console.log('Módulos parseados:', modulosParsed)
        console.log('Tipo dos módulos parseados:', typeof modulosParsed)
        console.log('É array?', Array.isArray(modulosParsed))
        setModulos(modulosParsed)
      }
    }
    fetchModulos()
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

  if (!modulos) return null

  // Na função hasModulo (linha ~77)
  const hasModulo = (nomeModulo) => {
    if (!modulos || !Array.isArray(modulos)) {
      return false;
    }
    
    // Se é um array de objetos (formato atual do backend)
    if (modulos.length > 0 && typeof modulos[0] === 'object') {
      return modulos.some(modulo => 
        modulo.nome === nomeModulo && modulo.ativo === true
      );
    }
    
    // Fallback para array de strings (formato antigo)
    return modulos.includes(nomeModulo);
  };

  const toggleCategory = (categoryKey) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryKey]: !prev[categoryKey],
    }))
  }

  const menuConfig = getMenuConfig(hasModulo)
  const individualItems = getIndividualMenuItems(hasModulo)

  return (
    <DrawerContentScrollView {...props} style={styles.container}>
      {/* Header com avatar */}
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

      {/* Itens individuais */}
      {individualItems.map((item, index) => (
        <MenuItem
          key={index}
          name={item.name}
          route={item.route}
          icon={item.icon}
          navigation={props.navigation}
          styles={styles}
        />
      ))}

      {/* Categorias */}
      {Object.entries(menuConfig).map(([key, categoria]) => {
        if (categoria.items.length === 0) return null

        return (
          <MenuCategory
            key={key}
            categoria={{
              ...categoria,
              expanded: expandedCategories[key] || false,
              setExpanded: () => toggleCategory(key),
            }}
            navigation={props.navigation}
            styles={styles}
          />
        )
      })}

      {/* Botão de logout */}
      <View style={styles.logoutSection}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={async () => {
            await AsyncStorage.removeItem('usuario')
            props.navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            })
          }}>
          <Icon
            name="log-out"
            size={18}
            color="#fff"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333',
  },
  header: {
    padding: 20,
    backgroundColor: '#444',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#555',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
    backgroundColor: '#888',
    borderWidth: 3,
    borderColor: '#fff',
  },
  usuarioName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  menuSection: {
    marginVertical: 5,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  subMenu: {
    backgroundColor: '#222',
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  subMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 40,
  },
  subMenuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subMenuText: {
    color: '#ccc',
    fontSize: 15,
  },
  logoutSection: {
    marginTop: 'auto',
    padding: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#e74c3c',
    borderRadius: 10,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
