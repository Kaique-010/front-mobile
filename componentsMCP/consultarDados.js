import { apiPostComContexto, BASE_URL } from '../utils/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getStoredData } from '../services/storageService'

export const consultarDados = async (pergunta, slug = null) => {
  try {
    console.log('📝 Consultando dados:', pergunta)
    const response = await apiPostComContexto(`mcp-agent/consulta/`, {
      pergunta,
      slug,
    })
    
    console.log('✅ Resposta recebida:', response)
    return response.data || response
  } catch (error) {
    console.error('❌ Erro na consulta:', error)
    throw new Error(`Erro na consulta: ${error.message}`)
  }
}

export const consultarDadosStreaming = async (pergunta, slug = null, onProgress = null) => {
  try {
    console.log('🎬 Iniciando consulta com streaming:', pergunta)
    
    // Obter dados necessários para autenticação
    const storedData = await getStoredData()
    const currentSlug = slug || storedData.slug
    const token = await AsyncStorage.getItem('access')
    
    if (!token) {
      throw new Error('Token de autenticação não encontrado')
    }
    
    // Obter headers de contexto
    const empresaId = await AsyncStorage.getItem('empresaId')
    const filialId = await AsyncStorage.getItem('filialId')
    const docu = await AsyncStorage.getItem('docu')
    const usuario_id = await AsyncStorage.getItem('usuario_id')
    const username = await AsyncStorage.getItem('username')
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Empresa': empresaId || '',
      'X-Filial': filialId || '',
      'X-Docu': docu || '',
      'X-Usuario-Id': usuario_id || '',
      'X-Username': username || '',
    }
    
    // Construir URL completa
    const url = `${BASE_URL}/api/${currentSlug}/mcp-agent/consulta-streaming/`
    console.log('🌐 URL da requisição:', url)
    
    // Implementação de streaming para React Native usando XMLHttpRequest
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      let processedLength = 0
      let finalResult = ''
      let buffer = '' // Buffer para linhas incompletas
      
      xhr.open('POST', url, true)
      
      // Configurar headers
      Object.keys(headers).forEach(key => {
        xhr.setRequestHeader(key, headers[key])
      })
      
      // Processar resposta em tempo real
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 3 || xhr.readyState === 4) { // LOADING ou DONE
          // Obter apenas os novos dados
          const newData = xhr.responseText.substring(processedLength)
          processedLength = xhr.responseText.length
          
          if (newData) {
            // Adicionar novos dados ao buffer
            buffer += newData
            
            // Processar linhas completas
            const lines = buffer.split('\n')
            
            // Manter a última linha no buffer se não terminar com \n
            if (!buffer.endsWith('\n')) {
              buffer = lines.pop() || ''
            } else {
              buffer = ''
            }
            
            // Processar cada linha completa
            for (const line of lines) {
              if (line.trim() && line.startsWith('data: ')) {
                try {
                  const jsonStr = line.slice(6).trim()
                  if (jsonStr) {
                    const data = JSON.parse(jsonStr)
                    
                    // Log mais detalhado
                    if (data.tipo === 'resposta_chunk') {
                      console.log('📦 Chunk recebido:', data.texto ? 'com texto' : 'vazio')
                    } else {
                      console.log('📦 Dados recebidos:', data.tipo, data.mensagem || data.etapa || 'processando...')
                    }
                    
                    // Chamar callback de progresso se fornecido
                    if (onProgress) {
                      onProgress(data)
                    }

                    // Se for o resultado final, armazenar
                    if (data.tipo === 'concluido' && data.resposta_final) {
                      finalResult = data.resposta_final
                    }
                  }
                } catch (parseError) {
                  console.log('⚠️ Erro ao parsear JSON:', parseError.message, 'Linha:', line.substring(0, 100) + '...')
                }
              }
            }
          }
          
          // Se a requisição foi concluída
          if (xhr.readyState === 4) {
            // Processar qualquer dado restante no buffer
            if (buffer.trim() && buffer.startsWith('data: ')) {
              try {
                const jsonStr = buffer.slice(6).trim()
                if (jsonStr) {
                  const data = JSON.parse(jsonStr)
                  console.log('📦 Dados finais do buffer:', data.tipo)
                  
                  if (onProgress) {
                    onProgress(data)
                  }
                  
                  if (data.tipo === 'concluido' && data.resposta_final) {
                    finalResult = data.resposta_final
                  }
                }
              } catch (parseError) {
                console.log('⚠️ Erro ao parsear dados finais do buffer:', parseError.message)
              }
            }
            
            if (xhr.status === 200) {
              console.log('🏁 Streaming finalizado com sucesso')
              resolve(finalResult || 'Resposta recebida via streaming')
            } else {
              console.error('❌ Erro HTTP:', xhr.status, xhr.responseText)
              reject(new Error(`HTTP error! status: ${xhr.status} - ${xhr.responseText}`))
            }
          }
        }
      }
      
      xhr.onerror = () => {
        console.error('❌ Erro na requisição XMLHttpRequest')
        reject(new Error('Erro de conexão na requisição de streaming'))
      }
      
      xhr.ontimeout = () => {
        console.error('❌ Timeout na requisição XMLHttpRequest')
        reject(new Error('Timeout na requisição de streaming'))
      }
      
      // Configurar timeout (60 segundos para consultas mais longas)
      xhr.timeout = 60000
      
      // Enviar dados
      xhr.send(JSON.stringify({
        pergunta,
        slug: currentSlug,
        empr: empresaId,
        fili: filialId,
        usua: usuario_id,
      }))
    })

  } catch (error) {
    console.error('❌ Erro na consulta streaming:', error)
    throw new Error(`Erro na consulta streaming: ${error.message}`)
  }
}

