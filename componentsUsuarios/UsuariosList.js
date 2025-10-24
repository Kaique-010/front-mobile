import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native'
import Icon from 'react-native-vector-icons/Feather'
import { apiGetComContexto, apiDeleteComContexto } from '../utils/api'
import Toast from 'react-native-toast-message'
import { StyleSheet } from 'react-native'

const UsuariosList = ({ navigation }) => {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [filteredUsuarios, setFilteredUsuarios] = useState([])

  const carregarUsuarios = async () => {
    try {
      setLoading(true)
      console.log('[UsuariosList] Iniciando carregamento de usuários...')
      const response = await apiGetComContexto('licencas/usuarios/')
      console.log('[UsuariosList] Resposta completa da API:', response)
      console.log('[UsuariosList] Tipo da resposta:', typeof response)
      console.log('[UsuariosList] É array?', Array.isArray(response))
      
      // Verificar diferentes estruturas possíveis de resposta
      let usuariosData = []
      
      if (Array.isArray(response)) {
        console.log('[UsuariosList] Usando response diretamente (é array)')
        usuariosData = response
      } else if (response && Array.isArray(response.results)) {
        console.log('[UsuariosList] Usando response.results')
        usuariosData = response.results
      } else if (response && Array.isArray(response.data)) {
        console.log('[UsuariosList] Usando response.data')
        usuariosData = response.data
      } else {
        console.log('[UsuariosList] Estrutura não reconhecida, tentando extrair dados...')
        usuariosData = []
      }
      
      console.log('[UsuariosList] Dados finais dos usuários:', usuariosData)
      console.log('[UsuariosList] Quantidade de usuários:', usuariosData.length)
      
      setUsuarios(usuariosData)
      setFilteredUsuarios(usuariosData)
    } catch (error) {
      console.error('[UsuariosList] Erro ao carregar usuários:', error)
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Erro ao carregar lista de usuários',
      })
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await carregarUsuarios()
    setRefreshing(false)
  }

  const filtrarUsuarios = (texto) => {
    setSearchText(texto)
    if (texto.trim() === '') {
      setFilteredUsuarios(usuarios)
    } else {
      const filtered = usuarios.filter(usuario =>
        usuario.usua_nome?.toLowerCase().includes(texto.toLowerCase())
      )
      setFilteredUsuarios(filtered)
    }
  }

  const confirmarExclusao = (usuario) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir o usuário "${usuario.usua_nome}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => excluirUsuario(usuario.usua_codi),
        },
      ]
    )
  }

  const excluirUsuario = async (usuaCodi) => {
    try {
      await apiDeleteComContexto(`licencas/usuarios/${usuaCodi}/`)
      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Usuário excluído com sucesso',
      })
      carregarUsuarios()
    } catch (error) {
      console.error('Erro ao excluir usuário:', error)
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Erro ao excluir usuário',
      })
    }
  }

  const editarUsuario = (usuario) => {
    navigation.navigate('UsuarioForm', { usuario })
  }

  const renderUsuario = ({ item }) => (
    <View style={styles.usuarioCard}>
      <View style={styles.usuarioInfo}>
        <View style={styles.usuarioHeader}>
          <Icon name="user" size={20} color="#10a2a7" />
          <Text style={styles.usuarioNome}>{item.usua_nome}</Text>
        </View>
        <Text style={styles.usuarioCodigo}>Código: {item.usua_codi}</Text>
      </View>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => editarUsuario(item)}>
          <Icon name="edit-2" size={16} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => confirmarExclusao(item)}>
          <Icon name="trash-2" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  )

  useEffect(() => {
    carregarUsuarios()
  }, [])

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      carregarUsuarios()
    })
    return unsubscribe
  }, [navigation])

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10a2a7" />
        <Text style={styles.loadingText}>Carregando usuários...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar usuários..."
            placeholderTextColor="#666"
            value={searchText}
            onChangeText={filtrarUsuarios}
          />
        </View>
        
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('UsuarioForm')}>
          <Icon name="plus" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Novo</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredUsuarios}
        keyExtractor={(item) => item.usua_codi?.toString() || Math.random().toString()}
        renderItem={renderUsuario}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#10a2a7']}
            tintColor="#10a2a7"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="users" size={48} color="#666" />
            <Text style={styles.emptyText}>Nenhum usuário encontrado</Text>
            <Text style={styles.emptySubtext}>
              {searchText ? 'Tente ajustar sua busca' : 'Adicione o primeiro usuário'}
            </Text>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#fff',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#10a2a7',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  usuarioCard: {
    backgroundColor: '#16213e',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
  },
  usuarioInfo: {
    flex: 1,
  },
  usuarioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  usuarioNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  usuarioCodigo: {
    fontSize: 14,
    color: '#ccc',
    marginLeft: 28,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#10a2a7',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
  },
})

export default UsuariosList