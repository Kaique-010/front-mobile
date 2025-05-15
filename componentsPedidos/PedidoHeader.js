import React from 'react'
import { View, TextInput, Text, StyleSheet } from 'react-native'
import BuscaClienteInput from '../components/BuscaClienteInput'

export default function PedidoHeader({ pedido = {}, setPedido }) {
  // fallback vazio para pedido evita undefined

  const handleSelecionaCliente = (cliente) => {
    setPedido((prev) => ({
      ...prev,
      pedi_forn: cliente.enti_clie,
    }))
  }

  // idem para vendedor
  const handleSelecionaVendedor = (vendedor) => {
    setPedido((prev) => ({
      ...prev,
      pedi_vend: vendedor.enti_clie,
    }))
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Cliente:</Text>
      <BuscaClienteInput
        tipo="cliente"
        placeholder="Buscar cliente..."
        onSelect={handleSelecionaCliente}
      />

      <Text style={styles.label}>Vendedor:</Text>
      <BuscaClienteInput
        tipo="vendedor"
        placeholder="Buscar vendedor..."
        onSelect={handleSelecionaVendedor}
      />

      <Text style={styles.label}>Tipo de Pagamento:</Text>
      <TextInput
        value={pedido?.pedi_fina ?? ''}
        onChangeText={(v) => setPedido((prev) => ({ ...prev, pedi_fina: v }))}
        style={styles.input}
      />

      <Text style={styles.label}>Observações:</Text>
      <TextInput
        value={pedido?.pedi_obse ?? ''}
        onChangeText={(v) => setPedido((prev) => ({ ...prev, pedi_obse: v }))}
        style={[styles.input, { height: 80 }]}
        multiline
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#233f4d',
  },
  label: {
    color: 'white',
    marginTop: 10,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#232935',
    borderRadius: 8,
    padding: 10,
    color: 'white',
  },
})
