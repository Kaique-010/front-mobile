import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Picker } from '@react-native-picker/picker'
import { apiPost, apiPut } from '../utils/api'
import styles from '../styles/entidadeStyles'
import { TextInputMask } from 'react-native-masked-text'

export default function EntidadeForm({ navigation, route }) {
  const entidade = route.params?.entidade
  const isEdicao = Boolean(entidade)

  const [formData, setFormData] = useState({
    enti_nome: '',
    enti_tipo_enti: 'CL',
    enti_cpf: '',
    enti_cnpj: '',
    enti_cep: '',
    enti_ende: '',
    enti_nume: '',
    enti_cida: '',
    enti_esta: '',
    enti_fone: '',
    enti_celu: '',
    enti_emai: '',
  })

  useEffect(() => {
    if (isEdicao && entidade) {
      setFormData({ ...entidade })
    }
  }, [entidade, isEdicao])

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validarFormulario = () => {
    if (!formData.enti_nome.trim()) {
      Alert.alert('Validação', 'O nome é obrigatório.')
      return false
    }
    if (!formData.enti_emai.trim()) {
      Alert.alert('Validação', 'O e-mail é obrigatório.')
      return false
    }
    return true
  }

  const salvarEntidade = async () => {
    console.log('Botão salvar foi clicado')
  
    if (!validarFormulario()) {
      console.log('Formulário inválido, saindo da função')
      return
    }
  
    console.log('Dados que serão enviados:', formData)
  
    try {
      const token = await AsyncStorage.getItem('access')
      console.log('Token recuperado:', token)
  
      if (isEdicao) {
        console.log('Enviando PUT para:', `http://192.168.10.35:8000/api/entidades/${entidade.enti_clie}/`)
      } else {
        console.log('Enviando POST para:', `http://192.168.10.35:8000/api/entidades/`)
      }
  
      // ... restante igual
  
    } catch (error) {
      console.log('Erro ao salvar entidade:', error.response?.data || error.message)
      Alert.alert('Erro', 'Não foi possível salvar a entidade.')
    }
  }
  

  const buscarEnderecoPorCep = async (cep) => {
    try {
      const response = await fetch(
        `http://192.168.10.35:8000/api/entidades/buscar-endereco/?cep=${cep}`
      )
      const data = await response.json()

      if (data.erro) {
        Alert.alert('CEP não encontrado')
        return
      }

      setFormData((prev) => ({
        ...prev,
        enti_ende: data.logradouro || '',
        enti_bair: data.bairro || '',
        enti_cida: data.cidade || '',
        enti_esta: data.estado || '',
        enti_complemento: data.complemento || '',
      }))
    } catch (error) {
      console.error('Erro ao buscar endereço:', error)
      Alert.alert('Erro na busca do CEP')
    }
  }

  // Gerenciador de abas
  const [abaAtual, setAbaAtual] = useState('dados')

  return (
    <ScrollView style={styles.container}>
      {/* Abas Personalizadas */}
      <View style={styles.tabsContainer}>
        {['dados', 'endereco', 'contato'].map((aba) => (
          <TouchableOpacity
            key={aba}
            style={[
              styles.tabButton,
              abaAtual === aba && styles.tabButtonAtiva,
            ]}
            onPress={() => setAbaAtual(aba)}>
            <Text
              style={[styles.tabText, abaAtual === aba && styles.tabTextAtivo]}>
              {aba === 'dados' && 'Dados'}
              {aba === 'endereco' && 'Endereço'}
              {aba === 'contato' && 'Contato'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Formulários por aba */}
      {abaAtual === 'dados' && (
        <View style={styles.innerContainer}>
          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={styles.input}
            value={formData.enti_nome}
            onChangeText={(text) => handleChange('enti_nome', text)}
          />

          <Text style={styles.label}>Tipo</Text>
          <Picker
            selectedValue={formData.enti_tipo_enti}
            onValueChange={(value) => handleChange('enti_tipo_enti', value)}
            style={styles.input}>
            <Picker.Item label="Cliente" value="CL" />
            <Picker.Item label="Fornecedor" value="FO" />
            <Picker.Item label="Ambos" value="AM" />
            <Picker.Item label="Funcionário" value="FU" />
            <Picker.Item label="Vendedor" value="VE" />
            <Picker.Item label="Outros" value="OU" />
          </Picker>
          <Text style={styles.label}>CPF</Text>
          <TextInputMask
            type={'cpf'}
            value={formData.enti_cpf}
            onChangeText={(text) => handleChange('enti_cpf', text)}
            style={styles.input}
            keyboardType="numeric"
          />

          <Text style={styles.label}>CNPJ</Text>
          <TextInputMask
            type={'cnpj'}
            value={formData.enti_cnpj}
            onChangeText={(text) => handleChange('enti_cnpj', text)}
            style={styles.input}
            keyboardType="numeric"
          />
        </View>
      )}

      {abaAtual === 'endereco' && (
        <View style={styles.innerContainer}>
          <Text style={styles.label}>CEP</Text>
          <TextInputMask
            type={'zip-code'}
            value={formData.enti_cep}
            onChangeText={(text) => {
              handleChange('enti_cep', text)
              if (text.length === 9) buscarEnderecoPorCep(text)
            }}
            style={styles.input}
          />

          <Text style={styles.label}>Endereço</Text>
          <TextInput
            style={styles.input}
            value={formData.enti_ende}
            onChangeText={(text) => handleChange('enti_ende', text)}
          />

          <Text style={styles.label}>Número</Text>
          <TextInput
            style={styles.input}
            value={formData.enti_nume}
            onChangeText={(text) => handleChange('enti_nume', text)}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Cidade</Text>
          <TextInput
            style={styles.input}
            value={formData.enti_cida}
            onChangeText={(text) => handleChange('enti_cida', text)}
          />

          <Text style={styles.label}>Estado</Text>
          <TextInput
            style={styles.input}
            value={formData.enti_esta}
            onChangeText={(text) => handleChange('enti_esta', text)}
            maxLength={2}
          />
        </View>
      )}

      {abaAtual === 'contato' && (
        <View style={styles.innerContainer}>
          <Text style={styles.label}>Telefone</Text>
          <TextInput
            style={styles.input}
            value={formData.enti_fone}
            onChangeText={(text) => handleChange('enti_fone', text)}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Celular</Text>
          <TextInput
            style={styles.input}
            value={formData.enti_celu}
            onChangeText={(text) => handleChange('enti_celu', text)}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={formData.enti_emai}
            onChangeText={(text) => handleChange('enti_emai', text)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      )}

      {/* Botão de salvar */}
      <TouchableOpacity style={styles.botaoSalvar} onPress={salvarEntidade}>
        <Text style={styles.botaoTexto}>
          {isEdicao ? 'Salvar Alterações' : 'Cadastrar Entidade'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  )
}
