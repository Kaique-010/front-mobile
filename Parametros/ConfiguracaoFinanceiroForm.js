import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  TextInput,
  ActivityIndicator,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import {
  getConfiguracaoFinanceiro,
  updateConfiguracaoFinanceiro,
} from '../services/parametrosService'

const ConfiguracaoFinanceiroForm = ({ navigation }) => {
  const [configuracao, setConfiguracao] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadConfiguracao()
  }, [])

  const loadConfiguracao = async () => {
    try {
      setLoading(true)
      const response = await getConfiguracaoFinanceiro()

      let config
      if (response?.data?.results && Array.isArray(response.data.results)) {
        config = response.data.results[0]
      } else if (response?.data && typeof response.data === 'object') {
        config = response.data
      } else {
        config = null
      }

      const finalConfig = config || {
        permitir_desconto: false,
        desconto_maximo_percentual: 0,
        exigir_aprovacao_desconto: false,
        permitir_parcelamento: false,
        maximo_parcelas: 12,
        juros_mora_mensal: 0,
        multa_atraso_percentual: 0,
        calcular_juros_automatico: false,
      }

      setConfiguracao(finalConfig)
    } catch (error) {
      console.error('Erro ao carregar configuração:', error)
      Alert.alert('Aviso', 'Erro ao carregar. Usando padrão.')

      setConfiguracao({
        permitir_desconto: false,
        desconto_maximo_percentual: 0,
        exigir_aprovacao_desconto: false,
        permitir_parcelamento: false,
        maximo_parcelas: 12,
        juros_mora_mensal: 0,
        multa_atraso_percentual: 0,
        calcular_juros_automatico: false,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      if (
        configuracao.desconto_maximo_percentual < 0 ||
        configuracao.desconto_maximo_percentual > 100
      ) {
        Alert.alert('Erro', 'Desconto máximo deve estar entre 0% e 100%')
        return
      }

      if (configuracao.id) {
        await updateConfiguracaoFinanceiro(configuracao.id, configuracao)
      }

      Alert.alert('Sucesso', 'Configuração salva com sucesso')
      navigation.goBack()
    } catch (error) {
      console.error('Erro ao salvar configuração:', error)
      Alert.alert('Erro', 'Não foi possível salvar a configuração')
    }
  }

  const handleToggle = (field) => {
    setConfiguracao((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const handleInputChange = (field, value) => {
    setConfiguracao((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const renderSwitch = (label, field) => (
    <View
      style={{
        backgroundColor: '#2f3e52',
        padding: 15,
        marginBottom: 12,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '500' }}>
        {label}
      </Text>
      <Switch
        value={configuracao[field]}
        onValueChange={() => handleToggle(field)}
        trackColor={{ false: '#777', true: '#34d399' }}
        thumbColor={configuracao[field] ? '#22c55e' : '#ccc'}
      />
    </View>
  )

  const renderInput = (label, field, placeholder = '0') => (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={{
          color: '#fff',
          marginBottom: 4,
          fontSize: 14,
          fontWeight: '500',
        }}>
        {label}
      </Text>
      <TextInput
        style={{
          backgroundColor: '#2f3e52',
          borderRadius: 10,
          paddingHorizontal: 12,
          paddingVertical: 10,
          color: '#fff',
          fontSize: 16,
        }}
        value={configuracao[field]?.toString()}
        onChangeText={(value) =>
          handleInputChange(
            field,
            field.includes('parcelas')
              ? parseInt(value) || 0
              : parseFloat(value) || 0
          )
        }
        keyboardType="numeric"
        placeholder={placeholder}
        placeholderTextColor="#aaa"
      />
    </View>
  )

  if (loading || !configuracao) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#243242',
        }}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#243242', padding: 16 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text
          style={{
            color: '#fff',
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 12,
          }}>
          Descontos
        </Text>
        {renderSwitch('Permitir Desconto', 'permitir_desconto')}
        {renderInput('Desconto Máximo (%)', 'desconto_maximo_percentual')}
        {renderSwitch(
          'Exigir Aprovação para Desconto',
          'exigir_aprovacao_desconto'
        )}

        <Text
          style={{
            color: '#fff',
            fontSize: 18,
            fontWeight: 'bold',
            marginVertical: 16,
          }}>
          Parcelamento
        </Text>
        {renderSwitch('Permitir Parcelamento', 'permitir_parcelamento')}
        {renderInput('Máximo de Parcelas', 'maximo_parcelas', '12')}

        <Text
          style={{
            color: '#fff',
            fontSize: 18,
            fontWeight: 'bold',
            marginVertical: 16,
          }}>
          Juros e Multas
        </Text>
        {renderInput('Juros de Mora Mensal (%)', 'juros_mora_mensal')}
        {renderInput('Multa por Atraso (%)', 'multa_atraso_percentual')}
        {renderSwitch(
          'Calcular Juros Automaticamente',
          'calcular_juros_automatico'
        )}
      </ScrollView>

      <TouchableOpacity
        style={{
          backgroundColor: '#0ea5e9',
          padding: 15,
          borderRadius: 10,
          marginTop: 20,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 8,
        }}
        onPress={handleSave}>
        <Feather name="save" size={20} color="#fff" />
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
          Salvar Configuração
        </Text>
      </TouchableOpacity>
    </View>
  )
}

export default ConfiguracaoFinanceiroForm
