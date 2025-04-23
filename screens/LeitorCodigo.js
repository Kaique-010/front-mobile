import React, { useState, useEffect } from 'react'
import { Text, View, Button } from 'react-native'
import { BarCodeScanner } from 'expo-barcode-scanner'

export default function Scanner() {
  const [hasPermission, setHasPermission] = useState(null)
  const [scanned, setScanned] = useState(false)

  useEffect(() => {
    ;(async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync()
      setHasPermission(status === 'granted')
    })()
  }, [])

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true)
    alert(`Código escaneado: ${data}`)
    // aqui você pode chamar sua API ou atualizar estado
  }

  if (hasPermission === null) return <Text>Pedindo permissão...</Text>
  if (hasPermission === false) return <Text>Sem acesso à câmera</Text>

  return (
    <View style={{ flex: 1 }}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={{ flex: 1 }}
      />
      {scanned && (
        <Button title="Escanear de novo" onPress={() => setScanned(false)} />
      )}
    </View>
  )
}
