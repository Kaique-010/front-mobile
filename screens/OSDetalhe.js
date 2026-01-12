import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native'
import AbaPecas from '../componentsOrdemServico/AbaPecas'
import AbaServicos from '../componentsOrdemServico/AbaServicos'
import AbaTotais from '../componentsOrdemServico/AbaTotais'
import AbaHoras from '../componentsOrdemServico/AbaHoras'
import { useFocusEffect } from '@react-navigation/native'
import { gerarPdfServidor as gerarPdfServidorComp } from '../componentsOrdemServico/OsPdfView'
import {
  apiGetComContexto,
  apiPatchComContexto,
  BASE_URL,
  getAuthHeaders,
} from '../utils/api'
import { handleApiError } from '../utils/errorHandler'
import * as Print from 'expo-print'
import * as Sharing from 'expo-sharing'
import { Linking, Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEnviarEmailOs } from '../hooks/useEnviarEmailOs'
import { useEnviarWhatsOs } from '../hooks/useEnviarWhatsOs'
import Toast from 'react-native-toast-message'

const OsDetalhe = ({ route, navigation }) => {
  const { os } = route.params

  const [abaAtiva, setAbaAtiva] = useState('detalhes')
  const [pecas, setPecas] = useState([])
  const [servicos, setServicos] = useState([])
  const [horas, setHoras] = useState([])
  const [osDetalhe, setOsDetalhe] = useState(os)
  const [dadosModificados, setDadosModificados] = useState(false)
  const [financeiroGerado, setFinanceiroGerado] = useState(false)
  const [scrollLock, setScrollLock] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalType, setModalType] = useState(null)
  const [inputValue, setInputValue] = useState('')
  const { enviarEmailOs, loading: loadingEmail } = useEnviarEmailOs()
  const { enviarWhatsOs, loading: loadingWhats } = useEnviarWhatsOs()

  const carregarDetalhes = async () => {
    try {
      const response = await apiGetComContexto('Os/ordens/', {
        os_os: os.os_os,
        os_empr: os.os_empr,
        os_fili: os.os_fili,
      })
      setOsDetalhe(response?.results?.[0] || os)
      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Detalhes carregados',
      })
    } catch (error) {
      console.error('Erro ao carregar detalhes da OS:', error)
      handleApiError(error)
    }
  }

  useEffect(() => {
    if (abaAtiva === 'detalhes') {
      carregarDetalhes()
    }
  }, [abaAtiva])

  useEffect(() => {
    carregarPecas()
    carregarServicos()
  }, [])

  useEffect(() => {
    if (abaAtiva === 'totais') {
      carregarPecas()
      carregarServicos()
    }
  }, [abaAtiva])

  const carregarPecas = async () => {
    try {
      const response = await apiGetComContexto('Os/pecas/', {
        peca_os: os.os_os,
        peca_empr: os.os_empr,
        peca_fili: os.os_fili,
      })
      setPecas(response?.results || [])
      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Peças carregadas',
      })
    } catch (error) {
      console.error('Erro ao carregar peças:', error)
      handleApiError(error)
    }
  }

  const carregarServicos = async () => {
    try {
      const response = await apiGetComContexto('Os/servicos/', {
        serv_os: os.os_os,
        serv_empr: os.os_empr,
        serv_fili: os.os_fili,
      })
      setServicos(response?.results || [])
      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Serviços carregados',
      })
    } catch (error) {
      console.error('Erro ao carregar serviços:', error)
    }
  }

  const gerarPdfServidor = async () => {
    try {
      await gerarPdfServidorComp(os)
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: e?.message || 'Falha ao gerar PDF da OS',
      })
      handleApiError(e)
    }
  }

  const abrirModal = (tipo) => {
    setModalType(tipo)
    setInputValue('')
    setModalVisible(true)
  }

  const fecharModal = () => {
    setModalVisible(false)
    setModalType(null)
    setInputValue('')
  }

  const handleEnviar = async () => {
    // Se for email, precisa do input
    if (modalType === 'email' && !inputValue.trim()) {
      Alert.alert('Erro', 'Email é obrigatório')
      return
    }

    // Se for whats, confirmamos o envio direto para o cliente da OS
    if (modalType === 'whats') {
      const numeroExibicao =
        os.cliente_celular || os.cliente_telefone || 'Número não encontrado'

      Alert.alert(
        'Confirmar Envio',
        `Deseja enviar o WhatsApp para ${os.cliente_nome}?\nNúmero: ${numeroExibicao}`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Enviar',
            onPress: async () => {
              await processarEnvioWhats()
            },
          },
        ]
      )
      return
    }

    await processarEnvioEmail()
  }

  const processarEnvioWhats = async () => {
    const slug = await AsyncStorage.getItem('slug')
    const urlPdf = `${BASE_URL}/api/${slug}/Os/ordens/${os.os_os}/imprimir/`
    const dadosEnviar = {
      os_id: os.os_os,
      os_clie: os.os_clie, // ID DO CLIENTE DIRETO DA OS
      cliente: os.cliente_nome,
      total: os.os_tota,
      url_pdf: urlPdf,
    }

    // Passamos o ID do cliente, não um número digitado
    const sucesso = await enviarWhatsOs(os.os_clie, dadosEnviar)
    if (sucesso) fecharModal()
  }

  const processarEnvioEmail = async () => {
    const slug = await AsyncStorage.getItem('slug')
    const urlPdf = `${BASE_URL}/api/${slug}/Os/ordens/${os.os_os}/imprimir/`
    const dadosEnviar = {
      os_id: os.os_os,
      os_clie: os.os_clie,
      cliente: os.cliente_nome,
      total: os.os_tota,
      url_pdf: urlPdf,
    }
    const sucesso = await enviarEmailOs(inputValue.trim(), dadosEnviar)
    if (sucesso) fecharModal()
  }

  useEffect(() => {
    const beforeRemove = (e) => {
      if (dadosModificados) {
        e.preventDefault()
        Alert.alert(
          'Alterações não salvas',
          'Você tem alterações não salvas. Deseja sair mesmo assim?',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Sair',
              style: 'destructive',
              onPress: () => navigation.dispatch(e.data.action),
            },
          ]
        )
      }
    }

    navigation.addListener('beforeRemove', beforeRemove)
    return () => navigation.removeListener('beforeRemove', beforeRemove)
  }, [navigation, dadosModificados])

  const renderDetalhes = () => (
    <ScrollView style={styles.detalhesContainer} scrollEnabled={!scrollLock}>
      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>Informações Gerais</Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Status:</Text>
          <Text style={styles.value}>{os.os_stat_os || '-'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.label, { flex: 1 }]}>Total:</Text>
          <Text style={[styles.value, styles.totalValue]}>
            R$ {Number(osDetalhe.os_tota || 0).toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>Datas</Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Abertura:</Text>
          <Text style={styles.value}>{os.os_data_aber || '-'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Fechamento:</Text>
          <Text style={styles.value}>{os.os_data_fech || '-'}</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>Descrições</Text>

        <View style={styles.descriptionRow}>
          <Text style={styles.label}>Observações:</Text>
          <Text style={styles.value}>{os.os_obje_os || '-'}</Text>
        </View>
        <View style={styles.descriptionRow}>
          <Text style={styles.label}>Local da Prestação do serviço:</Text>
          <Text style={styles.value}>{os.os_loca_apli || '-'}</Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.button} onPress={gerarPdfServidor}>
          <Text style={styles.buttonText}>Gerar PDF (Whatsapp)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => abrirModal('email')}
          disabled={loadingEmail}>
          <Text style={styles.actionText}>Enviar E-mail</Text>
        </TouchableOpacity>
      </View>
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

            {modalType === 'email' ? (
              <TextInput
                style={styles.inputModal}
                placeholder="Digite o email"
                keyboardType="email-address"
                value={inputValue}
                onChangeText={setInputValue}
                autoCapitalize="none"
                autoCorrect={false}
              />
            ) : (
              <View style={{ marginBottom: 20 }}>
                <Text style={{ color: '#fff', textAlign: 'center' }}>
                  O envio será feito para o número cadastrado do cliente:
                </Text>
                <Text
                  style={{
                    color: '#10a2a7',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    fontSize: 16,
                    marginTop: 5,
                  }}>
                  {os.cliente_nome}
                </Text>
                <Text
                  style={{
                    color: '#faebd7',
                    textAlign: 'center',
                    fontSize: 14,
                    marginTop: 5,
                  }}>
                  {os.cliente_celular ||
                    os.cliente_telefone ||
                    'Sem número cadastrado'}
                </Text>
              </View>
            )}

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>OS #{os.os_os}</Text>
        <Text style={styles.subtitle}>Cliente: {os.cliente_nome}</Text>
      </View>

      <View style={styles.tabs}>
        {['detalhes', 'horas'].map((aba) => (
          <TouchableOpacity
            key={aba}
            onPress={() => setAbaAtiva(aba)}
            style={[styles.tab, abaAtiva === aba && styles.tabActive]}>
            <Text
              style={[
                styles.tabText,
                abaAtiva === aba && styles.tabTextActive,
              ]}>
              {aba.charAt(0).toUpperCase() + aba.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        {abaAtiva === 'detalhes' ? (
          renderDetalhes()
        ) : (
          <View style={{ flex: 1 }}>
            {abaAtiva === 'pecas' && (
              <AbaPecas
                pecas={pecas}
                setPecas={setPecas}
                os_os={os.os_os}
                financeiroGerado={financeiroGerado}
              />
            )}
            {abaAtiva === 'servicos' && (
              <AbaServicos
                servicos={servicos}
                setServicos={setServicos}
                os_os={os.os_os}
                os_clie={os.os_enti}
                os_empr={os.os_empr}
                os_fili={os.os_fili}
                financeiroGerado={financeiroGerado}
              />
            )}
            {abaAtiva === 'totais' && (
              <AbaTotais
                pecas={pecas}
                servicos={servicos}
                os_os={os.os_os}
                os_clie={os.os_clie}
                os_empr={os.os_empr}
                os_fili={os.os_fili}
                onFinanceiroGerado={setFinanceiroGerado}
              />
            )}
            {abaAtiva === 'horas' && (
              <AbaHoras
                os_os={os.os_os}
                ordemServico={osDetalhe}
                setOrdemServico={setOsDetalhe}
                setScrollLock={setScrollLock}
              />
            )}
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a2f3d' },
  header: { padding: 20, backgroundColor: '#232935' },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10a2a7',
    marginBottom: 5,
  },
  subtitle: { fontSize: 20, color: '#faebd7', opacity: 0.8 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#232935',
    paddingHorizontal: 10,
  },
  tab: {
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  tabActive: { borderBottomColor: '#10a2a7' },
  tabText: { color: '#faebd7', opacity: 0.7, fontSize: 16 },
  tabTextActive: { color: '#10a2a7', opacity: 1, fontWeight: 'bold' },
  content: { flex: 1 },
  detalhesContainer: { padding: 15 },
  infoCard: {
    backgroundColor: '#232935',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  cardTitle: {
    color: '#10a2a7',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1a2f3d',
  },
  descriptionRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1a2f3d',
  },
  label: { color: '#faebd7', opacity: 0.7, flex: 1 },
  value: { color: '#fff', flex: 2, textAlign: 'right' },
  totalValue: {
    color: '#10a2a7',
    fontWeight: 'bold',
    fontSize: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginVertical: 25,
    marginHorizontal: 15,
    marginBottom: 50,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#10a2a7',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionText: { color: '#fff', fontWeight: 'bold' },
  button: {
    flex: 1,
    backgroundColor: '#10a2a7',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  modalFundo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#232935',
    borderRadius: 10,
    padding: 16,
  },
  modalTitulo: {
    color: '#10a2a7',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  inputModal: {
    backgroundColor: '#1a2f3d',
    borderColor: '#2c3e50',
    borderWidth: 1,
    color: '#fff',
    padding: 10,
    borderRadius: 8,
  },
  modalBotoes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalBotaoCancelar: {
    backgroundColor: '#666',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  modalBotaoEnviar: {
    backgroundColor: '#10a2a7',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  modalBotaoTexto: { color: '#fff', fontWeight: 'bold' },
})

export default OsDetalhe
