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
import Icon from 'react-native-vector-icons/Feather'

export default function CustomDrawer(props) {
  const [usuario, setUsuario] = useState(null)
  const [financeiroExpanded, setFinanceiroExpanded] = useState(false)
  const [dashboardsExpanded, setDashboardsExpanded] = useState(false)
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
      if (modulosStorage) {
        setModulos(JSON.parse(modulosStorage))
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

  const hasModulo = (mod) => modulos.includes(mod)

  const dashboards = [
    {
      name: 'Dashboard Financeiro',
      route: 'DashboardFinanceiro',
      icon: 'dollar-sign',
      condition: hasModulo('financeiro')
    },
    { 
      name: 'Dashboard Geral', 
      route: 'Dashboard', 
      icon: 'bar-chart-2',
      condition: hasModulo('dash')
    },
    {
      name: 'Dashboard Realizado',
      route: 'DashRealizado',
      icon: 'trending-up',
      condition: hasModulo('financeiro')
    },
  ].filter(d => d.condition)

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

      {/* Menu items padrão do drawer */}
      <View style={styles.menuSection}>
        <DrawerItemList {...props} />
      </View>

      {/* Submenu Dashboards */}
      {dashboards.length > 0 && (
        <View style={styles.menuSection}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setDashboardsExpanded(!dashboardsExpanded)}>
            <View style={styles.menuItemRow}>
              <Icon name="bar-chart" size={18} color="#fff" />
              <Text style={styles.menuItemText}>Dashboards</Text>
              <Icon
                name={dashboardsExpanded ? 'chevron-up' : 'chevron-down'}
                size={18}
                color="#fff"
                style={{ marginLeft: 'auto' }}
              />
            </View>
          </TouchableOpacity>

          {dashboardsExpanded && (
            <View style={styles.subMenu}>
              {dashboards.map((dashboard) => (
                <TouchableOpacity
                  key={dashboard.route}
                  style={styles.subMenuItem}
                  onPress={() => {
                    props.navigation.navigate(dashboard.route)
                    setDashboardsExpanded(false)
                  }}>
                  <View style={styles.subMenuItemRow}>
                    <Icon
                      name={dashboard.icon}
                      size={16}
                      color="#ccc"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.subMenuText}>{dashboard.name}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Submenu Financeiro */}
      {hasModulo('financeiro') && (
        <View style={styles.menuSection}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setFinanceiroExpanded(!financeiroExpanded)}>
            <View style={styles.menuItemRow}>
              <Icon name="dollar-sign" size={18} color="#fff" />
              <Text style={styles.menuItemText}>Financeiro</Text>
              <Icon
                name={financeiroExpanded ? 'chevron-up' : 'chevron-down'}
                size={18}
                color="#fff"
                style={{ marginLeft: 'auto' }}
              />
            </View>
          </TouchableOpacity>

          {financeiroExpanded && (
            <View style={styles.subMenu}>
              <TouchableOpacity
                style={styles.subMenuItem}
                onPress={() => props.navigation.navigate('ContasPagarList')}>
                <View style={styles.subMenuItemRow}>
                  <Icon name="credit-card" size={16} color="#ccc" style={{ marginRight: 8 }} />
                  <Text style={styles.subMenuText}>Contas a Pagar</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.subMenuItem}
                onPress={() => props.navigation.navigate('ContasReceberList')}>
                <View style={styles.subMenuItemRow}>
                  <Icon name="dollar-sign" size={16} color="#ccc" style={{ marginRight: 8 }} />
                  <Text style={styles.subMenuText}>Contas a Receber</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

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
          <Icon name="log-out" size={18} color="#fff" style={{ marginRight: 8 }} />
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
