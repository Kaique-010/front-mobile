import React, { useState } from 'react'
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
import { apiPostComContexto } from '../utils/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Toast from 'react-native-toast-message'
import { StyleSheet } from 'react-native'

const AlterarSenhaScreen = ({ navigation }) => {
  const [usuarioname, setUsuarioname] = useState('')
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false)
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false)
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false)

  const validarFormulario = () => {
    if (!usuarioname.trim()) {
      Alert.alert('Erro', 'Nome de usuário é obrigatório')
      return false
    }

    if (!senhaAtual.trim()) {
      Alert.alert('Erro', 'Senha atual é obrigatória')
      return false
    }

    if (!novaSenha.trim()) {
      Alert.alert('Erro', 'Nova senha é obrigatória')
      return false
    }

    if (novaSenha.length < 4) {
      Alert.alert('Erro', 'A nova senha deve ter pelo menos 4 caracteres')
      return false
    }

    if (novaSenha !== confirmarSenha) {
      Alert.alert('Erro', 'A confirmação da senha não confere')
      return false
    }

    if (senhaAtual === novaSenha) {
      Alert.alert('Erro', 'A nova senha deve ser diferente da senha atual')
      return false
    }

    return true
  }

  const alterarSenha = async () => {
    if (!validarFormulario()) return

    setLoading(true)
    try {
      const response = await apiPostComContexto('licencas/alterar-senha/', {
        usuarioname: usuarioname.trim(),
        nova_senha: novaSenha,
        senha_atual: senhaAtual,
      })

      if (response) {
        Toast.show({
          type: 'success',
          text1: 'Sucesso',
          text2: 'Senha alterada com sucesso!',
        })

        // Limpar formulário
        setUsuarioname('')
        setSenhaAtual('')
        setNovaSenha('')
        setConfirmarSenha('')

        // Voltar para a tela anterior após 2 segundos
        setTimeout(() => {
          navigation.goBack()
        }, 2000)
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error)
      const errorMessage =
        error.response?.data?.error || 'Erro interno do servidor'

      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  const preencherUsuarioLogado = async () => {
    try {
      const usuarioData = await AsyncStorage.getItem('usuario')
      if (usuarioData) {
        const usuario = JSON.parse(usuarioData)
        setUsuarioname(usuario.username || '')
      }
    } catch (error) {
      console.error('Erro ao buscar usuário logado:', error)
    }
  }

  React.useEffect(() => {
    preencherUsuarioLogado()
  }, [])

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Icon name="lock" size={48} color="#10a2a7" />
          <Text style={styles.title}>Alterar Senha</Text>
          <Text style={styles.subtitle}>
            Altere a senha de acesso ao sistema
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nome de Usuário</Text>
            <View style={styles.inputWrapper}>
              <Icon
                name="user"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={usuarioname}
                onChangeText={setUsuarioname}
                placeholder="Digite o nome de usuário"
                placeholderTextColor="#666"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Senha Atual</Text>
            <View style={styles.inputWrapper}>
              <Icon
                name="lock"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={senhaAtual}
                onChangeText={setSenhaAtual}
                placeholder="Digite a senha atual"
                placeholderTextColor="#666"
                secureTextEntry={!mostrarSenhaAtual}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setMostrarSenhaAtual(!mostrarSenhaAtual)}
                style={styles.eyeIcon}>
                <Icon
                  name={mostrarSenhaAtual ? 'eye-off' : 'eye'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nova Senha</Text>
            <View style={styles.inputWrapper}>
              <Icon
                name="lock"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={novaSenha}
                onChangeText={setNovaSenha}
                placeholder="Digite a nova senha (mín. 4 caracteres)"
                placeholderTextColor="#666"
                secureTextEntry={!mostrarNovaSenha}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setMostrarNovaSenha(!mostrarNovaSenha)}
                style={styles.eyeIcon}>
                <Icon
                  name={mostrarNovaSenha ? 'eye-off' : 'eye'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirmar Nova Senha</Text>
            <View style={styles.inputWrapper}>
              <Icon
                name="lock"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                placeholder="Confirme a nova senha"
                placeholderTextColor="#666"
                secureTextEntry={!mostrarConfirmarSenha}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                style={styles.eyeIcon}>
                <Icon
                  name={mostrarConfirmarSenha ? 'eye-off' : 'eye'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={alterarSenha}
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
                <Text style={styles.buttonText}>Alterar Senha</Text>
              </>
            )}
          </TouchableOpacity>
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
  button: {
    backgroundColor: '#10a2a7',
    borderRadius: 8,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#666',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})

export default AlterarSenhaScreen
