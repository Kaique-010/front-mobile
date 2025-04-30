import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Picker } from '@react-native-picker/picker'
import { apiGet, apiPostComContexto, apiPutComContexto } from '../utils/api'
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

  const [clientes, setClientes] = useState([])
  const [clienteNome, setClienteNome] = useState('')

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

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
        setClienteNome(lista.cliente_nome || '')
      }
    }
    init()
  }, [lista])

  const buscarClientes = async (texto) => {
    setClienteNome(texto)
    if (!texto) {
      setClientes([])
      return
    }
    try {
      const data = await apiGet('/api/entidades/', { search: texto })
      setClientes(data)
    } catch (e) {
      console.error('Erro ao buscar clientes:', e.message)
    }
  }

  const salvarLista = async () => {
    if (!form.list_noiv || !form.list_data) {
      Alert.alert('Erro', 'Preencha os campos obrigatórios.')
      return
    }

    try {
      const payload = { ...form }
      console.log('📦 Payload enviado:', payload)

      if (lista) {
        await apiPutComContexto(
          `/api/listas-casamento/${lista.list_codi}/`,
          payload
        )
        Alert.alert('Sucesso', 'Lista atualizada com sucesso!')
      } else {
        const novaLista = await apiPostComContexto(
          '/api/listas-casamento/',
          payload
        )
        Alert.alert('Sucesso', 'Lista criada com sucesso!')
        navigation.navigate('ItensListaModal', { listaId: novaLista.list_codi })
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

  const renderItemCliente = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        handleChange('list_noiv', parseInt(item.enti_clie))
        setClienteNome(item.enti_nome)
        setClientes([])
        Keyboard.dismiss()
      }}
      style={styles.sugestaoItem}>
      <Text style={styles.sugestaoTexto}>
        {item.enti_clie}-{item.enti_nome} — {item.enti_cpf || item.enti_cnpj}
      </Text>
    </TouchableOpacity>
  )

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <Text style={styles.label}>Cliente</Text>
          <TextInput
            style={styles.input}
            value={clienteNome}
            onChangeText={buscarClientes}
            placeholder="Buscar cliente..."
            placeholderTextColor="#aaa"
          />

          {clientes.length > 0 && (
            <FlatList
              data={clientes}
              keyExtractor={(item) => `${item.enti_clie}-${item.enti_fili}`}
              keyboardShouldPersistTaps="handled"
              renderItem={renderItemCliente}
              style={styles.sugestaoLista}
            />
          )}

          <Text style={styles.label}>Data</Text>
          <TextInput
            style={styles.input}
            value={form.list_data}
            onChangeText={(text) => handleChange('list_data', text)}
            placeholder="YYYY-MM-DD"
          />

          <Picker
            selectedValue={form.list_stat}
            onValueChange={(val) => handleChange('list_stat', val)}
            style={{
              color: '#fff',
              backgroundColor: '#222',
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
