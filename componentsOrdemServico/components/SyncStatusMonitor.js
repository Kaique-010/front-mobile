import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from 'react-native'
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider'
import withObservables from '@nozbe/with-observables'
import NetInfo from '@react-native-community/netinfo'
import { processSyncQueue } from '../services/syncService'
import { Ionicons } from '@expo/vector-icons'

const SyncStatusMonitor = ({ queueCount }) => {
  const [isOnline, setIsOnline] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [spinValue] = useState(new Animated.Value(0))
  const [lastSyncStatus, setLastSyncStatus] = useState(null)

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected)
    })
    return () => unsubscribe()
  }, [])

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  const startSpin = () => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start()
  }

  const stopSpin = () => {
    spinValue.setValue(0)
  }

  useEffect(() => {
    if (isSyncing) startSpin()
    else {
      stopSpin()
    }
  }, [isSyncing])

  const handleSync = async () => {
    if (!isOnline) return
    setIsSyncing(true)
    setLastSyncStatus(null)
    try {
      await processSyncQueue()
      setLastSyncStatus('success')
      setTimeout(() => setLastSyncStatus(null), 3000)
    } catch (e) {
      setLastSyncStatus('error')
    } finally {
      setIsSyncing(false)
    }
  }

  if (queueCount === 0 && isOnline && !lastSyncStatus) return null

  return (
    <View style={[styles.container, !isOnline && styles.offlineContainer]}>
      <View style={styles.infoRow}>
        <Text style={styles.text}>{!isOnline ? 'OFFLINE' : 'ONLINE'}</Text>
        {queueCount > 0 && (
          <Text style={styles.queueText}> • Pendente: {queueCount}</Text>
        )}
      </View>

      {isOnline && queueCount > 0 && (
        <TouchableOpacity
          onPress={handleSync}
          disabled={isSyncing}
          style={styles.syncButton}>
          {isSyncing ? (
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Text style={{ color: '#fff' }}>↻</Text>
            </Animated.View>
          ) : (
            <Text style={styles.syncButtonText}>Sincronizar Agora</Text>
          )}
        </TouchableOpacity>
      )}

      {lastSyncStatus === 'success' && (
        <Text style={styles.successText}>✓ Sincronizado</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#1a2f3d',
    borderTopWidth: 1,
    borderTopColor: '#2c3e50',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  offlineContainer: {
    backgroundColor: '#342222',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  queueText: {
    color: '#ff9800',
    fontSize: 12,
  },
  syncButton: {
    backgroundColor: '#10a2a7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  successText: {
    color: '#4caf50',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 10,
  },
})

export default withDatabase(
  withObservables([], ({ database }) => ({
    queueCount: database.collections
      .get('fila_sincronizacao')
      .query()
      .observeCount(),
  }))(SyncStatusMonitor)
)
