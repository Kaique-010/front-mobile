import AsyncStorage from "@react-native-async-storage/async-storage";

export const getStoredData = async () => {
  const user = await AsyncStorage.getItem("user");
  const empresaNome = await AsyncStorage.getItem("empresaNome");
  const filialNome = await AsyncStorage.getItem("filialNome");

  return {
    user: user ? JSON.parse(user) : null,
    empresaNome,
    filialNome,
  };
};
