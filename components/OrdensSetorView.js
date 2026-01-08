import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { FlashList } from '@shopify/flash-list'

export default function OrdensSetorView({ data }) {
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.cardContent}>
          <Text style={styles.ordem}>OS: {item.ordem}</Text>
          <Text style={styles.data}>
            Data de abertura:
            {item.data ? new Date(item.data).toLocaleDateString() : '-'}
          </Text>
        </View>
      </View>
      <Text style={styles.cliente} numberOfLines={2}>
        {item.nome_cliente ||
          item.cliente_nome ||
          item.cliente ||
          'Cliente não informado'}
      </Text>
      <View style={styles.footer}>
        <Text style={styles.setor} numberOfLines={1}>
          {item.setor}
        </Text>
        <Text style={styles.status}>{item.status}</Text>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <FlashList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.list}
        scrollEnabled={false}
        numColumns={4}
        estimatedItemSize={150}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { width: '100%', paddingBottom: 20 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  headerContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#00bfff',
    borderRadius: 8,
    marginBottom: 10,
  },
  list: { paddingBottom: 10 },
  card: {
    backgroundColor: '#1e1e1e',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#00bfff',
    flex: 1,
    marginHorizontal: 5,
    minHeight: 130,
    justifyContent: 'space-between',
  },
  cardContent: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  ordem: { color: '#00bfff', fontWeight: 'bold', fontSize: 14 },
  data: { color: '#aaa', fontSize: 11, marginTop: 2 },
  cliente: { color: '#fff', fontSize: 13, marginBottom: 8, height: 35 },
  footer: { flexDirection: 'column', columnGap: 4 },
  setor: { color: '#aaa', fontSize: 11 },
  status: { color: '#4caf50', fontWeight: 'bold', fontSize: 11 },
})
