import AsyncStorage from '@react-native-async-storage/async-storage'

export const getStoredData = async () => {
  const usuario = await AsyncStorage.getItem('usuario')
  const empresaNome = await AsyncStorage.getItem('empresaNome')
  const empresaId = await AsyncStorage.getItem('empresaId')
  const filialNome = await AsyncStorage.getItem('filialNome')
  const filialId = await AsyncStorage.getItem('filialId')

  console.log('Stored usuario:', usuario)
  console.log('Stored empresaNome:', empresaNome)
  console.log('Stored empresaId:', empresaId)
  console.log('Stored filialNome:', filialNome)
  console.log('Stored filialId:', filialId)

  return {
    usuario: usuario ? JSON.parse(usuario) : null,
    empresaNome,
    empresaId: empresaId ? parseInt(empresaId, 10) : null,
    filialNome,
    filialId: filialId ? parseInt(filialId, 10) : null,
  }
}
