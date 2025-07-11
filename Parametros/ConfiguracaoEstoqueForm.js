import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import {
  getConfiguracaoEstoque,
  updateConfiguracaoEstoque,
} from '../services/parametrosService'

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

      let config
      if (response?.data?.results && Array.isArray(response.data.results)) {
        config = response.data.results[0]
      } else if (response?.data && typeof response.data === 'object') {
        config = response.data
      } else {
        config = null
      }

      const finalConfig = config || {
        controlar_estoque: false,
        permitir_estoque_negativo: false,
        usar_custo_medio: false,
        usar_ultimo_custo: false,
        calcular_automatico: false,
        alertar_estoque_minimo: false,
      }

      setConfiguracao(finalConfig)
    } catch (error) {
      console.error('Erro ao carregar configuração:', error)
      Alert.alert('Aviso', 'Erro ao carregar dados. Usando valores padrão.')

      setConfiguracao({
        controlar_estoque: false,
        permitir_estoque_negativo: false,
        usar_custo_medio: false,
        usar_ultimo_custo: false,
        calcular_automatico: false,
        alertar_estoque_minimo: false,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      if (configuracao.usar_custo_medio && configuracao.usar_ultimo_custo) {
        Alert.alert(
          'Erro',
          'Não é possível usar custo médio e último custo ao mesmo tempo.'
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

  const renderItem = (label, field) => (
    <View
      style={{
        backgroundColor: '#2f3e52',
        padding: 15,
        marginBottom: 12,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 4,
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
          Controle de Estoque
        </Text>
        {renderItem('Controlar Estoque', 'controlar_estoque')}
        {renderItem('Permitir Estoque Negativo', 'permitir_estoque_negativo')}
        {renderItem('Bloquear Venda sem Estoque', 'bloquear_venda_sem_estoque')}

        <Text
          style={{
            color: '#fff',
            fontSize: 18,
            fontWeight: 'bold',
            marginVertical: 16,
          }}>
          Cálculo de Custos
        </Text>
        {renderItem('Usar Custo Médio', 'usar_custo_medio')}
        {renderItem('Usar Último Custo', 'usar_ultimo_custo')}
        {renderItem('Calcular Automaticamente', 'calcular_automatico')}

        <Text
          style={{
            color: '#fff',
            fontSize: 18,
            fontWeight: 'bold',
            marginVertical: 16,
          }}>
          Alertas
        </Text>
        {renderItem('Alertar Estoque Mínimo', 'alertar_estoque_minimo')}
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

export default ConfiguracaoEstoqueForm
