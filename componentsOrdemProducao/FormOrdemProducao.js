import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
  Dimensions,
} from 'react-native'
import {
  TextInput,
  Button,
  Card,
  RadioButton,
  Switch,
  HelperText,
  Divider,
  Chip,
} from 'react-native-paper'
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons'
import { useContextoApp } from '../hooks/useContextoApp'
import { apiPostComContexto, apiPutComContexto } from '../utils/api'
import DateTimePicker from '@react-native-community/datetimepicker'
import BuscaClienteInput from '../components/BuscaClienteInput'
import BuscaVendedorInput from '../components/BuscaVendedorInput'
import BuscaProdutoInput from '../components/BuscaProdutosInput'

const { width } = Dimensions.get('window')

const FormOrdemProducao = ({ route, navigation }) => {
  const { ordem } = route.params || {}
  const isEditing = !!ordem

  const [formData, setFormData] = useState({
    orpr_nuca: '',
    orpr_clie: '',
    orpr_tipo: '1',
    orpr_valo: '',
    orpr_prev: new Date(),
    orpr_desc: '',
    orpr_cort: false,
    orpr_gara: false,
    orpr_vend: '',
    orpr_prod: '',
    orpr_quan: '',
    orpr_gram_clie: '',
    ...ordem,
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedClienteNome, setSelectedClienteNome] = useState('')
  const [selectedVendedorNome, setSelectedVendedorNome] = useState('')
  const [selectedProdutoNome, setSelectedProdutoNome] = useState('')

  const tiposOrdem = [
    { value: '1', label: 'Confecção', icon: 'auto-fix-high', color: '#FFD700' },
    { value: '2', label: 'Conserto', icon: 'build', color: '#FF6B35' },
    { value: '3', label: 'Orçamento', icon: 'receipt', color: '#4ECDC4' },
    { value: '4', label: 'Conserto Relógio', icon: 'watch', color: '#45B7D1' },
  ]

  const validateForm = () => {
    const newErrors = {}

    if (!formData.orpr_nuca.trim()) {
      newErrors.orpr_nuca = 'Número de controle é obrigatório'
    }

    if (!formData.orpr_clie) {
      newErrors.orpr_clie = 'Cliente é obrigatório'
    }

    if (!formData.orpr_vend) {
      newErrors.orpr_vend = 'Vendedor é obrigatório'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Erro', 'Por favor, corrija os erros no formulário')
      return
    }

    try {
      setLoading(true)

      const dadosParaEnviar = {
        ...formData,
        orpr_entr: isEditing ? formData.orpr_entr : new Date().toISOString(),
        orpr_prev: formData.orpr_prev.toISOString(),
        orpr_valo: formData.orpr_valo ? parseFloat(formData.orpr_valo) : null,
        orpr_quan: formData.orpr_quan ? parseFloat(formData.orpr_quan) : null,
        orpr_gram_clie: formData.orpr_gram_clie
          ? parseFloat(formData.orpr_gram_clie)
          : null,
      }

      if (isEditing) {
        await apiPutComContexto(
          `ordemproducao/ordens/${ordem.orpr_codi}/`,
          dadosParaEnviar
        )
        Alert.alert('Sucesso', 'Ordem atualizada com sucesso!')
      } else {
        await apiPostComContexto('ordemproducao/ordens/', dadosParaEnviar)
        Alert.alert('Sucesso', 'Ordem criada com sucesso!')
      }

      navigation.goBack()
    } catch (error) {
      console.error('Erro ao salvar ordem:', error)
      Alert.alert('Erro', 'Falha ao salvar ordem de produção')
    } finally {
      setLoading(false)
    }
  }

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false)
    if (selectedDate) {
      updateField('orpr_prev', selectedDate)
    }
  }

  const formatCurrency = (value) => {
    if (!value) return ''
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(parseFloat(value))
  }

  const handleClienteSelect = (cliente) => {
    updateField('orpr_clie', cliente.enti_clie)
    setSelectedClienteNome(cliente.enti_nome)
  }

  const handleVendedorSelect = (vendedor) => {
    updateField('orpr_vend', vendedor.enti_clie)
    setSelectedVendedorNome(vendedor.enti_nome)
  }

  const handleProdutoSelect = (produto) => {
    updateField('orpr_prod', produto.prod_codi)
    setSelectedProdutoNome(produto.prod_nome)
  }

  const renderFormContent = () => {
    return [
      // Seção Principal
      {
        id: 'main-card',
        component: (
          <Card style={styles.mainCard}>
            <View style={styles.cardHeaderGold}>
              <FontAwesome5 name="gem" size={20} color="#1a1a2e" />
              <Text style={styles.cardHeaderText}>Informações Principais</Text>
            </View>

            <View style={styles.cardContent}>
              <View style={styles.inputGroup}>
                <View style={styles.inputHeader}>
                  <MaterialIcons name="credit-card" size={20} color="#FFD700" />
                  <Text style={styles.inputLabel}>Número de Cartão Jóia *</Text>
                </View>
                <TextInput
                  value={formData.orpr_nuca}
                  onChangeText={(value) => updateField('orpr_nuca', value)}
                  error={!!errors.orpr_nuca}
                  style={styles.luxuryInput}
                  theme={{
                    colors: {
                      primary: '#FFD700',
                      background: '#f8f9fa',
                      surface: '#ffffff',
                    },
                  }}
                  mode="outlined"
                  dense
                />
                <HelperText type="error" visible={!!errors.orpr_nuca}>
                  {errors.orpr_nuca}
                </HelperText>
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.inputHeader}>
                  <MaterialIcons name="person" size={20} color="#FFD700" />
                  <Text style={styles.inputLabel}>Cliente *</Text>
                </View>
                <BuscaClienteInput
                  onSelect={handleClienteSelect}
                  placeholder="Buscar cliente..."
                  tipo="clientes"
                />
                {selectedClienteNome ? (
                  <Chip
                    icon="check-circle"
                    style={styles.selectedChip}
                    textStyle={styles.chipText}>
                    {selectedClienteNome}
                  </Chip>
                ) : null}
                <HelperText type="error" visible={!!errors.orpr_clie}>
                  {errors.orpr_clie}
                </HelperText>
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.inputHeader}>
                  <MaterialIcons
                    name="business-center"
                    size={20}
                    color="#FFD700"
                  />
                  <Text style={styles.inputLabel}>Vendedor *</Text>
                </View>
                <BuscaVendedorInput
                  onSelect={handleVendedorSelect}
                  placeholder="Buscar vendedor..."
                  tipo="vendedor"
                />
                {selectedVendedorNome ? (
                  <Chip
                    icon="check-circle"
                    style={styles.selectedChip}
                    textStyle={styles.chipText}>
                    {selectedVendedorNome}
                  </Chip>
                ) : null}
                <HelperText type="error" visible={!!errors.orpr_vend}>
                  {errors.orpr_vend}
                </HelperText>
              </View>
            </View>
          </Card>
        ),
      },
      // Seção Tipo de Ordem
      {
        id: 'type-card',
        component: (
          <Card style={styles.typeCard}>
            <View style={styles.cardHeaderTeal}>
              <MaterialIcons name="category" size={20} color="#ffffff" />
              <Text style={[styles.cardHeaderText, { color: '#ffffff' }]}>
                Tipo da Ordem
              </Text>
            </View>

            <View style={styles.cardContent}>
              <RadioButton.Group
                onValueChange={(value) => updateField('orpr_tipo', value)}
                value={formData.orpr_tipo}>
                <View style={styles.radioGrid}>
                  {tiposOrdem.map((tipo) => (
                    <TouchableOpacity
                      key={tipo.value}
                      style={[
                        styles.radioCard,
                        formData.orpr_tipo === tipo.value &&
                          styles.radioCardSelected,
                      ]}
                      onPress={() => updateField('orpr_tipo', tipo.value)}>
                      <MaterialIcons
                        name={tipo.icon}
                        size={24}
                        color={
                          formData.orpr_tipo === tipo.value
                            ? '#ffffff'
                            : tipo.color
                        }
                      />
                      <Text
                        style={[
                          styles.radioCardText,
                          formData.orpr_tipo === tipo.value &&
                            styles.radioCardTextSelected,
                        ]}>
                        {tipo.label}
                      </Text>
                      <RadioButton value={tipo.value} />
                    </TouchableOpacity>
                  ))}
                </View>
              </RadioButton.Group>
            </View>
          </Card>
        ),
      },
      // Seção Produto e Valores
      {
        id: 'product-card',
        component: (
          <Card style={styles.productCard}>
            <View style={styles.cardHeaderPurple}>
              <FontAwesome5 name="ring" size={20} color="#ffffff" />
              <Text style={[styles.cardHeaderText, { color: '#ffffff' }]}>
                Produto e Valores
              </Text>
            </View>

            <View style={styles.cardContent}>
              <View style={styles.inputGroup}>
                <View style={styles.inputHeader}>
                  <MaterialIcons name="inventory" size={20} color="#667eea" />
                  <Text style={styles.inputLabel}>Produto</Text>
                </View>
                <BuscaProdutoInput
                  onSelect={handleProdutoSelect}
                  placeholder="Buscar produto..."
                />
                {selectedProdutoNome ? (
                  <Chip
                    icon="check-circle"
                    style={[styles.selectedChip, { backgroundColor: '#667eea' }]}
                    textStyle={styles.chipText}>
                    {selectedProdutoNome}
                  </Chip>
                ) : null}
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <View style={styles.inputHeader}>
                    <MaterialIcons
                      name="attach-money"
                      size={20}
                      color="#667eea"
                    />
                    <Text style={styles.inputLabel}>Valor</Text>
                  </View>
                  <TextInput
                    value={formData.orpr_valo.toString()}
                    onChangeText={(value) => updateField('orpr_valo', value)}
                    keyboardType="decimal-pad"
                    style={styles.luxuryInput}
                    theme={{
                      colors: {
                        primary: '#667eea',
                        background: '#f8f9fa',
                        surface: '#ffffff',
                      },
                    }}
                    mode="outlined"
                    dense
                    right={
                      <TextInput.Icon
                        icon={() => (
                          <Text style={styles.currencyText}>
                            {formatCurrency(formData.orpr_valo)}
                          </Text>
                        )}
                      />
                    }
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <View style={styles.inputHeader}>
                    <MaterialIcons name="straighten" size={20} color="#667eea" />
                    <Text style={styles.inputLabel}>Quantidade</Text>
                  </View>
                  <TextInput
                    value={formData.orpr_quan.toString()}
                    onChangeText={(value) => updateField('orpr_quan', value)}
                    keyboardType="decimal-pad"
                    style={styles.luxuryInput}
                    theme={{
                      colors: {
                        primary: '#667eea',
                        background: '#f8f9fa',
                        surface: '#ffffff',
                      },
                    }}
                    mode="outlined"
                    dense
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.inputHeader}>
                  <FontAwesome5 name="weight" size={18} color="#667eea" />
                  <Text style={styles.inputLabel}>Gramatura do Cliente</Text>
                </View>
                <TextInput
                  value={formData.orpr_gram_clie.toString()}
                  onChangeText={(value) => updateField('orpr_gram_clie', value)}
                  keyboardType="decimal-pad"
                  style={styles.luxuryInput}
                  theme={{
                    colors: {
                      primary: '#667eea',
                      background: '#f8f9fa',
                      surface: '#ffffff',
                    },
                  }}
                  mode="outlined"
                  dense
                  right={<TextInput.Icon icon="scale" />}
                />
              </View>
            </View>
          </Card>
        ),
      },
      // Seção Detalhes
      {
        id: 'details-card',
        component: (
          <Card style={styles.detailsCard}>
            <View style={styles.cardHeaderPink}>
              <MaterialIcons name="event" size={20} color="#ffffff" />
              <Text style={[styles.cardHeaderText, { color: '#ffffff' }]}>
                Detalhes e Configurações
              </Text>
            </View>

            <View style={styles.cardContent}>
              <View style={styles.inputGroup}>
                <View style={styles.inputHeader}>
                  <MaterialIcons name="schedule" size={20} color="#f5576c" />
                  <Text style={styles.inputLabel}>Previsão de Entrega</Text>
                </View>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}>
                  <View style={styles.dateContent}>
                    <MaterialIcons
                      name="calendar-today"
                      size={24}
                      color="#f5576c"
                    />
                    <View style={styles.dateTextContainer}>
                      <Text style={styles.dateValue}>
                        {formData.orpr_prev.toLocaleDateString('pt-BR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={formData.orpr_prev}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                />
              )}

              <View style={styles.inputGroup}>
                <View style={styles.inputHeader}>
                  <MaterialIcons name="description" size={20} color="#f5576c" />
                  <Text style={styles.inputLabel}>Descrição</Text>
                </View>
                <TextInput
                  value={formData.orpr_desc}
                  onChangeText={(value) => updateField('orpr_desc', value)}
                  multiline
                  numberOfLines={4}
                  style={styles.luxuryInput}
                  theme={{
                    colors: {
                      primary: '#f5576c',
                      background: '#f8f9fa',
                      surface: '#ffffff',
                    },
                  }}
                  mode="outlined"
                  placeholder="Descreva os detalhes da ordem..."
                />
              </View>

              <Divider style={styles.divider} />

              <View style={styles.switchSection}>
                <View style={styles.switchItem}>
                  <View style={styles.switchHeader}>
                    <MaterialIcons name="toggle-on" size={24} color="#4CAF50" />
                    <Text style={styles.switchLabel}>Ordem em Cortesia ?</Text>
                  </View>
                  <Switch
                    value={formData.orpr_cort}
                    onValueChange={(value) => updateField('orpr_cort', value)}
                    thumbColor={formData.orpr_cort ? '#4CAF50' : '#f4f3f4'}
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                  />
                </View>

                <View style={styles.switchItem}>
                  <View style={styles.switchHeader}>
                    <MaterialIcons name="verified" size={24} color="#FF9800" />
                    <Text style={styles.switchLabel}>Ordem em Garantia</Text>
                  </View>
                  <Switch
                    value={formData.orpr_gara}
                    onValueChange={(value) => updateField('orpr_gara', value)}
                    thumbColor={formData.orpr_gara ? '#FF9800' : '#f4f3f4'}
                    trackColor={{ false: '#767577', true: '#ffcc80' }}
                  />
                </View>
              </View>
            </View>
          </Card>
        ),
      },
    ]
  }

  return (
    <View style={styles.container}>
      {/* Header Premium */}
      <View style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <MaterialIcons name="diamond" size={32} color="#FFD700" />
          <Text style={styles.headerTitle}>
            {isEditing ? 'Editar Ordem' : 'Nova Ordem de Produção'}
          </Text>
        </View>
      </View>

      <FlatList
        data={renderFormContent()}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.formSection}>{item.component}</View>
        )}
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* Botões de Ação */}
      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.cancelButton}
          labelStyle={styles.cancelButtonText}
          icon="close">
          Cancelar
        </Button>
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.submitButton}
          labelStyle={styles.submitButtonText}
          icon={isEditing ? 'check' : 'plus'}>
          {isEditing ? 'Atualizar' : 'Criar Ordem'}
        </Button>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#154249',
  },
  headerGradient: {
    backgroundColor: '#0E5B67',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    // Simulando gradiente com sombra
    shadowColor: '#16213e',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 10,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFD700',
    marginTop: 5,
    fontStyle: 'italic',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  mainCard: {
    marginTop: 20,
    marginBottom: 15,
    borderRadius: 15,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  typeCard: {
    marginBottom: 15,
    borderRadius: 15,
    elevation: 6,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  productCard: {
    marginBottom: 15,
    borderRadius: 15,
    elevation: 6,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  detailsCard: {
    marginBottom: 20,
    borderRadius: 15,
    elevation: 6,
    shadowColor: '#f5576c',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  cardHeaderGold: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFD700',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    // Simulando gradiente dourado
    shadowColor: '#FFA500',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cardHeaderTeal: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#4ECDC4',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    // Simulando gradiente teal
    shadowColor: '#44A08D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cardHeaderPurple: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#667eea',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    // Simulando gradiente roxo
    shadowColor: '#764ba2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cardHeaderPink: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f093fb',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    // Simulando gradiente rosa
    shadowColor: '#f5576c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cardHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginLeft: 10,
  },
  cardContent: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  luxuryInput: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
  },
  selectedChip: {
    marginTop: 8,
    backgroundColor: '#4CAF50',
    alignSelf: 'flex-start',
  },
  chipText: {
    color: '#ffffff',
    fontSize: 12,
  },
  radioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  radioCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  radioCardSelected: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  radioCardText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    marginBottom: 8,
    textAlign: 'center',
  },
  radioCardTextSelected: {
    color: '#ffffff',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  currencyText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  dateButton: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 15,
  },
  dateContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  dateValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  divider: {
    marginVertical: 20,
    backgroundColor: '#e0e0e0',
  },
  switchSection: {
    marginTop: 10,
  },
  switchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 10,
  },
  switchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginLeft: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 30,
    gap: 15,
    backgroundColor: '#ffffff',
    // Simulando gradiente sutil
    shadowColor: '#f8f9fa',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  cancelButton: {
    flex: 1,
    borderColor: '#666',
    borderWidth: 1.5,
    borderRadius: 25,
    paddingVertical: 5,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#FFD700',
    borderRadius: 25,
    paddingVertical: 5,
    elevation: 4,
    // Simulando gradiente dourado no botão
    shadowColor: '#FFA500',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  submitButtonText: {
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: 'bold',
  },
})

export default FormOrdemProducao
