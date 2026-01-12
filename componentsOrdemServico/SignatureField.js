import React, { useRef, useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import SignatureCanvas from 'react-native-signature-canvas'

export default function SignatureField({
  label,
  value, // base64 VINDO DO BACKEND
  onChange,
  onSigningChange,
  readOnly = false, // permite só exibir a assinatura
}) {
  const ref = useRef(null)
  const [loadedImage, setLoadedImage] = useState(null)

  // Carregar imagem salva se existir
  useEffect(() => {
    if (value) {
      setLoadedImage(`data:image/png;base64,${value}`)
    } else {
      setLoadedImage(null)
    }
  }, [value])

  const handleOK = (sig) => {
    const base64 = sig.replace(/^data:image\/\w+;base64,/, '')
    onChange?.(base64)
  }

  const handleClear = () => {
    ref.current?.clearSignature()
    setLoadedImage(null)
    onChange?.('')
  }

  const handleBegin = () => onSigningChange?.(true)
  const handleEnd = () => {
    onSigningChange?.(false)
    ref.current?.readSignature()
  }

  const handleSave = () => ref.current?.readSignature()

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.pad}>
        {/* Caso haja assinatura salva, exibe por cima do canvas */}
        {loadedImage && (
          <Image
            source={{ uri: loadedImage }}
            style={styles.preview}
            resizeMode="contain"
          />
        )}

        {!readOnly && (
          <SignatureCanvas
            ref={ref}
            onOK={handleOK}
            onBegin={handleBegin}
            onEnd={handleEnd}
            webStyle={webStyle}
            backgroundColor="#1a2f3d"
            penColor="#10a2a7"
            dotSize={0}
            minWidth={1.8}
            maxWidth={3.6}
            velocityFilterWeight={0.2}
          />
        )}
      </View>

      {!readOnly && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.clear} onPress={handleClear}>
            <Text style={styles.clearText}>Limpar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const webStyle = `
.m-signature-pad { box-shadow: none; border: none; }
.m-signature-pad--body { border: 1px solid #2c3e50; background: #1a2f3d !important; touch-action: none; overscroll-behavior: contain; }
.m-signature-pad--footer { display: none; }
.m-signature-pad--body canvas { background-color: #1a2f3d !important; }
.m-signature-pad--body * { user-select: none; -webkit-user-select: none; }
`

const styles = StyleSheet.create({
  container: { marginBottom: 30 },
  label: { color: '#fff', fontSize: 16, marginBottom: 6, marginTop: 10 },
  pad: {
    height: 180,
    backgroundColor: '#1a2f3d',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#2c3e50',
    position: 'relative',
  },
  preview: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 10,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  clear: {
    alignSelf: 'flex-end',
    backgroundColor: '#666',
    padding: 8,
    borderRadius: 6,
    marginTop: 6,
  },
  clearText: { color: '#fff' },
  save: {
    alignSelf: 'flex-end',
    backgroundColor: '#10a2a7',
    padding: 8,
    borderRadius: 6,
    marginTop: 6,
    marginLeft: 8,
  },
  saveText: { color: '#fff', fontWeight: 'bold' },
})
