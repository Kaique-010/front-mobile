import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import {
  getConfiguracaoEstoque,
  updateConfiguracaoEstoque,
} from '../services/parametrosService'
import { parametrosStyles } from './styles/parametrosStyles'

const ConfiguracaoEstoqueForm = ({ navigation }) => {
  const [configuracao, setConfiguracao] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadConfiguracao()
  }, [])

  const loadConfiguracao = async () => {
    try {
      setLoading(true)
      const response = await getConfiguracaoEstoque()
      
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
        controlar_estoque: false,
        permitir_estoque_negativo: false,
        usar_custo_medio: false,
        usar_ultimo_custo: false,
        calcular_automatico: false,
        alertar_estoque_minimo: false,
        bloquear_venda_sem_estoque: false,
      }
      
      setConfiguracao(finalConfig)
    } catch (error) {
      console.error('Erro ao carregar configuração:', error)
      
      // Set default configuration on error
      setConfiguracao({
        controlar_estoque: false,
        permitir_estoque_negativo: false,
        usar_custo_medio: false,
        usar_ultimo_custo: false,
        calcular_automatico: false,
        alertar_estoque_minimo: false,
        bloquear_venda_sem_estoque: false,
      })
      
      Alert.alert('Aviso', 'Não foi possível carregar a configuração. Usando valores padrão.')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      if (configuracao.usar_custo_medio && configuracao.usar_ultimo_custo) {
        Alert.alert(
          'Erro',
          'Não é possível usar custo médio e último custo simultaneamente'
        )
        return
      }

      if (configuracao.id) {
        await updateConfiguracaoEstoque(configuracao.id, configuracao)
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
          <Text style={parametrosStyles.sectionTitle}>Controle de Estoque</Text>

          <View style={parametrosStyles.configItem}>
            <Text style={parametrosStyles.configLabel}>Controlar Estoque</Text>
            <Switch
              value={configuracao.controlar_estoque}
              onValueChange={() => handleToggle('controlar_estoque')}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={
                configuracao.controlar_estoque ? '#f5dd4b' : '#f4f3f4'
              }
            />
          </View>

          <View style={parametrosStyles.configItem}>
            <Text style={parametrosStyles.configLabel}>
              Permitir Estoque Negativo
            </Text>
            <Switch
              value={configuracao.permitir_estoque_negativo}
              onValueChange={() => handleToggle('permitir_estoque_negativo')}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={
                configuracao.permitir_estoque_negativo ? '#f5dd4b' : '#f4f3f4'
              }
            />
          </View>

          <View style={parametrosStyles.configItem}>
            <Text style={parametrosStyles.configLabel}>
              Bloquear Venda sem Estoque
            </Text>
            <Switch
              value={configuracao.bloquear_venda_sem_estoque}
              onValueChange={() => handleToggle('bloquear_venda_sem_estoque')}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={
                configuracao.bloquear_venda_sem_estoque ? '#f5dd4b' : '#f4f3f4'
              }
            />
          </View>
        </View>

        <View style={parametrosStyles.section}>
          <Text style={parametrosStyles.sectionTitle}>Cálculo de Custos</Text>

          <View style={parametrosStyles.configItem}>
            <Text style={parametrosStyles.configLabel}>Usar Custo Médio</Text>
            <Switch
              value={configuracao.usar_custo_medio}
              onValueChange={() => handleToggle('usar_custo_medio')}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={configuracao.usar_custo_medio ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>

          <View style={parametrosStyles.configItem}>
            <Text style={parametrosStyles.configLabel}>Usar Último Custo</Text>
            <Switch
              value={configuracao.usar_ultimo_custo}
              onValueChange={() => handleToggle('usar_ultimo_custo')}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={
                configuracao.usar_ultimo_custo ? '#f5dd4b' : '#f4f3f4'
              }
            />
          </View>

          <View style={parametrosStyles.configItem}>
            <Text style={parametrosStyles.configLabel}>
              Calcular Automaticamente
            </Text>
            <Switch
              value={configuracao.calcular_automatico}
              onValueChange={() => handleToggle('calcular_automatico')}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={
                configuracao.calcular_automatico ? '#f5dd4b' : '#f4f3f4'
              }
            />
          </View>
        </View>

        <View style={parametrosStyles.section}>
          <Text style={parametrosStyles.sectionTitle}>Alertas</Text>

          <View style={parametrosStyles.configItem}>
            <Text style={parametrosStyles.configLabel}>
              Alertar Estoque Mínimo
            </Text>
            <Switch
              value={configuracao.alertar_estoque_minimo}
              onValueChange={() => handleToggle('alertar_estoque_minimo')}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={
                configuracao.alertar_estoque_minimo ? '#f5dd4b' : '#f4f3f4'
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

export default ConfiguracaoEstoqueForm
