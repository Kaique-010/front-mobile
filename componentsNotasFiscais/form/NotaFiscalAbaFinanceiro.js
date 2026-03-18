import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native'
import { apiPostComContexto, apiGetComContexto } from '../../utils/api'
import Toast from 'react-native-toast-message'
import { Picker } from '@react-native-picker/picker'
import { Ionicons } from '@expo/vector-icons'
import DatePickerCrossPlatform from '../../components/DatePickerCrossPlatform'
import DateTimePicker from '@react-native-community/datetimepicker'

const FORMAS_RECEBIMENTO = [
  { codigo: '00', descricao: 'DUPLICATA' },
  { codigo: '01', descricao: 'CHEQUE' },
  { codigo: '02', descricao: 'PROMISSÓRIA' },
  { codigo: '03', descricao: 'RECIBO' },
  { codigo: '50', descricao: 'CHEQUE PRÉ' },
  { codigo: '51', descricao: 'CARTÃO DE CRÉDITO' },
  { codigo: '52', descricao: 'CARTÃO DE DÉBITO' },
  { codigo: '53', descricao: 'BOLETO BANCÁRIO' },
  { codigo: '54', descricao: 'DINHEIRO' },
  { codigo: '55', descricao: 'DEPÓSITO EM CONTA' },
  { codigo: '56', descricao: 'VENDA À VISTA' },
  { codigo: '60', descricao: 'PIX' },
]

