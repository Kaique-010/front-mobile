import { useState } from 'react'
import { Alert } from 'react-native'
import { apiPostComContexto } from '../utils/api'

export function useEnviarEmail() {
  const [loading, setLoading] = useState(false)

  const enviarEmail = async (email, dados) => {
    if (!email || !dados) {
      Alert.alert('Erro', 'Email e dados são obrigatórios')
      return false
    }

    setLoading(true)
    try {
      const response = await apiPostComContexto('dashboards/envio/email/', {
        email,
        dados,
      })
      console.log('Resposta da API:', response)
      Alert.alert(
        'Sucesso',
        response.data?.mensagem ?? 'Email enviado com sucesso'
      )
      return true
    } catch (error) {
      console.log('Erro na requisição:', error.response)
      Alert.alert('Erro', error.response?.data?.erro || 'Falha ao enviar email')
      return false
    } finally {
      setLoading(false)
    }
  }

  return { enviarEmail, loading }
}
