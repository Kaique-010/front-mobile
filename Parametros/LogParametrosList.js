import React, { useState, useEffect } from 'react'
import { View, Text, FlatList, RefreshControl, TextInput } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { getLogsParametros } from '../services/parametrosService'
import { parametrosStyles } from './styles/parametrosStyles'

const LogParametrosList = ({ navigation }) => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [filteredLogs, setFilteredLogs] = useState([])

  useEffect(() => {
    loadLogs()
  }, [])

  useEffect(() => {
    filterLogs()
  }, [logs, searchText])

  const loadLogs = async () => {
    try {
      setLoading(true)
      const response = await getLogsParametros({
        ordering: '-data_alteracao',
      })
      
      // Handle different response structures
      let logs
      if (response?.data?.results && Array.isArray(response.data.results)) {
        logs = response.data.results
      } else if (response?.data && Array.isArray(response.data)) {
        logs = response.data
      } else {
        logs = []
      }
      
      setLogs(logs)
    } catch (error) {
      console.error('Erro ao carregar logs:', error)
      setLogs([])
      // Don't show alert for logs as it's not critical
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const filterLogs = () => {
    if (!searchText.trim()) {
      setFilteredLogs(logs)
      return
    }

    const filtered = logs.filter(
      (log) =>
        log.parametro_nome?.toLowerCase().includes(searchText.toLowerCase()) ||
        log.usuario_nome?.toLowerCase().includes(searchText.toLowerCase()) ||
        log.acao?.toLowerCase().includes(searchText.toLowerCase())
    )
    setFilteredLogs(filtered)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('pt-BR')
  }

  const getActionColor = (action) => {
    switch (action?.toLowerCase()) {
      case 'criacao':
        return '#4CAF50'
      case 'edicao':
        return '#FF9800'
      case 'exclusao':
        return '#F44336'
      default:
        return '#2196F3'
    }
  }

  const renderLogItem = ({ item }) => (
    <View style={parametrosStyles.listItem}>
      <View style={parametrosStyles.itemHeader}>
        <Text style={parametrosStyles.itemTitle}>{item.parametro_nome}</Text>
        <View
          style={[
            parametrosStyles.actionBadge,
            { backgroundColor: getActionColor(item.acao) },
          ]}>
          <Text style={parametrosStyles.actionText}>{item.acao}</Text>
        </View>
      </View>

      <Text style={parametrosStyles.itemSubtitle}>
        Usuário: {item.usuario_nome}
      </Text>

      <Text style={parametrosStyles.itemSubtitle}>
        Data: {formatDate(item.data_alteracao)}
      </Text>

      {item.valor_anterior && (
        <View style={parametrosStyles.valueChange}>
          <Text style={parametrosStyles.valueLabel}>Valor anterior:</Text>
          <Text style={parametrosStyles.valueText}>{item.valor_anterior}</Text>
        </View>
      )}

      {item.valor_novo && (
        <View style={parametrosStyles.valueChange}>
          <Text style={parametrosStyles.valueLabel}>Valor novo:</Text>
          <Text style={parametrosStyles.valueText}>{item.valor_novo}</Text>
        </View>
      )}

      {item.observacoes && (
        <View style={parametrosStyles.valueChange}>
          <Text style={parametrosStyles.valueLabel}>Observações:</Text>
          <Text style={parametrosStyles.valueText}>{item.observacoes}</Text>
        </View>
      )}
    </View>
  )

  return (
    <View style={parametrosStyles.container}>
      <View style={parametrosStyles.searchContainer}>
        <Feather
          name="search"
          size={20}
          color="#666"
          style={parametrosStyles.searchIcon}
        />
        <TextInput
          style={parametrosStyles.searchInput}
          placeholder="Buscar logs..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <FlatList
        data={filteredLogs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderLogItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadLogs} />
        }
        contentContainerStyle={parametrosStyles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={parametrosStyles.emptyContainer}>
            <Feather name="file-text" size={48} color="#ccc" />
            <Text style={parametrosStyles.emptyText}>
              {searchText ? 'Nenhum log encontrado' : 'Nenhum log disponível'}
            </Text>
          </View>
        }
      />
    </View>
  )
}

export default LogParametrosList
