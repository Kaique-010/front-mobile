import React, { createContext, useContext } from 'react'
import { useNotificacoes as useNotificacoesHook } from './useNotificacoes'

const NotificacaoContext = createContext()

export const NotificacaoProvider = ({ children, config = {} }) => {
  // Recebe configuração do Provider
  const notificacoes = useNotificacoesHook(config)
  
  return (
    <NotificacaoContext.Provider value={notificacoes}>
      {children}
    </NotificacaoContext.Provider>
  )
}

export const useNotificacoes = () => {
  const context = useContext(NotificacaoContext)
  if (!context) {
    throw new Error('useNotificacoes deve ser usado dentro de NotificacaoProvider')
  }
  return context
}
