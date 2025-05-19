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
import AsyncStorage from '@react-native-async-storage/async-storage'
import BuscaClienteInput from '../components/BuscaClienteInput'
import BuscaProdutosInput from '../components/BuscaProdutosInput'
import styles from '../styles/listaStyles'
import { getStoredData } from '../services/storageService'

export default function EntradasForm({ route, navigation }) {
  const entrada = route.params?.entrada

  const [form, setForm] = useState({
    entr_data: new Date().toISOString().split('T')[0],
    entr_prod: '',
    entr_enti: '',
    entr_quan: '',
    entr_tota: '',
    entr_obse: '',
    entr_empr: null,
    entr_fili: null,
    entr_usua: null,
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
        entr_usua: usuarioId,
        entr_empr: empresaId,
        entr_fili: filialId,
      }))
    } catch (error) {
      console.error('Erro ao carregar contexto:', error)
    }
  }

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
    const init = async () => {
      await carregarContexto()
      if (entrada) {
        setForm((prev) => ({
          ...prev,
          entr_data: entrada.entr_data || prev.entr_data,
          entr_prod: entrada.entr_prod || prev.entr_prod,
          entr_enti: entrada.entr_enti || prev.entr_enti,
          entr_quan: entrada.entr_quan || prev.entr_quan,
          entr_tota: entrada.entr_tota || prev.entr_tota,
          entr_obse: entrada.entr_obse || prev.entr_obse,
        }))
      }
    }
    init()
    console.log('✅ useEffect executado. Entrada:', entrada)
  }, [entrada])
  console.log('Formulário de entrada:', form)
  console.log('Entrada recebida:', entrada)

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const salvarEntrada = async () => {
    console.log('🚀 Iniciando salvamento de entrada')
    console.log('🔎 Estado atual do form:', form)
    if (!form.entr_prod || !form.entr_quan || !form.entr_tota) {
      Alert.alert('Erro', 'Preencha os campos obrigatórios.')
      return
    }

    try {
      const payload = { ...form }
      console.log('Payload para salvar entrada:', payload)

      if (entrada) {
        await apiPutComContexto(
          `entradas_estoque/entradas-estoque/${entrada.entr_prod}/`,
          payload,
          'entr_'
        )
        Alert.alert('Sucesso', 'Entrada atualizada com sucesso!')
        navigation.goBack()
      } else {
        const novaEntrada = await apiPostComContexto(
          `entradas_estoque/entradas-estoque/`,
          payload,
          'entr_'
        )
        Alert.alert('Sucesso', 'Entrada criada com sucesso!')
        navigation.goBack()
      }
    } catch (error) {
      console.error('❌ Erro ao salvar entrada:', error.message)
      console.log('🧨 Response:', error.response)
      console.log('🧨 Dados do erro:', error.response?.data)
      Alert.alert('Erro', 'Falha ao salvar a entrada.')
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <Text style={styles.label}>Produto:</Text>

          <BuscaProdutosInput
            onSelect={(item) => {
              console.log('Produto selecionado:', item)
              setForm((prev) => ({
                ...prev,
                entr_prod: item.prod_codi,
              }))
            }}
          />

          <Text style={styles.label}>Entidade(Responsável Entrada): </Text>

          <BuscaClienteInput
            onSelect={(item) => {
              console.log('Fornecedor selecionado:', item)
              setForm((prev) => ({
                ...prev,
                entr_enti: item.enti_clie,
              }))
            }}
          />

          <Text style={styles.label}>Quantidade</Text>
          <TextInput
            style={styles.forminput}
            value={form.entr_quan}
            onChangeText={(text) => handleChange('entr_quan', text)}
            keyboardType="numeric"
            placeholder="Quantidade"
          />

          <Text style={styles.label}>Total</Text>
          <TextInput
            style={styles.forminput}
            value={form.entr_tota}
            onChangeText={(text) => handleChange('entr_tota', text)}
            keyboardType="numeric"
            placeholder="Total"
          />

          <Text style={styles.label}>Observações</Text>
          <TextInput
            style={styles.forminput}
            value={form.entr_obse}
            onChangeText={(text) => handleChange('entr_obse', text)}
            placeholder="Observações"
          />

          <Text style={styles.label}>Data</Text>
          <TextInput
            style={styles.forminput}
            value={form.entr_data}
            onChangeText={(text) => handleChange('entr_data', text)}
            placeholder="YYYY-MM-DD"
          />

          <TouchableOpacity
            style={styles.incluirButton}
            onPress={salvarEntrada}>
            <Text style={styles.incluirButtonText}>
              {entrada ? 'Salvar Alterações' : 'Criar Entrada'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}
