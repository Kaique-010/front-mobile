import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Switch,
  ActivityIndicator,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import {
  getModulosLiberados,
  getPermissoesUsuario,
  updatePermissaoModulo,
  sincronizarLicenca,
  getConfiguracaoCompleta,
} from '../services/parametrosService'
import { getStoredData } from '../services/storageService'
import { parametrosStyles } from './styles/parametrosStyles'

const SistemaPermissoes = ({ navigation }) => {
  const [modulos, setModulos] = useState([])
  const [permissoes, setPermissoes] = useState({})
  const [configuracao, setConfiguracao] = useState({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [empresaId, setEmpresaId] = useState('')
  const [filialId, setFilialId] = useState('')

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      setLoading(true)
      
      // Carregar dados da empresa/filial
      const { empresaId, filialId } = await getStoredData()
      setEmpresaId(empresaId)
      setFilialId(filialId)

      // Carregar dados em paralelo
      const [modulosResponse, permissoesResponse, configResponse] = await Promise.all([
        getModulosLiberados(),
        getPermissoesUsuario(),
        getConfiguracaoCompleta(),
      ])

      setModulos(modulosResponse?.data || [])
      setPermissoes(permissoesResponse?.data || {})
      setConfiguracao(configResponse?.data || {})
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      Alert.alert('Erro', 'Não foi possível carregar os dados do sistema')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleToggleModulo = async (moduloId, ativo) => {
    try {
      await updatePermissaoModulo(moduloId, { perm_ativ: !ativo })
      
      setModulos(prev => 
        prev.map(mod => 
          mod.modu_codi === moduloId 
            ? { ...mod, perm_ativ: !ativo }
            : mod
        )
      )
      
      Alert.alert('Sucesso', 'Permissão atualizada com sucesso')
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
              carregarDados()
            } catch (error) {
              console.error('Erro ao sincronizar licença:', error)
              Alert.alert('Erro', 'Não foi possível sincronizar a licença')
            }
          },
        },
      ]
    )
  }

  const renderModulo = (modulo) => (
    <View key={modulo.modu_codi} style={parametrosStyles.moduloCard}>
      <View style={parametrosStyles.moduloHeader}>
        <View style={parametrosStyles.moduloInfo}>
          <Text style={parametrosStyles.moduloNome}>{modulo.modu_nome}</Text>
          <Text style={parametrosStyles.moduloDescricao}>{modulo.modu_desc}</Text>
        </View>
        <Switch
          value={modulo.perm_ativ}
          onValueChange={() => handleToggleModulo(modulo.modu_codi, modulo.perm_ativ)}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={modulo.perm_ativ ? '#f5dd4b' : '#f4f3f4'}
        />
      </View>

      {modulo.perm_data_venc && (
        <Text style={parametrosStyles.dataVencimento}>
          Expira em: {new Date(modulo.perm_data_venc).toLocaleDateString('pt-BR')}
        </Text>
      )}

      {modulo.telas && modulo.telas.length > 0 && (
        <View style={parametrosStyles.telasContainer}>
          <Text style={parametrosStyles.telasTitulo}>Telas disponíveis:</Text>
          {modulo.telas.map(tela => (
            <Text key={tela.tela_codi} style={parametrosStyles.telaItem}>
              • {tela.tela_nome}
            </Text>
          ))}
        </View>
      )}
    </View>
  )

  const renderResumoPermissoes = () => (
    <View style={parametrosStyles.resumoCard}>
      <Text style={parametrosStyles.resumoTitulo}>Resumo de Permissões</Text>
      
      <View style={parametrosStyles.resumoItem}>
        <Text style={parametrosStyles.resumoLabel}>Módulos Liberados:</Text>
        <Text style={parametrosStyles.resumoValor}>
          {modulos.filter(m => m.perm_ativ).length} / {modulos.length}
        </Text>
      </View>

      <View style={parametrosStyles.resumoItem}>
        <Text style={parametrosStyles.resumoLabel}>Empresa:</Text>
        <Text style={parametrosStyles.resumoValor}>{empresaId}</Text>
      </View>

      <View style={parametrosStyles.resumoItem}>
        <Text style={parametrosStyles.resumoLabel}>Filial:</Text>
        <Text style={parametrosStyles.resumoValor}>{filialId}</Text>
      </View>
    </View>
  )

  if (loading) {
    return (
      <View style={parametrosStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={parametrosStyles.loadingText}>Carregando sistema de permissões...</Text>
      </View>
    )
  }

  return (
    <View style={parametrosStyles.container}>
      <View style={parametrosStyles.header}>
        <Text style={parametrosStyles.headerTitle}>Sistema de Permissões</Text>
        <TouchableOpacity
          style={parametrosStyles.syncButton}
          onPress={handleSincronizarLicenca}>
          <Feather name="refresh-cw" size={20} color="#fff" />
          <Text style={parametrosStyles.syncButtonText}>Sincronizar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={carregarDados} />
        }
        showsVerticalScrollIndicator={false}>
        
        {renderResumoPermissoes()}

        <View style={parametrosStyles.modulosContainer}>
          <Text style={parametrosStyles.secaoTitulo}>Módulos do Sistema</Text>
          {modulos.map(renderModulo)}
        </View>

        <View style={parametrosStyles.acoesContainer}>
          <TouchableOpacity
            style={parametrosStyles.acaoButton}
            onPress={() => navigation.navigate('ParametrosGeraisList')}>
            <Feather name="settings" size={20} color="#fff" />
            <Text style={parametrosStyles.acaoButtonText}>Parâmetros Gerais</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={parametrosStyles.acaoButton}
            onPress={() => navigation.navigate('ConfiguracaoEstoqueForm')}>
            <Feather name="package" size={20} color="#fff" />
            <Text style={parametrosStyles.acaoButtonText}>Config. Estoque</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={parametrosStyles.acaoButton}
            onPress={() => navigation.navigate('ConfiguracaoFinanceiroForm')}>
            <Feather name="dollar-sign" size={20} color="#fff" />
            <Text style={parametrosStyles.acaoButtonText}>Config. Financeiro</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

export default SistemaPermissoes 