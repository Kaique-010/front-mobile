import Toast from 'react-native-toast-message'

/**
 * Handles API errors by parsing the response and displaying a formatted Toast.
 *
 * @param {Error} error - The error object from the try-catch block (usually AxiosError)
 * @param {string} defaultMessage - Fallback message if error cannot be parsed
 * @param {string} customTitle - Title for the Toast
 */
export const handleApiError = (
  error,
  defaultMessage = 'Ocorreu um erro inesperado',
  customTitle = 'Erro'
) => {
  let message = defaultMessage
  let title = customTitle
  let type = 'error'

  console.log('[handleApiError] Processing error:', error)

  if (error && error.response) {
    const { data, status } = error.response
    console.log('[handleApiError] Response data:', data)

    // Handle 400 Validation Errors (Django Rest Framework)
    if (status === 400 && data) {
      title = 'Erro de Validação'

      if (Array.isArray(data)) {
        // e.g. ["Error message 1", "Error message 2"]
        message = data.join('\n')
      } else if (typeof data === 'object') {
        // e.g. { field_name: ["Error 1"], other_field: ["Error 2"] }
        // or { detail: "Error message" }

        if (
          data.detalhes &&
          Array.isArray(data.detalhes) &&
          data.detalhes.length > 0
        ) {
          message = data.detalhes
            .map((d) => d.message || JSON.stringify(d))
            .join('\n')
        } else if (data.detail && typeof data.detail === 'string') {
          message = data.detail
        } else {
          // Map field errors
          const errorMessages = []
          Object.entries(data).forEach(([key, value]) => {
            // If key is 'non_field_errors', don't show the key name
            const fieldName = key === 'non_field_errors' ? '' : `${key}: `

            let fieldError = ''
            if (Array.isArray(value)) {
              fieldError = value.join(' ')
            } else if (typeof value === 'string') {
              fieldError = value
            } else {
              fieldError = JSON.stringify(value)
            }

            errorMessages.push(`${fieldName}${fieldError}`)
          })

          message = errorMessages.join('\n')
        }
      } else if (typeof data === 'string') {
        message = data
      }
    }
    // Handle 401/403 Permission Errors
    else if (status === 401 || status === 403) {
      title = 'Acesso Negado'
      message =
        data?.detail || 'Você não tem permissão para realizar esta ação.'
    }
    // Handle 500 Server Errors
    else if (status >= 500) {
      title = 'Erro no Servidor'
      message = 'Ocorreu um erro interno. Tente novamente mais tarde.'
      // If in debug mode or specific message passed
      if (data?.detail) {
        message += `\n(${data.detail})`
      }
    }
  } else if (error && error.request) {
    // Network errors (no response received)
    title = 'Sem Conexão'
    message = 'Não foi possível conectar ao servidor. Verifique sua internet.'
  } else {
    // Other errors
    if (typeof error === 'string') {
      message = error
    } else if (error && error.message) {
      message = error.message
    }
    // Se error for null/undefined, mantém a 'message' original (defaultMessage)
  }

  // Ensure message is not too long for Toast
  if (message.length > 300) {
    message = message.substring(0, 300) + '...'
  }

  Toast.show({
    type: type,
    text1: title,
    text2: message,
    visibilityTime: 6000, // Show longer for reading errors
    autoHide: true,
    topOffset: 50,
  })

  return message // Return parsed message in case caller wants to use it
}
