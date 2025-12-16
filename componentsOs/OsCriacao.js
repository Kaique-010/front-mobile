import React, { useEffect, useState, useRef, useCallback } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  Modal,
  KeyboardAvoidingView,
} from 'react-native'
import CrossCheckbox from '../components/CrossCheckbox'
import { Picker } from '@react-native-picker/picker'
import DateTimePicker from '@react-native-community/datetimepicker'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import useContextoApp from '../hooks/useContextoApp'
import BuscaClienteInput from '../components/BuscaClienteInput'
import BuscaSetorInput from '../components/BuscaSetorInput'
import BuscaMarcasInput from '../components/BuscaMarcasInput'
import BuscaVoltagemInput from '../components/BuscaVoltagemInput'
import ErrorBoundary from '../components/ErrorBoundary'
import {
  apiPostComContexto,
  apiGetComContexto,
  apiPatchComContexto,
} from '../utils/api'
import AbaPecas from '../componentsOs/AbaPecas'
import AbaServicos from '../componentsOs/AbaServicos'
import AbaForos from '../componentsOs/AbaForos'
import AbaTotais from '../componentsOs/AbaTotais'
import Toast from 'react-native-toast-message'
import {
  ORDER_FIELDS_CONFIG,
  TIPOS_ORDEM,
} from '../componentsOs/orderFieldsConfig'

