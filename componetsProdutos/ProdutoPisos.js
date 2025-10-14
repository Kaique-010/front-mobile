import React, { useState, useEffect } from 'react'
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Toast from 'react-native-toast-message'
import { apiPatchComContexto } from '../utils/api'

export default function ProdutoPisos({
  produto = {},
  slug = '',
  atualizarProduto: propAtualizarProduto,
}) {
  const navigation = useNavigation()
  const atualizarProduto = propAtualizarProduto

  const [m2PPorCaixa, setM2PPorCaixa] = useState('')
  const [pcPorCaixa, setPcPorCaixa] = useState('')
  const [kgPorCaixa, setKgPorCaixa] = useState('')
  const [empresaId, setEmpresaId] = useState('')
  const [loading, setLoading] = useState(false)

  const validarCampos = () => {
    if (!m2PPorCaixa || parseFloat(m2PPorCaixa) <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'O m2 por caixa deve ser maior que zero',
      })
      return false
    }

    if (!pcPorCaixa || parseFloat(pcPorCaixa) < 0) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Peças  por caixa deve ser maior ou igual a zero',
      })
      return false
    }

    if (!kgPorCaixa || parseFloat(kgPorCaixa) < 0) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Kg por caixa deve ser maior ou igual a zero',
      })
      return false
    }

    return true
  }

  useEffect(() => {
    const carregarContexto = async () => {
      try {
        const empresaIdStorage = await AsyncStorage.getItem('empresaId')
        setEmpresaId(empresaIdStorage || '1')
      } catch (error) {
        console.error('Erro ao carregar empresaId:', error)
      }
    }
    carregarContexto()
  }, [])

  // Pré-preenche os campos com valores atuais do produto quando disponíveis
  useEffect(() => {
    try {
      if (produto) {
        if (
          produto.prod_cera_m2cx !== undefined &&
          produto.prod_cera_m2cx !== null
        ) {
          setM2PPorCaixa(String(produto.prod_cera_m2cx).replace('.', ','))
        }
        if (
          produto.prod_cera_pccx !== undefined &&
          produto.prod_cera_pccx !== null
        ) {
          setPcPorCaixa(String(produto.prod_cera_pccx).replace('.', ','))
        }
        if (
          produto.prod_cera_kgcx !== undefined &&
          produto.prod_cera_kgcx !== null
        ) {
          setKgPorCaixa(String(produto.prod_cera_kgcx).replace('.', ','))
        }
      }
    } catch (error) {
      console.warn('Falha ao pré-preencher campos de pisos:', error)
    }
  }, [produto])

  const salvar = async () => {
    if (!validarCampos()) return

    if (!produto?.prod_codi) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Produto inválido: código não informado',
      })
      return
    }

    setLoading(true)

    // Buscar sempre do AsyncStorage
    const empresaIdStorage = await AsyncStorage.getItem('empresaId')
    const filialIdStorage = await AsyncStorage.getItem('filialId')

    const payload = {
      prod_empr: parseInt(empresaIdStorage) || 1,
      prod_fili: parseInt(filialIdStorage) || 1,
      prod_codi: String(produto.prod_codi),
      // Alinha com campos do backend (Produtos.models): prod_cera_m2cx e prod_cera_pccx
      prod_cera_m2cx: parseFloat(m2PPorCaixa.replace(',', '.')) || 0,
      prod_cera_pccx: parseFloat(pcPorCaixa.replace(',', '.')) || 0,
      prod_cera_kgcx: parseFloat(kgPorCaixa.replace(',', '.')) || 0,
    }
    console.log('payload', payload)

    const empresa = produto?.prod_empr || payload.prod_empr
    const codigo = String(produto.prod_codi)
    const endpoint = `produtos/produtos/${empresa}/${codigo}/`
    console.log('endpoint', endpoint)

    try {
      const response = await apiPatchComContexto(endpoint, payload, 'prod_')

      // Atualizar o cache com os dados retornados da API
      const dadosAtualizados = response?.data || response || {}

      // Verificar se dadosAtualizados não é undefined antes de armazenar
      if (dadosAtualizados) {
        await AsyncStorage.setItem(
          `precos-produto-${produto.prod_codi}`,
          JSON.stringify(dadosAtualizados)
        )
      }

      Toast.show({
        type: 'success',
        text1: 'Sucesso!',
        text2: 'Dados de Pisos atualizados com sucesso',
      })

      // Atualizar o produto localmente com os campos salvos
      const novosCampos = {
        prod_cera_m2cx: payload.prod_cera_m2cx,
        prod_cera_pccx: payload.prod_cera_pccx,
        prod_cera_kgcx: payload.prod_cera_kgcx,
      }
      atualizarProduto({
        ...produto,
        ...novosCampos,
        ...(dadosAtualizados || {}),
      })
      setTimeout(() => navigation.goBack(), 1000)
    } catch (error) {
      console.error('Erro ao salvar produtos:', error)
      const status = error?.response?.status
      const data = error?.response?.data
      let mensagem = 'Não foi possível salvar os dados de Pisos.'

      if (status === 404) {
        mensagem = 'Produto não encontrado para atualização.'
      } else if (status === 400) {
        if (data && typeof data === 'object') {
          const detalhes = Object.entries(data)
            .map(
              ([campo, msgs]) =>
                `${campo}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`
            )
            .join('\n')
          mensagem = `Dados inválidos:\n${detalhes}`
        } else {
          mensagem = data || mensagem
        }
      }

      Toast.show({ type: 'error', text1: 'Erro', text2: mensagem })
    } finally {
      setLoading(false)
    }
  }

  const formatarNumero = (valor) => {
    // Remove caracteres não numéricos exceto vírgula
    const numero = valor.replace(/[^\d,]/g, '')
    // Garante apenas uma vírgula
    const partes = numero.split(',')
    if (partes.length > 2) {
      return partes[0] + ',' + partes[1]
    }
    return numero
  }

  return (
    <ScrollView style={styles.container}>
      <Campo
        label="M2 por Caixa"
        value={m2PPorCaixa}
        onChange={(valor) => setM2PPorCaixa(formatarNumero(valor))}
        placeholder="0,00"
      />
      <Campo
        label="Peça Por Caixa"
        value={pcPorCaixa}
        onChange={(valor) => setPcPorCaixa(formatarNumero(valor))}
        placeholder="0,00"
      />
      <Campo
        label="Kg por caixa"
        value={kgPorCaixa}
        onChange={(valor) => setKgPorCaixa(formatarNumero(valor))}
        placeholder="0,00"
      />
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
    </ScrollView>
  )
}

function Campo({
  label,
  value,
  onChange,
  editable = true,
  dark = false,
  placeholder,
}) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        editable={editable}
        keyboardType="decimal-pad"
        placeholder={placeholder}
        placeholderTextColor={dark ? '#666' : '#999'}
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
