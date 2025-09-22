import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  ActionSheetIOS,
} from 'react-native'
import { Picker } from '@react-native-picker/picker'
import DateTimePicker from '@react-native-community/datetimepicker'
import { MaterialIcons } from '@expo/vector-icons'
import {
  apiPostComContexto,
  apiPutComContexto,
  apiGetComContexto,
} from '../utils/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import BuscaClienteInput from '../components/BuscaClienteInput'
import styles from './ComissaoStyles'

export default function ComissaoForm({ navigation, route }) {
  const { comissaoId, isEdit } = route.params || {}

  const [loading, setLoading] = useState(false)
  const [empresaId, setEmpresaId] = useState('')
  const [filialId, setFilialId] = useState('')
  const [showDatePicker, setShowDatePicker] = useState(false)

  // Campos do formulário
  const [funcionario, setFuncionario] = useState(null)
  const [cliente, setCliente] = useState(null) 
  const [categoria, setCategoria] = useState('1')
  const [valorTotal, setValorTotal] = useState('')
  const [impostos, setImpostos] = useState('')
  const [valorLiquido, setValorLiquido] = useState('')
  const [percentual, setPercentual] = useState('')
  const [comissaoTotal, setComissaoTotal] = useState('')
  const [parcelas, setParcelas] = useState('1')
  const [comissaoParcela, setComissaoParcela] = useState('')
  const [formaPagamento, setFormaPagamento] = useState('')
  const [dataEntrega, setDataEntrega] = useState(new Date())

  const categorias = [
    { value: '1', label: 'Melhoria', percentual: 5 },
    { value: '2', label: 'Implantação', percentual: 5 },
    { value: '3', label: 'Dashboards', percentual: 20 },
    { value: '4', label: 'Mobile', percentual: 20 },
    { value: '5', label: 'Vendas', percentual: 5 },
  ]

  const formasPagamento = [
    'PIX',
    'Transferência',
    'Dinheiro',
    'Cartão',
    'Boleto',
  ]

  useEffect(() => {
    obterContexto()
    if (isEdit && comissaoId) {
      carregarComissao()
    }
  }, [])

  useEffect(() => {
    calcularCampos()
  }, [valorTotal, impostos, categoria, parcelas])

  const mostrarSeletorCategoria = () => {
    if (Platform.OS === 'ios') {
      const options = ['Cancelar', ...categorias.map(cat => `${cat.label} (${cat.percentual}%)`)]
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: 0,
          title: 'Selecione uma categoria',
        },
        (buttonIndex) => {
          if (buttonIndex > 0) {
            setCategoria(categorias[buttonIndex - 1].value)
          }
        }
      )
    }
  }

  const mostrarSeletorFormaPagamento = () => {
    if (Platform.OS === 'ios') {
      const options = ['Cancelar', ...formasPagamento]
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: 0,
          title: 'Selecione a forma de pagamento',
        },
        (buttonIndex) => {
          if (buttonIndex > 0) {
            setFormaPagamento(formasPagamento[buttonIndex - 1])
          }
        }
      )
    }
  }

  const obterContexto = async () => {
    try {
      const empresa = await AsyncStorage.getItem('empresaId')
      const filial = await AsyncStorage.getItem('filialId')
      setEmpresaId(empresa || '')
      setFilialId(filial || '')
    } catch (error) {
      console.log('Erro ao obter contexto:', error)
    }
  }

  const carregarComissao = async () => {
    setLoading(true)
    try {
      const response = await apiGetComContexto(
        `comissoes/comissoes-sps/${comissaoId}/`
      )
      const comissao = response.data || response

      setFuncionario({
        enti_clie: comissao.comi_func,
        enti_nome: comissao.comi_func_nome || 'Funcionário',
      })
      setCliente({
        enti_clie: comissao.comi_clie,
        enti_nome: comissao.comi_clie_nome || 'Cliente',
      })
      setCategoria(comissao.comi_cate)
      setValorTotal(comissao.comi_valo_tota.toString())
      setImpostos(comissao.comi_impo.toString())
      setValorLiquido(comissao.comi_valo_liqu.toString())
      setPercentual(comissao.comi_perc.toString())
      setComissaoTotal(comissao.comi_comi_tota.toString())
      setParcelas(comissao.comi_parc.toString())
      setComissaoParcela(comissao.comi_comi_parc.toString())
      setFormaPagamento(comissao.comi_form_paga)
      setDataEntrega(new Date(comissao.comi_data_entr))
    } catch (error) {
      Alert.alert('Erro', 'Erro ao carregar comissão')
    } finally {
      setLoading(false)
    }
  }

  const calcularCampos = () => {
    if (!valorTotal || !impostos || !categoria) return

    const vTotal = parseFloat(valorTotal) || 0
    const vImpostos = parseFloat(impostos) || 0
    const nParcelas = parseInt(parcelas) || 1

    const categoriaObj = categorias.find((c) => c.value === categoria)
    const perc = categoriaObj ? categoriaObj.percentual : 0

    const liquido = (vTotal - vImpostos) * (1 - 0.135)
    const comiTotal = liquido * (perc / 100)
    const comiParcela = comiTotal / nParcelas

    setValorLiquido(liquido.toFixed(2))
    setPercentual(perc.toString())
    setComissaoTotal(comiTotal.toFixed(2))
    setComissaoParcela(comiParcela.toFixed(2))
  }

  const salvarComissao = async () => {
    if (!funcionario || !cliente || !valorTotal || !impostos || !formaPagamento) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios')
      return
    }

    setLoading(true)
    try {
      const dados = {
        comi_empr: parseInt(empresaId),
        comi_fili: parseInt(filialId),
        comi_func: funcionario.enti_clie,
        comi_func_nome: funcionario.enti_nome,
        comi_clie: cliente.enti_clie,
        comi_clie_nome: cliente.enti_nome,
        comi_cate: categoria,
        comi_valo_tota: parseFloat(valorTotal),
        comi_impo: parseFloat(impostos),
        comi_valo_liqu: parseFloat(valorLiquido),
        comi_perc: parseFloat(percentual),
        comi_comi_tota: parseFloat(comissaoTotal),
        comi_parc: parseInt(parcelas),
        comi_comi_parc: parseFloat(comissaoParcela),
        comi_form_paga: formaPagamento,
        comi_data_entr: dataEntrega.toISOString().split('T')[0],
      }

      console.log('Dados enviados:', dados) // Para debug

      if (isEdit) {
        await apiPutComContexto(`comissoes/comissoes-sps/${comissaoId}/`, dados)
        Alert.alert('Sucesso', 'Comissão atualizada com sucesso!')
      } else {
        await apiPostComContexto('comissoes/comissoes-sps/', dados)
        Alert.alert('Sucesso', 'Comissão criada com sucesso!')
      }

      navigation.goBack()
    } catch (error) {
      console.log('Erro completo:', error) // Para debug
      Alert.alert('Erro', 'Erro ao salvar comissão')
    } finally {
      setLoading(false)
    }
  }

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || dataEntrega
    setShowDatePicker(Platform.OS === 'ios')
    setDataEntrega(currentDate)
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#007bff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEdit ? 'Editar Comissão' : 'Nova Comissão'}
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          {/* Data de Entrega - Primeiro campo */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Data de Entrega *</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateButtonText}>
                {dataEntrega.toLocaleDateString('pt-BR')}
              </Text>
              <MaterialIcons name="date-range" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Funcionário e Cliente na mesma linha */}
          <View style={styles.rowContainer}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Funcionário *</Text>
              <BuscaClienteInput
                placeholder="Selecione o funcionário"
                onSelect={setFuncionario}
                value={funcionario ? `${funcionario.enti_clie} - ${funcionario.enti_nome}` : ''}
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Cliente *</Text>
              <BuscaClienteInput
                placeholder="Selecione o cliente"
                onSelect={setCliente}
                value={cliente ? `${cliente.enti_clie} - ${cliente.enti_nome}` : ''}
                tipo="cliente"
              />
            </View>
          </View>

          {/* Categoria - linha inteira */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Categoria *</Text>
            {Platform.OS === 'ios' ? (
              <TouchableOpacity
                style={styles.iosPickerButton}
                onPress={mostrarSeletorCategoria}>
                <Text style={styles.iosPickerText}>
                  {categoria ? 
                    categorias.find(cat => cat.value === categoria)?.label + 
                    ` (${categorias.find(cat => cat.value === categoria)?.percentual}%)` 
                    : 'Selecione uma categoria'
                  }
                </Text>
                <MaterialIcons name="keyboard-arrow-down" size={20} color="#666" />
              </TouchableOpacity>
            ) : (
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={categoria}
                  onValueChange={setCategoria}
                  style={styles.picker}>
                  {categorias.map((cat) => (
                    <Picker.Item
                      key={cat.value}
                      label={`${cat.label} (${cat.percentual}%)`}
                      value={cat.value}
                    />
                  ))}
                </Picker>
              </View>
            )}
          </View>

          {/* Valor Total e Impostos na mesma linha */}
          <View style={styles.rowContainer}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Valor Total *</Text>
              <TextInput
                style={styles.input}
                value={valorTotal}
                onChangeText={setValorTotal}
                placeholder="0,00"
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Impostos *</Text>
              <TextInput
                style={styles.input}
                value={impostos}
                onChangeText={setImpostos}
                placeholder="0,00"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Campos calculados (readonly) */}
          <View style={styles.calculatedFields}>
            <Text style={styles.calculatedTitle}>Campos Calculados</Text>

            <View style={styles.calculatedRow}>
              <Text style={styles.calculatedLabel}>Valor Líquido:</Text>
              <Text style={styles.calculatedValue}>R$ {valorLiquido}</Text>
            </View>

            <View style={styles.calculatedRow}>
              <Text style={styles.calculatedLabel}>Percentual:</Text>
              <Text style={styles.calculatedValue}>{percentual}%</Text>
            </View>

            <View style={styles.calculatedRow}>
              <Text style={styles.calculatedLabel}>Comissão Total:</Text>
              <Text style={styles.calculatedValue}>R$ {comissaoTotal}</Text>
            </View>
          </View>

          {/* Forma de Pagamento - linha inteira */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Forma de Pagamento *</Text>
            {Platform.OS === 'ios' ? (
              <TouchableOpacity
                style={styles.iosPickerButton}
                onPress={mostrarSeletorFormaPagamento}>
                <Text style={styles.iosPickerText}>
                  {formaPagamento || 'Selecione a forma de pagamento'}
                </Text>
                <MaterialIcons name="keyboard-arrow-down" size={20} color="#666" />
              </TouchableOpacity>
            ) : (
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formaPagamento}
                  onValueChange={setFormaPagamento}
                  style={styles.picker}>
                  <Picker.Item label="Selecione..." value="" />
                  {formasPagamento.map((forma) => (
                    <Picker.Item key={forma} label={forma} value={forma} />
                  ))}
                </Picker>
              </View>
            )}
          </View>

          {/* Parcelas e Comissão por Parcela na mesma linha */}
          <View style={styles.rowContainer}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Parcelas</Text>
              <TextInput
                style={styles.input}
                value={parcelas}
                onChangeText={setParcelas}
                placeholder="1" 
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Comissão por Parcela</Text>
              <Text style={styles.readonlyInput}>R$ {comissaoParcela}</Text>
            </View>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={dataEntrega}
              mode="date"
              display="default"
              onChange={onChangeDate}
            />
          )}

          {/* Botões */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={salvarComissao}
              disabled={loading}>
              <Text style={styles.saveButtonText}>
                {isEdit ? 'Atualizar' : 'Salvar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
