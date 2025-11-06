import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import BuscaClienteInput from '../components/BuscaClienteInput'
import BuscaVendedorInput from '../components/BuscaVendedorInput'
import { apiGetComContexto } from '../utils/api'
import DataPicker from '../componetsPisos/DataComponent'



export default function PedidoPisosHeader({ pedido = {}, setPedido }) {
  const [carregandoCliente, setCarregandoCliente] = useState(false)

  useEffect(() => {
    const buscarDadosCliente = async () => {
      if (pedido?.pedi_clie && !pedido?.pedi_clie_nome) {
        setCarregandoCliente(true)
        try {
          const entidade = await apiGetComContexto(
            `entidades/entidades/${pedido.pedi_clie}/`
          )
          if (entidade) {
            setPedido((prev) => ({
              ...prev,
              pedi_clie_nome: entidade.enti_nome,
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
  }, [pedido?.pedi_clie])

  const clienteFormatado =
    pedido?.pedi_clie && pedido?.pedi_clie_nome
      ? `${pedido.pedi_clie} - ${pedido.pedi_clie_nome}`
      : ''

  const vendedorFormatado =
    pedido?.pedi_vend && pedido?.pedi_vend_nome
      ? `${pedido.pedi_vend} - ${pedido.pedi_vend_nome}`
      : ''

  return (
    <View style={styles.container}>
      {/* Data do Pedido */}
      <View style={styles.fieldContainer}>
        <View style={styles.labelContainer}>
          <MaterialIcons name="event" size={12} color="#18b7df" />
          <Text style={styles.label}>Data do Pedido</Text>
        </View>
        <DataPicker
          label="Data do Pedido"
          valor={pedido?.pedi_data ?? ''}
          onChange={(date) =>
            setPedido((prev) => ({ ...prev, pedi_data: date }))
          }
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#777"
        />
      </View>
      {/* Data de Previsão de Entrega */}
      <View style={styles.fieldContainer}>
        <View style={styles.labelContainer}>
          <MaterialIcons name="event" size={12} color="#18b7df" />
          <Text style={styles.label}>Data de Previsão de Entrega</Text>
        </View>
        <DataPicker
          label="Data de Previsão de Entrega"
          valor={pedido?.pedi_data_prev_entr ?? ''}
          onChange={(date) =>
            setPedido((prev) => ({ ...prev, pedi_data_prev_entr: date }))
          }
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#777"
        />
      </View>

      {/* Cliente */}
      <View style={styles.fieldContainer}>
        <View style={styles.labelContainer}>
          <MaterialIcons name="person" size={12} color="#10a2a7" />
          <Text style={styles.label}>Cliente</Text>
        </View>
        <BuscaClienteInput
          value={clienteFormatado}
          onSelect={(item) => {
            if (!item) {
              setPedido((prev) => ({
                ...prev,
                pedi_clie: null,
                pedi_clie_nome: null,
              }))
              return
            }
            setPedido((prev) => ({
              ...prev,
              pedi_clie: item.enti_clie,
              pedi_clie_nome: item.enti_nome,
            }))
          }}
          style={styles.searchInput}
        />
      </View>

      {/* Vendedor */}
      <View style={styles.fieldContainer}>
        <View style={styles.labelContainer}>
          <MaterialIcons name="person-outline" size={12} color="#18b7df" />
          <Text style={styles.label}>Vendedor</Text>
        </View>
        <BuscaVendedorInput
          value={vendedorFormatado}
          onSelect={(vendedor) => {
            console.log('Vendedor selecionado:', vendedor)
            setPedido((prev) => ({
              ...prev,
              pedi_vend: vendedor.enti_clie || vendedor.enti_clie,
              pedi_vend_nome: vendedor.enti_nome,
            }))
          }}
          placeholder="Buscar vendedor..."
        />
      </View>

      {/* Observações */}
      <View style={styles.fieldContainer}>
        <View style={styles.labelContainer}>
          <MaterialIcons name="note" size={12} color="#18b7df" />
          <Text style={styles.label}>Observações</Text>
        </View>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={pedido?.pedi_obse ?? ''}
          onChangeText={(text) =>
            setPedido((prev) => ({ ...prev, pedi_obse: text }))
          }
          placeholder="Observações gerais do pedido"
          placeholderTextColor="#777"
          multiline
          numberOfLines={3}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    margin: 5,
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#a8e6cf',
  },
  fieldContainer: {
    marginBottom: 30,
    flex: 1,
    marginTop: 3,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderColor: '#444',
    borderWidth: 1,
    borderRadius: 6,
    color: '#fff',
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  debugContainer: {
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  debugText: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sectionTitle: {
    color: '#18b7df',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  switchContainer: {
    marginTop: 10,
  },
  switchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  switchLabel: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
})
