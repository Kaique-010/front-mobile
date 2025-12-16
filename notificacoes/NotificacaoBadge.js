import React, { useState } from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useNotificacoes } from './NotificacaoContext'

const NotificacaoBadge = ({ onPress }) => {
  const { 
    contadorNaoLidas, 
    loading, 
    carregarNotificacoes,
    ultimaAtualizacao 
  } = useNotificacoes()
  
  const [refreshing, setRefreshing] = useState(false)

  // Refresh manual ao clicar no badge
  const handleRefresh = async () => {
    if (refreshing || loading) return

    console.log('🔄 Atualizando notificações manualmente...')
    setRefreshing(true)
    try {
      await carregarNotificacoes()
    } finally {
      setTimeout(() => setRefreshing(false), 500)
    }
  }

  return (
    <TouchableOpacity
      onPress={onPress} // ← Abre modal
      onLongPress={handleRefresh} // ← Long press = refresh manual
      disabled={refreshing}
      style={{
        padding: 8,
        position: 'relative',
        opacity: refreshing ? 0.6 : 1,
      }}
      activeOpacity={0.7}>
      
      {refreshing ? (
        <ActivityIndicator size="small" color="#3b82f6" />
      ) : (
        <>
          <Text style={{ fontSize: 20 }}>🔔</Text>
          {contadorNaoLidas > 0 && (
            <View
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                backgroundColor: '#ef4444',
                borderRadius: 10,
                minWidth: 18,
                height: 18,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: '#ffffff',
              }}>
              <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                {contadorNaoLidas > 99 ? '99+' : contadorNaoLidas}
              </Text>
            </View>
          )}
        </>
      )}
    </TouchableOpacity>
  )
}

export default NotificacaoBadge