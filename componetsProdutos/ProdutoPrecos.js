import React, { useState, useEffect } from 'react'
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import Toast from 'react-native-toast-message'

import {
  apiPutComContexto,
  apiGetComContexto,
  apiPostComContexto,
} from '../utils/api'

export default function ProdutoPrecos({ atualizarProduto }) {
  const navigation = useNavigation()
  const { params } = useRoute()
  const { produto = {}, slug = {} } = params || {}
  const [precoCompra, setPrecoCompra] = useState('')
  const [percentualAVista, setPercentualAVista] = useState('10')
  const [percentualAPrazo, setPercentualAPrazo] = useState('20')
  const [precoCusto, setPrecoCusto] = useState('')
  const [aVista, setAVista] = useState('')
  const [aPrazo, setAPrazo] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!produto) return

    const carregarOuIniciarCampos = async () => {
      let tabela =
        produto.tabe_prco !== undefined
          ? produto
          : (await getTabelaPrecoExistente()) || {}

      setPrecoCompra(String(tabela.tabe_prco || ''))
      setPrecoCusto(String(tabela.tabe_cuge || ''))
      setAVista(String(tabela.tabe_avis || ''))
      setAPrazo(String(tabela.tabe_apra || ''))
      setPercentualAVista(String(tabela.percentual_avis || '10'))
      setPercentualAPrazo(String(tabela.percentual_apra || '20'))
    }

    carregarOuIniciarCampos()
  }, [produto])

  useEffect(() => {
    const preco = parseFloat(precoCompra.replace(',', '.')) || 0
    const pVista = parseFloat(percentualAVista.replace(',', '.')) || 0
    const pPrazo = parseFloat(percentualAPrazo.replace(',', '.')) || 0

    setPrecoCusto(preco.toFixed(2))
    setAVista((preco * (1 + pVista / 100)).toFixed(2))
    setAPrazo((preco * (1 + pPrazo / 100)).toFixed(2))
  }, [precoCompra, percentualAVista, percentualAPrazo])

  const getTabelaPrecoExistente = async () => {
    const { empresa, filial } = slug
    if (!empresa || !filial) return null

    const res = await apiGetComContexto(
      `produtos/tabelapreco/?tabe_prod=${produto.prod_codi}&tabe_empr=${empresa}&tabe_fili=${filial}`
    )
    return Array.isArray(res) && res.length > 0 ? res[0] : null
  }

  const salvar = async () => {
    setLoading(true)

    const payload = {
      tabe_empr: parseInt(slug?.empresa) || 1,
      tabe_fili: parseInt(slug?.filial) || 1,
      tabe_prod: parseInt(produto.prod_codi),
      tabe_prco: parseFloat(precoCompra.replace(',', '.')) || 0,
      tabe_cuge: parseFloat(precoCusto.replace(',', '.')) || 0,
      tabe_avis: parseFloat(aVista.replace(',', '.')) || 0,
      tabe_apra: parseFloat(aPrazo.replace(',', '.')) || 0,
      percentual_avis: parseFloat(percentualAVista.replace(',', '.')) || 0,
      percentual_apra: parseFloat(percentualAPrazo.replace(',', '.')) || 0,
    }

    try {
      let tabela = await getTabelaPrecoExistente()

      if (tabela) {
        await apiPutComContexto(`produtos/tabelapreco/${tabela.id}/`, payload)
      } else {
        await apiPostComContexto(`produtos/tabelapreco/`, payload)
      }

      Toast.show({
        type: 'success',
        text1: 'Sucesso!',
        text2: 'Preços atualizados com sucesso',
      })

      atualizarProduto({ ...produto, ...payload })

      setTimeout(() => navigation.goBack(), 1000)
    } catch (error) {
      console.log('🔴 payload:', payload)
      console.log('🔴 erro:', error?.response || error)

      Toast.show({
        type: 'error',
        text1: 'Erro ao salvar',
        text2: error?.response?.data
          ? JSON.stringify(error.response.data)
          : 'Tente novamente mais tarde.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Campo
        label="Preço de Compra"
        value={precoCompra}
        onChange={setPrecoCompra}
      />
      <Campo
        label="Percentual à Vista (%)"
        value={percentualAVista}
        onChange={setPercentualAVista}
      />
      <Campo
        label="Percentual a Prazo (%)"
        value={percentualAPrazo}
        onChange={setPercentualAPrazo}
      />
      <Campo label="Preço à Vista" value={aVista} editable={false} dark />
      <Campo label="Preço a Prazo" value={aPrazo} editable={false} dark />

      <TouchableOpacity
        onPress={salvar}
        style={[styles.button, loading && { opacity: 0.6 }]}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Salvar</Text>
        )}
      </TouchableOpacity>
    </View>
  )
}

function Campo({ label, value, onChange, editable = true, dark = false }) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        editable={editable}
        keyboardType="decimal-pad"
        style={[
          styles.input,
          !editable && {
            backgroundColor: dark ? '#333' : '#eee',
            color: dark ? '#fff' : '#000',
          },
        ]}
      />
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 35,
    backgroundColor: '#0B141A',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
    padding: 10,
    fontSize: 16,
    color: 'white',
  },
  label: {
    marginBottom: 4,
    fontWeight: 'bold',
    fontSize: 14,
    color: '#fff',
  },
  button: {
    backgroundColor: '#0058A2',
    padding: 12,
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
})
