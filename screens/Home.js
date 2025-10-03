import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
  Alert,
} from 'react-native'
import { Audio } from 'expo-av'
import { getStoredData } from '../services/storageService'
import { fetchDashboardData } from '../services/apiService'
import SaldosChart from '../components/SaldosChart'
import PedidosChart from '../components/PedidosChart'
import { apiPostComContexto } from '../utils/api'

export default function Home() {
  const [user, setUsuario] = useState(null)
  const [empresaNome, setEmpresaNome] = useState(null)
  const [filialNome, setFilialNome] = useState(null)
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [historico, setHistorico] = useState([])
  const [mensagem, setMensagem] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [gravacao, setGravacao] = useState(null)
  const [pensando, setPensando] = useState(false)
  const [gravando, setGravando] = useState(false)

  // Config padrão para charts
  const chartConfig = {
    backgroundColor: '#121212',
    backgroundGradientFrom: '#121212',
    backgroundGradientTo: '#121212',
    decimalPlaces: 0,
    // Roxo claro translúcido para barras
    color: (opacity = 1) => `rgba(137, 35, 155, 0.35)`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    propsForBackgroundLines: {
      strokeDasharray: '',
    },
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const stored = await getStoredData()
        setUsuario(stored.usuario)
        setEmpresaNome(stored.empresaNome)
        setFilialNome(stored.filialNome)

        if (stored.usuario && stored.empresaNome && stored.filialNome) {
          const dashboard = await fetchDashboardData()
          setDashboardData(dashboard)
        } else {
          console.warn(
            '⚠️ Empresa ou Filial não encontrados. Dashboard não carregado.'
          )
          setDashboardData(null)
        }
      } catch (err) {
        console.error('❌ Erro ao carregar dados:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00bfff" />
      </View>
    )
  }

  // Envio de mensagem de texto
  const enviarMsg = async (texto) => {
    if (!texto) return

    setHistorico((prev) => [...prev, { tipo: 'user', texto }])
    setPensando(true)

    try {
      const resp = await apiPostComContexto('assistente/chat/', {
        mensagem: texto,
      })

      setHistorico((prev) => [...prev, { tipo: 'spart', texto: resp.resposta }])

      // se vier áudio, toca
      if (resp.resposta_audio) {
        const { sound } = await Audio.Sound.createAsync({
          uri: `data:audio/mp3;base64,${resp.resposta_audio}`,
        })
        await sound.playAsync()
      }
    } catch (err) {
      console.error('❌ Erro Spart:', err)
    } finally {
      setPensando(false)
    }
  }

  // Inicia gravação
  const iniciarGravacao = async () => {
    try {
      if (gravando || gravacao) {
        return
      }
      const { status } = await Audio.requestPermissionsAsync()
      if (status !== 'granted') {
        alert('Permissão de microfone negada!')
        return
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      })

      const recording = new Audio.Recording()
      await recording.prepareToRecordAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      )
      setGravando(true)
      await recording.startAsync()
      setGravacao(recording)
    } catch (err) {
      console.error('Erro ao iniciar gravação:', err)
      setGravando(false)
    }
  }

  // Para gravação e envia pro backend
  const pararGravacao = async () => {
    try {
      if (!gravacao) return
      await gravacao.stopAndUnloadAsync()
      const uri = gravacao.getURI()

      setGravando(false)
      setGravacao(null)

      const formData = new FormData()
      formData.append('audio', {
        uri,
        type: 'audio/wav',
        name: 'fala.wav',
      })

      // Fallback: envia mensagem de texto enquanto endpoint de áudio não está definido
      const resp = await apiPostComContexto('assistente/chat/', {
        mensagem: mensagem || '',
      })

      setHistorico((prev) => [...prev, { tipo: 'spart', texto: resp.resposta }])

      if (resp.resposta_audio) {
        const { sound } = await Audio.Sound.createAsync({
          uri: `data:audio/mp3;base64,${resp.resposta_audio}`,
        })
        await sound.playAsync()
      }
    } catch (err) {
      console.error('Erro ao parar gravação:', err)
      setGravando(false)
      setGravacao(null)
    }
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#121212' }}
      contentContainerStyle={styles.container}>
      <Text style={styles.welcome}>
        ✔️ Bem-vindo, {user?.username || 'Usuário'}!
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Empresa:</Text>
        <Text style={styles.value}>{empresaNome || 'Não selecionada'}</Text>
        <Text style={styles.label}>Filial:</Text>
        <Text style={styles.value}>{filialNome || 'Não selecionada'}</Text>
      </View>

      {dashboardData ? (
        <>
          <Text style={styles.chartTitle}>Saldos de Produtos</Text>
          <SaldosChart
            data={dashboardData.saldos_produto || []}
            chartConfig={chartConfig}
          />

          <Text style={styles.chartTitle}>Pedidos por Cliente</Text>
          <PedidosChart
            data={dashboardData.pedidos_por_cliente || []}
            chartConfig={chartConfig}
          />
        </>
      ) : (
        <Text style={styles.noDataText}>
          📊 Sem dados de dashboard disponíveis.
        </Text>
      )}

      {/* Botão para falar com Spart */}
      <TouchableOpacity
        style={styles.logoButton}
        onPress={() => setModalVisible(true)}
        onLongPress={async () => {
          if (gravacao) {
            await pararGravacao()
            setGravacao(null)
          } else {
            Alert.alert(
              'Falar com o assistente',
              'Deseja iniciar a gravação?',
              [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Sim',
                  onPress: async () => {
                    await iniciarGravacao()
                  },
                },
              ]
            )
          }
        }}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
      </TouchableOpacity>

      {/* Modal do Chat Spart */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Image
              source={require('../assets/logo.png')}
              style={styles.logomodal}
            />
            <Text style={styles.modalTitle}>Spart Assistente</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>✖</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.chatBox}>
            {historico.map((msg, idx) => (
              <Text
                key={idx}
                style={msg.tipo === 'user' ? styles.userMsg : styles.spartMsg}>
                {msg.texto}
              </Text>
            ))}
            {pensando && (
              <Text style={styles.thinkingMsg}>Spart está pensando...</Text>
            )}
          </ScrollView>

          {/* Botões extras */}
          <View style={styles.extraButtons}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setHistorico([])}>
              <Text style={styles.clearButtonText}>🗑 Limpar conversa</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Digite sua mensagem..."
              placeholderTextColor="#888"
              value={mensagem}
              onChangeText={setMensagem}
            />
            <TouchableOpacity
              style={[styles.sendButton, pensando && { opacity: 0.6 }]}
              disabled={pensando}
              onPress={() => {
                enviarMsg(mensagem)
                setMensagem('')
              }}>
              <Text style={styles.sendButtonText}>➤</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: 20 },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcome: { fontSize: 16, color: '#fff', fontWeight: '600', marginBottom: 20 },
  card: {
    backgroundColor: '#1e1e1e',
    padding: 10,
    borderRadius: 12,
    width: '100%',
    marginBottom: 15,
    alignItems: 'center',
  },
  label: { fontSize: 12, color: '#aaa', marginBottom: 4 },
  value: {
    fontSize: 13,
    color: '#00bfff',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  chartTitle: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  noDataText: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 20,
    textAlign: 'center',
  },
  logoButton: { position: 'absolute', top: 15, left: 20, marginBottom: 10 },
  logo: { width: 40, height: 50, resizeMode: 'contain' },
  modalContainer: { flex: 1, backgroundColor: '#121212', padding: 20 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logomodal: { width: 40, height: 40, resizeMode: 'contain' },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00bfff',
    marginBottom: 10,
  },
  closeButtonText: { fontSize: 18, color: '#ff5555' },
  chatBox: { flex: 1, marginBottom: 15 },
  userMsg: {
    alignSelf: 'flex-end',
    backgroundColor: '#00bfff',
    color: '#fff',
    padding: 8,
    borderRadius: 8,
    marginVertical: 4,
    maxWidth: '70%',
  },
  spartMsg: {
    alignSelf: 'flex-start',
    backgroundColor: '#333',
    color: '#fff',
    padding: 8,
    borderRadius: 8,
    marginVertical: 4,
    maxWidth: '70%',
  },
  thinkingMsg: {
    alignSelf: 'flex-start',
    backgroundColor: '#333',
    color: '#aaa',
    fontStyle: 'italic',
    padding: 8,
    borderRadius: 8,
    marginVertical: 4,
    maxWidth: '70%',
  },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  input: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    color: '#fff',
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
  },
  sendButton: { backgroundColor: '#00bfff', borderRadius: 8, padding: 10 },
  sendButtonText: { color: '#fff', fontWeight: 'bold' },
  extraButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  clearButton: { backgroundColor: '#444', padding: 8, borderRadius: 6 },
  clearButtonText: { color: '#fff', fontSize: 12 },
})
