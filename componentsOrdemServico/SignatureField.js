import React, { useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import SignatureCanvas from 'react-native-signature-canvas'

export default function SignatureField({
  label,
  value,
  onChange,
  onSigningChange,
}) {
  const ref = useRef(null)

  const handleOK = (sig) => {
    const base64 = sig.replace(/^data:image\/\w+;base64,/, '')
    onChange(base64)
  }

  const handleClear = () => {
    ref.current?.clearSignature()
    onChange('')
  }

  const handleBegin = () => {
    onSigningChange?.(true)
  }

  const handleEnd = () => {
    onSigningChange?.(false)
    // Capturar imagem ao finalizar o traço
    ref.current?.readSignature()
  }

  const handleSave = () => {
    ref.current?.readSignature()
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pad}>
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
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.clear} onPress={handleClear}>
          <Text style={styles.clearText}>Limpar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.save} onPress={handleSave}>
          <Text style={styles.saveText}>Salvar</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const webStyle = `
.m-signature-pad { box-shadow: none; border: none; }
.m-signature-pad--body { border: 1px solid #2c3e50; background: #1a2f3d !important; touch-action: none; -ms-touch-action: none; overscroll-behavior: contain; }
.m-signature-pad--footer { display: none; }
.m-signature-pad--body canvas { background-color: #1a2f3d !important; }
.m-signature-pad--body * { user-select: none; -webkit-user-select: none; }
`

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  label: { color: '#fff', fontSize: 16, marginBottom: 6, marginTop: 10 },
  pad: {
    height: 180,
    backgroundColor: '#1a2f3d',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 6,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#2c3e50',
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
