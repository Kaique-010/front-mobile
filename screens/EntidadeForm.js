import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native'
import Toast from 'react-native-toast-message'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getStoredData } from '../services/storageService'
import AbaControleClientes from '../componentsLoginClientes/abaControleClientes'
import AbaDados from '../componentsEntidades/AbaDados'
import AbaEndereco from '../componentsEntidades/AbaEndereco'
import AbaContato from '../componentsEntidades/AbaContato'
import {
  apiPostComContexto,
  apiPutComContexto,
  apiGetComContexto,
  BASE_URL,
} from '../utils/api'
import styles from '../styles/entidadeStyles'
import { handleApiError } from '../utils/errorHandler'

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
        else handleApiError(null, 'Slug não encontrado', 'Erro de Slug')
      } catch (err) {
        handleApiError(err, 'Erro ao carregar slug', 'Erro de Slug')
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
    enti_mobi_usua: '',
    enti_mobi_senh: '',
  })

  const [abaAtual, setAbaAtual] = useState('dados')

  useEffect(() => {
    if (isEdicao && entidade) {
      console.log(
        'Dados recebidos da navegação (route.params):',
        JSON.stringify(entidade, null, 2)
      )

      // Se for edição, garante que enti_empr também seja carregado se não vier no objeto entidade
      const carregarDadosEdicao = async () => {
        let empresaId = entidade.enti_empr
        if (!empresaId) {
          empresaId = await AsyncStorage.getItem('empresaId')
        }

        // 1. Carrega dados iniciais da navegação para não ficar vazio
        setFormData((prev) => ({
          ...prev,
          ...entidade,
          enti_empr: empresaId,
          enti_pais: entidade.enti_pais || prev.enti_pais || '1058',
          enti_codi_pais:
            entidade.enti_codi_pais || prev.enti_codi_pais || '1058',
          enti_codi_cida: entidade.enti_codi_cida || prev.enti_codi_cida || '',
        }))

        // 2. Busca dados completos na API
        try {
          console.log(
            `Buscando dados completos da entidade ${entidade.enti_clie} na API...`
          )
          const dadosCompletos = await apiGetComContexto(
            `entidades/entidades/${entidade.enti_clie}/`
          )
          console.log(
            'Dados completos recebidos da API:',
            JSON.stringify(dadosCompletos, null, 2)
          )

          if (dadosCompletos) {
            setFormData((prev) => ({
              ...prev,
              ...dadosCompletos,
              // Mantemos o ID da empresa se a API não trouxer ou trouxer vazio (precaução)
              enti_empr: dadosCompletos.enti_empr || empresaId,
              enti_pais: dadosCompletos.enti_pais || prev.enti_pais || '1058',
              enti_codi_pais:
                dadosCompletos.enti_codi_pais || prev.enti_codi_pais || '1058',
              enti_codi_cida:
                dadosCompletos.enti_codi_cida || prev.enti_codi_cida || '',
            }))
          }
        } catch (error) {
          console.error('Erro ao buscar detalhes da entidade:', error)
          handleApiError(
            error,
            'Não foi possível carregar os detalhes completos.',
            'Erro de Carregamento'
          )
        }
      }
      carregarDadosEdicao()
    } else {
      const carregarEmpresaFilial = async () => {
        try {
          const empresaId = await AsyncStorage.getItem('empresaId')
          console.log('[DEBUG] Carregando empresaId do Storage:', empresaId)

          setFormData((prev) => ({
            ...prev,
            enti_empr: empresaId,
          }))
        } catch (err) {
          handleApiError(err, 'Erro ao carregar empresaId', 'Erro de Empresa')
        }
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
    if (!formData.enti_nome?.trim()) {
      handleApiError(null, 'O nome é obrigatório.', 'Erro de Validação')
      return false
    }
    if (!formData.enti_empr) {
      handleApiError(null, 'Empresa não definida.', 'Erro de Validação')
      return false
    }
    return true
  }

  const salvarEntidade = async () => {
    console.log('Botão salvar pressionado')
    if (!validarFormulario()) {
      handleApiError(null, 'Validação falhou.', 'Erro de Validação')
      return
    }
    setIsSalvando(true)

    const { enti_clie, ...dadosEntidade } = formData

    // Garantir que os campos de país sempre tenham valores válidos
    dadosEntidade.enti_pais = dadosEntidade.enti_pais || '1058'
    dadosEntidade.enti_codi_pais = dadosEntidade.enti_codi_pais || '1058'
    dadosEntidade.enti_codi_cida = dadosEntidade.enti_codi_cida || ''

    // Garantir número (enti_nume)
    if (!dadosEntidade.enti_nume || dadosEntidade.enti_nume.trim() === '') {
      dadosEntidade.enti_nume = 'S/N'
    }

    try {
      if (!slug) throw new Error('Slug ainda não carregado')

      let responseData

      if (isEdicao) {
        handleApiError(
          null,
          'Dados enviados para salvar entidade (PUT):',
          dadosEntidade
        )
        responseData = await apiPutComContexto(
          `entidades/entidades/${entidade.enti_clie}/`,
          dadosEntidade
        )
      } else {
        handleApiError(
          null,
          'Dados enviados para salvar entidade (POST):',
          dadosEntidade
        )
        responseData = await apiPostComContexto(
          `entidades/entidades/`,
          dadosEntidade
        )
      }

      const idEntidade = responseData?.enti_clie || entidade?.enti_clie || 'ID'

      Toast.show({
        type: 'success',
        text1: 'Sucesso!',
        text2: `Entidade: #${idEntidade} salva com sucesso 👌`,
      })
      navigation.navigate('Entidades', {
        mensagemSucesso: `Entidade: #${idEntidade} salva com sucesso 👌`,
      })
    } catch (error) {
      handleApiError(
        error,
        'Não foi possível salvar a entidade 😞',
        'Erro ao Salvar'
      )
    } finally {
      setIsSalvando(false)
    }
  }

  const buscarEnderecoPorCep = async (cep) => {
    try {
      const { slug, accessToken } = await getStoredData()

      // ✅ ADICIONAR VALIDAÇÃO
      if (!slug || !accessToken) {
        handleApiError(
          new Error('Dados de autenticação não encontrados'),
          'Erro ao buscar endereço',
          'Dados de Autenticação'
        )
        return
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
        handleApiError(data.erro, 'CEP não encontrado', 'Erro de CEP')
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
      handleApiError(error, 'Erro ao buscar endereço', 'Erro de CEP')
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.tabsContainer}>
        {['dados', 'endereco', 'contato', 'clientes'].map((aba) => (
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
              {aba === 'clientes' && 'Acesso'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {abaAtual === 'dados' && (
        <AbaDados formData={formData} handleChange={handleChange} />
      )}

      {abaAtual === 'endereco' && (
        <AbaEndereco
          formData={formData}
          handleChange={handleChange}
          buscarEnderecoPorCep={buscarEnderecoPorCep}
        />
      )}

      {abaAtual === 'contato' && (
        <AbaContato formData={formData} handleChange={handleChange} />
      )}
      {abaAtual === 'clientes' && (
        <AbaControleClientes
          abaAtual={abaAtual}
          formData={formData}
          handleChange={handleChange}
        />
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
