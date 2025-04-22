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
import { apiGet, apiPost, apiPut } from '../utils/api'
import styles from '../styles/listaStyles'

export default function ListaCasamentoForm({ route, navigation }) {
  const lista = route.params?.lista

  const [form, setForm] = useState({
    list_data: new Date().toISOString().split('T')[0],
    list_clie: '',
    list_prod: '',
    list_comp: '',
    list_stat: '0',
  })

  const [empresa, setEmpresa] = useState(null)
  const [filial, setFilial] = useState(null)
  const [produtoNome, setProdutoNome] = useState('')
  const [clientes, setClientes] = useState([])
  const [clienteNome, setClienteNome] = useState('')

  const handleChange = (field, value) => {
    setForm((prevForm) => ({
      ...prevForm,
      [field]: value,
    }))
  }
  // 🧠 1. Carregar empresa/filial ao carregar a tela
  useEffect(() => {
    const carregarEmpresaFilial = async () => {
      const empresaId = await AsyncStorage.getItem('empresaId')
      const filialId = await AsyncStorage.getItem('filialId')

      setEmpresa(empresaId)
      setFilial(filialId)
    }

    carregarEmpresaFilial()

    if (lista) {
      setForm({
        list_data: lista.list_data,
        list_clie: lista.list_clie,
        list_comp: lista.list_comp,
        list_stat: String(lista.list_stat),
      })
    }
  }, [lista])

  const buscarClientes = async (texto) => {
    setClienteNome(texto)
    try {
      const data = await apiGet('/api/entidades/', { search: texto })
      setClientes(data)
    } catch (e) {
      console.log('Erro ao buscar clientes', e.message)
    }
  }

  const salvarLista = async () => {
    if (!empresa || !filial) {
      Alert.alert('Erro', 'Empresa ou filial não definida.')
      return
    }

    const payload = {
      ...form,
      list_empr: empresa,
      list_fili: filial,
    }

    try {
      if (lista) {
        await apiPut(`/api/listas-casamento/${lista.list_nume}/`, payload)
        Alert.alert('Sucesso', 'Lista atualizada com sucesso!')
      } else {
        const novaLista = await apiPost('/api/listas-casamento/', payload)
        Alert.alert('Sucesso', 'Lista criada com sucesso!')
        navigation.navigate('ItensListaModal', { listaId: novaLista.list_nume })
      }
    } catch (error) {
      console.log('❌ Erro ao salvar lista:', error.message)
      Alert.alert('Erro', 'Falha ao salvar a lista.')
    }
  }

  const renderSugestao = ({ item }, tipo) => (
    <TouchableOpacity
      style={styles.sugestaoItem}
      onPress={() => {
        if (tipo === 'cliente') {
          handleChange('list_clie', item.id)
          setClienteNome(item.nome)
          setClientes([])
        } else {
          handleChange('list_prod', item.id)
          setProdutoNome(item.nome)
          setProdutos([])
        }
        Keyboard.dismiss()
      }}>
      <Text style={styles.sugestaoTexto}>{item.nome}</Text>
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
              keyExtractor={(item) => item.enti_clie.toString()}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    handleChange('list_clie', item.enti_clie)
                    setClienteNome(item.enti_nome)
                    setClientes([])
                    Keyboard.dismiss()
                  }}
                  style={styles.sugestaoItem}>
                  <Text style={styles.sugestaoTexto}>
                    {item.enti_nome} — {item.enti_cpf || item.enti_cnpj}
                  </Text>
                </TouchableOpacity>
              )}
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

          <Text style={styles.label}>Complemento</Text>
          <TextInput
            style={styles.input}
            value={form.list_comp}
            onChangeText={(text) => handleChange('list_comp', text)}
            placeholder="Ex: Lista de presentes do casal"
          />

          <Picker
            selectedValue={form.list_stat}
            onValueChange={(itemValue) => handleChange('list_stat', itemValue)}
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
