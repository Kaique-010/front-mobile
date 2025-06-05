import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native'
import { apiPostComContexto, apiPutComContexto } from '../utils/api'
import styles from '../styles/listaStyles'
import AsyncStorage from '@react-native-async-storage/async-storage'
import BuscaClienteInput from '../components/BuscaClienteInput'
import BuscaProdutosInput from '../components/BuscaProdutosInput'
import { getStoredData } from '../services/storageService'

export default function SaidasForm({ route, navigation }) {
  const saida = route.params?.saida

  const [form, setForm] = useState({
    said_data: new Date().toISOString().split('T')[0],
    said_prod: '',
    said_enti: '',
    said_quan: '',
    said_tota: '',
    said_obse: '',
    said_empr: null,
    said_fili: null,
    said_usua: null,
  })

  const carregarContexto = async () => {
    try {
      const [usuarioRaw, empresaId, filialId] = await Promise.all([
        AsyncStorage.getItem('usuario'),
        AsyncStorage.getItem('empresaId'),
        AsyncStorage.getItem('filialId'),
      ])

      const usuarioObj = usuarioRaw ? JSON.parse(usuarioRaw) : null
      const usuarioId = usuarioObj?.usuario_id ?? null

      setForm((prev) => ({
        ...prev,
        said_usua: usuarioId,
        said_empr: empresaId,
        said_fili: filialId,
      }))
    } catch (error) {
      console.error('Erro ao carregar contexto:', error)
    }
  }

  const [slug, setSlug] = useState('')
  const [loading, setLoading] = useState(true)

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
    const init = async () => {
      await carregarContexto()
      if (saida) {
        setForm((prev) => ({
          ...prev,
          said_data: saida.said_data || prev.said_data,
          said_prod: saida.said_prod || prev.said_prod,
          said_enti: saida.said_enti || prev.said_enti,
          said_quan: saida.said_quan || prev.said_quan,
          said_tota: saida.said_tota || prev.said_tota,
          said_obse: saida.said_obse || prev.said_obse,
        }))
      }
    }
    init()
    console.log('✅ useEffect executado. Saída:', saida)
  }, [saida])
  console.log('Formulário de saida:', form)
  console.log('Saída recebida:', saida)

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const salvarSaida = async () => {
    console.log('🚀 Iniciando salvamento de saída')
    console.log('🔎 Estado atual do form:', form)
    if (!form.said_prod || !form.said_quan || !form.said_tota) {
      Alert.alert('Erro', 'Preencha os campos obrigatórios.')
      return
    }

    try {
      const payload = { ...form }

      if (saida) {
        await apiPutComContexto(
          `saidas_estoque/saidas-estoque/${saida.said_sequ}/`,
          payload
        )
        Alert.alert('Sucesso', 'Saída atualizada com sucesso!')
        navigation.goBack()
      } else {
        const novaSaida = await apiPostComContexto(
          `saidas_estoque/saidas-estoque/`,
          payload
        )
        Alert.alert('Sucesso', 'Saída criada com sucesso!')
        navigation.goBack()
      }
    } catch (error) {
      console.log('🧨 Response:', error.response)
      console.log('🧨 Dados do erro:', error.response?.data)
      console.error('❌ Erro ao salvar saída:', error.message)
      Alert.alert('Erro', 'Falha ao salvar a saída.')
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <Text style={styles.label}>Produto</Text>
          <BuscaProdutosInput
            onSelect={(item) => {
              console.log('Produto selecionado:', item)
              setForm((prev) => ({
                ...prev,
                said_prod: item.prod_codi,
              }))
            }}
          />

          <Text style={styles.label}>Entidade (Fornecedor)</Text>

          <BuscaClienteInput
            onSelect={(item) => {
              console.log('Fornecedor selecionado:', item)
              setForm((prev) => ({
                ...prev,
                said_enti: item.enti_clie,
              }))
            }}
          />

          <Text style={styles.label}>Quantidade</Text>
          <TextInput
            style={styles.forminput}
            value={form.said_quan}
            onChangeText={(text) => handleChange('said_quan', text)}
            keyboardType="numeric"
            placeholder="Quantidade"
          />

          <Text style={styles.label}>Total</Text>
          <TextInput
            style={styles.forminput}
            value={form.said_tota}
            onChangeText={(text) => handleChange('said_tota', text)}
            keyboardType="numeric"
            placeholder="Total"
          />

          <Text style={styles.label}>Observações</Text>
          <TextInput
            style={styles.forminput}
            value={form.said_obse}
            onChangeText={(text) => handleChange('said_obse', text)}
            placeholder="Observações"
          />

          <Text style={styles.label}>Data</Text>
          <TextInput
            style={styles.forminput}
            value={form.said_data}
            onChangeText={(text) => handleChange('said_data', text)}
            placeholder="YYYY-MM-DD"
          />

          <TouchableOpacity style={styles.incluirButton} onPress={salvarSaida}>
            <Text style={styles.incluirButtonText}>
              {saida ? 'Salvar Alterações' : 'Criar Saída'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}
