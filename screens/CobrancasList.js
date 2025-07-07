import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  TextInput,
  Modal,
  ScrollView,
  Linking,
} from 'react-native'
import { apiGetComContexto } from '../utils/api'
import { useEnviarEmail } from '../hooks/useEnviarEmail'
import DateTimePicker from '@react-native-community/datetimepicker'
import Toast from 'react-native-toast-message'

export default function CobrancasList() {
  const [cobrancas, setCobrancas] = useState([])
  const [loading, setLoading] = useState(false)
  const [dataIni, setDataIni] = useState(new Date())
  const [dataFim, setDataFim] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState({
    show: false,
    type: '',
  })
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedCobranca, setSelectedCobranca] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [loadingWhats, setLoadingWhats] = useState(false)
  const [selecionadas, setSelecionadas] = useState([])

  const { enviarEmail, loading: loadingEmail } = useEnviarEmail()

  const toggleSelecionada = (item) => {
    const chave = item.id || item.numero_titulo
    setSelecionadas((prev) => {
      if (prev.includes(chave)) {
        return prev.filter((i) => i !== chave)
      } else {
        return [...prev, chave]
      }
    })
  }

  const onDateChange = (event, selectedDate) => {
    if (selectedDate) {
      if (showDatePicker.type === 'ini') {
        setDataIni(selectedDate)
      } else {
        setDataFim(selectedDate)
      }
    }
    setShowDatePicker({ show: false, type: '' }) // sempre fecha após selecionar
  }

  const buscarCobrancas = async () => {
    setLoading(true)
    try {
      const dataIniFormatted = dataIni.toISOString().split('T')[0]
      const dataFimFormatted = dataFim.toISOString().split('T')[0]
      const response = await apiGetComContexto(
        `enviar-cobranca/enviar-cobranca/?data_ini=${dataIniFormatted}&data_fim=${dataFimFormatted}&search=${searchText}`
      )
      let cobrancasData = []

      if (response.data && response.data.results) {
        console.log('✅ Usando response.data.results:', response.data.results)
        cobrancasData = response.data.results
      } else if (Array.isArray(response.data)) {
        console.log('✅ Usando response.data diretamente:', response.data)
        cobrancasData = response.data
      } else if (Array.isArray(response)) {
        console.log('✅ Usando response diretamente:', response)
        cobrancasData = response
      } else {
        console.log('❌ Formato de dados não reconhecido')
        console.log('🔍 Tentando extrair dados...')
        const possibleData =
          response?.data?.data || response?.results || response || []
        console.log('🎯 Dados extraídos:', possibleData)
        cobrancasData = Array.isArray(possibleData) ? possibleData : []
      }

      console.log('🎯 Final cobrancasData:', cobrancasData)
      console.log('📏 Final length:', cobrancasData.length)
      setCobrancas(cobrancasData)
    } catch (error) {
      console.error('❌ Erro completo:', error)
      console.error('📡 Error response:', error.response)
      console.error('📊 Error response data:', error.response?.data)
      console.error('📋 Error message:', error.message)
      Alert.alert('Erro', 'Falha ao buscar cobranças: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    buscarCobrancas()
  }, [])

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR')
  }

  const formatarValor = (valor) => {
    return parseFloat(valor).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  const abrirModalCobranca = (cobranca) => {
    setSelectedCobranca(cobranca)
    setModalVisible(true)
  }

  //Função de envio de whatsapp unitario
  const enviarCobrancaWhatsApp = async () => {
    try {
      setLoadingWhats(true)

      // Verificar se tem pelo menos um dos números
      const numeroRaw =
        selectedCobranca.cliente_celular ||
        selectedCobranca.cliente_telefone ||
        ''
      const numeroLimpo = numeroRaw.replace(/\D/g, '')

      if (!numeroRaw || numeroLimpo.length < 10) {
        Alert.alert(
          'Erro',
          'Cliente não possui número de WhatsApp válido cadastrado'
        )
        return
      }

      const numeroZap = `55${numeroLimpo}`

      const mensagem = `*Cobrança a Vencer do Cliente: - ${
        selectedCobranca.cliente_nome
      }*

  *Título*: ${selectedCobranca.numero_titulo}
  *Parcela*: ${selectedCobranca.parcela}

  *Vencimento*: ${formatarData(selectedCobranca.vencimento)}

  *Valor*: ${formatarValor(selectedCobranca.valor)}

  
  ${
    selectedCobranca.linha_digitavel
      ? `Linha Digitável: ${selectedCobranca.linha_digitavel}\n`
      : ''
  }${
        selectedCobranca.url_boleto
          ? `Link do Boleto: ${selectedCobranca.url_boleto}`
          : ''
      }`

      const url = `https://wa.me/${numeroZap}?text=${encodeURIComponent(
        mensagem
      )}`

      const canOpen = await Linking.canOpenURL(url)
      if (canOpen) {
        await Linking.openURL(url)
        setModalVisible(false)
        Toast.show({
          type: 'success',
          text1: 'Sucesso',
          text2: 'WhatsApp aberto com sucesso!',
        })
      } else {
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'Falha ao abrir WhatsApp',
        })
      }
    } catch (error) {
      console.error('Erro ao enviar WhatsApp:', error)
      Alert.alert('Erro', 'Falha ao abrir WhatsApp')
    } finally {
      setLoadingWhats(false)
    }
  }

  //Enviar vários títulos pelo whatsapp
  const enviarMultiplosWhatsapps = async () => {
    const cobrancasSelecionadas = cobrancas.filter((c) =>
      selecionadas.includes(c.id || c.numero_titulo)
    )

    for (let cobranca of cobrancasSelecionadas) {
      const numeroRaw =
        cobranca.cliente_celular || cobranca.cliente_telefone || ''
      const numeroLimpo = numeroRaw.replace(/\D/g, '')

      if (!numeroLimpo || numeroLimpo.length < 10) continue

      const numeroZap = `55${numeroLimpo}`
      const mensagem = `*Cobrança - ${cobranca.cliente_nome}*\n\nTítulo: ${
        cobranca.numero_titulo
      }\nParcela: ${cobranca.parcela}\nVencimento: ${formatarData(
        cobranca.vencimento
      )}\nValor: ${formatarValor(cobranca.valor)}\n\n${
        cobranca.linha_digitavel
          ? `Linha Digitável: ${cobranca.linha_digitavel}`
          : ''
      }\n${cobranca.url_boleto ? `Link: ${cobranca.url_boleto}` : ''}`

      const url = `https://wa.me/${numeroZap}?text=${encodeURIComponent(
        mensagem
      )}`
      const canOpen = await Linking.canOpenURL(url)
      if (canOpen) await Linking.openURL(url)
    }

    Toast.show({
      type: 'success',
      text1: 'WhatsApp',
      text2: 'Envios abertos com sucesso!',
    })

    setSelecionadas([])
  }

  const enviarMultiplosEmails = async () => {
    const cobrancasSelecionadas = cobrancas.filter((c) =>
      selecionadas.includes(c.id || c.numero_titulo)
    )

    let enviados = 0

    for (let cobranca of cobrancasSelecionadas) {
      const email = cobranca.cliente_email
      if (!email) continue

      const dadosEmail = {
        assunto: `Cobrança - Título ${cobranca.numero_titulo}`,
        corpo: `
Prezado(a) ${cobranca.cliente_nome},

Segue cobrança referente ao título ${cobranca.numero_titulo}, parcela ${
          cobranca.parcela
        }, vencimento ${formatarData(
          cobranca.vencimento
        )}, valor ${formatarValor(cobranca.valor)}.

${
  cobranca.linha_digitavel ? `Linha Digitável: ${cobranca.linha_digitavel}` : ''
}
${cobranca.url_boleto ? `Link: ${cobranca.url_boleto}` : ''}

Att,
Equipe Financeira
      `,
        anexos: cobranca.url_boleto ? [cobranca.url_boleto] : [],
      }

      try {
        await enviarEmail(email, dadosEmail)
        enviados++
      } catch (err) {
        console.error('Erro ao enviar:', cobranca.numero_titulo, err.message)
      }
    }

    Alert.alert('Envio Concluído', `${enviados} e-mails enviados com sucesso!`)
    setSelecionadas([])
  }

  const renderCobranca = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.itemContainer,
        selecionadas.includes(item.id || item.numero_titulo) && {
          borderColor: '#4caf50',
          borderWidth: 2,
        },
      ]}
      onPress={() => toggleSelecionada(item)}
      onLongPress={() => abrirModalCobranca(item)}>
      <View style={styles.itemHeader}>
        <Text style={styles.clienteNome}>{item.cliente_nome}</Text>
        <Text style={styles.valor}>{formatarValor(item.valor)}</Text>
      </View>
      <View style={styles.itemDetails}>
        <Text style={styles.detailText}>Título: {item.numero_titulo}</Text>
        <Text style={styles.detailText}>
          Vencimento: {formatarData(item.vencimento)}
        </Text>
      </View>
      <View style={styles.itemFooter}>
        <Text style={styles.formaRecebimento}>
          {item.forma_recebimento_nome}
        </Text>
        <Text
          style={[
            styles.status,
            new Date(item.vencimento) < new Date()
              ? styles.vencido
              : styles.aVencer,
          ]}>
          {new Date(item.vencimento) < new Date() ? 'VENCIDO' : 'A VENCER'}
        </Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      {/* Filtros */}
      <View style={styles.filtrosContainer}>
        <View style={styles.dateContainer}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker({ show: true, type: 'ini' })}>
            <Text style={styles.dateButtonText}>
              Data Inicial: {formatarData(dataIni)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker({ show: true, type: 'fim' })}>
            <Text style={styles.dateButtonText}>
              Data Final: {formatarData(dataFim)}
            </Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por cliente ou título..."
          placeholderTextColor="#1f6d7a"
          value={searchText}
          onChangeText={setSearchText}
        />

        <TouchableOpacity
          style={styles.buscarButton}
          onPress={buscarCobrancas}
          disabled={loading}>
          <Text style={styles.buscarButtonText}>
            {loading ? 'Buscando...' : 'Buscar'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista */}
      <FlatList
        data={cobrancas}
        renderItem={renderCobranca}
        keyExtractor={(item, index) => {
          return (
            item.id?.toString() ||
            item.numero_titulo?.toString() ||
            index.toString()
          )
        }}
        refreshing={loading}
        onRefresh={buscarCobrancas}
        ListEmptyComponent={
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={styles.emptyText}>Nenhuma cobrança encontrada</Text>
            <Text style={{ marginTop: 10, color: '#999', fontSize: 12 }}>
              Total de itens: {cobrancas.length}
            </Text>
          </View>
        }
      />

      {/* Modal de Detalhes */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedCobranca && (
              <ScrollView>
                <Text style={styles.modalTitle}>Detalhes da Cobrança</Text>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Cliente:</Text>
                  <Text style={styles.modalValue}>
                    {selectedCobranca.cliente_nome}
                  </Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Título:</Text>
                  <Text style={styles.modalValue}>
                    {selectedCobranca.numero_titulo}
                  </Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Vencimento:</Text>
                  <Text style={styles.modalValue}>
                    {formatarData(selectedCobranca.vencimento)}
                  </Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Valor:</Text>
                  <Text style={styles.modalValue}>
                    {formatarValor(selectedCobranca.valor)}
                  </Text>
                </View>

                {selectedCobranca.linha_digitavel && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>Linha Digitável:</Text>
                    <Text style={styles.modalValue}>
                      {selectedCobranca.linha_digitavel}
                    </Text>
                  </View>
                )}

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.whatsappButton]}
                    onPress={enviarCobrancaWhatsApp}
                    disabled={
                      loadingWhats || !selectedCobranca.cliente_celular
                    }>
                    <Text style={styles.actionButtonText}>
                      {loadingWhats ? 'Abrindo...' : 'Enviar WhatsApp'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.emailButton]}
                    onPress={() => {
                      if (selectedCobranca?.cliente_email) {
                        enviarEmail(selectedCobranca.cliente_email, {
                          assunto: `Cobrança - Título ${selectedCobranca.numero_titulo}`,
                          corpo: `
Caro(a) ${selectedCobranca.cliente_nome},

Segue em anexo o boleto para pagamento:

Título: ${selectedCobranca.numero_titulo}
Parcela: ${selectedCobranca.parcela}
Vencimento: ${formatarData(selectedCobranca.vencimento)}
Valor: ${formatarValor(selectedCobranca.valor)}

${
  selectedCobranca.linha_digitavel
    ? `Linha Digitável: ${selectedCobranca.linha_digitavel}`
    : ''
}
${
  selectedCobranca.url_boleto
    ? `Link do Boleto: ${selectedCobranca.url_boleto}`
    : ''
}

Atenciosamente,
Equipe Financeira
      `,
                          anexos: selectedCobranca.url_boleto
                            ? [selectedCobranca.url_boleto]
                            : [],
                        })
                          .then(() => {
                            Alert.alert('Sucesso', 'Email enviado com sucesso!')
                            setModalVisible(false)
                          })
                          .catch((err) => {
                            Alert.alert('Erro', 'Falha ao enviar email')
                            console.error(err)
                          })
                      } else {
                        Alert.alert('Erro', 'Cliente sem email cadastrado')
                      }
                    }}
                    disabled={loadingEmail}>
                    <Text style={styles.actionButtonText}>
                      {loadingEmail ? 'Enviando...' : 'Enviar Email'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={() => setModalVisible(false)}>
                    <Text style={styles.actionButtonText}>Fechar</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
      {selecionadas.length > 0 && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginVertical: 10,
          }}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.whatsappButton,
              { flex: 1, marginRight: 5 },
            ]}
            onPress={enviarMultiplosWhatsapps}>
            <Text style={styles.actionButtonText}>
              WhatsApp ({selecionadas.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.emailButton,
              { flex: 1, marginLeft: 5 },
            ]}
            onPress={enviarMultiplosEmails}>
            <Text style={styles.actionButtonText}>
              E-mail ({selecionadas.length})
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* DatePicker */}
      {showDatePicker.show && (
        <DateTimePicker
          value={showDatePicker.type === 'ini' ? dataIni : dataFim}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c1c2c',
    padding: 16,
  },
  filtrosContainer: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#1f6d7a',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateButton: {
    flex: 0.48,
    padding: 12,
    backgroundColor: '#000',
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1f6d7a',
  },
  dateButtonText: {
    color: '#1f6d7a',
    fontWeight: 'bold',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#1f6d7a',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    color: '#1f6d7a',
    backgroundColor: '#000',
  },
  buscarButton: {
    backgroundColor: '#243242',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1f6d7a',
  },
  buscarButtonText: {
    color: '#1f6d7a',
    fontWeight: 'bold',
  },
  itemContainer: {
    backgroundColor: '#243242',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
    color: '#1f6d7a',
    borderColor: '#1f6d7a',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    color: '#1f6d7a',
    borderColor: '#1f6d7a',
  },
  clienteNome: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    color: '#f0f8ff',
  },
  valor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  itemDetails: {
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  formaRecebimento: {
    fontSize: 12,
    color: '#999',
  },
  status: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  vencido: {
    backgroundColor: '#ffebee',
    color: '#f44336',
  },
  aVencer: {
    backgroundColor: '#e8f5e8',
    color: '#4caf50',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 8,
    padding: 20,
    maxHeight: '80%',
    width: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalSection: {
    marginBottom: 12,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  modalValue: {
    fontSize: 14,
    color: '#666',
  },
  modalActions: {
    marginTop: 20,
  },
  actionButton: {
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 8,
  },
  whatsappButton: {
    backgroundColor: '#25d366',
    marginBottom: 150,
  },
  emailButton: {
    backgroundColor: '#2196f3',
    marginBottom: 150,
  },
  cancelButton: {
    backgroundColor: '#757575',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
})
