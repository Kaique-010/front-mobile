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
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getStoredData } from '../services/storageService'
import { Picker } from '@react-native-picker/picker'
import {
  apiGetComContexto,
  apiPutComContextoSemFili,
  apiPostComContextoSemFili,
} from '../utils/api'

export default function ProdutoDados({
  produto,
  atualizarProduto,
  navigation,
}) {
  const [nome, setNome] = useState(produto?.prod_nome || '')
  const [unidade, setUnidade] = useState(produto?.prod_unme || '')
  const [ncm, setNcm] = useState(produto?.prod_ncm || '')
  const [empresa, setEmpresa] = useState('')
  const [unidades, setUnidades] = useState([])
  const [loadingUnidades, setLoadingUnidades] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [slug, setSlug] = useState('')

  useEffect(() => {
    const carregarContexto = async () => {
      try {
        const dados = await getStoredData()
        if (dados?.slug) setSlug(dados.slug)
        else console.warn('Slug não encontrado')

        const empresaId = await AsyncStorage.getItem('empresaId')
        setEmpresa(empresaId || '')
      } catch (err) {
        console.error('Erro ao carregar contexto:', err.message)
      }
    }

    carregarContexto()
  }, [])

  useEffect(() => {
    if (!slug) return

    const carregarUnidades = async () => {
      setLoadingUnidades(true)
      try {
        const data = await apiGetComContexto('produtos/unidadesmedida/')
        setUnidades(data)
      } catch (error) {
        console.error('Erro ao carregar unidades:', error)
        Alert.alert('Erro', 'Não foi possível carregar unidades.')
      } finally {
        setLoadingUnidades(false)
      }
    }

    carregarUnidades()
  }, [slug])

  const salvar = async () => {
    setSalvando(true)

    const payload = {
      prod_nome: nome,
      prod_unme: unidade,
      prod_ncm: ncm,
      prod_empr: parseInt(empresa),
    }

    try {
      if (produto?.prod_codi) {
        console.log('Enviando produto:', payload)
        console.log('Slug atual:', slug)
        console.log('Empresa ID:', empresa)
        await apiPutComContextoSemFili(
          `produtos/produtos/${produto.prod_codi}/`,
          payload,
          'prod_'
        )
        Alert.alert('Sucesso', 'Produto atualizado com sucesso!')
        atualizarProduto({ ...payload, prod_codi: produto.prod_codi })
        navigation.goBack()
      } else {
        const { prod_codi } = await apiPostComContextoSemFili(
          `produtos/produtos/`,
          payload,
          'prod_'
        )
        Alert.alert('Criado', `Produto criado com código: ${prod_codi}`)
        const novoProduto = { ...payload, prod_codi }
        atualizarProduto(novoProduto)
        navigation.replace('ProdutoPrecos', { produto: novoProduto, slug })
      }
    } catch (err) {
      console.error('Erro ao salvar produto:', err)
      Alert.alert('Erro', 'Erro ao salvar produto.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Descrição do Produto</Text>
      <TextInput
        placeholder="Nome do Produto"
        value={nome}
        onChangeText={setNome}
        style={styles.input}
      />

      <Text style={styles.label}>Unidade de Medida</Text>
      {loadingUnidades ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Picker
          selectedValue={unidade}
          onValueChange={setUnidade}
          style={styles.input}>
          <Picker.Item label="Selecione uma unidade" value="" />
          {unidades.map((u) => (
            <Picker.Item
              key={u.unid_codi}
              label={u.unid_desc}
              value={u.unid_codi}
            />
          ))}
        </Picker>
      )}

      <Text style={styles.label}>NCM</Text>
      <TextInput
        placeholder="Inclua um NCM"
        value={ncm}
        onChangeText={setNcm}
        style={styles.input}
        keyboardType="number-pad"
      />

      <TouchableOpacity
        onPress={salvar}
        style={[styles.button, salvando && { opacity: 0.6 }]}
        disabled={salvando}>
        {salvando ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Salvar</Text>
        )}
      </TouchableOpacity>
    </View>
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
