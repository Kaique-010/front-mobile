import React, { useState, useCallback, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { apiGetComContexto } from '../utils/api'

export default function OrdensEmEstoque() {
  const navigation = useNavigation()
  const [ordens, setOrdens] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filtroCliente, setFiltroCliente] = useState('')
  const [filtroNumero, setFiltroNumero] = useState('')

  useFocusEffect(
    useCallback(() => {
      const fetchOrdens = async () => {
        setLoading(true)
        try {
          // Correção: Nome da função da API corrigido de apiGetComContextoos para apiGetComContexto
          const resp = await apiGetComContexto('ordemdeservico/motores-estoque')
          setOrdens(resp?.results || resp || [])
          setError(null)
        } catch (err) {
          console.error('Erro ao buscar motores em estoque:', err)
          setError(err.message || 'Erro ao carregar ordens')
        } finally {
          setLoading(false)
        }
      }
      fetchOrdens()
    }, [])
  )

  const ordensFiltradas = useMemo(() => {
    return ordens.filter((os) => {
      const numero = String(os.orde_nume || os.id || '')
      const cliente = (os.cliente_nome || os.orde_nome_clie || '').toLowerCase()

      const matchNumero = filtroNumero ? numero.includes(filtroNumero) : true
      const matchCliente = filtroCliente
        ? cliente.includes(filtroCliente.toLowerCase())
        : true

      return matchNumero && matchCliente
    })
  }, [ordens, filtroNumero, filtroCliente])

  const handlePressOrdem = (ordem) => {
    // Navegar para detalhes da ordem
    navigation.navigate('OrdemDetalhe', { ordem })
  }

  // Correção: O JSX deve ser retornado pela função do componente, não em um render() solto fora
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Motores em Estoque</Text>

      <View style={styles.filterContainer}>
        <TextInput
          style={[styles.input, { flex: 0.4, marginRight: 10 }]}
          placeholder="Nº OS"
          placeholderTextColor="#aaa"
          value={filtroNumero}
          onChangeText={setFiltroNumero}
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.input, { flex: 0.6 }]}
          placeholder="Cliente"
          placeholderTextColor="#aaa"
          value={filtroCliente}
          onChangeText={setFiltroCliente}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#10a2a7" style={styles.loader} />
      ) : error ? (
        <Text style={styles.errorText}>Erro: {error}</Text>
      ) : ordensFiltradas.length === 0 ? (
        <Text style={styles.emptyText}>
          {ordens.length === 0
            ? 'Nenhum motor em estoque no momento.'
            : 'Nenhuma ordem encontrada com os filtros atuais.'}
        </Text>
      ) : (
        <ScrollView style={styles.listContainer}>
          {ordensFiltradas.map((os) => (
            <TouchableOpacity
              key={os.id || os.orde_nume}
              style={styles.card}
              onPress={() => handlePressOrdem(os)}>
              <View style={styles.cardHeader}>
                <Text style={styles.osTitle}>OS: {os.orde_nume || os.id}</Text>
                <Text style={styles.statusBadge}>Em Estoque</Text>
              </View>

              <Text style={styles.clienteText}>
                Cliente: {os.cliente_nome || os.orde_nome_clie || 'N/A'}
              </Text>

              {os.orde_prob && (
                <Text style={styles.infoText} numberOfLines={2}>
                  Problema: {os.orde_prob}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#1a222c', // Mantendo consistência com tema escuro do app
  },
  header: {
    fontSize: 22,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#faebd7', // Cor de texto usada em outras telas
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#232935',
    color: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3a4b5c',
  },
  loader: {
    marginTop: 20,
  },
  listContainer: {
    flex: 1,
  },
  card: {
    backgroundColor: '#232935',
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10a2a7',
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  osTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusBadge: {
    backgroundColor: '#10a2a7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  clienteText: {
    fontSize: 16,
    color: '#ddd',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#aaa',
  },
  osText: {
    // Mantido para compatibilidade se necessário, mas preferir os novos
    fontSize: 16,
    marginBottom: 5,
    color: '#fff',
  },
  errorText: {
    fontSize: 16,
    color: '#ff6b6b',
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyText: {
    color: '#aaa',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
})
