import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native'
import { getStoredData } from '../services/storageService'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  apiPost,
  apiPut,
  apiGet,
  apiPutComContexto,
  apiPostComContexto,
} from '../utils/api'
import styles from '../styles/formStyles'

const MODULOS_CHOICES = [
  { label: 'Cadastros', value: 'cadastro' },
  { label: 'Estoque', value: 'estoque' },
  { label: 'Compras', value: 'compras' },
  { label: 'Vendas', value: 'vendas' },
  { label: 'Financeiro', value: 'financeiro' },
  { label: 'Agrícola', value: 'agricola' },
  { label: 'Ordem de Serviço', value: 'os' },
  { label: 'Transportes', value: 'transportes' },
  { label: 'Confecção', value: 'confeccao' },
  { label: 'Controle de Materiais', value: 'materiais' },
]

const TELAS_POR_MODULO = {
  cadastro: [
    'Entidades',
    'Centros de Custos',
    'CFOPs',
    'Grupo de Entidades',
    'Mensagens Fiscais',
    'Condições de Recebimento',
  ],
  estoque: ['Cadastro de Produtos', 'Entradas', 'Saídas', 'Saldo', 'Etiquetas'],
  compras: [
    'Entrada Xml',
    'Pedidos de Compra',
    'Relatórios',
    'Nota de Entrada Própria',
  ],
  vendas: ['Pedidos de Venda', 'Orçamentos', 'Nota Fiscal', 'Relatórios'],
  financeiro: ['Contas a Pagar', 'Contas a Receber', 'Fluxo de Caixa'],
  agricola: ['Talhões', 'Aplicações', 'Colheitas', 'Abastecimento'],
  os: ['Abertura de OS', 'Execução', 'Encerramento', 'Relatórios'],
  transportes: ['MDFe', 'Cte', 'Rotas', 'Entregas', 'Motoristas'],
  confeccao: ['Confecção de Jóias', 'Ordens de Produção'],
  materiais: ['Consumo', 'Requisição', 'Estoque Interno'],
}

export default function ImplantacaoForm({ navigation, route }) {
  const [slug, setSlug] = useState('')
  const [cliente, setCliente] = useState('')
  const [modulo, setModulo] = useState('')
  const [tela, setTela] = useState('')
  const [implantador, setImplantador] = useState('')
  const [dataImplantacao, setDataImplantacao] = useState('')
  const [status, setStatus] = useState('nao_iniciado')
  const [treinado, setTreinado] = useState(false)
  const [observacoes, setObservacoes] = useState('')
  const [loading, setLoading] = useState(false)
  const [telasDisponiveis, setTelasDisponiveis] = useState([])
  const [empresa, SetEmpresa] = useState([])
  const [filial, SetFilial] = useState([])

  const editarImplantacao = route.params?.implantacao

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
    if (modulo) {
      setTela('') // reseta a tela quando mudar módulo
      setTelasDisponiveis(TELAS_POR_MODULO[modulo] || [])
    } else {
      setTelasDisponiveis([])
    }
  }, [modulo])

  useEffect(() => {
    if (editarImplantacao) {
      setCliente(editarImplantacao.cliente)
      setModulo(editarImplantacao.modulo)
      setTela(editarImplantacao.tela)
      setImplantador(editarImplantacao.implantador)
      setDataImplantacao(editarImplantacao.data_implantacao)
      setStatus(editarImplantacao.status)
      setTreinado(editarImplantacao.treinado)
      setObservacoes(editarImplantacao.observacoes || '')
    }
  }, [editarImplantacao])

  const carregarContexto = async () => {
    try {
      const [empresaId, filialId] = await Promise.all([
        AsyncStorage.getItem('empresaId'),
        AsyncStorage.getItem('filialId'),
      ])
      setEmpresa(empresaId)
      setFilial(filialId)
    } catch (error) {
      console.error('Erro ao carregar contexto:', error)
    }
  }

  const salvarImplantacao = async () => {
    if (!cliente || !modulo || !tela || !implantador || !dataImplantacao) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios')
      return
    }
    setLoading(true)
    try {
      const payload = {
        cliente,
        modulo,
        tela,
        implantador,
        data_implantacao: dataImplantacao,
        status,
        treinado,
        observacoes,
        empresa,
        filial,
      }

      if (editarImplantacao) {
        await apiPutComContexto(
          `implantacao/implantacoes/${editarImplantacao.id}/`,
          payload
        )
      } else {
        await apiPostComContexto(`implantacao/implantacoes/`, payload)
      }
      Alert.alert('Sucesso', 'Implantação salva com sucesso', [
        {
          text: 'Ok',
          onPress: () => navigation.goBack(),
        },
      ])
    } catch (error) {
      console.error('Erro ao salvar implantação:', error.message)
      Alert.alert('Erro', 'Falha ao salvar implantação')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Cliente *</Text>
      <TextInput
        style={styles.input}
        value={cliente}
        onChangeText={setCliente}
        placeholder="Nome do cliente"
      />

      <Text style={styles.label}>Módulo *</Text>
      {MODULOS_CHOICES.map(({ label, value }) => (
        <TouchableOpacity
          key={value}
          style={[
            styles.choiceButton,
            modulo === value && styles.choiceButtonSelected,
          ]}
          onPress={() => setModulo(value)}>
          <Text
            style={[
              styles.choiceButtonText,
              modulo === value && styles.choiceButtonTextSelected,
            ]}>
            {label}
          </Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.label}>Tela *</Text>
      {telasDisponiveis.length === 0 && (
        <Text style={{ marginBottom: 10 }}>Escolha um módulo primeiro</Text>
      )}
      {telasDisponiveis.map((nomeTela) => (
        <TouchableOpacity
          key={nomeTela}
          style={[
            styles.choiceButton,
            tela === nomeTela && styles.choiceButtonSelected,
          ]}
          onPress={() => setTela(nomeTela)}>
          <Text
            style={[
              styles.choiceButtonText,
              tela === nomeTela && styles.choiceButtonTextSelected,
            ]}>
            {nomeTela}
          </Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.label}>Implantador *</Text>
      <TextInput
        style={styles.input}
        value={implantador}
        onChangeText={setImplantador}
        placeholder="Nome do implantador"
      />

      <Text style={styles.label}>Data de Implantação *</Text>
      <TextInput
        style={styles.input}
        value={dataImplantacao}
        onChangeText={setDataImplantacao}
        placeholder="YYYY-MM-DD"
      />

      <Text style={styles.label}>Status</Text>
      {['nao_iniciado', 'em_andamento', 'finalizado'].map((s) => (
        <TouchableOpacity
          key={s}
          style={[
            styles.choiceButton,
            status === s && styles.choiceButtonSelected,
          ]}
          onPress={() => setStatus(s)}>
          <Text
            style={[
              styles.choiceButtonText,
              status === s && styles.choiceButtonTextSelected,
            ]}>
            {s.replace('_', ' ').toUpperCase()}
          </Text>
        </TouchableOpacity>
      ))}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginVertical: 10,
        }}>
        <TouchableOpacity
          onPress={() => setTreinado(!treinado)}
          style={[styles.checkbox, treinado && styles.checkboxChecked]}>
          {treinado && <Text style={{ color: 'white' }}>✔</Text>}
        </TouchableOpacity>
        <Text>Treinado</Text>
      </View>

      <Text style={styles.label}>Observações</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        value={observacoes}
        onChangeText={setObservacoes}
        placeholder="Observações adicionais"
        multiline
      />

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <TouchableOpacity style={styles.saveButton} onPress={salvarImplantacao}>
          <Text style={styles.saveButtonText}>Salvar</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  )
}