export default function NotaFiscalAbaFinanceiro({
  nota = {},
  totalGeral = 0,
  setNota,
}) {
  const [loading, setLoading] = useState(false)
  const [titulos, setTitulos] = useState([])
  const [formaPagamento, setFormaPagamento] = useState('54')
  const [parcelas, setParcelas] = useState('1')
  const [dataBase, setDataBase] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [parcelasSimuladas, setParcelasSimuladas] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [tituloEmEdicao, setTituloEmEdicao] = useState(null)
  const [showModalDatePicker, setShowModalDatePicker] = useState(false)
  const [showPicker, setShowPicker] = useState(false)

  const total = Number(totalGeral) || 0

  const titu_titu = nota?.titu_titu || ''
  const titu_clie = nota?.titu_clie || ''
  const titu_empr = nota?.titu_empr || ''
  const titu_fili = nota?.titu_fili || ''

  // Sincronizar formaPagamento com o estado do Nota
  useEffect(() => {
    if (nota?.titu_form_reci) {
      setFormaPagamento(nota.titu_form_reci)
    }
  }, [nota?.titu_form_reci])

  // Atualizar o estado do Nota quando formaPagamento mudar
  useEffect(() => {
    if (setNota && formaPagamento) {
      setNota((prev) => ({
        ...prev,
        titu_form_reci: formaPagamento,
      }))
    }
  }, [formaPagamento, setNota])

  useEffect(() => {
    console.log('FinanceiroNota props:', {
      titu_titu,
      titu_clie,
      titu_empr,
      titu_fili,
      total,
    })
  }, [titu_titu, titu_clie, titu_empr, titu_fili, total])

  useEffect(() => {
    const numParcelas = parseInt(parcelas) || 1
    const valorParcela = total / numParcelas
    const novasParcelasSimuladas = []

    for (let i = 1; i <= numParcelas; i++) {
      const dataVencimento = new Date(dataBase)
      // Corrigindo o problema de Date value out of bounds
      const novoMes = dataVencimento.getMonth() + (i - 1)
      const novoAno = dataVencimento.getFullYear() + Math.floor(novoMes / 12)
      const mesAjustado = novoMes % 12

      dataVencimento.setFullYear(novoAno)
      dataVencimento.setMonth(mesAjustado)

      // Verificar se o dia é válido para o mês/ano
      const ultimoDiaDoMes = new Date(novoAno, mesAjustado + 1, 0).getDate()
      const diaOriginal = new Date(dataBase).getDate()
      if (diaOriginal > ultimoDiaDoMes) {
        dataVencimento.setDate(ultimoDiaDoMes)
      }

      novasParcelasSimuladas.push({
        parcela: i,
        valor:
          i === numParcelas
            ? total - valorParcela * (numParcelas - 1)
            : valorParcela,
        vencimento: dataVencimento.toISOString().split('T')[0],
      })
    }

    setParcelasSimuladas(novasParcelasSimuladas)
  }, [parcelas, total, dataBase])

  const carregarTitulos = async () => {
    if (!titu_titu) return

    try {
      setLoading(true)
      const response = await apiGetComContexto(
        `notasfiscais/notas-fiscais/financeiro/${titu_titu}/`,
      )
      setTitulos(response.titulos || [])
    } catch (error) {
      if (error.response?.status === 404) {
        setTitulos([])
        return
      }

      console.error('Erro ao carregar títulos:', error)
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível carregar os títulos',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarTitulos()
  }, [titu_titu])

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || dataBase
    setShowDatePicker(Platform.OS === 'ios')
    setDataBase(currentDate)
  }

  const onModalDateChange = (event, selectedDate) => {
    const currentDate =
      selectedDate || new Date(tituloEmEdicao?.vencimento || new Date())
    setShowModalDatePicker(Platform.OS === 'ios')
    if (selectedDate && tituloEmEdicao) {
      setTituloEmEdicao((prev) => ({
        ...prev,
        vencimento: selectedDate.toISOString().split('T')[0],
      }))
    }
  }

  const gerarTitulos = async () => {
    if (!titu_titu || !titu_clie || !total) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Cliente, número da nota fiscal e total são obrigatórios',
      })
      return
    }

    try {
      setLoading(true)
      const payload = {
        titu_titu,
        titu_clie,
        titu_tota: total,
        titu_form_reci: formaPagamento,
        parcelas: parseInt(parcelas),
        data_base: dataBase.toISOString().split('T')[0],
      }

      console.log('🔍 Payload gerarTitulos:', payload)
      console.log('📋 Forma de pagamento selecionada:', formaPagamento)
      const formaDescricao = FORMAS_RECEBIMENTO.find(
        (f) => f.codigo === formaPagamento,
      )?.descricao
      console.log('📝 Descrição da forma:', formaDescricao)
      console.log('Payload para gerar títulos:', payload)

      await apiPostComContexto(
        `notasfiscais/notas-fiscais/financeiro/${titu_titu}/gerar/`,
        payload,
      )

      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Títulos gerados com sucesso',
      })

      await carregarTitulos()
    } catch (error) {
      console.error('Erro ao gerar títulos:', error)
      const mensagemErro =
        error.response?.data?.detail || 'Não foi possível gerar os títulos'
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: mensagemErro,
      })
    } finally {
      setLoading(false)
    }
  }

  const removerTitulos = async () => {
    try {
      setLoading(true)
      await apiPostComContexto(
        `notasfiscais/notas-fiscais/financeiro/${titu_titu}/remover/`,
        { titu_titu },
      )

      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Títulos removidos com sucesso',
      })

      setTitulos([])
    } catch (error) {
      if (error.response?.status === 404) {
        setTitulos([])
        return
      }

      console.error('Erro ao remover títulos:', error)
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2:
          error.response?.data?.detail || 'Não foi possível remover os títulos',
      })
    } finally {
      setLoading(false)
    }
  }

  const editarTitulo = (titulo) => {
    setTituloEmEdicao(titulo)
    setModalVisible(true)
  }

  const salvarEdicaoTitulo = async () => {
    if (!tituloEmEdicao) return

    try {
      setLoading(true)
      const payload = {
        titu_titu,
        parcela: tituloEmEdicao.parcela,
        valor: parseFloat(tituloEmEdicao.valor),
        vencimento: tituloEmEdicao.vencimento,
        titu_form_reci: formaPagamento,
      }

      console.log('🔍 Payload salvarEdicaoTitulo:', payload)
      console.log('📋 Forma de pagamento na edição:', formaPagamento)
      const formaDescricao = FORMAS_RECEBIMENTO.find(
        (f) => f.codigo === formaPagamento,
      )?.descricao
      console.log('📝 Descrição da forma na edição:', formaDescricao)

      await apiPostComContexto(
        `notasfiscais/notas-fiscais/financeiro/${titu_titu}/atualizar/`,
        payload,
      )

      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Título atualizado com sucesso',
      })

      setModalVisible(false)
      setTituloEmEdicao(null)
      await carregarTitulos()
    } catch (error) {
      console.error('Erro ao atualizar título:', error)
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2:
          error.response?.data?.detail || 'Não foi possível atualizar o título',
      })
    } finally {
      setLoading(false)
    }
  }

  const validarEdicaoTitulo = () => {
    if (!tituloEmEdicao) return false

    const valor = parseFloat(tituloEmEdicao.valor)
    if (isNaN(valor) || valor <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'O valor deve ser maior que zero',
      })
      return false
    }

    if (!tituloEmEdicao.vencimento) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'A data de vencimento é obrigatória',
      })
      return false
    }

    return true
  }

  const renderModalEdicao = () => (
    <Modal
      visible={modalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setModalVisible(false)}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            Editar Parcela {tituloEmEdicao?.parcela}
          </Text>

          <TextInput
            label="Valor"
            value={tituloEmEdicao?.valor?.toString() || ''}
            onChangeText={(text) =>
              setTituloEmEdicao((prev) => ({ ...prev, valor: text }))
            }
            keyboardType="numeric"
            style={styles.modalInput}
          />

          <Text
            style={[
              styles.pickerLabel,
              { color: '#10a2a7', marginBottom: 10 },
            ]}>
            Data de Vencimento
          </Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowModalDatePicker(true)}>
            <Text style={styles.datePickerText}>
              {tituloEmEdicao?.vencimento
                ? new Date(tituloEmEdicao.vencimento).toLocaleDateString(
                    'pt-BR',
                  )
                : 'Selecionar data'}
            </Text>
            <Ionicons name="calendar" size={20} color="#10a2a7" />
          </TouchableOpacity>

          {showModalDatePicker && (
            <DatePickerCrossPlatform
              testID="modalDateTimePicker"
              value={
                tituloEmEdicao?.vencimento
                  ? new Date(tituloEmEdicao.vencimento)
                  : new Date()
              }
              mode="date"
              is24Hour={true}
              display="default"
              onChange={onModalDateChange}
            />
          )}

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonCancel]}
              onPress={() => setModalVisible(false)}
              disabled={loading}>
              <Text style={styles.modalButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonSave]}
              onPress={() => {
                if (validarEdicaoTitulo()) {
                  salvarEdicaoTitulo()
                }
              }}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.modalButtonText}>Salvar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Financeiro do Nota</Text>

        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Total do Nota:</Text>
            <Text style={styles.valor}>R$ {total.toFixed(2)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Número da Nota Fiscal:</Text>
            <Text style={styles.valor}>{titu_titu || 'N/A'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Cliente:</Text>
            <Text style={styles.valor}>{titu_clie || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.divisor} />

        <Text style={styles.cardTitle}>Geração de Títulos</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10a2a7" />
            <Text style={styles.loadingText}>Carregando...</Text>
          </View>
        ) : titulos.length > 0 ? (
          <View style={styles.titulosContainer}>
            <Text style={styles.subtitulo}>Títulos Gerados</Text>
            {titulos.map((titulo, index) => (
              <View key={index} style={styles.tituloItem}>
                <View style={styles.tituloHeader}>
                  <Text style={styles.tituloNumero}>
                    Parcela {titulo.parcela}
                  </Text>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => editarTitulo(titulo)}>
                    <Ionicons name="pencil" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>

                <View style={styles.tituloRow}>
                  <Text style={styles.tituloLabel}>Valor:</Text>
                  <Text style={styles.tituloValor}>
                    R$ {parseFloat(titulo.valor).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.tituloRow}>
                  <Text style={styles.tituloLabel}>Vencimento:</Text>
                  <Text style={styles.tituloValor}>
                    {new Date(titulo.vencimento).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.tituloRow}>
                  <Text style={styles.tituloLabel}>Forma de Pagamento:</Text>
                  <Text style={styles.tituloValor}>
                    {(() => {
                      const forma = FORMAS_RECEBIMENTO.find(
                        (f) => f.codigo === titulo.forma_pagamento,
                      )
                      return forma
                        ? `${forma.codigo} - ${forma.descricao}`
                        : titulo.forma_pagamento || 'N/A'
                    })()}
                  </Text>
                </View>
                <View style={styles.tituloRow}>
                  <Text style={styles.tituloLabel}>Status:</Text>
                  <Text
                    style={[
                      styles.tituloValor,
                      styles[`status${titulo.status || 'Aberta'}`],
                    ]}>
                    {titulo.status || 'Aberta'}
                  </Text>
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={[styles.button, styles.buttonDanger]}
              onPress={removerTitulos}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Remover Todos os Títulos</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.formContainer}>
              <Text style={styles.pickerLabel}>Forma de Pagamento</Text>
              {Platform.OS === 'ios' ? (
                <>
                  <TouchableOpacity
                    style={[
                      styles.pickerContainer,
                      {
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingHorizontal: 10,
                        height: 50,
                      },
                    ]}
                    onPress={() => setShowPicker(true)}
                    disabled={loading}>
                    <Text style={{ color: '#fff', fontSize: 16 }}>
                      {FORMAS_RECEBIMENTO.find(
                        (f) => f.codigo === formaPagamento,
                      )?.descricao || 'Selecione'}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#fff" />
                  </TouchableOpacity>

                  <Modal
                    visible={showPicker}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setShowPicker(false)}>
                    <View
                      style={{
                        flex: 1,
                        justifyContent: 'flex-end',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                      }}>
                      <View
                        style={{
                          backgroundColor: '#232935',
                          paddingBottom: 20,
                        }}>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'flex-end',
                            padding: 15,
                            borderBottomWidth: 1,
                            borderBottomColor: '#2c3e50',
                            backgroundColor: '#1a2f3d',
                          }}>
                          <TouchableOpacity
                            onPress={() => setShowPicker(false)}>
                            <Text
                              style={{
                                color: '#10a2a7',
                                fontSize: 18,
                                fontWeight: 'bold',
                              }}>
                              Confirmar
                            </Text>
                          </TouchableOpacity>
                        </View>
                        <Picker
                          selectedValue={formaPagamento}
                          onValueChange={(itemValue) =>
                            setFormaPagamento(itemValue)
                          }
                          itemStyle={{ color: '#fff' }}>
                          {FORMAS_RECEBIMENTO.map((forma) => (
                            <Picker.Item
                              key={forma.codigo}
                              label={forma.descricao}
                              value={forma.codigo}
                              color="#fff"
                            />
                          ))}
                        </Picker>
                      </View>
                    </View>
                  </Modal>
                </>
              ) : (
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formaPagamento}
                    onValueChange={setFormaPagamento}
                    style={styles.picker}
                    dropdownIconColor="#fff"
                    enabled={!loading}>
                    {FORMAS_RECEBIMENTO.map((forma) => (
                      <Picker.Item
                        key={forma.codigo}
                        label={forma.descricao}
                        value={forma.codigo}
                        style={styles.pickerItem}
                      />
                    ))}
                  </Picker>
                </View>
              )}

              <TextInput
                label="Número de Parcelas"
                value={parcelas}
                onChangeText={setParcelas}
                keyboardType="numeric"
                style={styles.input}
                disabled={loading}
              />

              <Text style={styles.pickerLabel}>Data Base</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
                disabled={loading}>
                <Text style={styles.datePickerText}>
                  {dataBase.toLocaleDateString('pt-BR')}
                </Text>
                <Ionicons name="calendar" size={20} color="#10a2a7" />
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={dataBase}
                  mode="date"
                  is24Hour={true}
                  display="default"
                  onChange={onDateChange}
                />
              )}

              {parcelasSimuladas.length > 0 && (
                <View style={styles.simulacaoContainer}>
                  <Text style={styles.subtitulo}>Simulação das Parcelas</Text>
                  {parcelasSimuladas.map((parcela, index) => (
                    <View key={index} style={styles.parcelaSimulada}>
                      <Text style={styles.parcelaTexto}>
                        {parcela.parcela}ª Parcela: R${' '}
                        {parcela.valor.toFixed(2)}
                      </Text>
                      <Text style={styles.parcelaData}>
                        Venc.:{' '}
                        {new Date(parcela.vencimento).toLocaleDateString()}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.button,
                  (loading || !titu_titu || !titu_clie || total <= 0) &&
                    styles.buttonDisabled,
                ]}
                onPress={gerarTitulos}
                disabled={
                  loading || !titu_titu || !titu_clie || total <= 0
                }>
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Gerar Títulos</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.semTitulosContainer}>
              <Text style={styles.semTitulosTexto}>
                Este Nota ainda não possui títulos gerados.
              </Text>
            </View>
          </>
        )}
      </View>
      {renderModalEdicao()}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a2f3d',
  },
  card: {
    backgroundColor: '#232935',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardTitle: {
    color: '#10a2a7',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: '#1a2f3d',
    borderRadius: 8,
    padding: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  label: {
    color: '#999',
    fontSize: 16,
  },
  valor: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divisor: {
    height: 1,
    backgroundColor: '#2c3e50',
    marginVertical: 20,
  },
  formContainer: {
    backgroundColor: '#1a2f3d',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  pickerLabel: {
    color: '#999',
    fontSize: 16,
    marginBottom: 5,
  },
  pickerContainer: {
    backgroundColor: '#232935',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2c3e50',
  },
  picker: {
    color: '#fff',
    height: 50,
  },
  pickerItem: {
    color: '#fff',
    backgroundColor: '#232935',
  },
  input: {
    marginBottom: 10,
    backgroundColor: '#232935',
    color: '#fff',
  },
  button: {
    backgroundColor: '#10a2a7',
    padding: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonDanger: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  titulosContainer: {
    backgroundColor: '#1a2f3d',
    borderRadius: 8,
    padding: 15,
  },
  simulacaoContainer: {
    backgroundColor: '#232935',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  parcelaSimulada: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2c3e50',
  },
  parcelaTexto: {
    color: '#fff',
    fontSize: 14,
  },
  parcelaData: {
    color: '#999',
    fontSize: 14,
  },
  subtitulo: {
    color: '#10a2a7',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tituloItem: {
    backgroundColor: '#232935',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  tituloRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    backgroundColor: '#232935',
    borderRadius: 8,
    padding: 8,
  },
  tituloLabel: {
    color: '#999',
    fontSize: 14,
  },
  tituloValor: {
    backgroundColor: '#232935',
    borderRadius: 8,
    padding: 8,
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#666',
    opacity: 0.7,
  },
  semTitulosContainer: {
    backgroundColor: '#1a2f3d',
    borderRadius: 8,
    padding: 15,
    marginTop: 15,
    alignItems: 'center',
  },
  semTitulosTexto: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#232935',
    borderRadius: 8,
    padding: 20,
  },
  modalTitle: {
    color: '#10a2a7',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    marginBottom: 15,
    backgroundColor: '#1a2f3d',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonCancel: {
    backgroundColor: '#666',
  },
  modalButtonSave: {
    backgroundColor: '#10a2a7',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tituloHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tituloNumero: {
    color: '#10a2a7',
    fontSize: 16,
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: '#10a2a7',
    padding: 8,
    borderRadius: 6,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: '#10a2a7',
    marginTop: 10,
    fontSize: 16,
  },
  statusAberta: {
    color: '#ffd700',
  },
  statusPago: {
    color: '#00ff00',
  },
  statusCancelado: {
    color: '#ff0000',
  },
  datePickerButton: {
    backgroundColor: '#1a2f3d',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#10a2a7',
  },
  datePickerText: {
    color: '#fff',
    fontSize: 16,
  },
})
