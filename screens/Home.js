import React, { useEffect, useState, useRef } from 'react'
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
  Animated,
  Easing,
} from 'react-native'
import { Audio } from 'expo-av'
import { getStoredData } from '../services/storageService'
import { fetchDashboardData } from '../services/apiService'
import SaldosChart from '../components/SaldosChart'
import PedidosChart from '../components/PedidosChart'
import { apiPostComContexto } from '../utils/api'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

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
    color: (opacity = 1) => `rgba(137, 35, 155, 0.35)`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    propsForBackgroundLines: { strokeDasharray: '' },
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
          console.warn('⚠️ Empresa ou Filial não encontrados.')
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

  // Envio de mensagem
  const enviarMsg = async (texto) => {
    if (!texto) return
    setHistorico((prev) => [...prev, { tipo: 'user', texto }])
    setPensando(true)
    try {
      const resp = await apiPostComContexto('assistente/chat/', {
        mensagem: texto,
      })
      const textoSpart =
        typeof resp?.resposta === 'string' && resp.resposta.trim()
          ? resp.resposta
          : resp?.erro || '⚠️ Sem retorno visível do agente.'
      setHistorico((prev) => [...prev, { tipo: 'spart', texto: textoSpart }])
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

  // Gravação
  const iniciarGravacao = async () => {
    try {
      if (gravando || gravacao) return
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

  const pararGravacao = async () => {
    try {
      if (!gravacao) return
      await gravacao.stopAndUnloadAsync()
      setGravando(false)
      setGravacao(null)
      const resp = await apiPostComContexto('assistente/chat/', {
        mensagem: mensagem || '',
      })
      const textoSpart2 =
        typeof resp?.resposta === 'string' && resp.resposta.trim()
          ? resp.resposta
          : resp?.erro || '⚠️ Sem retorno visível do agente.'
      setHistorico((prev) => [...prev, { tipo: 'spart', texto: textoSpart2 }])
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
                { text: 'Sim', onPress: async () => await iniciarGravacao() },
              ]
            )
          }
        }}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
      </TouchableOpacity>

      {/* Modal Kronos */}
      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <PulsingLogo active={pensando} />
              <Text style={styles.modalTitle}>
                Kronos — IA Estratégica Spartacus
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButtonText}>✖</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.chatBox}>
              {historico.map((msg, idx) => (
                <FadeMessage key={idx} tipo={msg.tipo} texto={msg.texto} />
              ))}
              {pensando && <ThinkingDots />}
            </ScrollView>

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
                placeholder="Diga algo para o Kronos..."
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
                <MaterialCommunityIcons name="send" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}

/* Brilho pulsante no logo */
const PulsingLogo = ({ active }) => {
  const pulse = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (active) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1.25,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      )
      loop.start()
      return () => loop.stop()
    }
  }, [active])

  return (
    <Animated.View style={{ transform: [{ scale: pulse }] }}>
      <Image source={require('../assets/logo.png')} style={styles.logomodal} />
    </Animated.View>
  )
}

/* Mensagens com fade-in */
const FadeMessage = ({ tipo, texto }) => {
  const fade = useRef(new Animated.Value(0)).current
  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 400,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start()
  }, [])
  return (
    <Animated.View
      style={{
        opacity: fade,
        flexDirection: tipo === 'user' ? 'row-reverse' : 'row',
        alignItems: 'flex-end',
        marginVertical: 6,
      }}>
      {tipo === 'user' ? (
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: '#00bfff33',
            justifyContent: 'center',
            alignItems: 'center',
            marginHorizontal: 6,
          }}>
          <MaterialCommunityIcons name="account" size={22} color="#00bfff" />
        </View>
      ) : (
        <Image
          source={require('../assets/logo.png')}
          style={{
            width: 34,
            height: 34,
            borderRadius: 17,
            marginHorizontal: 6,
          }}
        />
      )}
      <Text style={tipo === 'user' ? styles.userMsg : styles.spartMsg}>
        {texto}
      </Text>
    </Animated.View>
  )
}

/* Animação dos 3 pontinhos */
const ThinkingDots = () => {
  const anims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ]
  useEffect(() => {
    const loops = anims.map((a, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 200),
          Animated.timing(a, {
            toValue: 1,
            duration: 400,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(a, {
            toValue: 0,
            duration: 400,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ])
      )
    )
    loops.forEach((l) => l.start())
    return () => loops.forEach((l) => l.stop())
  }, [])
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 6,
        marginLeft: 8,
      }}>
      {anims.map((a, i) => (
        <Animated.View
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: '#00bfff',
            opacity: a.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 1],
            }),
            marginHorizontal: 3,
            transform: [
              {
                scale: a.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.6],
                }),
              },
            ],
          }}
        />
      ))}
      <Text style={{ color: '#aaa', marginLeft: 10 }}>pensando...</Text>
    </View>
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
  logoButton: { position: 'absolute', top: 15, left: 20 },
  logo: { width: 40, height: 50, resizeMode: 'contain' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#121212',
    width: '90%',
    height: '80%',
    borderRadius: 16,
    padding: 70,
    borderColor: '#00bfff',
    borderWidth: 1,
  },
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
  extraButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  clearButton: { backgroundColor: '#444', padding: 8, borderRadius: 6 },
  clearButtonText: { color: '#fff', fontSize: 12 },
})
