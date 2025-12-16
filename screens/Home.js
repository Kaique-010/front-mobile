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
import { Linking } from 'react-native'
import { Audio } from 'expo-av'
import { getStoredData } from '../services/storageService'
import { fetchDashboardData } from '../services/apiService'
import SaldosChart from '../components/SaldosChart'
import PedidosChart from '../components/PedidosChart'
import { apiPostComContexto } from '../utils/api'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { useNotificacoes } from '../notificacoes/NotificacaoContext'

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
  const notificacoes = useNotificacoes()

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
    if (notificacoes.error) {
      Alert.alert('Erro', notificacoes.error)
    }
  }, [notificacoes.error])

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
      <Text
        style={{
          color: '#aaa',
          marginLeft: 10,
          width: '100%',
          textAlign: 'center',
          marginBottom: 10,
          textTransform: 'uppercase',
          fontSize: 6,
        }}>
        Versão 1.0.12
      </Text>

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
        <Image
          source={require('../assets/logo.png')}
          style={{ width: 40, height: 50 }}
          resizeMode="contain"
        />
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
                Kronos — Agente I.A Spartacus
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
                <Text style={styles.clearButtonText}>🗑 Limpar</Text>
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
      <Image
        source={require('../assets/logo.png')}
        style={{ width: 30, height: 30, marginBottom: 15, marginRight: 10 }}
        resizeMode="contain"
      />
    </Animated.View>
  )
}

/* Mensagens com fade-in */
const FormattedMessage = ({ texto }) => {
  const lines = String(texto || '').split(/\r?\n/)

  const sanitizeUrl = (u) => String(u || '').replace(/^sandbox:\//, '')

  const renderBold = (str) => {
    const spans = []
    const re = /\*\*([^*]+)\*\*/g
    let last = 0
    let m
    while ((m = re.exec(str)) !== null) {
      const prev = str.slice(last, m.index)
      if (prev)
        spans.push(
          <Text key={`b-prev-${last}`} style={styles.paragraph}>
            {prev}
          </Text>
        )
      spans.push(
        <Text
          key={`b-bold-${m.index}`}
          style={{ fontWeight: 'bold', color: '#fff' }}>
          {m[1]}
        </Text>
      )
      last = re.lastIndex
    }
    const rest = str.slice(last)
    if (rest)
      spans.push(
        <Text key={`b-rest-${last}`} style={styles.paragraph}>
          {rest}
        </Text>
      )
    return spans.length
      ? spans
      : [
          <Text key={`b-only-${Math.random()}`} style={styles.paragraph}>
            {str}
          </Text>,
        ]
  }

  const renderSegments = (str) => {
    const parts = []
    const re = /\[([^\]]+)\]\(([^)]+)\)/g
    let last = 0
    let m
    while ((m = re.exec(str)) !== null) {
      const prev = str.slice(last, m.index)
      if (prev) parts.push(...renderBold(prev))
      const url = sanitizeUrl(m[2])
      parts.push(
        <Text
          key={`lnk-${m.index}`}
          style={{ color: '#00bfff', textDecorationLine: 'underline' }}
          onPress={() => {
            try {
              Linking.openURL(url)
            } catch (e) {}
          }}>
          {m[1]}
        </Text>
      )
      last = re.lastIndex
    }
    const rest = str.slice(last)
    if (rest) parts.push(...renderBold(rest))
    return parts.length
      ? parts
      : [
          <Text key={`seg-only-${Math.random()}`} style={styles.paragraph}>
            {str}
          </Text>,
        ]
  }

  const rows = []
  let inList = false
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const h1 = line.match(/^#\s+(.+)/)
    const h2 = line.match(/^##\s+(.+)/)
    const h3 = line.match(/^###\s+(.+)/)
    const li = line.match(/^\s*[-•]\s+(.+)/)

    if (h1) {
      rows.push(
        <Text key={`h1-${i}`} style={styles.h3}>
          {h1[1]}
        </Text>
      )
      inList = false
      continue
    }
    if (h2) {
      rows.push(
        <Text key={`h2-${i}`} style={styles.h4}>
          {h2[1]}
        </Text>
      )
      inList = false
      continue
    }
    if (h3) {
      rows.push(
        <Text key={`h3-${i}`} style={styles.h5}>
          {h3[1]}
        </Text>
      )
      inList = false
      continue
    }
    if (li) {
      rows.push(
        <View key={`li-${i}`} style={styles.listItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.listText}>{renderSegments(li[1])}</Text>
        </View>
      )
      inList = true
      continue
    }
    if (line.trim()) {
      rows.push(
        <Text key={`p-${i}`} style={styles.paragraph}>
          {renderSegments(line)}
        </Text>
      )
      inList = false
    }
  }
  return <View>{rows}</View>
}

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
      {tipo === 'user' ? (
        <Text style={styles.userMsg}>{texto}</Text>
      ) : (
        <View style={styles.spartMsg}>
          <FormattedMessage texto={texto} />
        </View>
      )}
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#121212',
    width: '87%',
    height: '60%',
    borderRadius: 16,
    padding: 30,
    borderColor: '#00bfff',
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00bfff',
    marginBottom: 1,
  },
  closeButtonText: {
    fontSize: 25,
    color: '#ff5555',
    marginLeft: 7,
    marginBottom: 35,
  },
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
    padding: 8,
    borderRadius: 8,
    marginVertical: 4,
    maxWidth: '70%',
  },
  paragraph: { color: '#fff', lineHeight: 18 },
  h3: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 6 },
  h4: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 6 },
  h5: { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 6 },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 2,
  },
  bullet: { color: '#00bfff', marginRight: 6 },
  listText: { color: '#fff', flex: 1, flexWrap: 'wrap' },
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
