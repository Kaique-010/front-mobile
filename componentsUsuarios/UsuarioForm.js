import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import Icon from 'react-native-vector-icons/Feather'
import { apiPostComContexto, apiPutComContexto } from '../utils/api'
import Toast from 'react-native-toast-message'
import { StyleSheet } from 'react-native'

const UsuarioForm = ({ navigation, route }) => {
  const { usuario } = route.params || {}
  const isEditing = !!usuario

  const [usuarioNome, setUsuarioNome] = useState('')
  const [password, setPassword] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [mostrarConfirmarPassword, setMostrarConfirmarPassword] = useState(false)

  const validarFormulario = () => {
    if (!usuarioNome.trim()) {
      Alert.alert('Erro', 'Nome de usuário é obrigatório')
      return false
    }

    if (usuarioNome.trim().length < 3) {
      Alert.alert('Erro', 'Nome de usuário deve ter pelo menos 3 caracteres')
      return false
    }

    if (!isEditing) {
      if (!password.trim()) {
        Alert.alert('Erro', 'Senha é obrigatória')
        return false
      }

      if (password.length < 4) {
        Alert.alert('Erro', 'A senha deve ter pelo menos 4 caracteres')
        return false
      }

      if (password !== confirmarPassword) {
        Alert.alert('Erro', 'A confirmação da senha não confere')
        return false
      }
    } else {
      // Se está editando e preencheu senha, deve confirmar
      if (password && password !== confirmarPassword) {
        Alert.alert('Erro', 'A confirmação da senha não confere')
        return false
      }

      if (password && password.length < 4) {
        Alert.alert('Erro', 'A senha deve ter pelo menos 4 caracteres')
        return false
      }
    }

    return true
  }

  const salvarUsuario = async () => {
    if (!validarFormulario()) return

    setLoading(true)
    try {
      const dados = {
        usua_nome: usuarioNome.trim(),
      }

      // Só inclui password se foi preenchido
      if (password) {
        dados.password = password
      }

      let response
      if (isEditing) {
        response = await apiPutComContexto(`licencas/usuarios/${usuario.usua_codi}/`, dados)
      } else {
        response = await apiPostComContexto('licencas/usuarios/', dados)
      }

      if (response) {
        Toast.show({
          type: 'success',
          text1: 'Sucesso',
          text2: isEditing ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!',
        })

        // Voltar para a lista após 1.5 segundos
        setTimeout(() => {
          navigation.goBack()
        }, 1500)
      }
    } catch (error) {
      console.error('Erro ao salvar usuário:', error)
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.usua_nome?.[0] ||
                          'Erro interno do servidor'

      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isEditing && usuario) {
      setUsuarioNome(usuario.usua_nome || '')
    }
  }, [isEditing, usuario])

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Icon name="user-plus" size={48} color="#10a2a7" />
          <Text style={styles.title}>
            {isEditing ? 'Editar Usuário' : 'Novo Usuário'}
          </Text>
          <Text style={styles.subtitle}>
            {isEditing 
              ? 'Altere os dados do usuário' 
              : 'Preencha os dados para criar um novo usuário'
            }
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nome de Usuário *</Text>
            <View style={styles.inputWrapper}>
              <Icon
                name="user"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={usuarioNome}
                onChangeText={setUsuarioNome}
                placeholder="Digite o nome de usuário"
                placeholderTextColor="#666"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              {isEditing ? 'Nova Senha (deixe vazio para manter)' : 'Senha *'}
            </Text>
            <View style={styles.inputWrapper}>
              <Icon
                name="lock"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder={isEditing ? "Digite nova senha (opcional)" : "Digite a senha (mín. 4 caracteres)"}
                placeholderTextColor="#666"
                secureTextEntry={!mostrarPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setMostrarPassword(!mostrarPassword)}
                style={styles.eyeIcon}>
                <Icon
                  name={mostrarPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              {isEditing ? 'Confirmar Nova Senha' : 'Confirmar Senha *'}
            </Text>
            <View style={styles.inputWrapper}>
              <Icon
                name="lock"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={confirmarPassword}
                onChangeText={setConfirmarPassword}
                placeholder="Confirme a senha"
                placeholderTextColor="#666"
                secureTextEntry={!mostrarConfirmarPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setMostrarConfirmarPassword(!mostrarConfirmarPassword)}
                style={styles.eyeIcon}>
                <Icon
                  name={mostrarConfirmarPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          {isEditing && (
            <View style={styles.infoContainer}>
              <Icon name="info" size={16} color="#10a2a7" />
              <Text style={styles.infoText}>
                Código do usuário: {usuario?.usua_codi}
              </Text>
            </View>
          )}

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}>
              <Icon name="x" size={20} color="#666" style={styles.buttonIcon} />
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, loading && styles.buttonDisabled]}
              onPress={salvarUsuario}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Icon
                    name="check"
                    size={20}
                    color="#fff"
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.saveButtonText}>
                    {isEditing ? 'Atualizar' : 'Criar'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#16213e',
    borderRadius: 10,
    padding: 20,
    elevation: 3,
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a2f3d',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  inputIcon: {
    marginLeft: 12,
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#fff',
    fontSize: 16,
    paddingRight: 12,
  },
  eyeIcon: {
    padding: 12,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a2f3d',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  infoText: {
    color: '#10a2a7',
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#333',
    borderRadius: 8,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#10a2a7',
    borderRadius: 8,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#666',
  },
  buttonIcon: {
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})

export default UsuarioForm