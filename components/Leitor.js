import React, { useState } from 'react'
import { View, Text, Button, Modal, StyleSheet } from 'react-native'
import { CameraView } from 'expo-camera'

export default function LeitorCodigoBarras({ onProdutoLido }) {
  const [modalVisible, setModalVisible] = useState(false)
  const [scanning, setScanning] = useState(true)

  const handleBarCodeScanned = ({ data }) => {
    if (!scanning) return
    setScanning(false)
    onProdutoLido(data)
    setModalVisible(false)
    setTimeout(() => setScanning(true), 500)
  }

  return (
    <View>
      <Button title="Escanear código" onPress={() => setModalVisible(true)} />

      <Modal visible={modalVisible} animationType="slide">
        <CameraView
          style={{ flex: 1 }}
          onBarcodeScanned={handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['ean13', 'ean8', 'qr', 'upc_a', 'ean128c'],
          }}
        />
        <View style={styles.footer}>
          <Button title="Cancelar" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
})
