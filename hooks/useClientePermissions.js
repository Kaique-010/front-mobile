import { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const useClientePermissions = () => {
  const [permissions, setPermissions] = useState({
    canViewPedidos: true,
    canViewOrcamentos: true,
    canViewOrdensServico: true,
    canCreatePedidos: false,
    canEditProfile: true,
    canViewFinanceiro: false,
    canDownloadDocuments: true
  })
  const [userType, setUserType] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPermissions()
  }, [])

  const loadPermissions = async () => {
    try {
      const storedUserType = await AsyncStorage.getItem('userType')
      const clienteData = await AsyncStorage.getItem('clienteData')
      
      setUserType(storedUserType)
      
      if (storedUserType === 'cliente') {
        // Permissões específicas para clientes
        const cliente = clienteData ? JSON.parse(clienteData) : null
        
        setPermissions({
          canViewPedidos: true,
          canViewOrcamentos: true,
          canViewOrdensServico: true,
          canCreatePedidos: cliente?.tipo === 'premium', // Apenas clientes premium podem criar pedidos
          canEditProfile: true,
          canViewFinanceiro: cliente?.tipo === 'premium', // Apenas clientes premium veem financeiro
          canDownloadDocuments: true
        })
      } else {
        // Permissões padrão para funcionários
        setPermissions({
          canViewPedidos: true,
          canViewOrcamentos: true,
          canViewOrdensServico: true,
          canCreatePedidos: true,
          canEditProfile: true,
          canViewFinanceiro: true,
          canDownloadDocuments: true
        })
      }
    } catch (error) {
      console.error('Erro ao carregar permissões:', error)
    } finally {
      setLoading(false)
    }
  }

  const hasPermission = (permission) => {
    return permissions[permission] || false
  }

  const isCliente = () => {
    return userType === 'cliente'
  }

  const isFuncionario = () => {
    return userType === 'funcionario'
  }

  return {
    permissions,
    hasPermission,
    isCliente,
    isFuncionario,
    loading,
    userType
  }
}

export default useClientePermissions