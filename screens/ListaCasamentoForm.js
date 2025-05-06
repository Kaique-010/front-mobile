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
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Picker } from '@react-native-picker/picker'
import { apiPostComContexto, apiPutComContexto } from '../utils/api'
import BuscaClienteInput from '../components/BuscaClienteInput'
import styles from '../styles/listaStyles'

export default function ListaCasamentoForm({ route, navigation }) {
  const lista = route.params?.lista

  const [form, setForm] = useState({
    list_data: new Date().toISOString().split('T')[0],
    list_noiv: '',
    list_stat: '0',
    list_usua: null,
    list_empr: null,
    list_fili: null,
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
        list_usua: usuarioId,
        list_empr: empresaId,
        list_fili: filialId,
      }))

      console.log('🔍 Contexto carregado:', { usuarioId, empresaId, filialId })
    } catch (error) {
      console.error('Erro ao carregar contexto:', error)
    }
  }

  useEffect(() => {
    const init = async () => {
      await carregarContexto()
      if (lista) {
        setForm((prev) => ({
          ...prev,
          list_data: lista.list_data,
          list_noiv: lista.list_noiv,
          list_stat: String(lista.list_stat),
        }))
      }
    }
    init()
  }, [lista])

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const salvarLista = async () => {
    if (!form.list_noiv || !form.list_data) {
      Alert.alert('Erro', 'Preencha os campos obrigatórios.')
      return
    }

    // Adicionando o log para verificar o valor de list_noiv antes de enviar o payload
    console.log('📦 List Noiv:', form.list_noiv)

    try {
      const payload = { ...form }
      console.log('📦 Payload enviado:', payload)

      if (lista) {
        await apiPutComContexto(
          `/api/listas-casamento/${lista.list_codi}/`,
          payload
        )
        Alert.alert('Sucesso', 'Lista atualizada com sucesso!')
        navigation.navigate('ItensListaModal', {
          listaId: lista.list_codi,
          clienteId: lista.list_noiv,
        })
      } else {
        const novaLista = await apiPostComContexto(
          '/api/listas-casamento/',
          payload
        )
        Alert.alert('Sucesso', 'Lista criada com sucesso!')
        navigation.navigate('ItensListaModal', {
          listaId: novaLista.list_codi,
          clienteId: form.list_noiv,
        })
      }
    } catch (error) {
      console.error(
        '❌ Erro ao salvar lista:',
        error.message,
        error.response?.data
      )
      Alert.alert('Erro', 'Falha ao salvar a lista.')
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <Text style={styles.label}>Cliente</Text>

          <BuscaClienteInput
            onSelect={(item) => {
              console.log('Cliente selecionado:', item)
              setForm((prev) => ({
                ...prev,
                list_noiv: item.enti_clie, 
              }))
            }}
          />
          <Text style={styles.label}>Data</Text>
          <TextInput
            style={styles.forminput}
            value={form.list_data}
            onChangeText={(text) => handleChange('list_data', text)}
            placeholder="YYYY-MM-DD"
          />
          <Text style={styles.label}>Status</Text>
          <Picker
            selectedValue={form.list_stat}
            onValueChange={(val) => handleChange('list_stat', val)}
            style={{
              color: '#fff',
              backgroundColor: '#222',
              marginTop: 20,
              marginBottom: 16,
              borderRadius: 8,
            }}>
            <Picker.Item label="Aberta" value="0" />
            <Picker.Item label="Aguardando" value="1" />
            <Picker.Item label="Finalizada" value="2" />
            <Picker.Item label="Cancelada" value="3" />
          </Picker>
          <TouchableOpacity style={styles.incluirButton} onPress={salvarLista}>
            <Text style={styles.incluirButtonText}>
              {lista ? 'Salvar Alterações' : 'Criar Lista'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}
