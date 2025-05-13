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
import { Picker } from '@react-native-picker/picker'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getStoredData } from '../services/storageService'
import { apiPost, apiPut, apiDelete, apiGetComContexto } from '../utils/api'

export default function ProdutoFormScreen({ route, navigation }) {
  const produto = route.params?.produto

  const [nome, setNome] = useState(produto?.prod_nome || '')
  const [unidade, setUnidade] = useState(
    produto?.prod_unme?.unid_codi || produto?.prod_unme || ''
  )
  const [ncm, setNcm] = useState(produto?.prod_ncm || '')
  const [empresa, setEmpresa] = useState('')
  const [unidades, setUnidades] = useState([])
  const [loading, setLoading] = useState(false)
  const [dots, setDots] = useState('')
  const [slug, setSlug] = useState('')

  useEffect(() => {
    const carregarSlug = async () => {
      try {
        const { slug } = await getStoredData()
        if (slug) setSlug(slug)
        else console.warn('Slug não encontrado')
      } catch (err) {
        console.error('Erro ao carregar slug:', err.message)
      }
    }
    carregarSlug()
  }, [])
  console.log('Slug:', slug)

  useEffect(() => {
    ;(async () => {
      try {
        const empresaId = await AsyncStorage.getItem('empresaId')
        setEmpresa(empresaId)
      } catch (error) {
        console.error('Erro ao carregar contexto:', error)
      }
    })()
    carregarUnidades()
  }, [])

  useEffect(() => {
    let interval
    if (loading) {
      interval = setInterval(() => {
        setDots((prev) => (prev.length < 3 ? prev + '.' : ''))
      }, 500)
    }
    return () => clearInterval(interval)
  }, [loading])

  const carregarUnidades = async () => {
    setLoading(true)
    try {
      const data = await apiGetComContexto(`/api/${slug}/unidadesmedida/`)
      setUnidades(data)
    } catch (error) {
      console.error('Erro ao carregar unidades', error)
      Alert.alert('Erro', 'Não foi possível carregar as unidades')
    } finally {
      setLoading(false)
    }
  }

  const salvar = async () => {
    setLoading(true)
    const payload = {
      prod_nome: nome,
      prod_unme: unidade,
      prod_ncm: ncm,
      prod_empr: empresa,
    }

    try {
      if (produto?.prod_codi) {
        await apiPut(`/api/${slug}/produtos/${produto.prod_codi}/`, payload)
        Alert.alert('Sucesso', 'Produto atualizado com sucesso!')
      } else {
        const { prod_codi } = await apiPost(`/api/${slug}/produtos/`, payload)
        Alert.alert('Criado', `Produto criado com código: ${prod_codi}`)
      }

      navigation.goBack()
    } catch (error) {
      console.error('Erro ao salvar:', error.response?.data || error.message)
      Alert.alert('Erro', 'Não foi possível salvar o produto.')
    } finally {
      setLoading(false)
      setDots('')
    }
  }

  const excluir = () => {
    Alert.alert('Confirmar', 'Deseja excluir este produto?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiDelete(`/api/${slug}/produtos/${produto.prod_codi}/`)

            Alert.alert('Excluído', 'Produto removido com sucesso.')
            navigation.goBack()
          } catch (error) {
            console.error(
              'Erro ao excluir:',
              error.response?.data || error.message
            )
            Alert.alert('Erro', 'Não foi possível excluir o produto.')
          }
        },
      },
    ])
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
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Picker
          selectedValue={unidade}
          onValueChange={setUnidade}
          style={styles.input}>
          <Picker.Item label="Selecione uma unidade" value="" />
          {unidades.map(({ unid_codi, unid_desc }) => (
            <Picker.Item key={unid_codi} label={unid_desc} value={unid_codi} />
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

      <View style={styles.buttonRow}>
        <TouchableOpacity
          onPress={salvar}
          style={[styles.button, loading && { opacity: 0.6 }]}
          disabled={loading}>
          <View style={styles.rowCenter}>
            <Text style={styles.buttonText}>
              {loading ? `Gravando${dots}` : 'Salvar'}
            </Text>
            {loading && (
              <ActivityIndicator
                size="small"
                color="#fff"
                style={{ marginLeft: 8 }}
              />
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.button, styles.cancelButton]}>
          <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>

      {produto?.prod_codi && (
        <TouchableOpacity onPress={excluir} style={styles.deleteButton}>
          <Text style={styles.buttonText}>Excluir</Text>
        </TouchableOpacity>
      )}
    </View>
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
    width: 100,
    height: 40,
    marginTop: 100,
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  rowCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 100,
    gap: 10,
  },
})
