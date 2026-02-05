import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native'
import { CameraView } from 'expo-camera'
import { Ionicons } from '@expo/vector-icons'

const { width } = Dimensions.get('window')

export default function LeitorConsulta({
  visible,
  onClose,
  onCodigoLido,
  statusLeitura, // 'idle', 'loading', 'success', 'error', 'not_found'
}) {
  const [scanning, setScanning] = useState(true)

  // Reiniciar scanning quando o modal abre ou quando o status volta para idle
  useEffect(() => {
    if (visible && statusLeitura === 'idle') {
      setScanning(true)
    }
  }, [visible, statusLeitura])

  const handleBarCodeScanned = ({ data }) => {
    if (!scanning || statusLeitura === 'loading' || statusLeitura === 'success')
      return

    setScanning(false)
    onCodigoLido(data)
  }

  // Renderiza o feedback visual baseado no status
  const renderOverlay = () => {
    if (statusLeitura === 'loading') {
      return (
        <View style={styles.overlayCenter}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.statusText}>Consultando...</Text>
        </View>
      )
    }

    if (statusLeitura === 'success') {
      return (
        <View style={[styles.overlayCenter, { backgroundColor: 'rgba(0,150,0,0.7)' }]}>
          <Ionicons name="checkmark-circle" size={80} color="#fff" />
          <Text style={styles.statusText}>Produto Encontrado!</Text>
        </View>
      )
    }

    if (statusLeitura === 'not_found') {
      return (
        <View style={[styles.overlayCenter, { backgroundColor: 'rgba(200,0,0,0.7)' }]}>
          <Ionicons name="close-circle" size={80} color="#fff" />
          <Text style={styles.statusText}>Produto não encontrado</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => setScanning(true)}>
            <Text style={styles.retryText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      )
    }

    if (statusLeitura === 'error') {
      return (
        <View style={[styles.overlayCenter, { backgroundColor: 'rgba(200,0,0,0.7)' }]}>
          <Ionicons name="alert-circle" size={80} color="#fff" />
          <Text style={styles.statusText}>Erro na consulta</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => setScanning(true)}>
            <Text style={styles.retryText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      )
    }

    return (
      <View style={styles.scanArea}>
        <View style={styles.scanFrame} />
        <Text style={styles.scanText}>Aponte para o código</Text>
      </View>
    )
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        <CameraView
          style={styles.camera}
          onBarcodeScanned={handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: [
              'aztec',
              'codabar',
              'code128',
              'code39',
              'code93',
              'datamatrix',
              'ean13',
              'ean8',
              'itf14',
              'pdf417',
              'qr',
              'upc_e',
            ],
          }}
        >
          <View style={styles.layerContainer}>
            {renderOverlay()}

            <View style={styles.header}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={30} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  layerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  closeButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  scanArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: width * 0.7,
    height: width * 0.7,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'transparent',
    borderRadius: 12,
  },
  scanText: {
    color: '#fff',
    marginTop: 20,
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    overflow: 'hidden',
  },
  overlayCenter: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 5,
  },
  statusText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 30,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
  },
})
