import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  TextInput,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import {
  getConfiguracaoFinanceiro,
  updateConfiguracaoFinanceiro,
} from '../services/parametrosService'
import { parametrosStyles } from './styles/parametrosStyles'

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
      
      // Handle different response structures
      let config
      if (response?.data?.results && Array.isArray(response.data.results)) {
        config = response.data.results[0]
      } else if (response?.data && typeof response.data === 'object') {
        config = response.data
      } else {
        config = null
      }
      
      // Set default values if no config found
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
      
      // Set default configuration on error
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
      
      Alert.alert('Aviso', 'Não foi possível carregar a configuração. Usando valores padrão.')
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

  if (loading || !configuracao) {
    return (
      <View style={parametrosStyles.loadingContainer}>
        <Text>Carregando...</Text>
      </View>
    )
  }

  return (
    <View style={parametrosStyles.container}>
      <ScrollView style={parametrosStyles.scrollContainer}>
        <View style={parametrosStyles.section}>
          <Text style={parametrosStyles.sectionTitle}>Descontos</Text>

          <View style={parametrosStyles.configItem}>
            <Text style={parametrosStyles.configLabel}>Permitir Desconto</Text>
            <Switch
              value={configuracao.permitir_desconto}
              onValueChange={() => handleToggle('permitir_desconto')}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={
                configuracao.permitir_desconto ? '#f5dd4b' : '#f4f3f4'
              }
            />
          </View>

          <View style={parametrosStyles.inputGroup}>
            <Text style={parametrosStyles.inputLabel}>Desconto Máximo (%)</Text>
            <TextInput
              style={parametrosStyles.input}
              value={configuracao.desconto_maximo_percentual?.toString()}
              onChangeText={(value) =>
                handleInputChange(
                  'desconto_maximo_percentual',
                  parseFloat(value) || 0
                )
              }
              keyboardType="numeric"
              placeholder="0"
            />
          </View>

          <View style={parametrosStyles.configItem}>
            <Text style={parametrosStyles.configLabel}>
              Exigir Aprovação para Desconto
            </Text>
            <Switch
              value={configuracao.exigir_aprovacao_desconto}
              onValueChange={() => handleToggle('exigir_aprovacao_desconto')}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={
                configuracao.exigir_aprovacao_desconto ? '#f5dd4b' : '#f4f3f4'
              }
            />
          </View>
        </View>

        <View style={parametrosStyles.section}>
          <Text style={parametrosStyles.sectionTitle}>Parcelamento</Text>

          <View style={parametrosStyles.configItem}>
            <Text style={parametrosStyles.configLabel}>
              Permitir Parcelamento
            </Text>
            <Switch
              value={configuracao.permitir_parcelamento}
              onValueChange={() => handleToggle('permitir_parcelamento')}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={
                configuracao.permitir_parcelamento ? '#f5dd4b' : '#f4f3f4'
              }
            />
          </View>

          <View style={parametrosStyles.inputGroup}>
            <Text style={parametrosStyles.inputLabel}>Máximo de Parcelas</Text>
            <TextInput
              style={parametrosStyles.input}
              value={configuracao.maximo_parcelas?.toString()}
              onChangeText={(value) =>
                handleInputChange('maximo_parcelas', parseInt(value) || 12)
              }
              keyboardType="numeric"
              placeholder="12"
            />
          </View>
        </View>

        <View style={parametrosStyles.section}>
          <Text style={parametrosStyles.sectionTitle}>Juros e Multas</Text>

          <View style={parametrosStyles.inputGroup}>
            <Text style={parametrosStyles.inputLabel}>
              Juros de Mora Mensal (%)
            </Text>
            <TextInput
              style={parametrosStyles.input}
              value={configuracao.juros_mora_mensal?.toString()}
              onChangeText={(value) =>
                handleInputChange('juros_mora_mensal', parseFloat(value) || 0)
              }
              keyboardType="numeric"
              placeholder="0"
            />
          </View>

          <View style={parametrosStyles.inputGroup}>
            <Text style={parametrosStyles.inputLabel}>
              Multa por Atraso (%)
            </Text>
            <TextInput
              style={parametrosStyles.input}
              value={configuracao.multa_atraso_percentual?.toString()}
              onChangeText={(value) =>
                handleInputChange(
                  'multa_atraso_percentual',
                  parseFloat(value) || 0
                )
              }
              keyboardType="numeric"
              placeholder="0"
            />
          </View>

          <View style={parametrosStyles.configItem}>
            <Text style={parametrosStyles.configLabel}>
              Calcular Juros Automaticamente
            </Text>
            <Switch
              value={configuracao.calcular_juros_automatico}
              onValueChange={() => handleToggle('calcular_juros_automatico')}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={
                configuracao.calcular_juros_automatico ? '#f5dd4b' : '#f4f3f4'
              }
            />
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={parametrosStyles.saveButton}
        onPress={handleSave}>
        <Feather name="save" size={20} color="#fff" />
        <Text style={parametrosStyles.saveButtonText}>Salvar Configuração</Text>
      </TouchableOpacity>
    </View>
  )
}

export default ConfiguracaoFinanceiroForm
