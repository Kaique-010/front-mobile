import React, { useState, useEffect } from 'react'
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
import SignatureField from '../componentsOrdemServico/SignatureField'
import { gerarPdfServidor as gerarPdfServidorComp } from '../componentsOrdemServico/OsPdfView'
import {
  apiGetComContexto,
  apiPatchComContexto,
  BASE_URL,
  getAuthHeaders,
} from '../utils/api'
import * as Print from 'expo-print'
import * as Sharing from 'expo-sharing'
import { Linking, Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEnviarEmail } from '../hooks/useEnviarEmail'
import { useEnviarWhats } from '../hooks/useEnviarWhats'

// Remove o prefixo e retorna só o base64
function sanitizeSignature(base64) {
  if (!base64) return ''
  return base64.replace(/^data:image\/[a-zA-Z]+;base64,/, '')
}

// Coloca prefixo antes de enviar
function addPrefix(base64) {
  if (!base64) return null
  return `data:image/png;base64,${base64}`
}

const OsDetalhe = ({ route, navigation }) => {
  const { os } = route.params

  const [abaAtiva, setAbaAtiva] = useState('detalhes')
  const [pecas, setPecas] = useState([])
  const [servicos, setServicos] = useState([])
  const [horas, setHoras] = useState([])
  const [dadosModificados, setDadosModificados] = useState(false)
  const [financeiroGerado, setFinanceiroGerado] = useState(false)
  const [scrollLock, setScrollLock] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalType, setModalType] = useState(null)
  const [inputValue, setInputValue] = useState('')
  const { enviarEmail, loading: loadingEmail } = useEnviarEmail()
  const { enviarWhats, loading: loadingWhats } = useEnviarWhats()

  // AGORA: o state guarda APENAS O BASE64 LIMPO
  const [assinaturaClie, setAssinaturaClie] = useState(
    sanitizeSignature(os.os_assi_clie)
  )
  const [assinaturaOper, setAssinaturaOper] = useState(
    sanitizeSignature(os.os_assi_oper)
  )

  console.log('Assinatura Cliente (state):', assinaturaClie?.slice(0, 30))
  console.log('Assinatura Operador (state):', assinaturaOper?.slice(0, 30))

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
    } catch (error) {
      console.error('Erro ao carregar peças:', error)
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
    } catch (error) {
      console.error('Erro ao carregar serviços:', error)
    }
  }

  const salvarAssinaturas = async () => {
    try {
      const payload = {
        os_os: os.os_os,
        os_empr: os.os_empr,
        os_fili: os.os_fili,
        os_assi_clie: addPrefix(assinaturaClie),
        os_assi_oper: addPrefix(assinaturaOper),
      }

      console.log('Payload de PATCH (com prefixo):', {
        ...payload,
        os_assi_clie: payload.os_assi_clie?.slice(0, 30),
        os_assi_oper: payload.os_assi_oper?.slice(0, 30),
      })

      await apiPatchComContexto('Os/ordens/', payload)
      Alert.alert('Sucesso', 'Assinaturas salvas')
    } catch (e) {
      console.error('Erro ao salvar assinaturas:', e)
      Alert.alert('Erro', 'Falha ao salvar assinaturas')
    }
  }

  const gerarPdfServidor = async () => {
    try {
      await gerarPdfServidorComp(os)
    } catch (e) {
      Alert.alert('Erro', e?.message || 'Falha ao gerar PDF da OS')
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
    if (!inputValue.trim()) {
      Alert.alert(
        'Erro',
        modalType === 'email' ? 'Email é obrigatório' : 'Número é obrigatório'
      )
      return
    }
    const slug = await AsyncStorage.getItem('slug')
    const urlPdf = `${BASE_URL}/api/${slug}/Os/ordens/${os.os_os}/imprimir/`
    const dadosEnviar = {
      os_id: os.os_os,
      cliente: os.cliente_nome,
      total: os.os_tota,
      url_pdf: urlPdf,
    }
    let sucesso = false
    if (modalType === 'email') {
      sucesso = await enviarEmail(inputValue.trim(), dadosEnviar)
    } else if (modalType === 'whats') {
      sucesso = await enviarWhats(inputValue.trim(), dadosEnviar)
    }
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
            R$ {Number(os.os_tota || 0).toFixed(2)}
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
          <Text style={styles.label}>Ordem de Origem:</Text>
          <Text style={styles.value}>{os.os_orig || '-'}</Text>
        </View>
        <View style={styles.descriptionRow}>
          <Text style={styles.label}>Local da Prestação do serviço:</Text>
          <Text style={styles.value}>{os.os_loca_apli || '-'}</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>Assinaturas</Text>

        <SignatureField
          label="Assinatura do Cliente"
          value={assinaturaClie} // agora 100% correto
          onChange={(b64) => {
            console.log('Cliente (b64 puro):', b64?.slice(0, 30))
            setAssinaturaClie(sanitizeSignature(b64))
          }}
          onSigningChange={setScrollLock}
        />

        <SignatureField
          label="Assinatura do Operador"
          value={assinaturaOper}
          onChange={(b64) => {
            console.log('Operador (b64 puro):', b64?.slice(0, 30))
            setAssinaturaOper(sanitizeSignature(b64))
          }}
          onSigningChange={setScrollLock}
        />

        <TouchableOpacity style={styles.saveAssin} onPress={salvarAssinaturas}>
          <Text style={styles.saveAssinText}>Salvar Assinaturas</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.button} onPress={gerarPdfServidor}>
          <Text style={styles.buttonText}>Gerar PDF (servidor)</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => abrirModal('whats')}
          disabled={loadingWhats}>
          <Text style={styles.actionText}>Enviar WhatsApp</Text>
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
            <TextInput
              style={styles.inputModal}
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>OS #{os.os_os}</Text>
        <Text style={styles.subtitle}>Cliente: {os.cliente_nome}</Text>
      </View>

      <View style={styles.tabs}>
        {['detalhes', 'pecas', 'servicos', 'horas'].map((aba) => (
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
                horas={horas}
                setHoras={setHoras}
                os_os={os.os_os}
                os_clie={os.os_enti}
                os_empr={os.os_empr}
                os_fili={os.os_fili}
                financeiroGerado={financeiroGerado}
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
  saveAssin: {
    backgroundColor: '#10a2a7',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveAssinText: { color: '#fff', fontWeight: 'bold' },
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
