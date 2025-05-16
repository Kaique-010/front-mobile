import React from 'react'
import { View, TextInput, Text, StyleSheet } from 'react-native'
import { Picker } from '@react-native-picker/picker'
import BuscaClienteInput from '../components/BuscaClienteInput'

export default function PedidoHeader({ pedido = {}, setPedido }) {
  return (
    <View style={styles.container}>
      <Text style={styles.labeldata}>Data do Pedido:</Text>
      <TextInput
        value={pedido?.pedi_data ?? ''}
        onChangeText={(v) => setPedido((prev) => ({ ...prev, pedi_data: v }))}
        style={styles.inputdata}
      />

      <Text style={styles.label}>Cliente:</Text>
      <BuscaClienteInput
        onSelect={(item) => {
          console.log('Cliente selecionado:', item)
          setPedido((prev) => ({
            ...prev,
            pedi_forn: item.enti_clie,
            pedi_forn_nome: item.enti_nome,
          }))
        }}
      />
      <Text style={styles.label}>Vendedor:</Text>
      <BuscaClienteInput
        styles={styles.inputcliente}
        onSelect={(item) => {
          console.log('Vendedor selecionado:', item)
          setPedido((prev) => ({
            ...prev,
            pedi_vend: item.enti_clie,
            pedi_vend_nome: item.enti_nome,
          }))
        }}
      />

      <Text style={styles.label}>Financeiro:</Text>
      <Picker
        selectedValue={pedido?.pedi_fina ?? '0'}
        onValueChange={(val) =>
          setPedido((prev) => ({
            ...prev,
            pedi_fina: val,
          }))
        }
        style={{
          color: '#fff',
          backgroundColor: '#232935',
          marginTop: 5,
          marginBottom: 5,
          borderRadius: 10,
        }}>
        <Picker.Item label="À Vista" value="0" />
        <Picker.Item label="A Prazo" value="1" />
        <Picker.Item label="Sem Financeiro" value="2" />
        <Picker.Item label="Na emissão" value="3" />
      </Picker>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#1a2f3d',
  },
  label: {
    color: '#faebd7',
    marginTop: 10,
    marginBottom: 5,
    fontWeight: 'bold',
    fontSize: 15,
    textDecorationLine: 'underline',
  },
  labeldata: {
    color: '#faebd7',
    marginBottom: 10,
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'right',
    textDecorationLine: 'underline',
  },
  inputdata: {
    textDecorationLine: 'underline',
    borderRadius: 8,
    color: 'white',
    textAlign: 'right',
  },
  inputcliente: {
    backgroundColor: '#232935',
    borderRadius: 8,
    padding: 10,
    color: 'white',
  },
  input: {
    backgroundColor: '#232935',
    borderRadius: 8,
    padding: 10,
    color: 'white',
  },

  clienteInput: {
    backgroundColor: '#232935',
    borderRadius: 8,
    padding: 10,
    color: 'white',
  },
  vendedorInput: {
    backgroundColor: '#232935',
    borderRadius: 8,
    padding: 10,
    color: 'white',
  },
})
