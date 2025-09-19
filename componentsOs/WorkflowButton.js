import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
} from 'react-native'
import { apiGetComContexto, apiPostComContexto } from '../utils/api'
import useContextoApp from '../hooks/useContextoApp'

const WorkflowButton = ({ ordem, onOrdemAtualizada }) => {
  const { usuarioId } = useContextoApp()
  const [proximosSetores, setProximosSetores] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [podeAvancar, setPodeAvancar] = useState(false)

  useEffect(() => {
    verificarPermissoes()
    carregarProximosSetores()
  }, [ordem])

  const verificarPermissoes = () => {
    // Verifica se o usuário pode avançar esta ordem baseado no setor atual
    console.log('Verificando permissões:', {
      ordem: ordem.orde_nume,
      pode_avancar: ordem.pode_avancar,
      proximosSetores: proximosSetores.length,
    })
    setPodeAvancar(ordem.pode_avancar || false)
  }

  const carregarProximosSetores = async () => {
    try {
      const response = await apiGetComContexto(
        `ordemdeservico/ordens/${ordem.orde_nume}/proximos-setores/`
      )
      setProximosSetores(response.proximos_setores || [])
    } catch (error) {
      console.error('Erro ao carregar próximos setores:', error)
    }
  }

  const avancarSetor = async (setorDestino) => {
    try {
      setCarregando(true)

      const response = await apiPostComContexto(
        `ordemdeservico/ordens/${ordem.orde_nume}/avancar-setor/`,
        {
          setor_destino: setorDestino.codigo,
        }
      )

      setModalVisible(false)

      // Verifica se a resposta contém dados válidos
      if (response && (response.success || response.ordem)) {
        Alert.alert('Sucesso', `Ordem avançada para ${setorDestino.nome}`, [
          {
            text: 'OK',
            onPress: () => {
              if (onOrdemAtualizada) {
                // Passa a ordem atualizada ou a resposta completa
                onOrdemAtualizada(response.ordem || response)
              }
            },
          },
        ])
      } else {
        Alert.alert(
          'Processado',
          `Solicitação de avanço para ${setorDestino.nome} foi processada`,
          [{ text: 'OK' }]
        )
      }
    } catch (error) {
      console.error('Erro ao avançar setor:', error)

      // Verifica se o erro é realmente um erro ou se a operação foi bem-sucedida
      if (error.response?.status === 200 || error.response?.data?.success) {
        Alert.alert('Sucesso', `Ordem avançada para ${setorDestino.nome}`, [
          { text: 'OK' },
        ])
      } else {
        Alert.alert(
          'Erro',
          error.response?.data?.error ||
            error.message ||
            'Não foi possível avançar a ordem'
        )
      }
    } finally {
      setCarregando(false)
    }
  }

  const confirmarAvanco = (setor) => {
    Alert.alert(
      'Confirmar Avanço',
      `Deseja avançar a ordem para ${setor.nome}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => avancarSetor(setor),
        },
      ]
    )
  }

  const renderSetorOption = (setor) => (
    <TouchableOpacity
      key={setor.codigo}
      style={styles.setorOption}
      onPress={() => confirmarAvanco(setor)}
      disabled={carregando}>
      <View style={styles.setorInfo}>
        <Text style={styles.setorNome}>{setor.nome}</Text>
        <Text style={styles.setorCodigo}>Código: {setor.codigo}</Text>
        <Text style={styles.setorOrdem}>Ordem: {setor.ordem}</Text>
      </View>
      <View style={styles.setorArrow}>
        <Text style={styles.arrowText}>→</Text>
      </View>
    </TouchableOpacity>
  )

  if (!podeAvancar || proximosSetores.length === 0) {
    return null
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.workflowButton}
        onPress={() => setModalVisible(true)}
        disabled={carregando}>
        <Text style={styles.buttonText}>
          {carregando ? 'Processando...' : 'Avançar OS'}
        </Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Próximos Setores</Text>
            <Text style={styles.modalSubtitle}>
              Selecione para onde avançar a OS #{ordem.orde_nume}
            </Text>

            <ScrollView style={styles.setoresList}>
              {proximosSetores.map(renderSetorOption)}
            </ScrollView>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  workflowButton: {
    backgroundColor: '#10a2a7',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#232935',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10a2a7',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#faebd7',
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.8,
  },
  setoresList: {
    maxHeight: 300,
  },
  setorOption: {
    backgroundColor: '#1a2f3d',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#10a2a7',
  },
  setorInfo: {
    flex: 1,
  },
  setorNome: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  setorCodigo: {
    color: '#faebd7',
    fontSize: 12,
    opacity: 0.7,
  },
  setorOrdem: {
    color: '#10a2a7',
    fontSize: 12,
    marginTop: 2,
  },
  setorArrow: {
    marginLeft: 10,
  },
  arrowText: {
    color: '#10a2a7',
    fontSize: 20,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
})

export default WorkflowButton
