import React, { useEffect, useState, useCallback } from 'react'
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { MaterialIcons } from '@expo/vector-icons'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import {
  getDashboardEstoque,
  getDashboardVendas,
} from '../services/dashboardService'
import DashboardEstoqueTopProdutos from './DashboardEstoqueTopProdutos'
import DashboardVendasStatusPedidos from './DashboardVendasStatusPedidos'
import { useEnviarEmail } from '../hooks/useEnviarEmail'
import { useEnviarWhats } from '../hooks/useEnviarWhats'

export default function Dashboard() {
  const [estoqueDados, setEstoqueDados] = useState(null)
  const [vendasDados, setVendasDados] = useState(null)
  const [graficosBase64, setGraficosBase64] = useState({})
  const [dataIni, setDataIni] = useState(() => {
    const hoje = new Date()
    return new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  })
  const [dataFim, setDataFim] = useState(() => new Date())

  const [showIniPicker, setShowIniPicker] = useState(false)
  const [showFimPicker, setShowFimPicker] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Modal controls
  const [modalVisible, setModalVisible] = useState(false)
  const [modalType, setModalType] = useState(null) // 'email' ou 'whats'
  const [inputValue, setInputValue] = useState('')

  const { enviarEmail, loading: loadingEmail } = useEnviarEmail()
  const { enviarWhats, loading: loadingWhats } = useEnviarWhats()

  const formatDate = (date) => date.toISOString().slice(0, 10)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const estoque = await getDashboardEstoque(
        formatDate(dataIni),
        formatDate(dataFim)
      )
      const vendas = await getDashboardVendas(
        formatDate(dataIni),
        formatDate(dataFim)
      )
      setEstoqueDados(estoque)
      setVendasDados(vendas)
    } catch (err) {
      setError('Erro ao carregar dados')
      setEstoqueDados(null)
      setVendasDados(null)
    } finally {
      setLoading(false)
    }
  }, [dataIni, dataFim])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const onChangeIni = (event, selectedDate) => {
    setShowIniPicker(false)
    if (selectedDate) {
      setDataIni(selectedDate)
    }
  }

  const onChangeFim = (event, selectedDate) => {
    setShowFimPicker(false)
    if (selectedDate) {
      setDataFim(selectedDate)
    }
  }

  const abrirModal = (tipo) => {
    setModalType(tipo)
    setInputValue('')
    setModalVisible(true)
  }

  const fecharModal = () => {
    setModalVisible(false)
    setInputValue('')
    setModalType(null)
  }

  const handleEnviar = async () => {
    if (!inputValue.trim()) {
      Alert.alert(
        'Erro',
        modalType === 'email' ? 'Email é obrigatório' : 'Número é obrigatório'
      )
      return
    }

    // Monta os dados que vai enviar, pode adaptar aqui o que mandar pra API
    const dadosEnviar = {
      estoque: estoqueDados,
      vendas: vendasDados,
      periodo: { inicio: formatDate(dataIni), fim: formatDate(dataFim) },
    }

    let sucesso = false
    if (modalType === 'email') {
      sucesso = await enviarEmail(inputValue.trim(), dadosEnviar)
    } else if (modalType === 'whats') {
      sucesso = await enviarWhats(inputValue.trim(), dadosEnviar)
    }

    if (sucesso) {
      fecharModal()
    }
  }

  return (
    <ScrollView style={styles.container}>
      {/* Data pickers */}
      <View style={styles.datePickerRow}>
        <View style={styles.datePickerWrapper}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowIniPicker(true)}>
            <Text style={styles.dateButtonText}>
              {`Data Início: ${formatDate(dataIni)}`}
            </Text>
          </TouchableOpacity>
          {showIniPicker && (
            <DateTimePicker
              value={dataIni}
              mode="date"
              display="default"
              onChange={onChangeIni}
              maximumDate={dataFim}
            />
          )}
        </View>

        <View style={styles.datePickerWrapper}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowFimPicker(true)}>
            <Text style={styles.dateButtonText}>
              {`Data Fim: ${formatDate(dataFim)}`}
            </Text>
          </TouchableOpacity>
          {showFimPicker && (
            <DateTimePicker
              value={dataFim}
              mode="date"
              display="default"
              onChange={onChangeFim}
              minimumDate={dataIni}
              maximumDate={new Date()}
            />
          )}
        </View>

        <View style={styles.updateButtonWrapper}>
          <TouchableOpacity style={styles.updateButton} onPress={fetchData}>
            <Text style={styles.updateButtonText}>Atualizar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Conteúdo do dashboard */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#fff"
          style={{ marginTop: 30 }}
        />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : !estoqueDados || !vendasDados ? (
        <Text style={styles.loadingText}>Nenhum dado disponível.</Text>
      ) : (
        <>
          <Text style={styles.title}>Top Produtos Saída Estoque</Text>
          <DashboardEstoqueTopProdutos
            dados={estoqueDados.top_produtos_saida}
          />

          <Text style={[styles.title, { marginTop: 32 }]}>
            Resumo de Pedidos
          </Text>
          <DashboardVendasStatusPedidos
            totalPedidos={vendasDados.total_pedidos}
            totalFaturado={vendasDados.total_faturado}
            ticketMedio={vendasDados.ticket_medio}
          />
        </>
      )}

      {/* Botões enviar email e WhatsApp */}
      <View style={styles.botaoContainer}>
        <TouchableOpacity
          style={styles.botaoEnviar}
          onPress={() => abrirModal('email')}
          disabled={loadingEmail}>
          <MaterialIcons name="email" size={24} color="#fff" />
          <Text style={styles.botaoTexto}>Enviar Email</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botaoEnviar}
          onPress={() => abrirModal('whats')}
          disabled={loadingWhats}>
          <MaterialCommunityIcons name="whatsapp" size={24} color="#25D366" />
          <Text style={[styles.botaoTexto, { color: '#25D366' }]}>
            Enviar Whats
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal para entrada de email ou número */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={fecharModal}>
        <View style={styles.modalFundo}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitulo}>
              {modalType === 'email'
                ? 'Enviar por Email'
                : 'Enviar por WhatsApp'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder={
                modalType === 'email' ? 'Digite o email' : 'Digite o número'
              }
              keyboardType={
                modalType === 'email' ? 'email-address' : 'phone-pad'
              }
              value={inputValue}
              onChangeText={setInputValue}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.modalBotoes}>
              <TouchableOpacity
                style={styles.modalBotaoCancelar}
                onPress={fecharModal}>
                <Text style={styles.modalBotaoTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalBotaoEnviar}
                onPress={handleEnviar}>
                {loadingEmail || loadingWhats ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalBotaoTexto}>Enviar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  datePickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  datePickerWrapper: {
    flex: 1,
    marginRight: 8,
  },
  dateButton: {
    backgroundColor: '#1f1f1f',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  dateButtonText: {
    color: '#ddd',
    fontSize: 14,
  },
  updateButtonWrapper: {
    justifyContent: 'center',
  },
  updateButton: {
    backgroundColor: '#333',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  updateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginTop: 20,
    textAlign: 'center',
  },
  loadingText: {
    color: '#aaa',
    marginTop: 20,
    textAlign: 'center',
  },
  botaoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 40,
    marginBottom: 30,
  },
  botaoEnviar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#444',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  botaoTexto: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  modalFundo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 20,
  },
  modalTitulo: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#333',
    color: '#fff',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  modalBotoes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalBotaoCancelar: {
    backgroundColor: '#555',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
  },
  modalBotaoEnviar: {
    backgroundColor: '#25D366',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
  },
  modalBotaoTexto: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
})
