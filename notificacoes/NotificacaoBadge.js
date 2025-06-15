import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { useNotificacoes } from './NotificacaoContext'

const NotificacaoBadge = ({ onPress }) => {
  const { contadorNaoLidas, loading } = useNotificacoes()

  if (loading) return null

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        padding: 8,
        position: 'relative'
      }}>
      {/* Ícone de sino - você pode usar react-native-vector-icons */}
      <Text style={{ fontSize: 24 }}>🔔</Text>
      {contadorNaoLidas > 0 && (
        <View style={{
          position: 'absolute',
          top: -2,
          right: -2,
          backgroundColor: 'red',
          borderRadius: 10,
          minWidth: 20,
          height: 20,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
            {contadorNaoLidas > 99 ? '99+' : contadorNaoLidas}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

export default NotificacaoBadge