export default function CriarOrdemServico() {
  const { usuarioId, empresaId, filialId, carregando } = useContextoApp()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitLock, setSubmitLock] = useState(false)
  const submitLockRef = useRef(false)
  const notaFiscalRef = useRef(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showDatePickerReprov, setShowDatePickerReprov] = useState(false)
  const [showSetorReprovModal, setShowSetorReprovModal] = useState(false)
  const [setorReprovNome, setSetorReprovNome] = useState('')
  const [abaAtiva, setAbaAtiva] = useState('cliente')
  const [orde_nume, setNumeroOS] = useState(null)
  const [financeiroGerado, setFinanceiroGerado] = useState(false)
  const [setorNome, setSetorNome] = useState('')

  const [ordemServico, setOrdemServico] = useState({
    orde_nume: '',
    orde_tipo: '',
    orde_enti: null,
    orde_enti_nome: '',
    orde_data_aber: new Date().toISOString().split('T')[0],
    orde_seto: '',
    pecas: [],
    servicos: [],
    fotos: [],
    orde_pote: '',
    orde_volt: '',
    orde_ampe: '',
    orde_hz: '',
    orde_rpm: '',
    orde_marc: '',
    orde_seri: '',
    orde_mode: '',
    orde_patr: '',
    orde_cond: '',
    orde_polo: '',
    orde_foco: '',
    orde_esta_chap: '',
    orde_esta_comp: '',
    orde_esta_cabo: '',
    orde_esta_quan_cabo: '',
    orde_esta_fio: '',
    orde_esta_quan_fio: '',
    orde_esta_larg: '',
    orde_esta_liga: '',
    orde_esta_mate: '',
    orde_esta_quan_mate: '',
    orde_grau_ip: '',
    orde_isol: '',
    orde_tens_camp: '',
    orde_corr_camp: '',
    orde_tens_arma: '',
    orde_corr_arma: '',
    orde_obse: '',
    orde_nf_entr: '',
    orde_gara: '',
    orde_sem_cons: '',
    orde_data_repr: '',
    orde_seto_repr: '',
    orde_fina_ofic: false,
    orde_stat_orde: '',
    orde_orde_ante: '',
  })

  const [camposVisiveis, setCamposVisiveis] = useState([])

  // Função de limpeza de campos isolada e memorizada
  const limparCamposNaoVisiveis = useCallback((camposAtivos) => {
    const keysAtivos = camposAtivos.map((c) => c.key)
    const camposParaLimpar = {}

    const todosCampos = [
      'orde_pote',
      'orde_volt',
      'orde_ampe',
      'orde_hz',
      'orde_rpm',
      'orde_marc',
      'orde_seri',
      'orde_mode',
      'orde_patr',
      'orde_cond',
      'orde_polo',
      'orde_foco',
      'orde_esta_chap',
      'orde_esta_comp',
      'orde_esta_cabo',
      'orde_esta_quan_cabo',
      'orde_esta_fio',
      'orde_esta_quan_fio',
      'orde_esta_larg',
      'orde_esta_liga',
      'orde_esta_mate',
      'orde_esta_quan_mate',
      'orde_grau_ip',
      'orde_isol',
      'orde_tens_camp',
      'orde_corr_camp',
      'orde_tens_arma',
      'orde_corr_arma',
      'orde_obse',
    ]

    todosCampos.forEach((campo) => {
      if (!keysAtivos.includes(campo)) {
        camposParaLimpar[campo] = ''
      }
    })

    setOrdemServico((prev) => ({ ...prev, ...camposParaLimpar }))
  }, [])

  // Atualiza campos visíveis quando o tipo muda
  useEffect(() => {
    if (ordemServico.orde_tipo) {
      const config = ORDER_FIELDS_CONFIG[ordemServico.orde_tipo]
      if (config) {
        setCamposVisiveis(config.campos)
        limparCamposNaoVisiveis(config.campos)
      }
    } else {
      setCamposVisiveis([])
    }
  }, [ordemServico.orde_tipo, limparCamposNaoVisiveis])

  // handleInputChange simplificado e memorizado
  const handleInputChange = useCallback((key, value) => {
    console.log(
      `🔄 handleInputChange: ${key} = ${value} (tipo: ${typeof value})`
    )

    setOrdemServico((prev) => {
      let nextValue = value

      // Normalização de valores
      if (key === 'orde_seto' || key === 'orde_seto_repr') {
        if (value && typeof value === 'object' && value.osfs_codi) {
          nextValue = Number(value.osfs_codi)
        } else if (value === '' || value === null || value === undefined) {
          nextValue = ''
        } else if (typeof value === 'string' && /^\d+$/.test(value.trim())) {
          nextValue = Number(value)
        }
      } else if (key === 'orde_volt') {
        if (value && typeof value === 'object' && value.osvo_codi) {
          nextValue = Number(value.osvo_codi)
        } else if (value === '' || value === null || value === undefined) {
          nextValue = ''
        } else if (typeof value === 'string' && /^\d+$/.test(value.trim())) {
          nextValue = Number(value)
        }
      } else if (key === 'orde_marc') {
        if (value && typeof value === 'object' && value.codigo) {
          nextValue = Number(value.codigo)
        } else if (value === '' || value === null || value === undefined) {
          nextValue = ''
        } else if (typeof value === 'string' && /^\d+$/.test(value.trim())) {
          nextValue = Number(value)
        }
      } else {
        // Campos de texto
        nextValue = value === null || value === undefined ? '' : String(value)
      }

      console.log(
        `✅ Valor final para ${key}:`,
        nextValue,
        `(tipo: ${typeof nextValue})`
      )

      return {
        ...prev,
        [key]: nextValue,
      }
    })
  }, [])

  // Funções auxiliares simplificadas
  const preencherSetorGarantia = useCallback(() => {
    console.log('🔧 Preenchendo setor Garantia (3)')
    handleInputChange('orde_seto', 3)
    setSetorNome('Garantia')
  }, [handleInputChange])

  const preencherSetorExpedicao = useCallback(() => {
    console.log('🔧 Preenchendo setor Expedição (13)')
    handleInputChange('orde_seto', 13)
    handleInputChange('orde_fina_ofic', true)
    handleInputChange('orde_stat_orde', 4)
    setSetorNome('Expedição')
  }, [handleInputChange])

  const validarMudancaAba = (novaAba) => {
    if (financeiroGerado && (novaAba === 'pecas' || novaAba === 'servicos')) {
      Toast.show({
        type: 'warning',
        text1: 'Atenção',
        text2:
          'Não é possível modificar peças ou serviços após gerar o financeiro',
      })
      return false
    }
    return true
  }

  const validarOrdemServico = () => {
    console.log('🔍 Validando ordem de serviço...')

    if (!ordemServico.orde_nume || ordemServico.orde_nume.trim() === '') {
      Toast.show({
        type: 'error',
        text1: 'Número da O.S ausente',
        text2: 'Por favor, informe o número da O.S antes de salvar',
      })
      return false
    }

    if (!ordemServico.orde_enti) {
      Toast.show({
        type: 'error',
        text1: 'Cliente não selecionado',
        text2: 'Por favor, selecione um cliente para continuar',
      })
      return false
    }

    if (!ordemServico.orde_data_aber) {
      Toast.show({
        type: 'error',
        text1: 'Data inválida',
        text2: 'Por favor, selecione uma data válida',
      })
      return false
    }

    return true
  }

  const salvarOrdemServico = async () => {
    console.log('🚀 Iniciando salvamento...')

    if (submitLockRef.current) {
      console.log('🔒 Salvamento já em andamento')
      return
    }

    submitLockRef.current = true

    if (submitLock || isSubmitting) {
      console.log('🔒 Locks já ativos')
      submitLockRef.current = false
      return
    }

    if (!validarOrdemServico()) {
      submitLockRef.current = false
      return
    }

    setSubmitLock(true)
    setIsSubmitting(true)

    try {
      const payload = {
        orde_nume: ordemServico.orde_nume,
        orde_enti: ordemServico.orde_enti,
        orde_data_aber: ordemServico.orde_data_aber,
        orde_tipo: ordemServico.orde_tipo?.toString() || '1',
        orde_empr: empresaId?.toString() || '',
        orde_fili: filialId?.toString() || '',
        usua: usuarioId?.toString() || '',
        orde_seto:
          ordemServico.orde_seto !== '' && ordemServico.orde_seto !== null
            ? Number(ordemServico.orde_seto)
            : 2,
        orde_nf_entr: ordemServico.orde_nf_entr?.toString() || '',
        orde_gara: ordemServico.orde_gara?.toString() || '',
        orde_sem_cons: ordemServico.orde_sem_cons ? 'S' : '',
        orde_data_repr:
          ordemServico.orde_data_repr &&
          ordemServico.orde_data_repr.trim() !== ''
            ? ordemServico.orde_data_repr
            : null,
        orde_seto_repr:
          ordemServico.orde_seto_repr !== '' &&
          ordemServico.orde_seto_repr !== null
            ? Number(ordemServico.orde_seto_repr)
            : null,
        orde_fina_ofic: ordemServico.orde_fina_ofic ? '1' : '0',
        orde_stat_orde:
          ordemServico.orde_stat_orde !== '' &&
          ordemServico.orde_stat_orde !== null
            ? Number(ordemServico.orde_stat_orde)
            : 0,
        orde_orde_ante: ordemServico.orde_orde_ante?.toString() || '',
      }

      camposVisiveis.forEach((campo) => {
        const valor = ordemServico[campo.key]
        if (valor && valor !== '') {
          payload[campo.key] = valor
        }
      })

      console.log('📤 Enviando payload:', payload)

      const data = await apiPostComContexto('ordemdeservico/ordens/', payload)
      console.log('✅ Resposta da API:', data)

      if (!data.orde_nume) {
        throw new Error('Número da O.S não retornado pelo servidor')
      }

      // Aplicar PATCH se necessário
      try {
        const setorSelecionado = Number(ordemServico.orde_seto)
        const desejaStatusQuatro =
          Number(ordemServico.orde_stat_orde) === 4 || setorSelecionado === 13

        if (desejaStatusQuatro) {
          console.log('🔧 Aplicando PATCH para status 4...')
          await apiPatchComContexto(
            `ordemdeservico/ordens/${data.orde_nume}/`,
            { orde_stat_orde: 4 }
          )
          console.log('✅ Status atualizado para 4')
        }
      } catch (patchErr) {
        console.warn('⚠️ Erro ao aplicar PATCH:', patchErr?.message)
      }

      setNumeroOS(data.orde_nume)
      setAbaAtiva('pecas')

      Toast.show({
        type: 'success',
        text1: 'O.S criada com sucesso!',
        text2: `Número da O.S: ${data.orde_nume}`,
      })
    } catch (error) {
      console.error('💥 Erro ao criar O.S:', error)

      let errorMessage = 'Tente novamente mais tarde'

      if (error.response?.data) {
        const errorData = error.response.data

        if (errorData.orde_nume && Array.isArray(errorData.orde_nume)) {
          const duplicateError = errorData.orde_nume.find(
            (err) => err.includes('já existe') || err.includes('unique')
          )
          if (duplicateError) {
            errorMessage = `O número ${ordemServico.orde_nume} já está em uso.`
          }
        } else if (errorData.message) {
          errorMessage = errorData.message
        } else if (errorData.error) {
          errorMessage = errorData.error
        } else if (typeof errorData === 'string') {
          errorMessage = errorData
        }
      } else if (error.message) {
        errorMessage = error.message
      }

      Toast.show({
        type: 'error',
        text1: 'Erro ao criar O.S',
        text2: errorMessage,
        visibilityTime: 5000,
      })
    } finally {
      submitLockRef.current = false
      setSubmitLock(false)
      setIsSubmitting(false)
    }
  }

  const renderCampo = (campo) => {
    const valor = ordemServico[campo.key] || ''

    if (campo.tipo === 'textarea') {
      return (
        <View key={campo.key} style={styles.fieldContainer}>
          <Text style={styles.label}>
            {campo.label}
            {campo.required && <Text style={styles.required}> *</Text>}:
          </Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={valor === null || valor === undefined ? '' : String(valor)}
            onChangeText={(value) => handleInputChange(campo.key, value)}
            placeholder={`Digite ${campo.label.toLowerCase()}`}
            placeholderTextColor="#666"
            multiline
            numberOfLines={4}
          />
        </View>
      )
    }

    if (campo.tipo === 'BuscaVoltagemInput') {
      return (
        <View key={campo.key} style={styles.fieldContainer}>
          <Text style={styles.label}>
            {campo.label}
            {campo.required && <Text style={styles.required}> *</Text>}:
          </Text>
          <ErrorBoundary>
            <BuscaVoltagemInput
              initialValue={valor}
              onSelect={(valorSelecionado) => {
                const codigoVoltagem =
                  typeof valorSelecionado === 'object'
                    ? valorSelecionado?.osvo_codi
                    : valorSelecionado
                handleInputChange(campo.key, codigoVoltagem || '')
              }}
            />
          </ErrorBoundary>
        </View>
      )
    }

    if (campo.tipo === 'BuscaMarcasInput') {
      return (
        <View key={campo.key} style={styles.fieldContainer}>
          <Text style={styles.label}>
            {campo.label}
            {campo.required && <Text style={styles.required}> *</Text>}:
          </Text>
          <ErrorBoundary>
            <BuscaMarcasInput
              initialValue={valor}
              onSelect={(valorSelecionado) => {
                const codigoMarca =
                  typeof valorSelecionado === 'object'
                    ? valorSelecionado?.codigo
                    : valorSelecionado
                handleInputChange(campo.key, codigoMarca || '')
              }}
            />
          </ErrorBoundary>
        </View>
      )
    }

    return (
      <View key={campo.key} style={styles.fieldContainer}>
        <Text style={styles.label}>
          {campo.label}
          {campo.required && <Text style={styles.required}> *</Text>}:
        </Text>
        <TextInput
          style={styles.input}
          value={valor === null || valor === undefined ? '' : String(valor)}
          onChangeText={(value) => handleInputChange(campo.key, value)}
          placeholder={`Digite ${campo.label.toLowerCase()}`}
          placeholderTextColor="#666"
          keyboardType={campo.tipo === 'number' ? 'numeric' : 'default'}
        />
      </View>
    )
  }

  if (carregando) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#121212',
        }}>
        <ActivityIndicator size="large" color="#10a2a7" />
        <Text style={{ color: '#fff', marginTop: 10 }}>Carregando...</Text>
      </View>
    )
  }

  return (
    <KeyboardAwareScrollView
      style={{ backgroundColor: '#0f1f2a' }}
      contentContainerStyle={{ flexGrow: 1 }}
      nestedScrollEnabled
      keyboardShouldPersistTaps="handled"
      behavior="padding"
      keyboardVerticalOffset={100}>
      <View style={{ padding: 20, backgroundColor: '#0f1f2a' }}>
        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
          {['cliente', 'pecas', 'servicos', 'fotos'].map((aba) => (
            <TouchableOpacity
              key={aba}
              onPress={() => {
                if (validarMudancaAba(aba)) {
                  setAbaAtiva(aba)
                }
              }}
              style={{
                flex: 1,
                padding: 10,
                borderBottomWidth: 2,
                borderBottomColor: abaAtiva === aba ? '#10a2a7' : 'gray',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  fontWeight: abaAtiva === aba ? 'bold' : 'normal',
                  color: abaAtiva === aba ? '#10a2a7' : '#fff',
                }}>
                {aba === 'cliente'
                  ? 'Dados O.S'
                  : aba.charAt(0).toUpperCase() + aba.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ flex: 1 }}>
          {abaAtiva === 'cliente' && (
            <>
              <View style={styles.inlineRow}>
                <View style={styles.rowItem}>
                  <Text style={styles.rowLabel}>Garantia</Text>
                  <CrossCheckbox
                    value={Boolean(ordemServico.orde_gara)}
                    onValueChange={(value) => {
                      handleInputChange('orde_gara', value)
                      if (value) {
                        preencherSetorGarantia()
                      }
                    }}
                  />
                </View>
                <View style={styles.rowItem}>
                  <Text style={styles.rowLabel}>Sem Conserto</Text>
                  <CrossCheckbox
                    value={ordemServico.orde_sem_cons}
                    onValueChange={(value) => {
                      handleInputChange('orde_sem_cons', value)
                      if (value) {
                        const hoje = new Date().toISOString().split('T')[0]
                        handleInputChange('orde_data_repr', hoje)
                        setShowSetorReprovModal(true)
                      } else {
                        handleInputChange('orde_data_repr', '')
                        handleInputChange('orde_seto_repr', '')
                        setSetorReprovNome('')
                      }
                    }}
                  />
                </View>
                <View style={styles.rowItemDate}>
                  <Text style={styles.rowLabel}>Reprov.:</Text>
                  <TouchableOpacity
                    onPress={() => setShowDatePickerReprov(true)}
                    style={styles.datePill}>
                    <Text style={{ color: '#fff' }} numberOfLines={1}>
                      {ordemServico.orde_data_repr
                        ? new Date(
                            ordemServico.orde_data_repr
                          ).toLocaleDateString()
                        : 'Selecionar'}
                    </Text>
                  </TouchableOpacity>
                </View>
                {ordemServico.orde_sem_cons && (
                  <View style={styles.rowItem}>
                    <Text style={styles.rowLabel}>Setor:</Text>
                    <TouchableOpacity
                      onPress={() => setShowSetorReprovModal(true)}
                      style={styles.datePill}>
                      <Text style={{ color: '#fff' }} numberOfLines={1}>
                        {setorReprovNome ||
                          (ordemServico.orde_seto_repr
                            ? `Código ${ordemServico.orde_seto_repr}`
                            : 'Selecionar')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {showDatePickerReprov && (
                <DateTimePicker
                  value={
                    ordemServico.orde_data_repr
                      ? new Date(ordemServico.orde_data_repr)
                      : new Date()
                  }
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePickerReprov(false)
                    if (selectedDate) {
                      handleInputChange(
                        'orde_data_repr',
                        selectedDate.toISOString().split('T')[0]
                      )
                    }
                  }}
                />
              )}

              <Modal
                visible={showSetorReprovModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowSetorReprovModal(false)}>
                <View
                  style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <View
                    style={{
                      width: '90%',
                      backgroundColor: '#1a2f3d',
                      borderRadius: 12,
                      padding: 16,
                    }}>
                    <Text
                      style={{ color: '#fff', fontSize: 16, marginBottom: 10 }}>
                      Selecionar Setor da Reprovação
                    </Text>
                    <ErrorBoundary>
                      <BuscaSetorInput
                        initialValue={setorReprovNome}
                        onSelect={(setor) => {
                          const codigo = setor?.osfs_codi || ''
                          const nome = setor?.osfs_nome || ''
                          handleInputChange('orde_seto_repr', codigo)
                          setSetorReprovNome(nome)
                          setShowSetorReprovModal(false)
                        }}
                      />
                    </ErrorBoundary>
                    <TouchableOpacity
                      onPress={() => setShowSetorReprovModal(false)}
                      style={{
                        backgroundColor: '#10a2a7',
                        padding: 12,
                        borderRadius: 8,
                        alignItems: 'center',
                        marginTop: 10,
                      }}>
                      <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                        Fechar
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>

              <Text style={styles.label}>
                Nº da O.S<Text style={styles.required}> *</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  !ordemServico.orde_nume && {
                    borderColor: '#1a2f3d',
                    borderWidth: 1,
                  },
                ]}
                value={ordemServico.orde_nume}
                onChangeText={(value) => handleInputChange('orde_nume', value)}
                placeholder="Digite o número da O.S"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />

              <Text style={styles.label}>Data de Abertura:</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={styles.datePickerButton}>
                <Text style={{ color: '#fff' }}>
                  {(() => {
                    const d = new Date(ordemServico.orde_data_aber)
                    return isNaN(d.getTime())
                      ? new Date().toLocaleDateString()
                      : d.toLocaleDateString()
                  })()}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={(() => {
                    const d = new Date(ordemServico.orde_data_aber)
                    return isNaN(d.getTime()) ? new Date() : d
                  })()}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false)
                    if (selectedDate) {
                      handleInputChange(
                        'orde_data_aber',
                        selectedDate.toISOString().split('T')[0]
                      )
                    }
                  }}
                />
              )}
              <Text style={styles.label}>Ordem Antecessora:</Text>
              <TextInput
                style={[
                  styles.input,
                  !ordemServico.orde_orde_ante && {
                    borderColor: '#1a2f3d',
                    borderWidth: 1,
                  },
                ]}
                value={ordemServico.orde_orde_ante}
                onChangeText={(value) =>
                  handleInputChange('orde_orde_ante', value)
                }
                placeholder="Digite o número da ordem antecessora"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />

              <Text style={styles.label}>Cliente:</Text>
              <BuscaClienteInput
                value={ordemServico.orde_enti_nome}
                tipo="entidade"
                onSelect={(entidade) => {
                  handleInputChange('orde_enti', entidade?.enti_clie || null)
                  handleInputChange('orde_enti_nome', entidade?.enti_nome || '')
                }}
              />

              <Text style={styles.label}>Setor:</Text>
              <BuscaSetorInput
                initialValue={setorNome}
                onSelect={(setor) => {
                  const codigo = Number(setor?.osfs_codi || null)
                  const nome = setor?.osfs_nome || ''
                  handleInputChange('orde_seto', codigo)
                  setSetorNome(nome)

                  if (codigo === 13) {
                    preencherSetorExpedicao()
                  }
                }}
              />

              <Text style={styles.label}>
                Número da Nota Fiscal de Entrada:
              </Text>
              <TextInput
                ref={notaFiscalRef}
                style={[
                  styles.input,
                  !ordemServico.orde_nf_entr && {
                    borderColor: '#1a2f3d',
                    borderWidth: 1,
                  },
                ]}
                value={ordemServico.orde_nf_entr}
                onChangeText={(text) => handleInputChange('orde_nf_entr', text)}
                placeholder="Digite o número da nota fiscal"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />

              <Text style={styles.label}>Tipo de Ordem:</Text>
              <View
                style={[
                  styles.pickerContainer,
                  Platform.OS === 'android' && { overflow: 'hidden' },
                  Platform.OS === 'ios' && { paddingVertical: 5 },
                ]}>
                <Picker
                  selectedValue={ordemServico.orde_tipo}
                  onValueChange={(value) =>
                    handleInputChange('orde_tipo', value)
                  }
                  style={[
                    styles.picker,
                    Platform.OS === 'android' && {
                      backgroundColor: 'transparent',
                      marginHorizontal: -5,
                      marginVertical: -3,
                    },
                    Platform.OS === 'ios' && {
                      backgroundColor: 'transparent',
                      height: undefined,
                      minHeight: 44,
                    },
                  ]}
                  dropdownIconColor="#000000ff"
                  mode={Platform.OS === 'android' ? 'dropdown' : 'compact'}>
                  <Picker.Item
                    label="Selecione o tipo de ordem..."
                    value=""
                    backgroundColor="transparent"
                  />
                  {TIPOS_ORDEM.map((tipo) => (
                    <Picker.Item
                      key={tipo.value}
                      label={tipo.label}
                      value={tipo.value}
                      backgroundColor="transparent"
                    />
                  ))}
                </Picker>
              </View>

              {ordemServico.orde_tipo && camposVisiveis.length > 0 && (
                <>
                  <View style={styles.divider}>
                    <Text style={styles.dividerText}>
                      Campos Específicos -{' '}
                      {
                        TIPOS_ORDEM.find(
                          (t) => t.value === ordemServico.orde_tipo
                        )?.label
                      }
                    </Text>
                  </View>
                  {camposVisiveis.map(renderCampo)}
                </>
              )}

              {!orde_nume && (
                <TouchableOpacity
                  onPress={salvarOrdemServico}
                  style={[
                    styles.salvarButton,
                    isSubmitting && styles.salvarButtonDisabled,
                  ]}
                  disabled={isSubmitting}
                  activeOpacity={isSubmitting ? 1 : 0.7}>
                  <Text style={styles.salvarButtonText}>
                    {isSubmitting ? 'Salvando...' : 'Salvar O.S'}
                  </Text>
                </TouchableOpacity>
              )}

              {orde_nume && (
                <View style={styles.avisoContainer}>
                  <Text style={styles.avisoText}>
                    O.S criada com sucesso! Agora você pode incluir peças e
                    serviços.
                  </Text>
                </View>
              )}
            </>
          )}

          {abaAtiva === 'pecas' && orde_nume && (
            <AbaPecas
              orde_nume={orde_nume}
              pecas={ordemServico.pecas}
              onPecasChange={(novasPecas) =>
                handleInputChange('pecas', novasPecas)
              }
            />
          )}

          {abaAtiva === 'servicos' && orde_nume && (
            <AbaServicos
              orde_nume={orde_nume}
              servicos={ordemServico.servicos}
              onServicosChange={(novosServicos) =>
                handleInputChange('servicos', novosServicos)
              }
            />
          )}

          {abaAtiva === 'fotos' && orde_nume && (
            <AbaForos
              fotos={ordemServico.fotos}
              setFotos={(fotosNovas) =>
                setOrdemServico((prev) => ({ ...prev, fotos: fotosNovas }))
              }
              orde_nume={orde_nume}
              codTecnico={usuarioId}
            />
          )}

          {abaAtiva === 'totais' && orde_nume && (
            <AbaTotais
              orde_nume={orde_nume}
              pecas={ordemServico.pecas}
              servicos={ordemServico.servicos}
              financeiroGerado={financeiroGerado}
              onFinanceiroGerado={setFinanceiroGerado}
            />
          )}

          {abaAtiva !== 'cliente' && !orde_nume && (
            <View style={styles.avisoContainer}>
              <Text style={styles.avisoText}>
                Primeiro salve os dados básicos da O.S para continuar
              </Text>
            </View>
          )}
        </View>
      </View>
    </KeyboardAwareScrollView>
  )
}

