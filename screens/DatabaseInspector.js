import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
  StyleSheet,
  Platform,
} from 'react-native'
import database from '../componentsOrdemServico/schemas/database'
import { Q } from '@nozbe/watermelondb'
import { checkAndSyncMegaData } from '../componentsOrdemServico/services/syncService'

export default function DatabaseInspector() {
  const [tables, setTables] = useState([])
  const [selectedTable, setSelectedTable] = useState(null)
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)

  const loadTables = async () => {
    // Get all collections from schema
    const tableNames = Object.keys(database.collections.map)
    const stats = []

    for (const name of tableNames) {
      try {
        const count = await database.collections.get(name).query().fetchCount()
        stats.push({ name, count })
      } catch (e) {
        stats.push({ name, count: 'Error' })
      }
    }
    setTables(stats)
  }

  useEffect(() => {
    loadTables()
  }, [])

  const handleTablePress = async (tableName) => {
    setLoading(true)
    setSelectedTable(tableName)
    try {
      const recs = await database.collections
        .get(tableName)
        .query(Q.take(100))
        .fetch()
      setRecords(recs)
    } catch (e) {
      Alert.alert('Erro', e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRecord = async (item) => {
    if (Platform.OS === 'web') {
      const confirm = window.confirm(
        'Tem certeza que deseja remover este registro permanentemente?'
      )
      if (confirm) {
        try {
          await database.write(async () => {
            await item.destroyPermanently()
          })
          setRecords((prev) => prev.filter((r) => r.id !== item.id))
          window.alert('Registro deletado.')
        } catch (e) {
          window.alert('Erro: ' + e.message)
        }
      }
      return
    }

    Alert.alert(
      'Deletar Registro',
      'Tem certeza que deseja remover este registro permanentemente?',
      [
        { text: 'Cancelar' },
        {
          text: 'Deletar',
          onPress: async () => {
            try {
              await database.write(async () => {
                await item.destroyPermanently()
              })
              setRecords((prev) => prev.filter((r) => r.id !== item.id))
              Alert.alert('Sucesso', 'Registro deletado.')
            } catch (e) {
              Alert.alert('Erro', e.message)
            }
          },
          style: 'destructive',
        },
      ]
    )
  }

  const renderDeleteButton = (item) => (
    <TouchableOpacity
      style={styles.deleteBtn}
      onPress={() => handleDeleteRecord(item)}>
      <Text style={styles.deleteBtnText}>Deletar</Text>
    </TouchableOpacity>
  )

  const renderRecord = ({ item }) => {
    const raw = item._raw

    if (selectedTable === 'mega_entidades') {
      return (
        <View style={styles.record}>
          <View style={styles.recordHeader}>
            <Text style={styles.recordTitle}>
              {raw.enti_nome || 'Sem Nome'}
            </Text>
            {renderDeleteButton(item)}
          </View>
          <Text style={styles.recordDetail}>
            Doc: {raw.enti_cpf || raw.enti_cnpj || 'N/A'}
          </Text>
          <Text style={styles.recordDetail}>
            Cód: {raw.enti_clie} | Loja: {raw.enti_empr}
          </Text>
          <Text style={styles.recordDetail}>
            Cidade: {raw.enti_cida || 'N/A'}
          </Text>
          <Text style={styles.recordJson}>{JSON.stringify(raw)}</Text>
        </View>
      )
    }

    if (selectedTable === 'mega_produtos') {
      return (
        <View style={styles.record}>
          <View style={styles.recordHeader}>
            <Text style={styles.recordTitle}>
              {raw.prod_nome || 'Sem Nome'}
            </Text>
            {renderDeleteButton(item)}
          </View>
          <Text style={styles.recordDetail}>Cód: {raw.prod_codi}</Text>
          <Text style={styles.recordDetail}>
            Saldo: {raw.saldo} | Preço: R$ {raw.preco_vista?.toFixed(2)}
          </Text>
          <Text style={styles.recordDetail}>
            Marca: {raw.marca_nome || '-'}
          </Text>
          <Text style={styles.recordJson}>{JSON.stringify(raw)}</Text>
        </View>
      )
    }

    return (
      <View style={styles.record}>
        <View style={styles.recordHeader}>
          <Text style={{ fontSize: 10, flex: 1 }}>
            {JSON.stringify(raw, null, 2)}
          </Text>
          {renderDeleteButton(item)}
        </View>
      </View>
    )
  }

  const handleSync = async () => {
    setLoading(true)
    try {
      await checkAndSyncMegaData()
      Alert.alert('Sucesso', 'Sincronização iniciada/concluída')
      loadTables()
    } catch (e) {
      Alert.alert('Erro', e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async () => {
    Alert.alert(
      'Cuidado',
      'Isso apagará todo o banco de dados local. Confirmar?',
      [
        { text: 'Cancelar' },
        {
          text: 'Apagar',
          onPress: async () => {
            try {
              await database.write(async () => {
                await database.unsafeResetDatabase()
              })
              Alert.alert('Sucesso', 'Banco resetado.')
              loadTables()
              setRecords([])
              setSelectedTable(null)
            } catch (e) {
              Alert.alert('Erro', e.message)
            }
          },
        },
      ]
    )
  }

  return (
    <View style={{ flex: 1, padding: 10, backgroundColor: '#f5f5f5' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
        Inspetor de Banco de Dados
      </Text>

      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        <TouchableOpacity onPress={loadTables} style={styles.btn}>
          <Text style={styles.btnText}>Atualizar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSync} style={styles.btn}>
          <Text style={styles.btnText}>Sincronizar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleReset}
          style={[styles.btn, { backgroundColor: 'red' }]}>
          <Text style={styles.btnText}>Resetar DB</Text>
        </TouchableOpacity>
      </View>

      {!selectedTable ? (
        <ScrollView>
          {tables.map((t) => (
            <TouchableOpacity
              key={t.name}
              onPress={() => handleTablePress(t.name)}
              style={styles.item}>
              <Text style={styles.itemText}>{t.name}</Text>
              <Text style={styles.itemCount}>{t.count} registros</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            onPress={() => setSelectedTable(null)}
            style={styles.backBtn}>
            <Text>Voltar</Text>
          </TouchableOpacity>
          <Text style={{ fontWeight: 'bold', marginVertical: 5 }}>
            Tabela: {selectedTable}
          </Text>
          {records.length === 0 ? (
            <Text style={{ padding: 20, textAlign: 'center', color: '#666' }}>
              Nenhum registro encontrado nesta tabela.
            </Text>
          ) : (
            <FlatList
              data={records}
              keyExtractor={(item) => item.id}
              renderItem={renderRecord}
            />
          )}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  btn: {
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 5,
    marginRight: 5,
  },
  btnText: { color: 'white', fontWeight: 'bold' },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: 'white',
    marginBottom: 5,
    borderRadius: 5,
  },
  itemText: { fontSize: 16 },
  itemCount: { color: '#666' },
  backBtn: {
    padding: 10,
    backgroundColor: '#ccc',
    alignSelf: 'flex-start',
    borderRadius: 5,
    marginBottom: 5,
  },
  record: {
    backgroundColor: 'white',
    padding: 10,
    marginBottom: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#eee',
  },
  recordTitle: { fontWeight: 'bold', fontSize: 14, marginBottom: 2 },
  recordDetail: { fontSize: 12, color: '#444' },
  recordJson: { fontSize: 9, color: '#aaa', marginTop: 4 },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  deleteBtn: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  deleteBtnText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
})
