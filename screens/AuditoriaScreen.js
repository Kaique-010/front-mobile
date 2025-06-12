import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
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

  const renderItem = ({ item }) => (
    <View style={styles.logItem}>
      <Text style={styles.logText}>🕵️ {item.acao_descricao}</Text>
      <Text style={styles.logText}>👤 {item.usuario_nome}</Text>
      <Text style={styles.logText}>
        🕒 {item.data_hora_formatada || item.data_hora}
      </Text>
      <Text style={styles.logText}>🔗 {item.url}</Text>
      <Text style={styles.logText}>🖥️ {item.ip}</Text>
      <Text style={styles.logText}>⚙️ {item.metodo}</Text>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <View style={styles.row}>
          <TextInput
            style={styles.inputHalf}
            placeholder="👤 Usuário"
            value={searchUser}
            onChangeText={setSearchUser}
          />
          <TextInput
            style={styles.inputHalf}
            placeholder="⚙️(GET, POST, PUT ...)"
            value={searchMetodo}
            onChangeText={setSearchMetodo}
          />
        </View>
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.inputHalf}
            onPress={() => setShowStartPicker(true)}>
            <Text>
              📅 Início: {startDate ? formatDate(startDate) : 'Selecionar'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.inputHalf}
            onPress={() => setShowEndPicker(true)}>
            <Text>📅 Fim: {endDate ? formatDate(endDate) : 'Selecionar'}</Text>
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
          refreshing={refreshing}
          onRefresh={fetchLogs}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 20, color: '#fff' }}>
              Nenhum log encontrado.
            </Text>
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a2f3d',
    padding: 10,
  },
  filterContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  inputHalf: {
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    padding: 10,
    flex: 1,
    marginRight: 8,
  },
  inputHalfLast: {
    marginRight: 0,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  input: {
    backgroundColor: '#eee',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  logItem: {
    backgroundColor: '#e8f0fe',
    padding: 12,
    marginBottom: 10,
    borderRadius: 6,
  },
  logText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
})

export default AuditoriaScreen
