import React from 'react'
import { Text, View, FlatList, ActivityIndicator } from 'react-native'

export default function ListarPontosView({ pontos, loading }) {
  if (loading) {
    return (
      <View>
        <Text>Carregando...</Text>
        <ActivityIndicator />
      </View>
    )
  }

  return (
    <FlatList
      style={{
        borderRadius: 5,
        backgroundColor: '#2c3e50',
        padding: 10,
        boxShadow: '0 0 10px rgba(0,0,0,0.5)',
      }}
      data={pontos}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 10,
            padding: 10,
            backgroundColor: item.tipo === 'ENTRADA' ? '#eeffcfff' : '#A8535B',
            borderRadius: 5,
            borderLeftWidth: 5,
            borderLeftColor: item.tipo === 'ENTRADA' ? '#28a745' : '#dc3545',
          }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: item.tipo === 'ENTRADA' ? '#333' : '#fff',
              flex: 1,
            }}>
            {item.tipo}
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: item.tipo === 'ENTRADA' ? '#666' : '#fff',
              flex: 1,
              textAlign: 'right',
            }}>
            {new Date(item.data_hora).toLocaleString('pt-BR')}
          </Text>
        </View>
      )}
    />
  )
}
