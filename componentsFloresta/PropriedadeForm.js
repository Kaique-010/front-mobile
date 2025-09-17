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
import {
  apiPostComContexto,
  apiPatchComContexto,
  apiGetComContexto,
} from '../utils/api'
import { useRoute, useNavigation } from '@react-navigation/native'
import useContextoApp from '../hooks/useContextoApp'

export default function PropriedadeForm() {
  const route = useRoute()
  const navigation = useNavigation()
  const {
    propriedadeId,
    propriedade: propriedadeParam,
    mode = 'create',
  } = route.params || {}
  const isEdit = mode === 'edit' && propriedadeId


  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(isEdit && !propriedadeParam)
  const [propriedade, setPropriedade] = useState({
    prop_nome: propriedadeParam?.prop_nome || '',
    prop_sigl: propriedadeParam?.prop_sigl || '',
    prop_ativa: propriedadeParam?.prop_ativa === 'true',
  })

  useEffect(() => {
    if (isEdit && !propriedadeParam) {
      carregarPropriedade()
    }
  }, [isEdit, propriedadeId, propriedadeParam])

  const carregarPropriedade = async () => {
    try {
      setLoadingData(true)
      const data = await apiGetComContexto(
        `Floresta/propriedade/${propriedadeId}`
      )
      setPropriedade(data)
    } catch (error) {
      console.error('Erro ao carregar propriedade:', error)
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Erro ao carregar propriedade. Tente novamente.',
      })
    } finally {
      setLoadingData(false)
    }
  }

  const salvarPropriedade = async () => {
    if (!propriedade.prop_nome.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Nome da propriedade é obrigatório.',
      })
      return
    }

    try {
      setLoading(true)
      if (isEdit) {
        await apiPatchComContexto(
          `Floresta/propriedades/${propriedadeId}/`,
          propriedade,
          'prop_'
        )
        Toast.show({
          type: 'success',
          text1: 'Sucesso',
          text2: 'Propriedade editada com sucesso.',
        })
      } else {
        await apiPostComContexto('Floresta/propriedades/', propriedade, 'prop_')
        Toast.show({
          type: 'success',
          text1: 'Sucesso',
          text2: 'Propriedade criada com sucesso.',
        })
      }
      navigation.goBack()
    } catch (error) {
      console.error('Erro ao salvar propriedade:', error)
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Erro ao salvar propriedade. Tente novamente.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVoltar = () => {
    Alert.alert('Confirmar', 'Deseja sair sem salvar as alterações?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => navigation.goBack(),
      },
    ])
  }

  if (loadingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Carregando propriedade...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {isEdit ? 'Editar Propriedade' : 'Nova Propriedade'}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome *</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o nome da propriedade"
              placeholderTextColor="#666"
              value={propriedade.prop_nome}
              onChangeText={(text) =>
                setPropriedade({ ...propriedade, prop_nome: text })
              }
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Sigla</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite a sigla da propriedade"
              placeholderTextColor="#666"
              value={propriedade.prop_sigl}
              onChangeText={(text) =>
                setPropriedade({ ...propriedade, prop_sigl: text })
              }
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.switchContainer}>
              <TouchableOpacity
                style={[
                  styles.switchButton,
                  propriedade.prop_ativa && styles.switchButtonActive,
                ]}
                onPress={() =>
                  setPropriedade({ ...propriedade, prop_ativa: true })
                }>
                <Text
                  style={[
                    styles.switchButtonText,
                    propriedade.prop_ativa && styles.switchButtonTextActive,
                  ]}>
                  Ativa
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.switchButton,
                  !propriedade.prop_ativa && styles.switchButtonActive,
                ]}
                onPress={() =>
                  setPropriedade({ ...propriedade, prop_ativa: false })
                }>
                <Text
                  style={[
                    styles.switchButtonText,
                    !propriedade.prop_ativa && styles.switchButtonTextActive,
                  ]}>
                  Inativa
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleVoltar}>
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.buttonDisabled]}
            onPress={salvarPropriedade}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {isEdit ? 'Atualizar' : 'Salvar'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  loadingText: {
    marginTop: 12,
    color: '#fff',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    backgroundColor: '#203952',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#283541',
    borderWidth: 1,
    borderColor: '#345686',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#fff',
  },
  switchContainer: {
    flexDirection: 'row',
    backgroundColor: '#283541',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#345686',
    overflow: 'hidden',
  },
  switchButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  switchButtonActive: {
    backgroundColor: '#345686',
  },
  switchButtonText: {
    color: '#aaa',
    fontSize: 16,
    fontWeight: '500',
  },
  switchButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#d63633',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#345686',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
})
