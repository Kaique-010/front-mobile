import AsyncStorage from '@react-native-async-storage/async-storage'

export const getStoredData = async () => {
  const usuario = await AsyncStorage.getItem('usuario')
  const empresaNome = await AsyncStorage.getItem('empresaNome')
  const empresaId = await AsyncStorage.getItem('empresaId')
  const filialNome = await AsyncStorage.getItem('filialNome')
  const filialId = await AsyncStorage.getItem('filialId')
  const docu = await AsyncStorage.getItem('docu')
  const slug = await AsyncStorage.getItem('slug')
  const user = await AsyncStorage.getItem('user')
  const token = await AsyncStorage.getItem('access')
  const refreshToken = await AsyncStorage.getItem('refresh')

  // Campos específicos do cliente
  const userType = await AsyncStorage.getItem('userType')
  const cliente_id = await AsyncStorage.getItem('cliente_id')
  const cliente_nome = await AsyncStorage.getItem('cliente_nome')
  const documento = await AsyncStorage.getItem('documento')
  const usuario_cliente = await AsyncStorage.getItem('usuario_cliente')

  return {
    usuario: usuario ? JSON.parse(usuario) : null,
    empresaNome,
    empresaId: empresaId ? parseInt(empresaId, 10) : null,
    filialNome,
    filialId: filialId ? parseInt(filialId, 10) : null,
    docu,
    slug,
    user: user ? JSON.parse(user) : null,
    accessToken: token,
    refreshToken: refreshToken,
    access: token, // ✅ ADICIONAR para compatibilidade
    refresh: refreshToken, // ✅ ADICIONAR para compatibilidade

    // Dados do cliente - ✅ CORRIGIR conversão
    userType,
    cliente_id: cliente_id ? parseInt(cliente_id, 10) : null, // ✅ CORRIGIDO
    cliente_nome,
    documento,
    usuario_cliente,
  }
}
