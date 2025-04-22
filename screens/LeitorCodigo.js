import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { RNCamera } from 'react-native-camera'

export default function LeitorCodigo({ onCodigoDetectado, navigation }) {
  const [scanned, setScanned] = useState(false)

  const handleBarCodeScanned = ({ data }) => {
    setScanned(true)
    Alert.alert('Código escaneado', data)
    onCodigoDetectado(data) // Envia o código para o componente pai
    navigation.goBack() // Fecha o modal após escanear
  }

  return (
    <View style={styles.container}>
      <RNCamera
        style={styles.camera}
        type={RNCamera.Constants.Type.back}
        onBarCodeRead={scanned ? undefined : handleBarCodeScanned}
        captureAudio={false}>
        <View style={styles.overlay} />
        <Text style={styles.texto}>Escaneie o código de barras</Text>
      </RNCamera>
      {scanned && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => setScanned(false)}>
          <Text style={styles.buttonText}>Escanear novamente</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  camera: { flex: 1, width: '100%' },
  overlay: {
    position: 'absolute',
    width: '80%',
    height: '50%',
    borderColor: '#fff',
    borderWidth: 2,
    borderRadius: 10,
    borderStyle: 'dashed',
  },
  texto: {
    position: 'absolute',
    bottom: 40,
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  button: {
    position: 'absolute',
    bottom: 100,
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
})
