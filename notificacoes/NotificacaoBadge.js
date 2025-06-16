import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Alert } from 'react-native'
import { useNotificacoes } from './NotificacaoContext'
import NotificacaoService from './Service'

const NotificacaoBadge = ({ onPress }) => {
  const { contadorNaoLidas, loading, carregarNotificacoes } = useNotificacoes()
  const [gerandoNotificacoes, setGerandoNotificacoes] = useState(false)

  const gerarNotificacoes = async () => {
    if (gerandoNotificacoes) return

    setGerandoNotificacoes(true)
    try {
      const resultado = await NotificacaoService.gerarTodasNotificacoes()

      Alert.alert(
        'Notificações Geradas',
        `${resultado.sucessos} tipos de notificações foram processados com sucesso!`,
        [{ text: 'OK' }]
      )

      await carregarNotificacoes()
    } catch (error) {
      Alert.alert('Erro', 'Erro ao gerar notificações. Tente novamente.', [
        { text: 'OK' },
      ])
      console.error('Erro ao gerar notificações:', error)
    } finally {
      setGerandoNotificacoes(false)
    }
  }

  if (loading) return null

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={gerarNotificacoes}
      style={{
        padding: 8,
        position: 'relative',
        opacity: gerandoNotificacoes ? 0.6 : 1,
      }}>
      <Text style={{ fontSize: 18 }}>🔔</Text>
      {contadorNaoLidas > 0 && (
        <View
          style={{
            position: 'absolute',
            top: -2,
            right: -2,
            backgroundColor: 'red',
            borderRadius: 10,
            minWidth: 15,
            height: 15,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
            {contadorNaoLidas > 99 ? '99+' : contadorNaoLidas}
          </Text>
        </View>
      )}
      {gerandoNotificacoes && (
        <View
          style={{
            position: 'absolute',
            bottom: -8,
            right: -8,
            backgroundColor: 'blue',
            borderRadius: 6,
            paddingHorizontal: 4,
            paddingVertical: 2,
          }}>
          <Text style={{ color: 'white', fontSize: 8 }}>...</Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

export default NotificacaoBadge
