import { useState } from 'react'
import { Alert } from 'react-native'
import { apiPostComContexto } from '../utils/api'

export function useEnviarWhats() {
  const [loading, setLoading] = useState(false)

  const enviarWhats = async (numero, dados) => {
    if (!numero || !dados) {
      Alert.alert('Erro', 'Número e dados são obrigatórios')
      return false
    }

    setLoading(true)
    try {
      const response = await apiPostComContexto('/envio/whatsapp/', {
        numero,
        dados,
      })
      Alert.alert('Sucesso', response.data.mensagem)
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

  return { enviarWhats, loading }
}
