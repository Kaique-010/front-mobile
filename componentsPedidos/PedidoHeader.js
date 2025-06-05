import React, { useEffect, useState } from 'react'
import { View, TextInput, Text, StyleSheet } from 'react-native'
import { Picker } from '@react-native-picker/picker'
import BuscaClienteInput from '../components/BuscaClienteInput'
import BuscaVendedorInput from '../components/BuscaVendedorInput'
import { apiGetComContexto } from '../utils/api'

export default function PedidoHeader({ pedido = {}, setPedido }) {
  const [carregandoCliente, setCarregandoCliente] = useState(false)

  useEffect(() => {
    const buscarDadosCliente = async () => {
      // Se temos o código do cliente mas não o nome, busca os dados
      if (pedido?.pedi_forn && !pedido?.pedi_forn_nome) {
        setCarregandoCliente(true)
        try {
          const entidade = await apiGetComContexto(
            `entidades/entidades/${pedido.pedi_forn}/`
          )
          if (entidade) {
            setPedido((prev) => ({
              ...prev,
              pedi_forn_nome: entidade.enti_nome,
            }))
          }
        } catch (err) {
          console.error('Erro ao buscar dados do cliente:', err)
        } finally {
          setCarregandoCliente(false)
        }
      }
    }

    buscarDadosCliente()
  }, [pedido?.pedi_forn])

  const clienteFormatado =
    pedido?.pedi_forn && pedido?.pedi_forn_nome
      ? `${pedido.pedi_forn} - ${pedido.pedi_forn_nome}`
      : ''

  const vendedorFormatado =
    pedido?.pedi_vend && pedido?.pedi_vend_nome
      ? `${pedido.pedi_vend} - ${pedido.pedi_vend_nome}`
      : ''

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
        value={clienteFormatado}
        onSelect={(item) => {
          if (!item) {
            setPedido((prev) => ({
              ...prev,
              pedi_forn: null,
              pedi_forn_nome: null,
            }))
            return
          }
          setPedido((prev) => ({
            ...prev,
            pedi_forn: item.enti_clie,
            pedi_forn_nome: item.enti_nome,
          }))
        }}
      />

      <Text style={styles.label}>Vendedor:</Text>
      <BuscaVendedorInput
        value={vendedorFormatado}
        onSelect={(item) => {
          if (!item) {
            setPedido((prev) => ({
              ...prev,
              pedi_vend: null,
              pedi_vend_nome: null,
            }))
            return
          }
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
