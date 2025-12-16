import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native'
import { apiGetComContexto } from '../utils/api'
import DateTimePicker from '@react-native-community/datetimepicker'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Toast from 'react-native-toast-message'
import { useNavigation } from '@react-navigation/native'

const AuditoriaScreen = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [expandedItems, setExpandedItems] = useState(new Set())
  const [searchUser, setSearchUser] = useState('')
  const [searchMetodo, setSearchMetodo] = useState('')
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [showStartPicker, setShowStartPicker] = useState(false)
  const [showEndPicker, setShowEndPicker] = useState(false)

  const navigation = useNavigation()
  const debounceTimeout = useRef(null)

  const fetchLogsDebounced = () => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current)
    debounceTimeout.current = setTimeout(() => {
      fetchLogs()
    }, 500) // 500ms depois do último input
  }

  const formatDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    return `${d.getFullYear()}-${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
  }

  useEffect(() => {
    fetchLogsDebounced()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchUser, searchMetodo, startDate, endDate])

  const fetchLogs = async () => {
    try {
      let query = []
      if (searchUser) query.push(`usuario=${encodeURIComponent(searchUser)}`)
      if (searchMetodo) query.push(`metodo=${encodeURIComponent(searchMetodo)}`)
      if (startDate) query.push(`data_inicio=${formatDate(startDate)}`)
      if (endDate) query.push(`data_fim=${formatDate(endDate)}`)
      const fullQuery = query.length > 0 ? `?${query.join('&')}` : ''
      const response = await apiGetComContexto(
        `auditoria/logs/admin/${fullQuery}`
      )

      if (Array.isArray(response.results)) {
        setLogs(response.results)
      } else if (Array.isArray(response)) {
        setLogs(response)
      } else {
        throw new Error('Formato inválido de resposta')
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao carregar logs',
        text2: error.message,
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const checkUserPermission = async () => {
    const username = await AsyncStorage.getItem('username')
    const allowed = ['admin', 'supervisor', 'root']
    if (!username || !allowed.includes(username)) {
      Toast.show({
        type: 'error',
        text1: 'Sem permissão',
      })
      navigation.replace('MainApp')
    }
  }

  useEffect(() => {
    checkUserPermission().then(fetchLogs)
  }, [])

  const toggleExpanded = (itemId) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedItems(newExpanded)
  }

  const renderAlteracoes = (campos_alterados) => {
    if (!campos_alterados || Object.keys(campos_alterados).length === 0) {
      return null
    }

    return (
      <View style={styles.alteracoesContainer}>
        <Text style={styles.alteracoesTitle}>📝 Campos Alterados:</Text>
        {Object.entries(campos_alterados).map(([campo, detalhes], index) => (
          <View key={index} style={styles.alteracaoItem}>
            <Text style={styles.campoNome}>• {campo}:</Text>
            {typeof detalhes === 'object' && detalhes.antes !== undefined ? (
              <View style={styles.alteracaoDetalhes}>
                <Text style={styles.valorAntes}>
                  Antes: {JSON.stringify(detalhes.antes)}
                </Text>
                <Text style={styles.valorDepois}>
                  Depois: {JSON.stringify(detalhes.depois)}
                </Text>
              </View>
            ) : (
              <Text style={styles.valorSimples}>
                {JSON.stringify(detalhes)}
              </Text>
            )}
          </View>
        ))}
      </View>
    )
  }

  const renderDadosCompletos = (item) => {
    if (!item.dados_antes && !item.dados_depois) {
      return null
    }

    const isExpanded = expandedItems.has(item.id)

    return (
      <View style={styles.dadosContainer}>
        <TouchableOpacity
          style={styles.dadosToggle}
          onPress={() => toggleExpanded(item.id)}>
          <Text style={styles.dadosToggleText}>
            {isExpanded ? '🔽' : '▶️'} Ver dados completos
          </Text>
        </TouchableOpacity>

        {isExpanded && (
          <ScrollView style={styles.dadosScrollView} nestedScrollEnabled={true}>
            {item.dados_antes && (
              <View style={styles.dadosSection}>
                <Text style={styles.dadosTitle}>📋 Dados Antes:</Text>
                <Text style={styles.dadosContent}>
                  {JSON.stringify(item.dados_antes, null, 2)}
                </Text>
              </View>
            )}
            {item.dados_depois && (
              <View style={styles.dadosSection}>
                <Text style={styles.dadosTitle}>📋 Dados Depois:</Text>
                <Text style={styles.dadosContent}>
                  {JSON.stringify(item.dados_depois, null, 2)}
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    )
  }

  const renderItem = ({ item }) => (
    <View style={styles.logItem}>
      <Text style={styles.logText}>🕵️ {item.acao_descricao}</Text>
      <Text style={styles.logText}>👤 {item.usuario_nome}</Text>
      <Text style={styles.logText}>
        🕒 {item.data_hora_formatada || item.data_hora}
      </Text>
      <Text style={styles.logText}>🔗 {item.url}</Text>
      <Text style={styles.logText}>🖥️ {item.ip}</Text>
      <Text style={styles.logText}>⚙️ {item.tipo_acao}</Text>

      {/* Novos campos de auditoria */}
      {item.modelo && (
        <Text style={styles.logText}>📦 Modelo: {item.modelo}</Text>
      )}
      {item.objeto_id && (
        <Text style={styles.logText}>🆔 Objeto ID: {item.objeto_id}</Text>
      )}
      {item.tipo_alteracao && (
        <Text style={styles.logText}>🔄 Tipo: {item.tipo_alteracao}</Text>
      )}
      {item.tem_alteracoes && (
        <Text style={styles.logTextSuccess}>✅ Possui alterações</Text>
      )}
      {item.resumo_alteracoes && (
        <Text style={styles.logText}>📊 Resumo: {item.resumo_alteracoes}</Text>
      )}

      {/* Renderizar alterações detalhadas */}
      {renderAlteracoes(item.campos_alterados)}

      {/* Renderizar dados completos (colapsável) */}
      {renderDadosCompletos(item)}
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <View style={styles.row}>
          <TextInput
            style={styles.inputHalf}
            placeholder="👤 Usuário"
            placeholderTextColor="#999"
            value={searchUser}
            onChangeText={setSearchUser}
          />
          <TextInput
            style={styles.inputHalf}
            placeholder="⚙️(GET, POST, PUT ...)"
            placeholderTextColor="#999"
            value={searchMetodo}
            onChangeText={setSearchMetodo}
          />
        </View>
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.inputHalf}
            onPress={() => setShowStartPicker(true)}>
            <Text style={styles.dateText}>
              📅 Início: {startDate ? formatDate(startDate) : 'Selecionar'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.inputHalf}
            onPress={() => setShowEndPicker(true)}>
            <Text style={styles.dateText}>
              📅 Fim: {endDate ? formatDate(endDate) : 'Selecionar'}
            </Text>
          </TouchableOpacity>
        </View>

        {showStartPicker && (
          <DateTimePicker
            value={startDate || new Date()}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowStartPicker(false)
              if (date) setStartDate(date)
            }}
          />
        )}

        {showEndPicker && (
          <DateTimePicker
            value={endDate || new Date()}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowEndPicker(false)
              if (date) setEndDate(date)
            }}
          />
        )}

        <TouchableOpacity style={styles.button} onPress={fetchLogs}>
          <Text style={styles.buttonText}>🔍 Filtrar Logs</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#fff"
          style={{ marginTop: 30 }}
        />
      ) : (
        <FlatList
          data={logs}
          renderItem={renderItem}
          keyExtractor={(item, index) =>
            item.id ? item.id.toString() : index.toString()
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 16,
  },
  filterContainer: {
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  inputHalf: {
    flex: 0.48,
    backgroundColor: '#3a3a3a',
    color: '#fff',
    padding: 12,
    borderRadius: 6,
    fontSize: 14,
  },
  dateText: {
    color: '#fff',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingBottom: 20,
  },
  logItem: {
    backgroundColor: '#2a2a2a',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  logText: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 4,
    lineHeight: 20,
  },
  logTextSuccess: {
    fontSize: 14,
    color: '#28a745',
    marginBottom: 4,
    lineHeight: 20,
    fontWeight: 'bold',
  },
  // Estilos para alterações
  alteracoesContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#3a3a3a',
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  alteracoesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 8,
  },
  alteracaoItem: {
    marginBottom: 8,
  },
  campoNome: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ccc',
    marginBottom: 4,
  },
  alteracaoDetalhes: {
    marginLeft: 12,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#555',
  },
  valorAntes: {
    fontSize: 12,
    color: '#dc3545',
    marginBottom: 2,
    fontFamily: 'monospace',
  },
  valorDepois: {
    fontSize: 12,
    color: '#28a745',
    fontFamily: 'monospace',
  },
  valorSimples: {
    fontSize: 12,
    color: '#999',
    marginLeft: 12,
    fontFamily: 'monospace',
  },
  // Estilos para dados completos
  dadosContainer: {
    marginTop: 12,
  },
  dadosToggle: {
    padding: 8,
    backgroundColor: '#3a3a3a',
    borderRadius: 4,
    alignItems: 'center',
  },
  dadosToggleText: {
    fontSize: 13,
    color: '#ccc',
    fontWeight: '500',
  },
  dadosScrollView: {
    maxHeight: 200,
    marginTop: 8,
  },
  dadosSection: {
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#3a3a3a',
    borderRadius: 4,
  },
  dadosTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ccc',
    marginBottom: 6,
  },
  dadosContent: {
    fontSize: 11,
    color: '#999',
    fontFamily: 'monospace',
    lineHeight: 16,
  },
})

export default AuditoriaScreen
