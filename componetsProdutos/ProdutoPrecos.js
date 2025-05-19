import React, { useState, useEffect } from 'react'
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native'
import {
  apiPut,
  apiPutComContexto,
  apiGetComContexto,
  apiPostComContexto,
} from '../utils/api'

export default function ProdutoPrecos({ produto, atualizarProduto, slug }) {
  const [precoCompra, setPrecoCompra] = useState('')
  const [percentualAVista, setPercentualAVista] = useState('10')
  const [percentualAPrazo, setPercentualAPrazo] = useState('20')
  const [precoCusto, setPrecoCusto] = useState('')
  const [aVista, setAVista] = useState('')
  const [aPrazo, setAPrazo] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setPrecoCompra(String(produto.tabe_prco || ''))
    setPrecoCusto(String(produto.tabe_cuge || ''))
    setAVista(String(produto.tabe_avis || ''))
    setAPrazo(String(produto.tabe_apra || ''))
    setPercentualAVista(String(produto.percentual_avis || '10'))
    setPercentualAPrazo(String(produto.percentual_apra || '20'))
  }, [produto])

  useEffect(() => {
    const preco = parseFloat(precoCompra.replace(',', '.')) || 0
    const pVista = parseFloat(percentualAVista.replace(',', '.')) || 0
    const pPrazo = parseFloat(percentualAPrazo.replace(',', '.')) || 0

    setPrecoCusto(preco.toFixed(2))
    setAVista((preco * (1 + pVista / 100)).toFixed(2))
    setAPrazo((preco * (1 + pPrazo / 100)).toFixed(2))
  }, [precoCompra, percentualAVista, percentualAPrazo])

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
      const res = await apiGetComContexto(
        `produtos/tabelapreco/?produto_id=${produto.prod_codi}`
      )

      if (Array.isArray(res) && res.length > 0) {
        const idExistente = res[0].id
        await apiPutComContexto(`produtos/tabelapreco/${idExistente}/`, payload)
      } else {
        try {
          await apiPostComContexto(`produtos/tabelapreco/`, payload)
        } catch (err) {
          if (err?.response?.status === 400 && err.response.data?.tabe_empr) {
            // fallback: faz GET de novo e tenta PUT
            const retry = await apiGetComContexto(
              `produtos/tabelapreco/?produto_id=${produto.prod_codi}`
            )
            if (retry.length > 0) {
              const id = retry[0].id
              await apiPutComContexto(`produtos/tabelapreco/${id}/`, payload)
            }
          } else {
            throw err
          }
        }
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao salvar os preços.')
      console.log('🔴 payload:', payload)
      console.log('🔴 erro:', error)
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
          !editable && { backgroundColor: dark ? '#333' : '#eee' },
        ]}
      />
    </>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 35, backgroundColor: '#0B141A' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
    padding: 10,
    fontSize: 16,
    color: 'white',
  },
  label: { marginBottom: 4, fontWeight: 'bold', fontSize: 14, color: '#fff' },
  button: {
    backgroundColor: '#0058A2',
    padding: 12,
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: { color: 'white', fontWeight: 'bold' },
})
