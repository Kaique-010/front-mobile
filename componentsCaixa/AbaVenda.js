import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import BuscaClienteInput from '../components/BuscaClienteInput'
import BuscaVendedorInput from '../components/BuscaVendedorInput'
import { Ionicons } from '@expo/vector-icons'

function CampoResultado({ label, valor, onClear }) {
  if (!valor) return null
  return (
    <View style={styles.resultadoContainer}>
      <Text style={styles.resultado}>
        {label}: {valor}
      </Text>
      <TouchableOpacity onPress={onClear}>
        <Ionicons name="close-circle" size={20} color="#f55" />
      </TouchableOpacity>
    </View>
  )
}

export default function AbaVenda({ mov, setMov }) {
  return (
    <View style={styles.scene}>
      <View style={styles.inputWrapper}>
        <Text style={styles.label}>
          <Ionicons name="person-outline" size={20} color="#aaa" />
          Cliente:
        </Text>
        <BuscaClienteInput
          inputStyle={styles.input}
          onSelect={(item) =>
            setMov((prev) => ({
              ...prev,
              movi_clie: item.enti_clie,
              movi_clie_nome: item.enti_nome,
            }))
          }
        />
        <CampoResultado
          label="Cliente"
          valor={mov.movi_clie_nome}
          onClear={() =>
            setMov((prev) => ({
              ...prev,
              movi_clie: null,
              movi_clie_nome: '',
            }))
          }
        />
      </View>

      <View style={styles.inputWrapper}>
        <Text style={styles.label}>
          <Ionicons name="business-outline" size={20} color="#aaa" />
          Vendedor:
        </Text>
        <BuscaVendedorInput
          tipo="vendedor"
          isEdit={true}
          value={mov.movi_vend}
          inputStyle={styles.input}
          onSelect={(item) =>
            setMov((prev) => ({
              ...prev,
              movi_vend: item.enti_clie,
              movi_vend_nome: item.enti_nome,
            }))
          }
        />
        <CampoResultado
          label="Vendedor"
          valor={mov.movi_vend_nome}
          onClear={() =>
            setMov((prev) => ({
              ...prev,
              movi_vend: null,
              movi_vend_nome: '',
            }))
          }
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  scene: {
    flex: 1,
    padding: 40,
  },
  inputWrapper: {
    marginBottom: 30,
  },
  label: {
    color: '#bbb',
    marginBottom: 15,
    fontSize: 20,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: '#fff',
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  resultadoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  resultado: {
    color: '#faebd7',
    fontSize: 16,
  },
})
