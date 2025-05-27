import React, { useEffect, useState } from 'react'
import { ScrollView, ActivityIndicator, Alert } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import DatePickerField from '../componetsImplantacao/DatePickerField'
import ClienteInput from '../componetsImplantacao/ClienteInput'
import ModulosSelector from '../componetsImplantacao/ModulosSelector'
import TelasModal from '../componetsImplantacao/TelasModal'
import ImplantadorInput from '../componetsImplantacao/ImplantadorInput'
import StatusSelector from '../componetsImplantacao/StatusSelector'
import TreinadoCheckbox from '../componetsImplantacao/TreinadoCheckbox'
import ObservacoesInput from '../componetsImplantacao/ObservacoesInput'
import SaveButton from '../componetsImplantacao/SaveButton'
import { getStoredData } from '../services/storageService'
import { apiPostComContexto, apiPutComContexto } from '../utils/api'
import styles from '../styles/formStyles'

export default function ImplantacaoForm({ navigation, route }) {
  const editarImplantacao = route.params?.implantacao || null

  const [slug, setSlug] = useState('')
  const [cliente, setCliente] = useState('')
  const [modulosSelecionados, setModulosSelecionados] = useState([])
  const [telasSelecionadasPorModulo, setTelasSelecionadasPorModulo] = useState(
    []
  )
  const [modalModuloAtual, setModalModuloAtual] = useState(null)
  const [implantador, setImplantador] = useState('')
  const [dataImplantacao, setDataImplantacao] = useState(new Date())
  const [status, setStatus] = useState('nao_iniciado')
  const [treinado, setTreinado] = useState(false)
  const [observacoes, setObservacoes] = useState('')
  const [loading, setLoading] = useState(false)
  const [empresa, setEmpresa] = useState('')
  const [filial, setFilial] = useState('')

  useEffect(() => {
    async function loadSlug() {
      try {
        const { slug } = await getStoredData()
        if (slug) setSlug(slug)
      } catch (e) {
        console.error('Erro ao carregar slug:', e.message)
      }
    }
    loadSlug()
  }, [])

  useEffect(() => {
    async function loadContext() {
      try {
        const [empresaId, filialId] = await Promise.all([
          AsyncStorage.getItem('empresaId'),
          AsyncStorage.getItem('filialId'),
        ])
        setEmpresa(empresaId)
        setFilial(filialId)
      } catch (e) {
        console.error('Erro ao carregar contexto:', e)
      }
    }
    loadContext()
  }, [])

  useEffect(() => {
    if (editarImplantacao) {
      setCliente(editarImplantacao.cliente)
      setModulosSelecionados(editarImplantacao.modulos || [])
      setTelasSelecionadasPorModulo(editarImplantacao.telas || {})
      setImplantador(editarImplantacao.implantador)
      setDataImplantacao(new Date(editarImplantacao.data_implantacao))
      setStatus(editarImplantacao.status)
      setTreinado(editarImplantacao.treinado)
      setObservacoes(editarImplantacao.observacoes || '')
    }
  }, [editarImplantacao])

  const salvarImplantacao = async () => {
    if (
      !cliente ||
      modulosSelecionados.length === 0 ||
      Object.keys(telasSelecionadasPorModulo).length === 0 ||
      !implantador ||
      !dataImplantacao
    ) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios')
      return
    }

    setLoading(true)
    try {
      const payload = {
        cliente,
        modulos: modulosSelecionados,
        telas: Object.values(telasSelecionadasPorModulo).flat(),
        implantador,
        data_implantacao: dataImplantacao.toISOString().split('T')[0],
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
        { text: 'Ok', onPress: () => navigation.goBack() },
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
      <DatePickerField date={dataImplantacao} setDate={setDataImplantacao} />
      <ClienteInput cliente={cliente} setCliente={setCliente} />
      <ModulosSelector
        modulosSelecionados={modulosSelecionados}
        setModulosSelecionados={setModulosSelecionados}
        setModalModuloAtual={setModalModuloAtual}
        setTelasSelecionadasPorModulo={setTelasSelecionadasPorModulo}
      />
      <TelasModal
        modalModuloAtual={modalModuloAtual}
        setModalModuloAtual={setModalModuloAtual}
        telasSelecionadasPorModulo={telasSelecionadasPorModulo}
        setTelasSelecionadasPorModulo={setTelasSelecionadasPorModulo}
      />
      <ImplantadorInput
        implantador={implantador}
        setImplantador={setImplantador}
      />
      <StatusSelector status={status} setStatus={setStatus} />
      <TreinadoCheckbox treinado={treinado} setTreinado={setTreinado} />
      <ObservacoesInput
        observacoes={observacoes}
        setObservacoes={setObservacoes}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <SaveButton onPress={salvarImplantacao} />
      )}
    </ScrollView>
  )
}
