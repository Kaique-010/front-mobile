import React, { useEffect, useState } from 'react'
import { View, TextInput, Text, StyleSheet } from 'react-native'
import BuscaClienteInput from '../components/BuscaClienteInput'
import BuscaVendedorInput from '../components/BuscaVendedorInput'
import { apiGetComContexto } from '../utils/api'

export default function OrcamentoHeader({ orcamento = {}, setOrcamento }) {
  const [carregandoCliente, setCarregandoCliente] = useState(false)

  useEffect(() => {
    const buscarDadosCliente = async () => {
      // Se temos o código do cliente mas não o nome, busca os dados
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
      />

      <Text style={styles.label}>Vendedor:</Text>
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
