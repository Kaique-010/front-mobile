import { useState } from 'react'
import { Alert } from 'react-native'
import { apiPostComContexto } from '../utils/api'

export function useEnviarWhatsOs() {
  const [loading, setLoading] = useState(false)

  const enviarWhatsOs = async (clienteId, dados) => {
    if (!clienteId || !dados) {
      Alert.alert('Erro', 'ID do Cliente e dados são obrigatórios')
      return false
    }

    setLoading(true)
    try {
      // Ajuste a rota conforme seu backend (ex: Os/ordens/enviarwhatsapp/)
      const response = await apiPostComContexto('Os/ordens/enviarwhatsapp/', {
        cliente_id: clienteId,
        dados,
      })
      Alert.alert(
        'Sucesso',
        response?.mensagem ||
          response?.data?.mensagem ||
          'WhatsApp enviado com sucesso'
      )
      return true
    } catch (error) {
      Alert.alert(
        'Erro',
        error.response?.data?.erro || 'Falha ao enviar WhatsApp'
      )
      return false
    } finally {
      setLoading(false)
    }
  }

  return { enviarWhatsOs, loading }
}
