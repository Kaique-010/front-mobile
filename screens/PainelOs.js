import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import axios from 'axios'
import { Picker } from '@react-native-picker/picker'

const STATUS_OPTIONS = [
  { label: 'Todas', value: '' },
  { label: 'Aberta', value: 'aberta' },
  { label: 'Em andamento', value: 'andamento' },
  { label: 'Concluída', value: 'concluida' },
  { label: 'Cancelada', value: 'cancelada' },
  { label: 'Atrasada', value: 'atrasada' },
]

const PRIORIDADE_OPTIONS = [
  { label: 'Todas', value: '' },
  { label: 'Baixa', value: 'baixa' },
  { label: 'Média', value: 'media' },
  { label: 'Alta', value: 'alta' },
]

const statusColors = {
  aberta: '#f8d7da',
  andamento: '#fff3cd',
  concluida: '#d4edda',
  cancelada: '#f5c6cb',
  atrasada: '#f8d7da',
  '': '#eeeeee',
}

const prioridadeColors = {
  baixa: '#d1ecf1',
  media: '#bee5eb',
  alta: '#0d6efd',
  '': '#eeeeee',
}

const PainelAcompanhamento = ({ navigation }) => {
  const [ordens, setOrdens] = useState([])
  const [loading, setLoading] = useState(false)
  const [filtroStatus, setFiltroStatus] = useState('')
  const [filtroPrioridade, setFiltroPrioridade] = useState('')
  const [contadores, setContadores] = useState({
    abertas: 0,
    atrasadas: 0,
    concluídas: 0,
    total: 0,
  })

  const fetchOrdens = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filtroStatus) params.orde_stat = filtroStatus
      if (filtroPrioridade) params.orde_prio = filtroPrioridade

      const res = await axios.get('https://suaapi.com/api/ordens/', { params })
      const ordensData = res.data.results
      setOrdens(ordensData)

      // Calcula os contadores gerais independente dos filtros atuais
      const resAll = await axios.get('https://suaapi.com/api/ordens/')
      const allOrdens = resAll.data.results
      const abertas = allOrdens.filter((o) => o.orde_stat === 'aberta').length
      const atrasadas = allOrdens.filter(
        (o) => o.orde_stat === 'atrasada'
      ).length
      const concluidas = allOrdens.filter(
        (o) => o.orde_stat === 'concluida'
      ).length
      setContadores({
        abertas,
        atrasadas,
        concluídas: concluidas,
        total: allOrdens.length,
      })
    } catch (error) {
      console.error('Erro ao buscar ordens:', error.message)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchOrdens()
  }, [filtroStatus, filtroPrioridade])

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: statusColors[item.orde_stat] || '#eee',
          borderLeftColor: prioridadeColors[item.orde_prio] || '#aaa',
        },
      ]}
      onPress={() => navigation.navigate('OrdemDetalhe', { ordem: item })}>
      <View style={styles.cardHeader}>
        <Text style={styles.numero}>OS #{item.orde_nume}</Text>
        <Text style={styles.prioridade}>
          {item.orde_prio?.toUpperCase() || '-'}
        </Text>
      </View>
      <Text style={styles.status}>
        Status: {item.orde_stat?.toUpperCase() || '-'}
      </Text>
      <Text style={styles.tipo}>Tipo: {item.orde_tipo || '-'}</Text>
      <Text style={styles.problema} numberOfLines={1}>
        Problema: {item.orde_prob || '-'}
      </Text>
      <Text style={styles.data}>Abertura: {item.orde_data_aber || '-'}</Text>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      {/* Indicadores no topo */}
      <View style={styles.indicadores}>
        <View style={[styles.indicador, { backgroundColor: '#f8d7da' }]}>
          <Text style={styles.indicadorLabel}>Abertas</Text>
          <Text style={styles.indicadorValor}>{contadores.abertas}</Text>
        </View>
        <View style={[styles.indicador, { backgroundColor: '#f8d7da' }]}>
          <Text style={styles.indicadorLabel}>Atrasadas</Text>
          <Text style={styles.indicadorValor}>{contadores.atrasadas}</Text>
        </View>
        <View style={[styles.indicador, { backgroundColor: '#d4edda' }]}>
          <Text style={styles.indicadorLabel}>Concluídas</Text>
          <Text style={styles.indicadorValor}>{contadores.concluídas}</Text>
        </View>
        <View style={[styles.indicador, { backgroundColor: '#eee' }]}>
          <Text style={styles.indicadorLabel}>Total</Text>
          <Text style={styles.indicadorValor}>{contadores.total}</Text>
        </View>
      </View>

      {/* Filtros */}
      <View style={styles.filtros}>
        <Picker
          selectedValue={filtroStatus}
          onValueChange={setFiltroStatus}
          style={styles.picker}>
          {STATUS_OPTIONS.map((opt) => (
            <Picker.Item label={opt.label} value={opt.value} key={opt.value} />
          ))}
        </Picker>

        <Picker
          selectedValue={filtroPrioridade}
          onValueChange={setFiltroPrioridade}
          style={styles.picker}>
          {PRIORIDADE_OPTIONS.map((opt) => (
            <Picker.Item label={opt.label} value={opt.value} key={opt.value} />
          ))}
        </Picker>
      </View>

      {/* Lista */}
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={ordens}
          keyExtractor={(item) => item.orde_nume.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 30 }}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 20 }}>
              Nenhuma OS encontrada
            </Text>
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#f7f7f7' },
  indicadores: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
    paddingVertical: 8,
  },
  indicador: {
    flex: 1,
    marginHorizontal: 4,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  indicadorLabel: { fontWeight: 'bold', fontSize: 14, marginBottom: 4 },
  indicadorValor: { fontSize: 20, fontWeight: 'bold' },
  filtros: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  picker: { flex: 1, backgroundColor: '#fff', marginHorizontal: 5 },
  card: {
    padding: 14,
    marginBottom: 10,
    borderRadius: 8,
    borderLeftWidth: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  numero: { fontWeight: 'bold', fontSize: 16 },
  prioridade: { fontWeight: 'bold', fontSize: 14, color: '#333' },
  status: { fontSize: 14, marginBottom: 2 },
  tipo: { fontSize: 14, marginBottom: 2 },
  problema: { fontSize: 14, fontStyle: 'italic', color: '#555' },
  data: { fontSize: 12, color: '#666' },
})

export default PainelAcompanhamento
