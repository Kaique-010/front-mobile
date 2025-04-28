import AsyncStorage from '@react-native-async-storage/async-storage'

export const getStoredData = async () => {
  const user = await AsyncStorage.getItem('user')
  const empresaNome = await AsyncStorage.getItem('empresaNome')
  const filialNome = await AsyncStorage.getItem('filialNome')

  console.log('Stored user:', user)
  console.log('Stored empresaNome:', empresaNome)
  console.log('Stored filialNome:', filialNome)

  return {
    user: user ? JSON.parse(user) : null,
    empresaNome,
    filialNome,
  }
}
