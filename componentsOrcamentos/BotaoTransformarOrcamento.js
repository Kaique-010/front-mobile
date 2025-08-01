// src/components/BotaoTransformarOrcamento.js
import React, { useState } from 'react'
import { TouchableOpacity, Text, ActivityIndicator, Alert } from 'react-native'
import { apiPostComContexto } from '../utils/api'

export default function BotaoTransformarOrcamento({ orcamentoId, onSuccess }) {
  const [loading, setLoading] = useState(false)

  const transformar = async () => {
    setLoading(true)
    try {
      const response = await apiPostComContexto(
        `orcamentos/orcamentos/${orcamentoId}/transformar-em-pedido/`
      )

      if (response.status === 200 || response.status === 201) {
        Alert.alert('Sucesso', 'Orçamento transformado em pedido!')
        onSuccess?.(response.data) // callback se quiser atualizar UI
      } else {
        throw new Error('Falha inesperada')
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível transformar o orçamento.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <TouchableOpacity
      onPress={transformar}
      disabled={loading}
      style={{
        backgroundColor: '#4CAF50',
        padding: 12,
        borderRadius: 6,
        alignItems: 'center',
        marginVertical: 8,
      }}>
      {loading ? (
        <ActivityIndicator color="#FFF" />
      ) : (
        <Text style={{ color: '#FFF', fontWeight: 'bold' }}>
          Transformar em Pedido
        </Text>
      )}
    </TouchableOpacity>
  )
}
