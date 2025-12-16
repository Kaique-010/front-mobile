import React, { useState } from 'react'
import { View } from 'react-native'
import NotificacaoBadge from '../notificacoes/NotificacaoBadge'
import NotificacaoComponent from '../notificacoes/NotificacaoComponent'

const NotificationOverlay = () => {
  const [mostrarNotificacoes, setMostrarNotificacoes] = useState(false)

  return (
    <View style={{ position: 'absolute', top: 50, right: 20, zIndex: 1000 }}>
      <NotificacaoBadge
        onPress={() => setMostrarNotificacoes(!mostrarNotificacoes)}
      />
      {mostrarNotificacoes && (
        <View
          style={{
            position: 'absolute',
            right: 0,
            top: 50,
            width: 300,
            backgroundColor: 'white',
            borderRadius: 8,
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
            zIndex: 1001,
          }}>
          <NotificacaoComponent />
        </View>
      )}
    </View>
  )
}

export default NotificationOverlay