import React, { useEffect, useState } from 'react'
import { View, TextInput, Text, StyleSheet } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import BuscaClienteInput from '../components/BuscaClienteInput'
import BuscaVendedorInput from '../components/BuscaVendedorInput'
import { apiGetComContexto } from '../utils/api'

export default function OrcamentoHeader({ orcamento = {}, setOrcamento }) {
  const [carregandoCliente, setCarregandoCliente] = useState(false)

  useEffect(() => {
    const buscarDadosCliente = async () => {
      if (orcamento?.pedi_forn && !orcamento?.pedi_forn_nome) {
        setCarregandoCliente(true)
        try {
          const entidade = await apiGetComContexto(
            `entidades/entidades/${orcamento.pedi_forn}/`
          )
          if (entidade) {
            setOrcamento((prev) => ({
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
  }, [orcamento?.pedi_forn])

  const clienteFormatado =
    orcamento?.pedi_forn && orcamento?.pedi_forn_nome
      ? `${orcamento.pedi_forn} - ${orcamento.pedi_forn_nome}`
      : ''

  const vendedorFormatado =
    orcamento?.pedi_vend && orcamento?.pedi_vend_nome
      ? `${orcamento.pedi_vend} - ${orcamento.pedi_vend_nome}`
      : ''

  return (
    <View style={styles.container}>
      <View style={styles.headerTitle}>
        <MaterialIcons name="description" size={24} color="#10a2a7" />
        <Text style={styles.title}>Dados do Orçamento</Text>
      </View>

      <View style={styles.fieldContainer}>
        <View style={styles.labelContainer}>
          <MaterialIcons name="event" size={16} color="#10a2a7" />
          <Text style={styles.label}>Data do Orçamento</Text>
        </View>
        <TextInput
          value={orcamento?.pedi_data ?? ''}
          onChangeText={(v) =>
            setOrcamento((prev) => ({ ...prev, pedi_data: v }))
          }
          style={styles.input}
          placeholder="DD/MM/AAAA"
          placeholderTextColor="#666"
        />
      </View>

      <View style={styles.fieldContainer}>
        <View style={styles.labelContainer}>
          <MaterialIcons name="person" size={16} color="#10a2a7" />
          <Text style={styles.label}>Cliente</Text>
        </View>
        <BuscaClienteInput
          value={clienteFormatado}
          onSelect={(item) => {
            if (!item) {
              setOrcamento((prev) => ({
                ...prev,
                pedi_forn: null,
                pedi_forn_nome: null,
              }))
              return
            }
            setOrcamento((prev) => ({
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
          <MaterialIcons name="work" size={16} color="#10a2a7" />
          <Text style={styles.label}>Vendedor</Text>
        </View>
        <BuscaVendedorInput
          value={vendedorFormatado}
          onSelect={(item) => {
            if (!item) {
              setOrcamento((prev) => ({
                ...prev,
                pedi_vend: null,
                pedi_vend_nome: null,
              }))
              return
            }
            setOrcamento((prev) => ({
              ...prev,
              pedi_vend: item.enti_clie,
              pedi_vend_nome: item.enti_nome,
            }))
          }}
          style={styles.searchInput}
        />
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
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
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
    color: '#10a2a7',
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
})
