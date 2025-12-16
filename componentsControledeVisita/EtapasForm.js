//Tela para Cadastro das etapas com o endpoint de /api/{slug}/controledevisitas/etapas-visita/
//Tela para Edição das etapas com o endpoint de /api/{slug}/controledevisitas/etapas-visita/{id}/
//Tela para exclusão das etapas com o endpoint de /api/{slug}/controledevisitas/etapas-visita/{id}/

import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'
import { apiPostComContexto, apiPatchComContexto, apiGetComContexto } from '../utils/api'
import { useRoute, useNavigation } from '@react-navigation/native'
import useContextoApp from '../hooks/useContextoApp'

export default function EtapasForm() {
  const route = useRoute()
  const navigation = useNavigation()
  const { etapaId, etapa: etapaParam, mode = 'create' } = route.params || {}
  const isEdit = mode === 'edit' && etapaId
  const { empresaId, filialId } = useContextoApp()

  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(isEdit && !etapaParam)
  const [etapa, setEtapa] = useState({
    etap_descricao: etapaParam?.etap_descricao || '',
    etap_obse: etapaParam?.etap_obse || '',
  })

  // Carregar dados da etapa se for edição e não tiver dados
  useEffect(() => {
    if (isEdit && !etapaParam) {
      carregarEtapa()
    }
  }, [isEdit, etapaId, etapaParam])

  const carregarEtapa = async () => {
    try {
      setLoadingData(true)
      console.log('🔍 [ETAPAS-FORM] Carregando etapa ID:', etapaId)
      
      const response = await apiGetComContexto(`controledevisitas/etapas-visita/${etapaId}/`)
      console.log('📥 [ETAPAS-FORM] Dados recebidos:', response.data)
      
      if (response.data) {
        setEtapa({
          etap_descricao: response.data.etap_descricao || '',
          etap_obse: response.data.etap_obse || '',
        })
      }
    } catch (error) {
      console.error('❌ [ETAPAS-FORM] Erro ao carregar etapa:', error)
      Toast.show({
        type: 'error',
        text1: 'Erro ao carregar etapa',
        text2: error.message || 'Tente novamente',
      })
    } finally {
      setLoadingData(false)
    }
  }

  const validarCampos = () => {
    if (!etapa.etap_descricao.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Campo obrigatório',
        text2: 'Preencha a descrição da etapa',
      })
      return false
    }

    return true
  }

  const handleSalvarEtapa = async () => {
    if (!validarCampos()) {
      return
    }

    try {
      setLoading(true)
      
      const dadosEtapa = {
        etap_descricao: etapa.etap_descricao.trim(),
        etap_empr: empresaId, // Pega automaticamente do contexto
        etap_obse: etapa.etap_obse.trim(),
      }

      console.log('📤 [ETAPAS-FORM] Dados a serem enviados:', dadosEtapa)
      console.log('🏢 [ETAPAS-FORM] Empresa ID do contexto:', empresaId)
      console.log('🏪 [ETAPAS-FORM] Filial ID do contexto:', filialId)
      console.log('🔧 [ETAPAS-FORM] Modo:', isEdit ? 'Edição' : 'Criação')

      if (isEdit) {
        console.log('✏️ [ETAPAS-FORM] Atualizando etapa ID:', etapaId)
        const response = await apiPatchComContexto(
          `controledevisitas/etapas-visita/${etapaId}/`,
          dadosEtapa
        )
        console.log('✅ [ETAPAS-FORM] Resposta da atualização:', response.data)
        
        Toast.show({
          type: 'success',
          text1: 'Sucesso',
          text2: 'Etapa atualizada com sucesso',
        })
      } else {
        console.log('➕ [ETAPAS-FORM] Criando nova etapa')
        const response = await apiPostComContexto('controledevisitas/etapas-visita/', dadosEtapa)
        console.log('✅ [ETAPAS-FORM] Resposta da criação:', response.data)
        
        Toast.show({
          type: 'success',
          text1: 'Sucesso',
          text2: 'Etapa criada com sucesso',
        })
      }
      
      navigation.goBack()
    } catch (error) {
      console.error('❌ [ETAPAS-FORM] Erro ao salvar etapa:', error)
      console.error('❌ [ETAPAS-FORM] Detalhes do erro:', error.response?.data)
      
      Toast.show({
        type: 'error',
        text1: 'Erro ao salvar',
        text2: error.message || 'Tente novamente',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVoltar = () => {
    Alert.alert(
      'Confirmar',
      'Deseja sair sem salvar as alterações?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: () => navigation.goBack() },
      ]
    )
  }

  if (loadingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2ecc71" />
        <Text style={styles.loadingText}>Carregando etapa...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleVoltar} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {isEdit ? 'Editar Etapa' : 'Nova Etapa'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Descrição */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Descrição *</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite a descrição da etapa"
            placeholderTextColor="#666"
            value={etapa.etap_descricao}
            onChangeText={(text) => setEtapa({ ...etapa, etap_descricao: text })}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Observação */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Observação</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Digite observações adicionais"
            placeholderTextColor="#666"
            value={etapa.etap_obse}
            onChangeText={(text) => setEtapa({ ...etapa, etap_obse: text })}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Info da empresa (apenas visual) */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Empresa:</Text>
          <Text style={styles.infoValue}>{empresaId || 'Não definida'}</Text>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, loading && styles.fabDisabled]}
        onPress={handleSalvarEtapa}
        disabled={loading}
      >
        <MaterialIcons
          name={loading ? 'hourglass-empty' : 'save'}
          size={24}
          color="#fff"
        />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1421',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0d1421',
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a3441',
    backgroundColor: '#1a252f',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a252f',
    borderWidth: 1,
    borderColor: '#2a3441',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#fff',
    minHeight: 48,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  infoContainer: {
    backgroundColor: '#1a252f',
    borderWidth: 1,
    borderColor: '#2a3441',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2ecc71',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  fabDisabled: {
    backgroundColor: '#666',
  },
})
