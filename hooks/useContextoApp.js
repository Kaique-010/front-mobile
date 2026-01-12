import { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function useContextoApp() {
  const [contexto, setContexto] = useState({
    usuarioId: null,
    username: null,
    empresaId: null,
    filialId: null,
    carregando: true,
  })
  const [modulos, setModulos] = useState([])

  useEffect(() => {
    const carregar = async () => {
      try {
        const [usuarioRaw, empresaId, filialId, modulosRaw, usernameRaw] =
          await Promise.all([
            AsyncStorage.getItem('usuario'),
            AsyncStorage.getItem('empresaId'),
            AsyncStorage.getItem('filialId'),
            AsyncStorage.getItem('modulos'),
            AsyncStorage.getItem('username'),
          ])

        const usuarioObj = usuarioRaw ? JSON.parse(usuarioRaw) : null
        const usuarioId = usuarioObj?.usuario_id ?? null
        // Prioriza username salvo diretamente, depois tenta pegar do objeto usuario
        const usuarioNome =
          usernameRaw ||
          usuarioObj?.username ||
          usuarioObj?.usuario_nome ||
          null
        const modulosArray = modulosRaw ? JSON.parse(modulosRaw) : []

        setContexto({
          usuarioId,
          username: usuarioNome,
          empresaId,
          filialId,
          carregando: false,
        })
        setModulos(modulosArray)
      } catch (err) {
        console.error('❌ Erro ao carregar contexto do app:', err)
        setContexto((prev) => ({ ...prev, carregando: false }))
      }
    }

    carregar()
  }, [])

  const hasModulo = (mod) => {
    if (!modulos || !Array.isArray(modulos)) {
      return false
    }

    if (modulos.length > 0 && typeof modulos[0] === 'object') {
      return modulos.some((modulo) => {
        // Verificação mais robusta para o campo ativo
        const isAtivo =
          modulo.ativo === true ||
          modulo.ativo === 'true' ||
          modulo.ativo === 1 ||
          modulo.ativo === undefined
        // Verificar por nome, código ou ID do módulo
        return (
          (modulo.modu_nome === mod ||
            modulo.nome === mod ||
            modulo.modu_codi === mod) &&
          isAtivo
        )
      })
    }
    return modulos.includes(mod)
  }

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove([
        'usuario',
        'empresaId',
        'filialId',
        'modulos',
      ])
      setContexto({
        usuarioId: null,
        username: null,
        empresaId: null,
        filialId: null,
        carregando: false,
      })
      setModulos([])
    } catch (err) {
      console.error('❌ Erro ao fazer logout:', err)
    }
  }

  return {
    ...contexto,
    hasModulo,
    logout,
  }
}

export { useContextoApp }
