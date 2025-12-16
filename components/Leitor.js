import React, { useState } from 'react'
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native'
import { CameraView } from 'expo-camera'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'

export default function LeitorCodigoBarras({ onProdutoLido }) {
  const [modalVisible, setModalVisible] = useState(false)
  const [scanning, setScanning] = useState(true)
  const navigation = useNavigation()

  const handleBarCodeScanned = ({ data }) => {
    if (!scanning) return
    setScanning(false)
    onProdutoLido(data)
    setModalVisible(false)
    setTimeout(() => setScanning(true), 500)
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.botao}
        onPress={() => setModalVisible(true)}>
        <Ionicons name="barcode-outline" size={20} color="#fff" />
        <Text style={styles.botaoTexto}>Escanear Código</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.botaoCancelarleitura}
        onPress={() => {
          setModalVisible(false)
          navigation.goBack()
        }}>
        <Ionicons name="close-outline" size={20} color="#fff" />
        <Text style={styles.cancelarTexto}>Cancelar Leitura</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide">
        <CameraView
          style={{ flex: 1 }}
          onBarcodeScanned={handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['ean13', 'ean8', 'code128', 'code39'],
          }}
        />

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.botaoCancelar}
            onPress={() => setModalVisible(false)}>
            <Ionicons name="close-outline" size={20} color="#fff" />
            <Text style={styles.cancelarTexto}>Cancelar Leitura</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 20,
  },
  botao: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10a2a7',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  botaoCancelar: {
    flexDirection: 'row',
    backgroundColor: '#d11a2a',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelarTexto: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
  },
  botaoCancelarleitura: {
    flexDirection: 'row',
    backgroundColor: '#d11a2a',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 600,
  },
})
