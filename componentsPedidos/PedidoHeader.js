import React, { useEffect, useState } from 'react'
import { View, TextInput, Text, StyleSheet } from 'react-native'
import DatePickerCrossPlatform from '../components/DatePickerCrossPlatform'
import { Picker } from '@react-native-picker/picker'
import { MaterialIcons } from '@expo/vector-icons'
import BuscaClienteInput from '../components/BuscaClienteInput'
import BuscaVendedorInput from '../components/BuscaVendedorInput'
import { apiGetComContexto } from '../utils/api'

export default function PedidoHeader({ pedido = {}, setPedido }) {
  const [carregandoCliente, setCarregandoCliente] = useState(false)

  useEffect(() => {
    const buscarDadosCliente = async () => {
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
      <View style={styles.fieldContainer}>
        <View style={styles.labelContainer}>
          <MaterialIcons name="event" size={12} color="#18b7df" />
          <Text style={styles.label}>Data do Pedido</Text>
        </View>
        <DatePickerCrossPlatform
          value={pedido?.pedi_data || ''}
          onChange={(date) => {
            if (date instanceof Date && !isNaN(date.getTime())) {
              const ano = date.getFullYear()
              const mes = String(date.getMonth() + 1).padStart(2, '0')
              const dia = String(date.getDate()).padStart(2, '0')
              const iso = `${ano}-${mes}-${dia}`
              setPedido((prev) => ({ ...prev, pedi_data: iso }))
            }
          }}
          style={styles.input}
          textStyle={{ color: '#faebd7', fontSize: 16 }}
          placeholder="Selecione a data"
        />
      </View>

      <View style={styles.fieldContainer}>
        <View style={styles.labelContainer}>
          <MaterialIcons name="person" size={12} color="#18b7df" />
          <Text style={styles.label}>Cliente</Text>
        </View>
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
          style={styles.searchInput}
        />
      </View>

      <View style={styles.fieldContainer}>
        <View style={styles.labelContainer}>
          <MaterialIcons name="work" size={12} color="#18b7df" />
          <Text style={styles.label}>Vendedor</Text>
        </View>
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
          style={styles.searchInput}
        />
      </View>

      <View style={styles.fieldContainer}>
        <View style={styles.labelContainer}>
          <MaterialIcons name="payment" size={12} color="#18b7df" />
          <Text style={styles.label}>Tipo de Financeiro</Text>
        </View>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={pedido?.pedi_fina ?? '0'}
            onValueChange={(val) =>
              setPedido((prev) => ({
                ...prev,
                pedi_fina: val,
              }))
            }
            style={styles.picker}
            dropdownIconColor="#18b7df">
            <Picker.Item label="À Vista" value="0" />
            <Picker.Item label="A Prazo" value="1" />
            <Picker.Item label="Sem Financeiro" value="2" />
            <Picker.Item label="Na emissão" value="3" />
          </Picker>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a252f',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a3441',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a3441',
  },
  title: {
    color: '#faebd7',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    color: '#18b7df',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  input: {
    backgroundColor: '#232935',
    borderRadius: 8,
    padding: 12,
    color: '#faebd7',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#3a4651',
  },
  searchInput: {
    backgroundColor: '#232935',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3a4651',
  },
  pickerContainer: {
    backgroundColor: '#232935',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3a4651',
    overflow: 'hidden',
  },
  picker: {
    color: '#faebd7',
    backgroundColor: '#232935',
  },
})
