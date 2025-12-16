import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native'
import {
  consultarDados,
  consultarDadosStreaming,
  consultarGrafico,
  obterHistorico,
  limparCache,
  limparHistorico,
} from '../componentsMCP/consultarDados'

const { width } = Dimensions.get('window')

const ConsultaScreen = () => {
  const [pergunta, setPergunta] = useState('')
  const [mensagens, setMensagens] = useState([
    {
      id: 1,
      texto:
        'Olá! Sou seu agente especializado em banco de dados.\n\n• Consultas otimizadas ao banco\n• Insights de dados\n• Relatórios personalizados\n• 🎬 Modo streaming: Veja meu processo de raciocínio!',
      isUser: false,
      timestamp: new Date(),
      isStreaming: false,
    },
  ])
  const [loading, setLoading] = useState(false)
  const [streamingProgress, setStreamingProgress] = useState(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const scrollViewRef = useRef(null)
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Animação de fade in para novas mensagens
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }, [mensagens])

  const adicionarMensagem = (texto, isUser = false, isStreaming = false) => {
    const novaMensagem = {
      id: Date.now(),
      texto,
      isUser,
      timestamp: new Date(),
      isStreaming,
    }

    setMensagens((prev) => [...prev, novaMensagem])

    // Scroll automático para a última mensagem
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true })
    }, 100)

    return novaMensagem.id
  }

  const atualizarMensagem = (id, novoTexto) => {
    setMensagens((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, texto: novoTexto } : msg))
    )
  }

  const handleConsulta = async (useStreaming = false) => {
    if (!pergunta.trim()) return

    const perguntaAtual = pergunta
    setPergunta('')
    adicionarMensagem(perguntaAtual, true)
    setLoading(true)

    try {
      if (useStreaming) {
        await handleStreamingConsulta(perguntaAtual)
      } else {
        await handleRegularConsulta(perguntaAtual)
      }
    } catch (error) {
      console.error('❌ Erro no handleConsulta:', error)
      adicionarMensagem(`❌ Erro: ${error.message}`, false)
    } finally {
      setLoading(false)
      setIsStreaming(false)
      setStreamingProgress(null)
    }
  }

  const handleRegularConsulta = async (perguntaAtual) => {
    try {
      const response = await consultarDados(perguntaAtual)

      let resultado
      if (response && typeof response === 'object') {
        resultado =
          response.resposta ||
          response.resultado ||
          response.data ||
          JSON.stringify(response)
      } else {
        resultado = response || 'Resposta vazia'
      }

      adicionarMensagem(resultado, false)
    } catch (error) {
      throw error
    }
  }

  const handleStreamingConsulta = async (perguntaAtual) => {
    setIsStreaming(true)
    const mensagemId = adicionarMensagem(
      '🎬 Iniciando consulta streaming...',
      false,
      true
    )

    try {
      const resultado = await consultarDadosStreaming(
        perguntaAtual,
        null,
        (progressData) => {
          // Callback de progresso
          setStreamingProgress(progressData)

          if (progressData.etapa) {
            atualizarMensagem(mensagemId, `🎬 ${progressData.etapa}`)
          }

          if (progressData.progresso) {
            atualizarMensagem(
              mensagemId,
              `🎬 Processando... ${Math.round(progressData.progresso)}%`
            )
          }
        }
      )

      // Atualizar com resultado final
      atualizarMensagem(mensagemId, `✅ ${resultado}`)
    } catch (error) {
      atualizarMensagem(mensagemId, `❌ Erro no streaming: ${error.message}`)
    }
  }

  const handleGrafico = async () => {
    if (!pergunta.trim()) return

    const perguntaAtual = pergunta
    setPergunta('')
    adicionarMensagem(perguntaAtual, true)
    setLoading(true)

    try {
      const response = await consultarGrafico(perguntaAtual)

      let resultado
      if (response && typeof response === 'object') {
        resultado =
          response.resposta ||
          response.resultado ||
          response.data ||
          JSON.stringify(response)
      } else {
        resultado = response || 'Gráfico gerado'
      }

      adicionarMensagem(`📊 ${resultado}`, false)
    } catch (error) {
      console.error('❌ Erro ao gerar gráfico:', error)
      adicionarMensagem(`❌ Erro ao gerar gráfico: ${error.message}`, false)
    } finally {
      setLoading(false)
    }
  }

  const handleLimparConversa = () => {
    Alert.alert(
      'Limpar Conversa',
      'Tem certeza que deseja limpar toda a conversa?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: () => {
            setMensagens([
              {
                id: 1,
                texto: 'Conversa limpa! Como posso ajudá-lo?',
                isUser: false,
                timestamp: new Date(),
                isStreaming: false,
              },
            ])
          },
        },
      ]
    )
  }

  const handleLimparCache = async () => {
    try {
      await limparCache()
      Alert.alert('Sucesso', 'Cache limpo com sucesso!')
    } catch (error) {
      Alert.alert('Erro', `Erro ao limpar cache: ${error.message}`)
    }
  }

  const renderMensagem = (mensagem) => (
    <Animated.View
      key={mensagem.id}
      style={[
        styles.mensagemContainer,
        mensagem.isUser ? styles.mensagemUser : styles.mensagemBot,
        { opacity: fadeAnim },
      ]}>
      <View
        style={[
          styles.mensagemBubble,
          mensagem.isUser ? styles.bubbleUser : styles.bubbleBot,
          mensagem.isStreaming && styles.bubbleStreaming,
        ]}>
        {mensagem.isStreaming && (
          <View style={styles.streamingIndicator}>
            <Text style={styles.streamingText}>🎬 STREAMING</Text>
            <Animated.View
              style={[
                styles.streamingDot,
                {
                  opacity: fadeAnim,
                },
              ]}
            />
          </View>
        )}
        <Text
          style={[
            styles.mensagemTexto,
            mensagem.isUser ? styles.textoUser : styles.textoBot,
          ]}>
          {mensagem.texto}
        </Text>
        <Text style={styles.timestamp}>
          {mensagem.timestamp.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </Animated.View>
  )

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🤖 Agente de Banco de Dados</Text>
        <Text style={styles.headerSubtitle}>Consultas inteligentes com IA</Text>
      </View>

      {/* Mensagens */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.mensagensContainer}
        showsVerticalScrollIndicator={false}>
        {mensagens.map(renderMensagem)}

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#007bff" />
            <Text style={styles.loadingText}>
              {isStreaming
                ? 'Processando com streaming...'
                : 'Agente processando...'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Digite sua pergunta..."
          value={pergunta}
          onChangeText={setPergunta}
          multiline
          maxLength={500}
          editable={!loading}
        />

        {/* Botões */}
        <View style={styles.botoesContainer}>
          <TouchableOpacity
            style={[styles.botao, styles.botaoConsulta]}
            onPress={() => handleConsulta(false)}
            disabled={loading || !pergunta.trim()}>
            <Text style={styles.botaoTexto}>📋 Consultar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.botao, styles.botaoStreaming]}
            onPress={() => handleConsulta(true)}
            disabled={loading || !pergunta.trim()}>
            <Text style={styles.botaoTexto}>🎬 Streaming</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.botao, styles.botaoGrafico]}
            onPress={handleGrafico}
            disabled={loading || !pergunta.trim()}>
            <Text style={styles.botaoTexto}>📊 Gráfico</Text>
          </TouchableOpacity>
        </View>

        {/* Botões de ação */}
        <View style={styles.acoesContainer}>
          <TouchableOpacity
            style={styles.botaoAcao}
            onPress={handleLimparConversa}>
            <Text style={styles.botaoAcaoTexto}>🗑️ Limpar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botaoAcao}
            onPress={handleLimparCache}>
            <Text style={styles.botaoAcaoTexto}>🧹 Cache</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a4358',
  },
  header: {
    backgroundColor: '#243242',
    paddingHorizontal: 16,
    paddingVertical: 15,
    paddingTop: 15,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  mensagensContainer: {
    flex: 1,
    padding: 16,
  },
  mensagemContainer: {
    marginBottom: 16,
  },
  mensagemUser: {
    alignItems: 'flex-end',
  },
  mensagemBot: {
    alignItems: 'flex-start',
  },
  mensagemBubble: {
    maxWidth: width * 0.8,
    padding: 12,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  bubbleUser: {
    backgroundColor: '#1bff',
  },
  bubbleBot: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  bubbleStreaming: {
    borderColor: '#28a745',
    borderWidth: 2,
    backgroundColor: '#f8fff9', // Fundo levemente verde para streaming
  },
  streamingIndicator: {
    backgroundColor: '#28a745',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  streamingText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  streamingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f0f8ff',
    marginLeft: 6,
  },
  mensagemTexto: {
    fontSize: 16,
    lineHeight: 22,
  },
  textoUser: {
    color: 'white',
  },
  textoBot: {
    color: '#333',
  },
  timestamp: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: 'rgba(40, 167, 69, 0.1)', // Fundo verde claro para streaming
    borderRadius: 12,
    marginVertical: 8,
  },
  loadingText: {
    marginLeft: 8,
    color: '#28a745',
    fontStyle: 'italic',
    fontWeight: '500',
  },
  inputContainer: {
    backgroundColor: '#243242',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#154249',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    maxHeight: 100,
    marginBottom: 12,
    color: 'white',
  },
  botoesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  botao: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  botaoConsulta: {
    backgroundColor: '#007bff',
  },
  botaoStreaming: {
    backgroundColor: '#28a745',
  },
  botaoGrafico: {
    backgroundColor: '#17a2b8',
  },
  botaoTexto: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  acoesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    marginBottom: 25,
  },
  botaoAcao: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#6c757d',
  },
  botaoAcaoTexto: {
    color: 'white',
    fontSize: 12,
  },
})

export default ConsultaScreen