const styles = StyleSheet.create({
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    marginTop: 10,
    marginBottom: 10,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 8,
    flexShrink: 1,
  },
  rowItemDate: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 8,
    flexShrink: 1,
  },
  rowLabel: {
    color: '#fff',
    fontSize: 14,
    marginRight: 8,
  },
  datePill: {
    backgroundColor: '#1a2f3d',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexShrink: 1,
    maxWidth: 180,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
    marginTop: 15,
  },
  datePickerButton: {
    backgroundColor: '#1a2f3d',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  pickerContainer: {
    backgroundColor: '#1a2f3d',
    borderRadius: 8,
    marginBottom: 25,
  },
  picker: {
    backgroundColor: Platform.OS === 'android' ? '#0f1f2a' : 'transparent',
    color: '#fff',
    height: Platform.OS === 'ios' ? undefined : 50,
    minHeight: Platform.OS === 'ios' ? 44 : undefined,
    paddingHorizontal: 15,
    fontSize: 18,
  },
  divider: {
    backgroundColor: '#1a2f3d',
    padding: 10,
    borderRadius: 8,
    marginVertical: 20,
    alignItems: 'center',
  },
  dividerText: {
    color: '#10a2a7',
    fontSize: 18,
    fontWeight: 'bold',
  },
  fieldContainer: {
    marginBottom: 25,
  },
  input: {
    backgroundColor: '#1a2f3d',
    color: '#fff',
    padding: 15,
    borderRadius: 8,
    fontSize: 18,
  },
  textarea: {
    height: 100,
    textAlignVertical: 'top',
  },
  required: {
    color: '#ff6b6b',
  },
  salvarButton: {
    backgroundColor: '#10a2a7',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  salvarButtonDisabled: {
    backgroundColor: '#0c7c80',
    opacity: 0.7,
  },
  salvarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  avisoContainer: {
    backgroundColor: '#1a2f3d',
    padding: 20,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  avisoText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
})
