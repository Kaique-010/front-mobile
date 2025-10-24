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
  ActivityIndicator,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Picker } from '@react-native-picker/picker'
import DateTimePicker from '@react-native-community/datetimepicker'
import { apiPostComContexto, apiPutComContexto } from '../utils/api'
import BuscaClienteInput from '../components/BuscaClienteInput'
import styles from '../styles/listaStyles'
import { getStoredData } from '../services/storageService'

export default function ListaCasamentoForm({ route, navigation }) {
  const { lista, cliente_nome, list_noiv } = route.params || {}

  const [clienteSelecionadoTexto, setClienteSelecionadoTexto] = useState(
    cliente_nome && list_noiv ? `${list_noiv} - ${cliente_nome}` : ''
  )
  
  // Estados para controlar a exibição dos date pickers
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showDateCasaPicker, setShowDateCasaPicker] = useState(false)
  const [datePickerMode, setDatePickerMode] = useState('date')

  const [form, setForm] = useState({
    list_data: new Date().toISOString().split('T')[0],
    list_data_casa: new Date().toISOString().split('T')[0],
    list_nome: '',
    list_cade: '',
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
      if (lista) {
        console.log('📦 Dados da lista recebidos:', lista)
        console.log('📦 list_cade valor:', lista.list_cade)
        setForm((prev) => ({
          ...prev,
          list_data: lista.list_data || prev.list_data,
          list_data_casa: lista.list_data_casa || prev.list_data_casa,
          list_noiv: lista.list_noiv || prev.list_noiv,
          list_stat: String(lista.list_stat),
          list_nome: lista.list_nome || prev.list_nome,
          list_cade: lista.list_cade || prev.list_cade,
        }))
        console.log('📦 Form após atualização:', {
          list_cade: lista.list_cade || prev.list_cade,
          list_nome: lista.list_nome || prev.list_nome
        })
        // Garantir que tanto código quanto nome estejam disponíveis
        const nomeCliente = cliente_nome || lista.cliente_nome || ''
        setClienteSelecionadoTexto(`${lista.list_noiv} - ${nomeCliente}`)
      } else {
        // Se não tem lista, limpa o texto (nova lista)
        setClienteSelecionadoTexto('')
        setForm((prev) => ({
          ...prev,
          list_data: new Date().toISOString().split('T')[0],
          list_data_casa: new Date().toISOString().split('T')[0],
          list_noiv: '',
          list_stat: '0',
          list_nome: '',
          list_cade: '',
        }))
      }
    }
    init()
  }, [lista])

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  // Função para converter string de data para objeto Date
  const stringToDate = (dateString) => {
    if (!dateString) return new Date()
    const [year, month, day] = dateString.split('-')
    return new Date(year, month - 1, day)
  }

  // Função para converter objeto Date para string no formato YYYY-MM-DD
  const dateToString = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Função para formatar data no padrão brasileiro (dd/mm/yyyy)
  const formatDateBrazilian = (dateString) => {
    if (!dateString) return 'Selecione a data'
    const date = new Date(dateString + 'T00:00:00')
    return date.toLocaleDateString('pt-BR')
  }

  // Handlers para os date pickers
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false)
    if (selectedDate) {
      const dateString = dateToString(selectedDate)
      handleChange('list_data', dateString)
    }
  }

  const onDateCasaChange = (event, selectedDate) => {
    setShowDateCasaPicker(false)
    if (selectedDate) {
      const dateString = dateToString(selectedDate)
      handleChange('list_data_casa', dateString)
    }
  }

  const [estaSalvando, setEstaSalvando] = useState(false)

  const salvarLista = async () => {
    if (estaSalvando) return
    setEstaSalvando(true)
    if (!form.list_noiv || !form.list_data) {
      Alert.alert('Erro', 'Preencha os campos obrigatórios.')
      setEstaSalvando(false)
      return
    }

    console.log('📦 List Noiv:', form.list_noiv)

    try {
      const payload = { ...form }
      console.log('📦 Payload enviado:', payload)

      if (lista) {
        await apiPutComContexto(
          `listacasamento/listas-casamento/${lista.list_codi}/`,
          payload
        )
        Alert.alert('Sucesso', 'Lista atualizada com sucesso!')

        // Limpar cache após atualização
        try {
          await AsyncStorage.removeItem('listas_casamento_cache')
          console.log('🗑️ [CACHE-FORM] Cache de listas limpo após atualização')
        } catch (error) {
          console.log('⚠️ Erro ao limpar cache:', error)
        }

        navigation.navigate('ItensListaModal', {
          listaId: lista.list_codi,
          clienteId: lista.list_noiv,
          empresaId: lista.list_empr,
          filialId: lista.list_fili,
          list_noiv: clienteSelecionadoTexto,
        })
      } else {
        const novaLista = await apiPostComContexto(
          `listacasamento/listas-casamento/`,
          payload
        )
        Alert.alert('Sucesso', 'Lista criada com sucesso!')

        // Limpar cache após criação
        try {
          await AsyncStorage.removeItem('listas_casamento_cache')
          console.log('🗑️ [CACHE-FORM] Cache de listas limpo após criação')
        } catch (error) {
          console.log('⚠️ Erro ao limpar cache:', error)
        }

        navigation.navigate('ItensListaModal', {
          listaId: novaLista.list_codi,
          clienteId: form.list_noiv,
          empresaId: form.list_empr,
          filialId: form.list_fili,
        })
      }
    } catch (error) {
      console.error(
        '❌ Erro ao salvar lista:',
        error.message,
        error.response?.data
      )
      Alert.alert('Erro', 'Falha ao salvar a lista.')
      setEstaSalvando(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <Text style={styles.label}>Data de criação</Text>
          <TouchableOpacity
            style={[styles.forminput, { justifyContent: 'center' }]}
            onPress={() => setShowDatePicker(true)}>
            <Text style={{ color: '#fff', fontSize: 16 }}>
              {formatDateBrazilian(form.list_data)}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={stringToDate(form.list_data)}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
              onChange={onDateChange}
            />
          )}

          <Text style={styles.label}>Data do Casamento</Text>
          <TouchableOpacity
            style={[styles.forminput, { justifyContent: 'center' }]}
            onPress={() => setShowDateCasaPicker(true)}>
            <Text style={{ color: '#fff', fontSize: 16 }}>
              {formatDateBrazilian(form.list_data_casa)}
            </Text>
          </TouchableOpacity>
          {showDateCasaPicker && (
            <DateTimePicker
              value={stringToDate(form.list_data_casa)}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
              onChange={onDateCasaChange}
            />
          )}

          <Text style={styles.label}>Cliente</Text>

          <BuscaClienteInput
            value={clienteSelecionadoTexto}
            onSelect={(item) => {
              const texto = `${item.enti_clie} - ${item.enti_nome}`
              setClienteSelecionadoTexto(texto)
              setForm((prev) => ({
                ...prev,
                list_noiv: item.enti_clie,
              }))
            }}
          />
          <Text style={styles.label}>Nome do Casal/Lista</Text>
          <TextInput
            style={styles.forminput}
            value={form.list_nome}
            onChangeText={(text) => handleChange('list_nome', text)}
            placeholder="Nome do Casal"
          />
          <Text style={styles.label}>Cadeiras Por Mesa</Text>
          <TextInput
            style={styles.forminput}
            value={String(form.list_cade || '')}
            onChangeText={(text) => handleChange('list_cade', text)}
            placeholder="Cadeira"
            keyboardType="numeric"
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
          <TouchableOpacity
            style={[styles.incluirButton, estaSalvando && { opacity: 0.6 }]}
            onPress={salvarLista}
            disabled={estaSalvando}>
            {estaSalvando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.incluirButtonText}>
                {lista ? 'Salvar Alterações' : 'Criar Lista'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}
