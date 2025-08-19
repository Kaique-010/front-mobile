import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Switch,
} from 'react-native'
import { MaterialIcons, Feather } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Picker } from '@react-native-picker/picker'
import {
  apiGetComContexto,
  apiPostComContexto,
  apiPutComContexto,
  addContextoControleVisita, // Adicionar import
} from '../utils/api'
import useContextoApp from '../hooks/useContextoApp'

import BuscaClienteInput from '../components/BuscaClienteInput'
import BuscaVendedorInput from '../components/BuscaVendedorInput'
import Toast from 'react-native-toast-message'

export default function ControleVisitaForm({ route, navigation }) {
  const { visitaId, mode = 'create', cliente, vendedor } = route.params || {}
  const isEdit = mode === 'edit' && visitaId

  const [loading, setLoading] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState({
    field: null,
    show: false,
  })

  const { empresaId, filialId } = useContextoApp()

  const [formData, setFormData] = useState({
    ctrl_empresa: empresaId,
    ctrl_filial: filialId,
    ctrl_numero: null,
    ctrl_cliente: '',
    ctrl_data: new Date().toISOString().split('T')[0],
    ctrl_vendedor: '',
    ctrl_etapa: 1,
    ctrl_contato: '',
    ctrl_fone: '',
    ctrl_obse: '',
    ctrl_km_inic: '',
    ctrl_km_fina: '',
    ctrl_prox_visi: '',
    ctrl_novo: 0,
    ctrl_base: 0,
    ctrl_prop: 0,
    ctrl_leva: 0,
    ctrl_proj: 0,
    ctrl_nume_orca: '',
  })

  const [selectedCliente, setSelectedCliente] = useState(null)
  const [selectedVendedor, setSelectedVendedor] = useState(null)

  const [etapas, setEtapas] = useState([])

  // Remover array hardcoded de etapas e carregar do backend
  useEffect(() => {
    carregarEtapas()
    if (isEdit) {
      carregarVisita()
    }
  }, [isEdit, visitaId])

  // Dentro da função carregarEtapas
  const carregarEtapas = async () => {
    try {
      const response = await apiGetComContexto(
        'controledevisitas/etapas-visita/'
      )
      // Tratar resposta paginada e garantir array
      const etapasData = response?.results || response || []
      console.log('Etapas carregadas:', etapasData) // Debug temporário
      setEtapas(Array.isArray(etapasData) ? etapasData : [])
    } catch (error) {
      console.error('Erro ao carregar etapas:', error)
      setEtapas([])
    }
  }

  const carregarVisita = async () => {
    try {
      setLoading(true)

      const response = await apiGetComContexto(
        `controledevisitas/controle-visitas/${visitaId}/`
      )

      setFormData({
        ...response,
        ctrl_data: response.ctrl_data || new Date().toISOString().split('T')[0],
        ctrl_prox_visi: response.ctrl_prox_visi || '',
        ctrl_km_inic: response.ctrl_km_inic?.toString() || '',
        ctrl_km_fina: response.ctrl_km_fina?.toString() || '',
        ctrl_nume_orca: response.ctrl_nume_orca?.toString() || '',
        ctrl_numero: response.ctrl_numero || null, // Adicionado para edição
        ctrl_etapa: response.ctrl_etapa || 1,
        ctrl_empresa: response.ctrl_empresa || null,
        ctrl_filial: response.ctrl_filial || null,
      })

      if (response.ctrl_cliente) {
        setSelectedCliente({
          enti_clie: response.ctrl_cliente,
          enti_nome: response.cliente_nome,
        })
      }

      if (response.ctrl_vendedor) {
        setSelectedVendedor({
          enti_clie: response.ctrl_vendedor,
          enti_nome: response.vendedor_nome,
        })
      }
    } catch (error) {
      console.error('Erro ao carregar visita:', error)
      Alert.alert('Erro', 'Não foi possível carregar os dados da visita')
      navigation.goBack()
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      // Validar cliente obrigatório
      if (!selectedCliente || !selectedCliente.enti_clie) {
        Alert.alert('Erro', 'Selecione um cliente')
        return
      }

      // Validar vendedor obrigatório
      if (!selectedVendedor || !selectedVendedor.enti_clie) {
        Alert.alert('Erro', 'Selecione um vendedor')
        return
      }

      // NOVA VALIDAÇÃO: Etapa obrigatória
      if (!formData.ctrl_etapa) {
        Alert.alert('Erro', 'Selecione uma etapa')
        return
      }

      // Validar KM
      const kmInic = parseFloat(formData.ctrl_km_inic) || 0
      const kmFina = parseFloat(formData.ctrl_km_fina) || 0

      if (kmInic > 0 && kmFina > 0 && kmFina < kmInic) {
        Alert.alert('Erro', 'KM final deve ser maior que KM inicial')
        return
      }

      setLoading(true)

      const dataToSave = {
        ...formData,
        ctrl_cliente: selectedCliente.enti_clie, // Garantir que cliente seja enviado
        ctrl_vendedor: selectedVendedor.enti_clie, // Garantir que vended                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           or seja enviado
        ctrl_empresa: formData.ctrl_empresa
          ? parseInt(formData.ctrl_empresa)
          : null,
        ctrl_filial: formData.ctrl_filial
          ? parseInt(formData.ctrl_filial)
          : null,
        ctrl_numero: formData.ctrl_numero
          ? parseInt(formData.ctrl_numero)
          : null,
        ctrl_km_inic: formData.ctrl_km_inic
          ? parseFloat(formData.ctrl_km_inic)
          : null,
        ctrl_km_fina: formData.ctrl_km_fina
          ? parseFloat(formData.ctrl_km_fina)
          : null,
        ctrl_nume_orca: formData.ctrl_nume_orca
          ? parseInt(formData.ctrl_nume_orca)
          : null,
        ctrl_prox_visi: formData.ctrl_prox_visi || null,
      }

      if (isEdit) {
        const dataWithContext = await addContextoControleVisita(dataToSave)
        await apiPutComContexto(
          `controledevisitas/controle-visitas/${visitaId}/`,
          dataWithContext
        )
        Toast.show({
          type: 'success',
          text1: 'Sucesso',
          text2: 'Visita atualizada com sucesso',
        })
      } else {
        const dataWithContext = await addContextoControleVisita(dataToSave)
        await apiPostComContexto(
          'controledevisitas/controle-visitas/',
          dataWithContext
        )
        Toast.show({
          type: 'success',
          text1: 'Sucesso',
          text2: 'Visita criada com sucesso',
        })
      }

      navigation.goBack()
    } catch (error) {
      console.error('Erro ao salvar visita:', error)
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível salvar a visita',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker({ field: null, show: false })

    if (selectedDate && showDatePicker.field) {
      const formattedDate = selectedDate.toISOString().split('T')[0]
      setFormData({
        ...formData,
        [showDatePicker.field]: formattedDate,
      })
    }
  }

  const showDatePickerModal = (field) => {
    setShowDatePicker({ field, show: true })
  }

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'Selecionar data'
    const date = new Date(dateString + 'T00:00:00')
    return date.toLocaleDateString('pt-BR')
  }

  // CORRIGIDO: onSelect functions
  const handleClienteSelect = (cliente) => {
    setSelectedCliente(cliente)
    setFormData({
      ...formData,
      ctrl_cliente: cliente?.enti_clie || '',
    })
  }

  const handleVendedorSelect = (vendedor) => {
    setSelectedVendedor(vendedor)
    setFormData({
      ...formData,
      ctrl_vendedor: vendedor?.enti_clie || '',
    })
  }

  // Adicionar este useEffect após os existentes
  useEffect(() => {
    // Processar dados do cliente e vendedor vindos da navegação
    if (cliente && !isEdit) {
      setSelectedCliente({
        enti_clie: cliente.id,
        enti_nome: cliente.nome,
      })
      setFormData((prev) => ({
        ...prev,
        ctrl_cliente: cliente.id,
      }))
    }

    if (vendedor && !isEdit) {
      setSelectedVendedor({
        enti_clie: vendedor.id,
        enti_nome: vendedor.nome,
      })
      setFormData((prev) => ({
        ...prev,
        ctrl_vendedor: vendedor.id,
      }))
    }
  }, [cliente, vendedor, isEdit])

  const renderSwitchField = (label, field, description) => (
    <View style={styles.switchContainer}>
      <View style={styles.switchInfo}>
        <Text style={styles.switchLabel}>{label}</Text>
        {description && (
          <Text style={styles.switchDescription}>{description}</Text>
        )}
      </View>
      <Switch
        value={!!formData[field]}
        onValueChange={(value) =>
          setFormData({ ...formData, [field]: value ? 1 : 0 })
        }
        trackColor={{ false: '#2a3441', true: '#2ecc71' }}
        thumbColor={formData[field] ? '#fff' : '#666'}
      />
    </View>
  )

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {isEdit ? 'Editar Visita' : 'Nova Visita'}
        </Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          <Feather name="check" size={24} color="#2ecc71" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Informações Básicas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Básicas</Text>
          {/* Cliente */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Cliente *</Text>
            <BuscaClienteInput
              onSelect={handleClienteSelect}
              placeholder="Selecionar cliente"
              value={selectedCliente?.enti_nome || ''}
              style={styles.input}
            />
          </View>
          {/* Data da Visita */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Data da Visita *</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => showDatePickerModal('ctrl_data')}>
              <Feather name="calendar" size={20} color="#2ecc71" />
              <Text style={styles.dateButtonText}>
                {formatDateForDisplay(formData.ctrl_data)}
              </Text>
            </TouchableOpacity>
          </View>
          {/* Vendedor */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Vendedor *</Text>
            <BuscaVendedorInput
              onSelect={handleVendedorSelect}
              placeholder="Selecionar vendedor"
              value={selectedVendedor?.enti_nome || ''}
              style={styles.input}
            />
          </View>
          {/* Etapa */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Etapa *</Text>
            // Dentro do Picker de etapas
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.ctrl_etapa}
                onValueChange={(value) =>
                  setFormData({ ...formData, ctrl_etapa: value })
                }
                style={styles.picker}>
                <Picker.Item
                  label="Selecione uma etapa"
                  value=""
                  color="#999"
                />
                {etapas.map((etapa) => (
                  <Picker.Item
                    key={etapa.etap_id}
                    label={etapa.etap_descricao}
                    value={etapa.etap_id}
                    color="#000"
                  />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        {/* Informações de Contato */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contato</Text>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Nome do Contato</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Nome da pessoa de contato"
              placeholderTextColor="#666"
              value={formData.ctrl_contato}
              onChangeText={(text) =>
                setFormData({ ...formData, ctrl_contato: text })
              }
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Telefone</Text>
            <TextInput
              style={styles.textInput}
              placeholder="(00) 00000-0000"
              placeholderTextColor="#666"
              value={formData.ctrl_fone}
              onChangeText={(text) =>
                setFormData({ ...formData, ctrl_fone: text })
              }
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Observações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Observações</Text>

          <View style={styles.field}>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Observações sobre a visita..."
              placeholderTextColor="#666"
              value={formData.ctrl_obse}
              onChangeText={(text) =>
                setFormData({ ...formData, ctrl_obse: text })
              }
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Controles de Atividade */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Atividades Realizadas</Text>

          {renderSwitchField(
            'Cliente Novo',
            'ctrl_novo',
            'Marque se é um cliente novo'
          )}

          {renderSwitchField(
            'Levantamento de Base',
            'ctrl_base',
            'Foi feito levantamento da base do cliente'
          )}

          {renderSwitchField(
            'Proposta Apresentada',
            'ctrl_prop',
            'Foi apresentada uma proposta'
          )}

          {renderSwitchField(
            'Levantamento Técnico',
            'ctrl_leva',
            'Foi feito levantamento técnico'
          )}

          {renderSwitchField(
            'Projeto Elaborado',
            'ctrl_proj',
            'Foi elaborado um projeto'
          )}
        </View>

        {/* Informações Adicionais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Adicionais</Text>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>KM Inicial</Text>
            <TextInput
              style={styles.textInput}
              placeholder="0.00"
              placeholderTextColor="#666"
              value={formData.ctrl_km_inic}
              onChangeText={(text) =>
                setFormData({ ...formData, ctrl_km_inic: text })
              }
              keyboardType="numeric"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>KM Final</Text>
            <TextInput
              style={styles.textInput}
              placeholder="0.00"
              placeholderTextColor="#666"
              value={formData.ctrl_km_fina}
              onChangeText={(text) =>
                setFormData({ ...formData, ctrl_km_fina: text })
              }
              keyboardType="numeric"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Número do Orçamento</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Número do orçamento"
              placeholderTextColor="#666"
              value={formData.ctrl_nume_orca}
              onChangeText={(text) =>
                setFormData({ ...formData, ctrl_nume_orca: text })
              }
              keyboardType="numeric"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Próxima Visita</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => showDatePickerModal('ctrl_prox_visi')}>
              <Feather name="calendar" size={20} color="#2ecc71" />
              <Text style={styles.dateButtonText}>
                {formatDateForDisplay(formData.ctrl_prox_visi)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Espaço extra no final */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Botão de Salvar Fixo */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}>
          <MaterialIcons
            name={loading ? 'hourglass-empty' : 'save'}
            size={24}
            color="#fff"
          />
          <Text style={styles.saveButtonText}>
            {loading ? 'Salvando...' : 'Salvar Visita'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
      {showDatePicker.show && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1421',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a3441',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2ecc71',
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#1a252f',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2a3441',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  input: {
    backgroundColor: '#1a252f',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a3441',
  },
  pickerContainer: {
    backgroundColor: '#1a252f',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a3441',
  },
  picker: {
    color: '#fff',
    backgroundColor: 'transparent',
  },
  dateButton: {
    backgroundColor: '#1a252f',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a3441',
  },
  dateButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 12,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a252f',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a3441',
  },
  switchInfo: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  switchDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#2a3441',
  },
  saveButton: {
    backgroundColor: '#2ecc71',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#666',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
})
