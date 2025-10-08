import React, { useEffect, useState, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  StyleSheet,
  TextInput,
} from 'react-native'
import { Picker } from '@react-native-picker/picker'
import DateTimePicker from '@react-native-community/datetimepicker'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import useContextoApp from '../hooks/useContextoApp'
import BuscaClienteInput from '../components/BuscaClienteInput'
import BuscaSetorInput from '../components/BuscaSetorInput'
import BuscaMarcasInput from '../components/BuscaMarcasInput'
import ErrorBoundary from '../components/ErrorBoundary'
import { apiPostComContexto } from '../utils/api'
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
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [abaAtiva, setAbaAtiva] = useState('cliente')
  const [orde_nume, setNumeroOS] = useState(null)
  const [financeiroGerado, setFinanceiroGerado] = useState(false)

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
    // Campos dinâmicos
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
    orde_obse: '',
  })

  const [camposVisiveis, setCamposVisiveis] = useState([])

  // Atualiza campos visíveis quando o tipo muda
  useEffect(() => {
    if (ordemServico.orde_tipo) {
      const config = ORDER_FIELDS_CONFIG[ordemServico.orde_tipo]
      if (config) {
        setCamposVisiveis(config.campos)
        // Limpa campos que não são do tipo atual
        limparCamposNaoVisiveis(config.campos)
      }
    } else {
      setCamposVisiveis([]) // Não mostra campos se não há tipo selecionado
    }
  }, [ordemServico.orde_tipo])

  const limparCamposNaoVisiveis = (camposAtivos) => {
    const keysAtivos = camposAtivos.map((c) => c.key)
    const camposParaLimpar = {}

    // Lista todos os campos possíveis
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
      'orde_obse',
    ]

    todosCampos.forEach((campo) => {
      if (!keysAtivos.includes(campo)) {
        camposParaLimpar[campo] = ''
      }
    })

    setOrdemServico((prev) => ({ ...prev, ...camposParaLimpar }))
  }

  const handleInputChange = (key, value) => {
    // Log específico para orde_marc
    if (key === 'orde_marc') {
      console.log(
        `🏷️ Marca alterada: ${key} = ${value} (tipo: ${typeof value})`
      )
    }

    setOrdemServico((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

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
    console.log('🔍 Iniciando validação da ordem de serviço...')
    if (!ordemServico.orde_nume || ordemServico.orde_nume.trim() === '') {
      console.log('❌ Validação falhou: Número da O.S não informado')
      Toast.show({
        type: 'error',
        text1: 'Número da O.S ausente',
        text2: 'Por favor, informe o número da O.S antes de salvar',
      })
      return false
    }
    console.log('📋 Dados para validação:', {
      orde_enti: ordemServico.orde_enti,
      orde_data_aber: ordemServico.orde_data_aber,
      orde_tipo: ordemServico.orde_tipo,
    })

    if (!ordemServico.orde_enti) {
      console.log('❌ Validação falhou: Cliente não selecionado')
      Toast.show({
        type: 'error',
        text1: 'Cliente não selecionado',
        text2: 'Por favor, selecione um cliente para continuar',
      })
      return false
    }

    if (!ordemServico.orde_data_aber) {
      console.log('❌ Validação falhou: Data inválida')
      Toast.show({
        type: 'error',
        text1: 'Data inválida',
        text2: 'Por favor, selecione uma data válida',
      })
      return false
    }

    // Validar campos obrigatórios do tipo selecionado
    const config = ORDER_FIELDS_CONFIG[ordemServico.orde_tipo]
    if (config) {
      console.log(
        '🔍 Validando campos obrigatórios para tipo:',
        ordemServico.orde_tipo
      )
      const camposObrigatorios = config.campos.filter((c) => c.required)
      console.log(
        '📝 Campos obrigatórios encontrados:',
        camposObrigatorios.map((c) => c.key)
      )

      for (const campo of camposObrigatorios) {
        const valor = ordemServico[campo.key]
        console.log(`🔍 Validando campo ${campo.key}:`, valor)

        // Verificar se o valor existe e não está vazio
        // Para números, verificar se não é null/undefined/0
        // Para strings, verificar se não está vazio após trim
        let valorVazio = false

        if (valor === null || valor === undefined) {
          valorVazio = true
        } else if (typeof valor === 'string') {
          valorVazio = valor.trim() === ''
        } else if (typeof valor === 'number') {
          valorVazio = valor === 0 || isNaN(valor)
        } else {
          valorVazio = !valor
        }

        if (valorVazio) {
          console.log(
            `❌ Validação falhou: Campo obrigatório vazio - ${campo.key}`
          )
          Toast.show({
            type: 'error',
            text1: 'Campo obrigatório',
            text2: `Por favor, preencha o campo: ${campo.label}`,
          })
          return false
        }
      }
    }

    console.log('✅ Validação passou com sucesso!')
    return true
  }

  const salvarOrdemServico = async () => {
    console.log('🚀 Iniciando salvamento da ordem de serviço...')
    console.log(
      '🔍 Estado dos locks - submitLock:',
      submitLock,
      'isSubmitting:',
      isSubmitting,
      'submitLockRef:',
      submitLockRef.current
    )

    // Verificação imediata com ref para evitar execuções múltiplas
    if (submitLockRef.current) {
      console.log('🔒 Salvamento já em andamento (ref), ignorando...')
      return
    }

    // Ativa o lock imediatamente
    submitLockRef.current = true
    console.log('🔒 Lock ativado via ref')

    // Dupla verificação para evitar execuções múltiplas
    if (submitLock || isSubmitting) {
      console.log('🔒 Salvamento já em andamento (state), ignorando...')
      submitLockRef.current = false
      return
    }

    if (!validarOrdemServico()) {
      console.log('❌ Validação falhou')
      submitLockRef.current = false
      return
    }

    console.log('🔒 Ativando locks de salvamento')
    setSubmitLock(true)
    setIsSubmitting(true)

    try {
      console.log('📋 Estado atual do ordemServico:', ordemServico)
      console.log(
        '👥 Contexto - empresaId:',
        empresaId,
        'filialId:',
        filialId,
        'usuarioId:',
        usuarioId
      )

      // Cria payload apenas com campos preenchidos
      const payload = {
        orde_nume: ordemServico.orde_nume,
        orde_enti: ordemServico.orde_enti,
        orde_data_aber: ordemServico.orde_data_aber,
        orde_tipo: ordemServico.orde_tipo,
        orde_empr: empresaId?.toString() || '',
        orde_fili: filialId?.toString() || '',
        usua: usuarioId?.toString() || '',
        orde_seto: ordemServico.orde_seto?.toString() || '',
      }

      // Adiciona apenas campos que têm valor
      camposVisiveis.forEach((campo) => {
        const valor = ordemServico[campo.key]
        if (valor && valor !== '') {
          payload[campo.key] = valor
        }
      })

      console.log('📤 Payload a ser enviado:', payload)
      console.log('🌐 Fazendo chamada para API: ordemdeservico/ordens/')
      console.log('🔄 Iniciando apiPostComContexto...')

      let data
      try {
        data = await apiPostComContexto('ordemdeservico/ordens/', payload)
        console.log('✅ Resposta da API após criar O.S.:', data)
      } catch (apiError) {
        console.error('💥 Erro específico na chamada da API:', apiError)
        console.error('📊 Detalhes do erro da API:', {
          message: apiError.message,
          status: apiError.status,
          response: apiError.response,
          stack: apiError.stack,
        })
        throw apiError
      }

      if (!data.orde_nume) {
        throw new Error('Número da O.S não retornado pelo servidor')
      }

      setNumeroOS(data.orde_nume)
      setAbaAtiva('pecas')

      Toast.show({
        type: 'success',
        text1: 'O.S criada com sucesso!',
        text2: `Número da O.S: ${data.orde_nume}. Agora você pode incluir peças.`,
      })
    } catch (error) {
      console.error('💥 Erro ao criar O.S:', error)
      console.error('📊 Detalhes do erro:', {
        message: error.message,
        status: error.status,
        response: error.response,
        stack: error.stack,
      })

      Toast.show({
        type: 'error',
        text1: 'Erro ao criar O.S',
        text2: error.message || 'Tente novamente mais tarde',
      })
    } finally {
      console.log('🏁 Finalizando processo de salvamento')
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
            value={valor}
            onChangeText={(value) => handleInputChange(campo.key, value)}
            placeholder={`Digite ${campo.label.toLowerCase()}`}
            placeholderTextColor="#666"
            multiline
            numberOfLines={4}
          />
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
              onSelect={(codigoMarca) => {
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
          value={valor}
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
    <KeyboardAwareScrollView style={{ backgroundColor: '#0f1f2a' }}>
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
              <Text style={styles.label}>
                Nº da O.S
                <Text style={styles.required}> *</Text>
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
                  {new Date(ordemServico.orde_data_aber).toLocaleDateString()}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={new Date(ordemServico.orde_data_aber)}
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
                value={ordemServico.orde_seto}
                tipo="setor"
                onSelect={(setor) => {
                  handleInputChange('orde_seto', setor?.osfs_codi || null)
                }}
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
                      backgroundColor: '#1a2f3d',
                      marginHorizontal: -5,
                      marginVertical: -3,
                    },
                    Platform.OS === 'ios' && {
                      backgroundColor: 'transparent',
                      height: undefined,
                      minHeight: 44,
                    },
                  ]}
                  dropdownIconColor="#fff"
                  itemStyle={
                    Platform.OS === 'ios'
                      ? {
                          color: '#fff',
                          backgroundColor: 'transparent',
                          fontSize: 18,
                          height: 44,
                          textAlign: 'center',
                        }
                      : undefined
                  }
                  mode={Platform.OS === 'android' ? 'dropdown' : 'compact'}
                  dropdownIconRippleColor="#10a2a7"
                  prompt="Selecione o tipo de ordem">
                  <Picker.Item
                    label="Selecione o tipo de ordem..."
                    value=""
                    color={Platform.OS === 'android' ? '#666' : '#999'}
                  />
                  {TIPOS_ORDEM.map((tipo) => (
                    <Picker.Item
                      key={tipo.value}
                      label={tipo.label}
                      value={tipo.value}
                      color={Platform.OS === 'android' ? '#fff' : '#fff'}
                      style={
                        Platform.OS === 'android'
                          ? { backgroundColor: '#1a2f3d' }
                          : undefined
                      }
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
                    serviços nas abas correspondentes.
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
  osNumeroContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a2f3d',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  osNumeroLabel: {
    color: '#10a2a7',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  osNumero: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
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
