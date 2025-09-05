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
import Toast from 'react-native-toast-message'
import {
  apiPostComContexto,
  apiPutComContexto,
  apiGetComContexto,
} from '../utils/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import BuscaClienteInput from '../components/BuscaClienteInput'
import BuscaProdutosInput from '../components/BuscaProdutosInput'
import styles from '../styles/listaStyles'
import { getStoredData } from '../services/storageService'

export default function EntradasForm({ route, navigation }) {
  const entrada = route.params?.entrada
  const [carregando, setCarregando] = useState(false)

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

  useEffect(() => {
    const init = async () => {
      await carregarContexto()
      if (entrada) {
        setForm((prev) => ({
          ...prev,
          entr_data: entrada.entr_data || prev.entr_data,
          entr_prod: entrada.entr_prod || '',
          entr_enti: entrada.entr_enti || '',
          entr_quan: entrada.entr_quan?.toString() || '',
          entr_tota: entrada.entr_tota?.toString() || '',
          entr_obse: entrada.entr_obse || '',
        }))
      }
    }
    init()
  }, [entrada])

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const validarEntrada = () => {
    if (!form.entr_prod) {
      Alert.alert('Erro', 'Selecione um produto.')
      return false
    }
    if (!form.entr_quan || parseFloat(form.entr_quan) <= 0) {
      Alert.alert('Erro', 'A quantidade deve ser maior que zero.')
      return false
    }
    if (!form.entr_tota || parseFloat(form.entr_tota) <= 0) {
      Alert.alert('Erro', 'O total deve ser maior que zero.')
      return false
    }
    if (!form.entr_data) {
      Alert.alert('Erro', 'Informe a data da entrada.')
      return false
    }
    return true
  }

  const salvarEntrada = async () => {
    if (!validarEntrada()) return

    try {
      setCarregando(true)

      if (form.entr_id) {
        await apiPutComContexto(
          'entradas_estoque/ntradas-estoque/',
          form.entr_id,
          form
        )
      } else {
        await apiPostComContexto('entradas_estoque/entradas-estoque/', form)
      }

      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Entrada salva com sucesso!',
      })

      navigation.goBack()
    } catch (error) {
      console.error('Erro ao salvar entrada:', error)
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Erro ao salvar entrada',
      })
    } finally {
      setCarregando(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <Text style={styles.label}>Data *</Text>
          <TextInput
            style={styles.forminput}
            value={form.entr_data}
            onChangeText={(text) => handleChange('entr_data', text)}
            placeholder="YYYY-MM-DD"
          />

          <Text style={styles.label}>Produto *</Text>
          <BuscaProdutosInput
            onSelect={(item) => {
              console.log('Produto selecionado:', item)
              setForm((prev) => ({
                ...prev,
                entr_prod: item.prod_codi,
              }))
            }}
          />

          <Text style={styles.label}>Entidade(Responsável Entrada)</Text>
          <BuscaClienteInput
            onSelect={(item) => {
              console.log('Fornecedor selecionado:', item)
              setForm((prev) => ({
                ...prev,
                entr_enti: item.enti_clie,
              }))
            }}
          />

          <Text style={styles.label}>Quantidade *</Text>
          <TextInput
            style={styles.forminput}
            value={form.entr_quan}
            onChangeText={(text) => handleChange('entr_quan', text)}
            keyboardType="numeric"
            placeholder="Quantidade"
          />

          <Text style={styles.label}>Total *</Text>
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

          <TouchableOpacity
            style={styles.incluirButton}
            onPress={salvarEntrada}
            disabled={carregando}>
            <Text style={styles.incluirButtonText}>
              {carregando
                ? 'Salvando...'
                : entrada
                ? 'Salvar Alterações'
                : 'Criar Entrada'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}
