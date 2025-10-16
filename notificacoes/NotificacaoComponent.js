import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { useNotificacoes } from './NotificacaoContext'

const NotificacaoComponent = () => {
  const { notificacoes, loading, marcarComoLida, contadorNaoLidas } =
    useNotificacoes()

  const getPrioridadeStyle = (prioridade) => {
    const styles = {
      alta: { borderLeftColor: '#ef4444', backgroundColor: '#fef2f2' },
      media: { borderLeftColor: '#eab308', backgroundColor: '#fefce8' },
      baixa: { borderLeftColor: '#3b82f6', backgroundColor: '#eff6ff' },
    }
    return styles[prioridade] || styles.media
  }

  const getTipoIcon = (tipo) => {
    const icons = {
      estoque: '📦',
      financeiro: '💰',
      vendas: '🛒',
      resumo: '📊',
    }
    return icons[tipo] || '📢'
  }

  if (loading) {
    return (
      <View style={{ padding: 16, alignItems: 'center' }}>
        <ActivityIndicator size="small" color="#3b82f6" />
        <Text style={{ marginTop: 8, textAlign: 'center', color: '#6b7280' }}>
          Carregando notificações...
        </Text>
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: '#e5e7eb',
          backgroundColor: '#ffffff',
        }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827' }}>
          Notificações
        </Text>
        {contadorNaoLidas > 0 && (
          <View
            style={{
              backgroundColor: '#ef4444',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
            }}>
            <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
              {contadorNaoLidas} nova{contadorNaoLidas !== 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ paddingBottom: 16 }}>
        {notificacoes.length === 0 ? (
          <View style={{ padding: 32, alignItems: 'center' }}>
            <Text style={{ fontSize: 40, marginBottom: 8 }}>🔔</Text>
            <Text style={{ color: '#6b7280', textAlign: 'center', fontSize: 16 }}>
              Nenhuma notificação no momento
            </Text>
          </View>
        ) : (
          notificacoes.map((notif) => (
            <TouchableOpacity
              key={notif.id}
              style={{
                padding: 16,
                borderLeftWidth: 4,
                marginHorizontal: 8,
                marginTop: 8,
                borderRadius: 8,
                ...getPrioridadeStyle(notif.prioridade),
              }}
              onPress={() => marcarComoLida(notif.id)}
              activeOpacity={0.7}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    flex: 1,
                  }}>
                  <Text style={{ fontSize: 24, marginRight: 12 }}>
                    {getTipoIcon(notif.tipo)}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontWeight: 'bold',
                        color: '#111827',
                        marginBottom: 4,
                        fontSize: 15,
                      }}>
                      {notif.titulo}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: '#374151',
                        marginBottom: 8,
                        lineHeight: 20,
                      }}>
                      {notif.mensagem}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: '#9ca3af',
                      }}>
                      {new Date(notif.data_criacao).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </View>

                {!notif.lida && (
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      backgroundColor: '#3b82f6',
                      borderRadius: 5,
                      marginLeft: 8,
                      marginTop: 4,
                    }}
                  />
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  )
}

export default NotificacaoComponent