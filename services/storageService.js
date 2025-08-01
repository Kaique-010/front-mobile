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
  }
}
