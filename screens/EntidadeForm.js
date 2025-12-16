import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native'
import { Picker } from '@react-native-picker/picker'
import { TextInputMask } from 'react-native-masked-text'
import Toast from 'react-native-toast-message'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getStoredData } from '../services/storageService'
import { apiPostComContexto, apiPutComContexto, BASE_URL } from '../utils/api'
import styles from '../styles/entidadeStyles'

export default function EntidadeForm({ navigation, route }) {
  const entidade = route.params?.entidade
  const isEdicao = Boolean(entidade)
  const [slug, setSlug] = useState('')
  const [isSalvando, setIsSalvando] = useState(false)

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

  const [formData, setFormData] = useState({
    enti_nome: '',
    enti_tipo_enti: 'CL',
    enti_cpf: '',
    enti_cnpj: '',
    enti_cep: '',
    enti_ende: '',
    enti_nume: '',
    enti_bair: '',
    enti_pais: '1058',
    enti_codi_pais: '1058',
    enti_codi_cida: '',
    enti_cida: '',
    enti_esta: '',
    enti_fone: '',
    enti_celu: '',
    enti_emai: '',
    enti_empr: '',
  })

  const [abaAtual, setAbaAtual] = useState('dados')

  useEffect(() => {
    if (isEdicao && entidade) {
      setFormData((prev) => ({
        ...prev,
        ...entidade,
        enti_pais: entidade.enti_pais || prev.enti_pais || '1058',
        enti_codi_pais:
          entidade.enti_codi_pais || prev.enti_codi_pais || '1058',
        enti_codi_cida: entidade.enti_codi_cida || prev.enti_codi_cida || '',
      }))
    } else {
      const carregarEmpresaFilial = async () => {
        const empresaId = await AsyncStorage.getItem('empresaId')

        setFormData((prev) => ({
          ...prev,
          enti_empr: empresaId,
        }))
      }
      carregarEmpresaFilial()
    }
  }, [entidade, isEdicao])

  const limparMascara = (campo, valor) => {
    switch (campo) {
      case 'enti_cep':
      case 'enti_cpf':
      case 'enti_cnpj':
      case 'enti_fone':
      case 'enti_celu':
        return valor.replace(/\D/g, '')
      default:
        return valor
    }
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: limparMascara(field, value),
    }))
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
    if (!formData.enti_empr) {
      Alert.alert('Erro', 'Empresa nã definida.')
      return false
    }
    return true
  }

  const salvarEntidade = async () => {
    if (!validarFormulario()) return
    setIsSalvando(true)

    const { enti_clie, ...dadosEntidade } = formData

    // Garantir que os campos de país sempre tenham valores válidos
    dadosEntidade.enti_pais = dadosEntidade.enti_pais || '1058'
    dadosEntidade.enti_codi_pais = dadosEntidade.enti_codi_pais || '1058'
    dadosEntidade.enti_codi_cida = dadosEntidade.enti_codi_cida || ''

    try {
      if (!slug) throw new Error('Slug ainda não carregado')

      if (isEdicao) {
        console.log('Dados enviados para salvar entidade:', dadosEntidade)
        await apiPutComContexto(
          `entidades/entidades/${entidade.enti_clie}/`,
          dadosEntidade
        )
      } else {
        console.log('Dados enviados para salvar entidade:', dadosEntidade)
        await apiPostComContexto(`entidades/entidades/`, dadosEntidade)
      }

      Toast.show({
        type: 'success',
        text1: 'Sucesso!',
        text2: `Entidade: #${enti_clie} salva com sucesso 👌`,
      })
      navigation.navigate('Entidades', {
        mensagemSucesso: `Entidade: #${enti_clie} salva com sucesso 👌`,
      })
    } catch (error) {
      console.log(
        'Erro ao salvar entidade:',
        error.response?.data || error.message
      )
      Toast.show({
        type: 'error',
        text1: 'Erro!',
        text2: 'Não foi possível salvar a entidade 😞',
      })
    } finally {
      setIsSalvando(false)
    }
  }

  const buscarEnderecoPorCep = async (cep) => {
    try {
      const { slug, accessToken } = await getStoredData()

      // ✅ ADICIONAR VALIDAÇÃO
      if (!slug || !accessToken) {
        console.error('Slug ou token não encontrados:', { slug, accessToken })
        throw new Error('Dados de autenticação não encontrados')
      }

      const response = await fetch(
        `${BASE_URL}/api/${slug}/entidades/entidades/buscar-endereco/?cep=${cep}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )

      if (!response.ok) throw new Error('Falha ao buscar endereço')

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
        enti_pais: data.pais || prev.enti_pais || '1058',
        enti_codi_pais: data.pais || prev.enti_codi_pais || '1058',
        enti_codi_cida: data.codi_cidade || prev.enti_codi_cida || '',
      }))
    } catch (error) {
      console.error('Erro ao buscar endereço:', error)
      Alert.alert('Erro na busca do CEP', error.message)
    }
  }

  return (
    <ScrollView style={styles.container}>
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
              const cepLimpo = text.replace(/\D/g, '')
              handleChange('enti_cep', text)
              if (cepLimpo.length === 8) buscarEnderecoPorCep(cepLimpo)
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

          <Text style={styles.label}>Bairro</Text>
          <TextInput
            style={styles.input}
            value={formData.enti_bair}
            onChangeText={(text) => handleChange('enti_bair', text)}
          />

          <Text style={styles.label}>País</Text>
          <TextInput
            style={styles.input}
            value={formData.enti_pais}
            onChangeText={(text) => handleChange('enti_pais', text)}
          />

          <Text style={styles.label}>Cidade</Text>
          <TextInput
            style={styles.input}
            value={formData.enti_cida}
            onChangeText={(text) => handleChange('enti_cida', text)}
          />

          <Text style={styles.label}>Código da Cidade (IBGE)</Text>
          <TextInput
            style={styles.input}
            value={formData.enti_codi_cida}
            onChangeText={(text) => handleChange('enti_codi_cida', text)}
            keyboardType="numeric"
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

      <TouchableOpacity
        style={styles.botaoSalvar}
        onPress={salvarEntidade}
        disabled={isSalvando}>
        <Text style={styles.botaoTexto}>
          {isEdicao ? 'Salvar Alterações' : 'Cadastrar Entidade'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  )
}
