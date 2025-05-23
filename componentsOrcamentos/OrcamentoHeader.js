import React from 'react'
import { View, TextInput, Text, StyleSheet } from 'react-native'
import BuscaClienteInput from '../components/BuscaClienteInput'
import BuscaVendedorInput from '../components/BuscaVendedorInput'
export default function OrcamentoHeader({ orcamento = {}, setOrcamento }) {
  return (
    <View style={styles.container}>
      <Text style={styles.labeldata}>Data do orcamento:</Text>
      <TextInput
        value={orcamento?.pedi_data ?? ''}
        onChangeText={(v) =>
          setOrcamento((prev) => ({ ...prev, pedi_data: v }))
        }
        style={styles.inputdata}
      />

      <Text style={styles.label}>Cliente:</Text>
      <BuscaClienteInput
        onSelect={(item) => {
          console.log('Cliente selecionado:', item)
          setOrcamento((prev) => ({
            ...prev,
            pedi_forn: item.enti_clie,
            pedi_forn_nome: item.enti_nome,
          }))
        }}
      />
      <Text style={styles.label}>Vendedor:</Text>
      <BuscaVendedorInput
        styles={styles.inputcliente}
        tipo="vendedor"
        isEdit={true}
        value={orcamento.pedi_vend}
        onSelect={(item) => {
          setOrcamento((prev) => ({
            ...prev,
            pedi_vend: item.enti_clie,
            pedi_vend_nome: item.enti_nome,
          }))
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#111a22',
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
    backgroundColor: '#0c0c24',
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
