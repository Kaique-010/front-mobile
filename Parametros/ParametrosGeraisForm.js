import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Switch,
} from 'react-native'
import { Picker } from '@react-native-picker/picker'
import Toast from 'react-native-toast-message'
import {
  createParametroGeral,
  updateParametroGeral,
} from '../services/parametrosService'
import { getStoredData } from '../services/storageService'
import { parametrosStyles } from './styles/parametrosStyles'

export default function ParametrosGeraisForm({ navigation, route }) {
  const parametro = route.params?.parametro
  const isEdicao = Boolean(parametro)
  const [isSalvando, setIsSalvando] = useState(false)
  const [empresaId, setEmpresaId] = useState('')
  const [filialId, setFilialId] = useState('')

  const [formData, setFormData] = useState({
    para_nome: '',
    para_valo: '',
    para_desc: '',
    para_tipo: 'string',
    para_ativ: true,
    para_empr: '',
    para_fili: '',
  })

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const { empresaId, filialId } = await getStoredData()
        setEmpresaId(empresaId)
        setFilialId(filialId)

        if (isEdicao && parametro) {
          setFormData({ ...parametro })
        } else {
          setFormData((prev) => ({
            ...prev,
            para_empr: empresaId,
            para_fili: filialId,
          }))
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err.message)
      }
    }
    carregarDados()
  }, [parametro, isEdicao])

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const validarFormulario = () => {
    if (!formData.para_nome.trim()) {
      Alert.alert('Validação', 'O nome do parâmetro é obrigatório.')
      return false
    }
    if (!formData.para_valo.trim()) {
      Alert.alert('Validação', 'O valor do parâmetro é obrigatório.')
      return false
    }

    // Validações específicas por tipo
    try {
      switch (formData.para_tipo) {
        case 'integer':
          if (isNaN(parseInt(formData.para_valo))) {
            throw new Error('Valor deve ser um número inteiro')
          }
          break
        case 'decimal':
          if (isNaN(parseFloat(formData.para_valo))) {
            throw new Error('Valor deve ser um número decimal')
          }
          break
        case 'boolean':
          const validBooleans = [
            'true',
            'false',
            '1',
            '0',
            'sim',
            'não',
            'yes',
            'no',
          ]
          if (!validBooleans.includes(formData.para_valo.toLowerCase())) {
            throw new Error('Valor booleano inválido')
          }
          break
        case 'json':
          JSON.parse(formData.para_valo)
          break
      }
    } catch (error) {
      Alert.alert('Validação', error.message)
      return false
    }

    return true
  }

  const salvarParametro = async () => {
    if (!validarFormulario()) return
    setIsSalvando(true)

    try {
      if (isEdicao) {
        await updateParametroGeral(parametro.para_codi, formData)
      } else {
        await createParametroGeral(formData)
      }

      Toast.show({
        type: 'success',
        text1: 'Sucesso!',
        text2: `Parâmetro ${isEdicao ? 'atualizado' : 'criado'} com sucesso`,
      })

      navigation.navigate('ParametrosGeraisList', {
        mensagemSucesso: `Parâmetro ${
          isEdicao ? 'atualizado' : 'criado'
        } com sucesso`,
      })
    } catch (error) {
      console.error('Erro ao salvar parâmetro:', error)
      Toast.show({
        type: 'error',
        text1: 'Erro!',
        text2: 'Não foi possível salvar o parâmetro',
      })
    } finally {
      setIsSalvando(false)
    }
  }

  return (
    <ScrollView style={parametrosStyles.container}>
      <View style={parametrosStyles.formContainer}>
        <Text style={parametrosStyles.formTitle}>
          {isEdicao ? 'Editar Parâmetro' : 'Novo Parâmetro'}
        </Text>

        <View style={parametrosStyles.inputGroup}>
          <Text style={parametrosStyles.label}>Nome do Parâmetro *</Text>
          <TextInput
            style={parametrosStyles.input}
            value={formData.para_nome}
            onChangeText={(value) => handleChange('para_nome', value)}
            placeholder="Ex: sistema_nome"
            editable={!isEdicao} // Nome não pode ser alterado na edição
          />
        </View>

        <View style={parametrosStyles.inputGroup}>
          <Text style={parametrosStyles.label}>Tipo *</Text>
          <View style={parametrosStyles.pickerContainer}>
            <Picker
              selectedValue={formData.para_tipo}
              style={parametrosStyles.picker}
              onValueChange={(value) => handleChange('para_tipo', value)}>
              <Picker.Item label="Texto" value="string" />
              <Picker.Item label="Verdadeiro/Falso" value="boolean" />
              <Picker.Item label="Número Inteiro" value="integer" />
              <Picker.Item label="Número Decimal" value="decimal" />
              <Picker.Item label="JSON" value="json" />
            </Picker>
          </View>
        </View>

        <View style={parametrosStyles.inputGroup}>
          <Text style={parametrosStyles.label}>Valor *</Text>
          <TextInput
            style={[
              parametrosStyles.input,
              formData.para_tipo === 'json' && parametrosStyles.textArea,
            ]}
            value={formData.para_valo}
            onChangeText={(value) => handleChange('para_valo', value)}
            placeholder={getPlaceholderPorTipo(formData.para_tipo)}
            multiline={formData.para_tipo === 'json'}
            numberOfLines={formData.para_tipo === 'json' ? 4 : 1}
          />
        </View>

        <View style={parametrosStyles.inputGroup}>
          <Text style={parametrosStyles.label}>Descrição</Text>
          <TextInput
            style={[parametrosStyles.input, parametrosStyles.textArea]}
            value={formData.para_desc}
            onChangeText={(value) => handleChange('para_desc', value)}
            placeholder="Descrição do parâmetro"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={parametrosStyles.switchGroup}>
          <Text style={parametrosStyles.label}>Parâmetro Ativo</Text>
          <Switch
            value={formData.para_ativ}
            onValueChange={(value) => handleChange('para_ativ', value)}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={formData.para_ativ ? '#007bff' : '#f4f3f4'}
          />
        </View>

        <View style={parametrosStyles.metadadosContainer}>
          <Text style={parametrosStyles.metadadosLabel}>Empresa: {empresaId}</Text>
          <Text style={parametrosStyles.metadadosLabel}>Filial: {filialId}</Text>
        </View>

        <TouchableOpacity
          style={[parametrosStyles.salvarButton, isSalvando && parametrosStyles.buttonDisabled]}
          onPress={salvarParametro}
          disabled={isSalvando}>
          <Text style={parametrosStyles.salvarButtonText}>
            {isSalvando ? 'Salvando...' : isEdicao ? 'Atualizar' : 'Salvar'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

function getPlaceholderPorTipo(tipo) {
  switch (tipo) {
    case 'string':
      return 'Ex: Sistema SPS'
    case 'boolean':
      return 'Ex: true, false, 1, 0'
    case 'integer':
      return 'Ex: 30'
    case 'decimal':
      return 'Ex: 15.50'
    case 'json':
      return '{"chave": "valor"}'
    default:
      return 'Digite o valor'
  }
}

// Remover a criação manual e usar configurações pré-definidas no código
const PARAMETROS_SISTEMA = {
  'backup_automatico': { tipo: 'boolean', default: true, descricao: 'Backup automático' },
  'dias_backup': { tipo: 'integer', default: 7, descricao: 'Dias para manter backup' },
  'email_notificacoes': { tipo: 'boolean', default: true, descricao: 'Notificações por email' }
}
