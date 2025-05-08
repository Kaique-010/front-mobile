import React, { useState, useEffect } from 'react'
import { ActivityIndicator } from 'react-native'
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native'
import { Picker } from '@react-native-picker/picker'
import { apiPost, apiPut, apiDelete } from '../utils/api'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function ProdutoFormScreen({ route, navigation }) {
  const produto = route.params?.produto

  const [nome, setNome] = useState(produto?.prod_nome || '')
  const [unidade, setUnidade] = useState(produto?.prod_unme || '')
  const [ncm, setNcm] = useState(produto?.prod_ncm || '')
  const [empresa, setEmpresa] = useState('') // Inicializando como vazio
  const [loading, setLoading] = useState(false)
  const [dots, setDots] = useState('')

  const carregarContexto = async () => {
    try {
      const empresaId = await AsyncStorage.getItem('empresaId')
      setEmpresa(empresaId) // Atualiza o estado de 'empresa' com o ID da empresa

      console.log('🔍 Contexto carregado:', { empresaId })
    } catch (error) {
      console.error('Erro ao carregar contexto:', error)
    }
  }

  useEffect(() => {
    carregarContexto() // Chama a função ao carregar o componente
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

  const salvar = async () => {
    setLoading(true)
    const data = {
      prod_nome: nome,
      prod_unme: unidade,
      prod_ncm: ncm,
      prod_empr: empresa,
    }

    try {
      if (produto?.prod_codi) {
        await apiPut(`/api/produtos/${produto.prod_codi}/`, data)
        Alert.alert('Sucesso', 'Produto atualizado com sucesso!')
      } else {
        const response = await apiPost(`/api/produtos/`, data)
        const novoCodigo = response.prod_codi
        Alert.alert('Criado', `Produto criado com código: ${novoCodigo}`)
      }
      navigation.goBack()
    } catch (error) {
      console.error(
        '❌ Erro ao salvar produto:',
        error.response?.data || error.message
      )
      Alert.alert('Erro', 'Não foi possível salvar o produto.')
    } finally {
      setLoading(false)
      setDots('')
    }
  }

  /* Exclusão dos produtos */
  const excluir = () => {
    Alert.alert('Confirmar', 'Tem certeza que deseja excluir o produto?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiDelete(`/api/produtos/${produto.prod_codi}/`)
            Alert.alert('Excluído', 'Produto removido com sucesso.')
            navigation.goBack()
          } catch (error) {
            console.error(
              '❌ Erro ao excluir:',
              error.response?.data || error.message
            )
            Alert.alert('Erro', 'Não foi possível excluir o produto.')
          }
        },
      },
    ])
  }

  /* Visualização da tela */
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Descrição Produto</Text>
      <TextInput
        placeholder="Nome do Produto"
        value={nome}
        onChangeText={setNome}
        style={styles.input}
      />
      <Text style={styles.label}>Unidade de Medida (Ex: un)</Text>
      <Picker
        selectedValue={unidade}
        placeholder="Unidade de Medida"
        value={unidade}
        onChangeText={setUnidade}
        style={styles.input}
      />

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
  button: {
    backgroundColor: '#0058A2',
    padding: 12,
    borderRadius: 8,
    width: 100,
    height: 40,
    marginTop: 100,
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
  label: {
    marginBottom: 4,
    fontWeight: 'bold',
    fontSize: 14,
    color: '#fff',
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
  cancelButton: {
    backgroundColor: '#666',
  },
})
