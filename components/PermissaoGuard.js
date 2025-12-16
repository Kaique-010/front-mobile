import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { usePermissoes } from '../hooks/usePermissoes'
import { parametrosStyles } from '../Parametros/styles/parametrosStyles'

const PermissaoGuard = ({ 
  children, 
  modulo, 
  tela, 
  operacao, 
  fallback = null,
  showError = true 
}) => {
  const { 
    moduloLiberado, 
    telaLiberada, 
    operacaoLiberada, 
    loading,
    moduloVencido,
    getDataVencimentoModulo
  } = usePermissoes()

  // Se ainda está carregando, mostrar loading
  if (loading) {
    return (
      <View style={parametrosStyles.loadingContainer}>
        <Text style={parametrosStyles.loadingText}>Verificando permissões...</Text>
      </View>
    )
  }

  // Verificar permissão do módulo
  if (modulo && !moduloLiberado(modulo)) {
    if (fallback) return fallback
    
    if (showError) {
      return (
        <View style={parametrosStyles.errorContainer}>
          <Text style={parametrosStyles.errorTitle}>Módulo Bloqueado</Text>
          <Text style={parametrosStyles.errorMessage}>
            O módulo "{modulo}" não está liberado para sua empresa.
          </Text>
          {moduloVencido(modulo) && (
            <Text style={parametrosStyles.errorWarning}>
              ⚠️ Licença vencida em {getDataVencimentoModulo(modulo)?.toLocaleDateString('pt-BR')}
            </Text>
          )}
        </View>
      )
    }
    
    return null
  }

  // Verificar permissão da tela
  if (tela && !telaLiberada(tela)) {
    if (fallback) return fallback
    
    if (showError) {
      return (
        <View style={parametrosStyles.errorContainer}>
          <Text style={parametrosStyles.errorTitle}>Tela Bloqueada</Text>
          <Text style={parametrosStyles.errorMessage}>
            Você não tem permissão para acessar esta tela.
          </Text>
        </View>
      )
    }
    
    return null
  }

  // Verificar permissão da operação
  if (operacao && !operacaoLiberada(tela, operacao)) {
    if (fallback) return fallback
    
    if (showError) {
      return (
        <View style={parametrosStyles.errorContainer}>
          <Text style={parametrosStyles.errorTitle}>Operação Bloqueada</Text>
          <Text style={parametrosStyles.errorMessage}>
            Você não tem permissão para executar esta operação.
          </Text>
        </View>
      )
    }
    
    return null
  }

  // Se passou por todas as verificações, mostrar o conteúdo
  return children
}

// Componente para botões com permissão
export const BotaoComPermissao = ({ 
  children, 
  onPress, 
  modulo, 
  tela, 
  operacao, 
  style,
  disabled = false,
  ...props 
}) => {
  const { 
    moduloLiberado, 
    telaLiberada, 
    operacaoLiberada, 
    loading 
  } = usePermissoes()

  if (loading) {
    return (
      <TouchableOpacity 
        style={[style, parametrosStyles.buttonDisabled]} 
        disabled={true}
        {...props}
      >
        <Text style={parametrosStyles.buttonTextDisabled}>Carregando...</Text>
      </TouchableOpacity>
    )
  }

  // Verificar permissões
  const moduloOk = !modulo || moduloLiberado(modulo)
  const telaOk = !tela || telaLiberada(tela)
  const operacaoOk = !operacao || operacaoLiberada(tela, operacao)

  const temPermissao = moduloOk && telaOk && operacaoOk

  return (
    <TouchableOpacity 
      style={[
        style, 
        (!temPermissao || disabled) && parametrosStyles.buttonDisabled
      ]} 
      onPress={temPermissao && !disabled ? onPress : undefined}
      disabled={!temPermissao || disabled}
      {...props}
    >
      {children}
    </TouchableOpacity>
  )
}

// Componente para campos com permissão
export const CampoComPermissao = ({ 
  children, 
  modulo, 
  tela, 
  operacao, 
  style,
  ...props 
}) => {
  const { 
    moduloLiberado, 
    telaLiberada, 
    operacaoLiberada, 
    loading 
  } = usePermissoes()

  if (loading) {
    return (
      <View style={[style, parametrosStyles.fieldDisabled]}>
        <Text style={parametrosStyles.fieldTextDisabled}>Carregando...</Text>
      </View>
    )
  }

  // Verificar permissões
  const moduloOk = !modulo || moduloLiberado(modulo)
  const telaOk = !tela || telaLiberada(tela)
  const operacaoOk = !operacao || operacaoLiberada(tela, operacao)

  const temPermissao = moduloOk && telaOk && operacaoOk

  if (!temPermissao) {
    return (
      <View style={[style, parametrosStyles.fieldDisabled]}>
        <Text style={parametrosStyles.fieldTextDisabled}>
          Campo bloqueado
        </Text>
      </View>
    )
  }

  return (
    <View style={style} {...props}>
      {children}
    </View>
  )
}

export default PermissaoGuard 