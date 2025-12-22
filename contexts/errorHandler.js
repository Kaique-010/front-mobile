import { Alert } from 'react-native'
import Toast from 'react-native-toast-message'

/**
 * Trata erros de requisições API de forma padronizada.
 * Extrai a mensagem de erro da resposta (se houver) e exibe Toast e Alert.
 *
 * @param {any} error - O objeto de erro capturado no catch
 * @param {string} titulo - Título para o erro (padrão: 'Erro')
 * @returns {string} A mensagem de erro extraída
 */
export const tratarErroApi = (error, titulo = 'Erro') => {
  console.error(`❌ ${titulo}:`, error)

  let mensagemErro = error?.message || 'Ocorreu um erro inesperado.'

  // Tenta extrair mensagem estruturada do backend (Django REST / Custom)
  if (error?.response?.data) {
    const data = error.response.data

    if (data.detail) {
      mensagemErro = data.detail
    } else if (data.mensagem) {
      mensagemErro = data.mensagem
    } else if (data.error) {
      mensagemErro = data.error
    } else if (typeof data === 'string') {
      mensagemErro = data
    }
    // Caso seja um objeto de erro de validação (campo: [erros])
    else if (typeof data === 'object') {
      // Pega o primeiro erro encontrado
      const chaves = Object.keys(data)
      if (chaves.length > 0) {
        const primeiraChave = chaves[0]
        const erroCampo = data[primeiraChave]
        if (Array.isArray(erroCampo)) {
          mensagemErro = `${primeiraChave}: ${erroCampo[0]}`
        } else {
          mensagemErro = `${primeiraChave}: ${erroCampo}`
        }
      }
    }
  }

  Toast.show({
    type: 'error',
    text1: titulo,
    text2: mensagemErro,
  })

  Alert.alert(titulo, mensagemErro)

  return mensagemErro
}
