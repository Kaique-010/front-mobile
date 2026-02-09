import React, { useState } from 'react'
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native'
import Toast from 'react-native-toast-message'
import { apiPostComContexto } from '../../utils/api'
import { useContextoApp } from '../../hooks/useContextoApp'

const CadastroRapidoOutrosModal = ({ visible, onClose, onSuccess }) => {
  const { empresaId } = useContextoApp()
  const [nome, setNome] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCadastro = async () => {
    if (!nome.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Atenção',
        text2: 'Informe o nome do cliente',
      })
      return
    }

    setLoading(true)
    try {
      // O backend espera: enti_nome, enti_cep, enti_empr
      // Enviamos enti_cep vazio para que o backend use o fallback se disponível
      const payload = {
        enti_nome: nome,
        enti_cep: '',
        enti_empr: empresaId,
      }

      // Endpoint conforme contexto
      const data = await apiPostComContexto(
        'entidades/entidades/cadastro-rapido-outros/',
        payload,
      )

      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Cliente cadastrado com sucesso!',
      })

      if (onSuccess) {
        // data deve conter { enti_clie: ... }
        // Combinamos com o nome que temos no estado
        onSuccess({ ...data, enti_nome: nome })
      }

      // Limpa e fecha
      setNome('')
      onClose()
    } catch (error) {
      console.error('Erro ao cadastrar:', error)
      const msg = error.response?.data?.erro || 'Erro ao realizar cadastro'
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: msg,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Cadastro Rápido - Outros</Text>

              <Text style={styles.label}>Nome do Cliente</Text>
              <TextInput
                style={styles.input}
                value={nome}
                onChangeText={setNome}
                placeholder="Digite o nome do cliente"
                autoCapitalize="words"
              />

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={onClose}
                  disabled={loading}>
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.confirmButton]}
                  onPress={handleCadastro}
                  disabled={loading}>
                  {loading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.confirmButtonText}>Cadastrar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  confirmButton: {
    backgroundColor: '#007bff',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  confirmButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
})

export default CadastroRapidoOutrosModal
