import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Switch,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import {
  getPermissoesModulos,
  updatePermissaoModulo,
  getModulosSistema,
  sincronizarLicenca,
} from '../services/parametrosService'
import { parametrosStyles } from './styles/parametrosStyles'

const PermissoesModulosList = ({ navigation }) => {
  const [permissoes, setPermissoes] = useState([])
  const [modulosSistema, setModulosSistema] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [permissoesResponse, modulosResponse] = await Promise.all([
        getPermissoesModulos(),
        getModulosSistema(),
      ])

      // Handle different response structures for permissions
      let permissoes
      if (permissoesResponse?.data?.results && Array.isArray(permissoesResponse.data.results)) {
        permissoes = permissoesResponse.data.results
      } else if (permissoesResponse?.data && Array.isArray(permissoesResponse.data)) {
        permissoes = permissoesResponse.data
      } else {
        permissoes = []
      }

      // Handle different response structures for system modules
      let modulosSistema
      if (modulosResponse?.data?.results && Array.isArray(modulosResponse.data.results)) {
        modulosSistema = modulosResponse.data.results
      } else if (modulosResponse?.data && Array.isArray(modulosResponse.data)) {
        modulosSistema = modulosResponse.data
      } else {
        modulosSistema = []
      }

      setPermissoes(permissoes)
      setModulosSistema(modulosSistema)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      
      // Set empty arrays on error
      setPermissoes([])
      setModulosSistema([])
      
      Alert.alert('Aviso', 'Não foi possível carregar os dados. Verifique a conexão com o servidor.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleTogglePermissao = async (item, field) => {
    try {
      const updatedData = {
        ...item,
        [field]: !item[field],
      }

      await updatePermissaoModulo(item.id, updatedData)

      setPermissoes((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, [field]: !p[field] } : p))
      )
    } catch (error) {
      console.error('Erro ao atualizar permissão:', error)
      Alert.alert('Erro', 'Não foi possível atualizar a permissão')
    }
  }

  const handleSincronizarLicenca = async () => {
    Alert.alert(
      'Sincronizar Licença',
      'Deseja sincronizar as permissões com a licença do sistema?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sincronizar',
          onPress: async () => {
            try {
              await sincronizarLicenca({})
              Alert.alert('Sucesso', 'Licença sincronizada com sucesso')
              loadData()
            } catch (error) {
              console.error('Erro ao sincronizar licença:', error)
              Alert.alert('Erro', 'Não foi possível sincronizar a licença')
            }
          },
        },
      ]
    )
  }

  const renderPermissaoItem = ({ item }) => (
    <View style={parametrosStyles.listItem}>
      <View style={parametrosStyles.itemHeader}>
        <Text style={parametrosStyles.itemTitle}>{item.modulo_nome}</Text>
        <Text style={parametrosStyles.itemSubtitle}>
          Usuário: {item.usuario_nome}
        </Text>
      </View>

      <View style={parametrosStyles.permissionRow}>
        <View style={parametrosStyles.permissionItem}>
          <Text style={parametrosStyles.permissionLabel}>Ativo</Text>
          <Switch
            value={item.ativo}
            onValueChange={() => handleTogglePermissao(item, 'ativo')}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={item.ativo ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>

        <View style={parametrosStyles.permissionItem}>
          <Text style={parametrosStyles.permissionLabel}>Leitura</Text>
          <Switch
            value={item.pode_ler}
            onValueChange={() => handleTogglePermissao(item, 'pode_ler')}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={item.pode_ler ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={parametrosStyles.permissionRow}>
        <View style={parametrosStyles.permissionItem}>
          <Text style={parametrosStyles.permissionLabel}>Escrita</Text>
          <Switch
            value={item.pode_escrever}
            onValueChange={() => handleTogglePermissao(item, 'pode_escrever')}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={item.pode_escrever ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>

        <View style={parametrosStyles.permissionItem}>
          <Text style={parametrosStyles.permissionLabel}>Exclusão</Text>
          <Switch
            value={item.pode_excluir}
            onValueChange={() => handleTogglePermissao(item, 'pode_excluir')}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={item.pode_excluir ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>
      </View>

      {item.data_expiracao && (
        <Text style={parametrosStyles.itemSubtitle}>
          Expira em: {new Date(item.data_expiracao).toLocaleDateString('pt-BR')}
        </Text>
      )}
    </View>
  )

  return (
    <View style={parametrosStyles.container}>
      <View style={parametrosStyles.header}>
        <TouchableOpacity
          style={parametrosStyles.headerButton}
          onPress={handleSincronizarLicenca}>
          <Feather name="refresh-cw" size={20} color="#fff" />
          <Text style={parametrosStyles.headerButtonText}>
            Sincronizar Licença
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={permissoes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPermissaoItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadData} />
        }
        contentContainerStyle={parametrosStyles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}

export default PermissoesModulosList
