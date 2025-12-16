import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  FlatList,
} from 'react-native'
import {
  apiGetComContexto,
  apiPostComContexto,
  apiPutComContexto,
  apiDeleteComContexto,
} from '../utils/api'
import useContextoApp from '../hooks/useContextoApp'
import Toast from 'react-native-toast-message'

const WorkflowConfig = () => {
  const { usuarioId } = useContextoApp()
  const [workflows, setWorkflows] = useState([])
  const [setores, setSetores] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [editando, setEditando] = useState(null)
  const [showSetorOrigem, setShowSetorOrigem] = useState(false)
  const [showSetorDestino, setShowSetorDestino] = useState(false)
  const [buscaSetorOrigem, setBuscaSetorOrigem] = useState('')
  const [buscaSetorDestino, setBuscaSetorDestino] = useState('')
  const [formData, setFormData] = useState({
    wkfl_seto_orig: '',
    wkfl_seto_dest: '',
    wkfl_orde: 1,
    wkfl_ativo: true,
  })

  useEffect(() => {
    carregarWorkflows()
    carregarSetores()
  }, [])

  const carregarWorkflows = async () => {
    try {
      const response = await apiGetComContexto('ordemdeservico/workflow-setor/')
      setWorkflows(response?.results || [])
    } catch (error) {
      console.error('Erro ao carregar workflows:', error)
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível carregar os workflows',
      })
    }
  }

  const carregarSetores = async () => {
    try {
      const response = await apiGetComContexto('ordemdeservico/fase-setor/')
      setSetores(response?.results || [])
    } catch (error) {
      console.error('Erro ao carregar setores:', error)
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível carregar os setores',
      })
    }
  }

  const abrirModal = (workflow = null) => {
    if (workflow) {
      setEditando(workflow)
      const setorOrigem = setores.find(
        (s) => s.osfs_codi === workflow.wkfl_seto_orig
      )
      const setorDestino = setores.find(
        (s) => s.osfs_codi === workflow.wkfl_seto_dest
      )

      setFormData({
        wkfl_seto_orig: workflow.wkfl_seto_orig.toString(),
        wkfl_seto_dest: workflow.wkfl_seto_dest.toString(),
        wkfl_orde: workflow.wkfl_orde,
        wkfl_ativo: workflow.wkfl_ativo,
      })
      setBuscaSetorOrigem(
        setorOrigem
          ? `${setorOrigem.osfs_codi} - ${setorOrigem.osfs_nome}`
          : workflow.wkfl_seto_orig.toString()
      )
      setBuscaSetorDestino(
        setorDestino
          ? `${setorDestino.osfs_codi} - ${setorDestino.osfs_nome}`
          : workflow.wkfl_seto_dest.toString()
      )
    } else {
      setEditando(null)
      setFormData({
        wkfl_seto_orig: '',
        wkfl_seto_dest: '',
        wkfl_orde: 1,
        wkfl_ativo: true,
      })
      setBuscaSetorOrigem('')
      setBuscaSetorDestino('')
    }
    setShowSetorOrigem(false)
    setShowSetorDestino(false)
    setModalVisible(true)
  }

  const fecharModal = () => {
    setModalVisible(false)
    setEditando(null)
    setShowSetorOrigem(false)
    setShowSetorDestino(false)
    setBuscaSetorOrigem('')
    setBuscaSetorDestino('')
    setFormData({
      wkfl_seto_orig: '',
      wkfl_seto_dest: '',
      wkfl_orde: '',
      wkfl_ativo: true,
    })
  }

  const salvarWorkflow = async () => {
    try {
      if (!formData.wkfl_seto_orig || !formData.wkfl_seto_dest) {
        Alert.alert('Erro', 'Selecione os setores de origem e destino')
        return
      }

      const workflowData = {
        wkfl_seto_orig: parseInt(formData.wkfl_seto_orig),
        wkfl_seto_dest: parseInt(formData.wkfl_seto_dest),
        wkfl_orde: formData.wkfl_orde,
        wkfl_ativo: formData.wkfl_ativo,
      }

      if (editando) {
        await apiPutComContexto(
          `ordemdeservico/workflow-setor/${editando.wkfl_codi}/`,
          workflowData
        )
        Alert.alert('Sucesso', 'Workflow atualizado com sucesso!')
      } else {
        await apiPostComContexto('ordemdeservico/workflow-setor/', workflowData)
        Alert.alert('Sucesso', 'Workflow criado com sucesso!')
      }

      fecharModal()
      carregarWorkflows()
    } catch (error) {
      console.error('Erro ao salvar workflow:', error)
      Alert.alert('Erro', 'Erro ao salvar workflow')
    }
  }

  const filtrarSetores = (busca) => {
    if (!busca || busca.length < 2) return []

    return setores
      .filter(
        (setor) =>
          setor.osfs_nome.toLowerCase().includes(busca.toLowerCase()) ||
          setor.osfs_codi.toString().includes(busca)
      )
      .slice(0, 10) // Limita a 10 resultados
  }

  const selecionarSetorOrigem = (setor) => {
    setFormData((prev) => ({
      ...prev,
      wkfl_seto_orig: setor.osfs_codi.toString(),
    }))
    setBuscaSetorOrigem(`${setor.osfs_codi} - ${setor.osfs_nome}`)
    setShowSetorOrigem(false)
  }

  const selecionarSetorDestino = (setor) => {
    setFormData((prev) => ({
      ...prev,
      wkfl_seto_dest: setor.osfs_codi.toString(),
    }))
    setBuscaSetorDestino(`${setor.osfs_codi} - ${setor.osfs_nome}`)
    setShowSetorDestino(false)
  }

  const excluirWorkflow = async (workflow) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja excluir o workflow do Setor ${getNomeSetor(
        workflow.wkfl_seto_orig
      )} para Setor ${getNomeSetor(workflow.wkfl_seto_dest)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiDeleteComContexto(
                `ordemdeservico/workflow-setor/${workflow.wkfl_id}/`
              )
              carregarWorkflows()
              Toast.show({
                type: 'success',
                text1: 'Sucesso',
                text2: 'Workflow excluído com sucesso!',
              })
            } catch (error) {
              console.error('Erro ao excluir workflow:', error)
              Toast.show({
                type: 'error',
                text1: 'Erro',
                text2: 'Não foi possível excluir o workflow',
              })
            }
          },
        },
      ]
    )
  }

  const getNomeSetor = (codigo) => {
    const setor = setores.find((s) => s.osfs_codi === codigo)
    return setor ? setor.osfs_nome : `Setor ${codigo}`
  }

  const renderWorkflowItem = (workflow) => (
    <View key={workflow.wkfl_id} style={styles.workflowItem}>
      <View style={styles.workflowInfo}>
        <Text style={styles.workflowText}>
          {getNomeSetor(workflow.wkfl_seto_orig)} →{' '}
          {getNomeSetor(workflow.wkfl_seto_dest)}
        </Text>
        <Text style={styles.workflowSubtext}>
          Ordem: {workflow.wkfl_orde} |{' '}
          {workflow.wkfl_ativo ? 'Ativo' : 'Inativo'}
        </Text>
      </View>
      <View style={styles.workflowActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => abrirModal(workflow)}>
          <Text style={styles.buttonText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => excluirWorkflow(workflow)}>
          <Text style={styles.buttonText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}> Workflows</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => abrirModal()}>
          <Text style={styles.addButtonText}>+ Novo Workflow</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {workflows.map(renderWorkflowItem)}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editando ? 'Editar Workflow' : 'Novo Workflow'}
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Setor Origem *</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite para buscar setor..."
                placeholderTextColor="#999"
                value={buscaSetorOrigem}
                onChangeText={(text) => {
                  setBuscaSetorOrigem(text)
                  setShowSetorOrigem(text.length >= 2)
                }}
                onFocus={() => setShowSetorOrigem(buscaSetorOrigem.length >= 2)}
              />
              {showSetorOrigem && (
                <View style={styles.dropdown}>
                  <FlatList
                    data={filtrarSetores(buscaSetorOrigem)}
                    keyExtractor={(item) => item.osfs_codi.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.dropdownItem}
                        onPress={() => selecionarSetorOrigem(item)}>
                        <Text style={styles.dropdownText}>
                          {item.osfs_codi} - {item.osfs_nome}
                        </Text>
                      </TouchableOpacity>
                    )}
                    style={styles.dropdownList}
                    nestedScrollEnabled
                  />
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Setor Destino *</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite para buscar setor..."
                placeholderTextColor="#999"
                value={buscaSetorDestino}
                onChangeText={(text) => {
                  setBuscaSetorDestino(text)
                  setShowSetorDestino(text.length >= 2)
                }}
                onFocus={() =>
                  setShowSetorDestino(buscaSetorDestino.length >= 2)
                }
              />
              {showSetorDestino && (
                <View style={styles.dropdown}>
                  <FlatList
                    data={filtrarSetores(buscaSetorDestino)}
                    keyExtractor={(item) => item.osfs_codi.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.dropdownItem}
                        onPress={() => selecionarSetorDestino(item)}>
                        <Text style={styles.dropdownText}>
                          {item.osfs_codi} - {item.osfs_nome}
                        </Text>
                      </TouchableOpacity>
                    )}
                    style={styles.dropdownList}
                    nestedScrollEnabled
                  />
                </View>
              )}
            </View>

            <Text style={styles.label}>Ordem na Sequência:</Text>
            <TextInput
              style={styles.input}
              value={formData.wkfl_orde.toString()}
              onChangeText={(text) =>
                setFormData({ ...formData, wkfl_orde: parseInt(text) || '' })
              }
              placeholder="Ordem na sequência"
              keyboardType="numeric"
            />

            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  formData.wkfl_ativo && styles.checkboxActive,
                ]}
                onPress={() =>
                  setFormData({ ...formData, wkfl_ativo: !formData.wkfl_ativo })
                }>
                <Text style={styles.checkboxText}>
                  {formData.wkfl_ativo ? '✓' : ''}
                </Text>
              </TouchableOpacity>
              <Text style={styles.checkboxLabel}>Ativo</Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={fecharModal}>
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={salvarWorkflow}>
                <Text style={styles.buttonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a2f3d',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#232935',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10a2a7',
  },
  addButton: {
    backgroundColor: '#10a2a7',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  workflowItem: {
    backgroundColor: '#232935',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workflowInfo: {
    flex: 1,
  },
  workflowText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  workflowSubtext: {
    color: '#faebd7',
    opacity: 0.7,
    marginTop: 5,
  },
  workflowActions: {
    flexDirection: 'row',
    gap: 10,
  },
  editButton: {
    backgroundColor: '#10a2a7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
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
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10a2a7',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    color: '#faebd7',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#1a2f3d',
    color: '#fff',
    padding: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#10a2a7',
    position: 'relative',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  inputGroup: {
    marginBottom: 16,
    position: 'relative',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#232935',
    borderWidth: 1,
    borderColor: '#10a2a7',
    borderTopWidth: 0,
    borderRadius: 5,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownList: {
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#10a2a7',
  },
  dropdownText: {
    fontSize: 16,
    color: '#fff',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#10a2a7',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#10a2a7',
  },
  checkboxText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  checkboxLabel: {
    color: '#faebd7',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#10a2a7',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
})

export default WorkflowConfig