export const consultarGrafico = async (pergunta, tipoGrafico = 'bar', slug = null) => {
  try {
    console.log('📊 Consultando gráfico:', pergunta, tipoGrafico)
    const response = await apiPostComContexto(`mcp-agent/grafico/`, {
      pergunta,
      tipo_grafico: tipoGrafico,
      slug,
    })
    
    console.log('✅ Resposta de gráfico recebida:', response)
    return response.data || response
  } catch (error) {
    console.error('❌ Erro na consulta de gráfico:', error)
    throw new Error(`Erro na consulta de gráfico: ${error.message}`)
  }
}

export const obterHistorico = async () => {
  try {
    console.log('📚 Obtendo histórico...')
    const storedData = await getStoredData()
    const token = await AsyncStorage.getItem('access')
    
    if (!token) {
      throw new Error('Token de autenticação não encontrado')
    }
    
    const response = await fetch(`${BASE_URL}/api/${storedData.slug}/mcp-agent/historico/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('✅ Histórico obtido:', data.count, 'itens')
    return data.historico || []
  } catch (error) {
    console.error('❌ Erro ao obter histórico:', error)
    throw new Error(`Erro ao obter histórico: ${error.message}`)
  }
}

export const limparCache = async () => {
  try {
    console.log('🧹 Limpando cache...')
    const response = await apiPostComContexto(`mcp-agent/limpar-cache/`, {})
    console.log('✅ Cache limpo com sucesso')
    return response.data || response
  } catch (error) {
    console.error('❌ Erro ao limpar cache:', error)
    throw new Error(`Erro ao limpar cache: ${error.message}`)
  }
}

export const limparHistorico = async () => {
  try {
    console.log('🧹 Limpando histórico...')
    const response = await apiPostComContexto(`mcp-agent/limpar-historico/`, {})
    console.log('✅ Histórico limpo com sucesso')
    return response.data || response
  } catch (error) {
    console.error('❌ Erro ao limpar histórico:', error)
    throw new Error(`Erro ao limpar histórico: ${error.message}`)
  }
}
