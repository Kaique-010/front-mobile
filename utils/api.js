import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const BASE_URL = "http://192.168.0.13:8000";

// 🔁 Tenta renovar o access token
const refreshToken = async () => {
  const refresh = await AsyncStorage.getItem("refresh");
  if (!refresh) throw new Error("Refresh token não encontrado");

  try {
    const response = await axios.post(`${BASE_URL}/api/auth/token/refresh/`, {
      refresh,
    });

    const newAccess = response.data.access;
    await AsyncStorage.setItem("access", newAccess);
    return newAccess;
  } catch (error) {
    console.log(
      "❌ Erro ao tentar renovar token:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// 🌐 Requisição com verificação e renovação de token automática
export const apiFetch = async (
  endpoint,
  method = "get",
  data = null,
  params = null
) => {
  let token = await AsyncStorage.getItem("access");

  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      ...(data && { data }),
      ...(params && { params }),
    };

    return await axios(config);
  } catch (error) {
    // Se token expirou, tenta renovar
    if (error.response?.status === 401) {
      console.log("🔄 Token expirado, tentando renovar...");

      try {
        token = await refreshToken();

        const retryConfig = {
          method,
          url: `${BASE_URL}${endpoint}`,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          ...(data && { data }),
          ...(params && { params }),
        };

        return await axios(retryConfig);
      } catch (refreshError) {
        console.log("🚫 Não foi possível renovar o token. Logout necessário.");
        throw refreshError;
      }
    }

    throw error;
  }
};

// 📦 Métodos simplificados
export const apiGet = async (endpoint, params = {}) => {
  const response = await apiFetch(endpoint, "get", null, params);
  return response.data;
};

export const apiPost = async (endpoint, data) => {
  const response = await apiFetch(endpoint, "post", data);
  return response.data;
};

export const apiPut = async (endpoint, data) => {
  const response = await apiFetch(endpoint, "put", data);
  return response.data;
};

export const apiDelete = async (endpoint) => {
  const response = await apiFetch(endpoint, "delete");
  return response.data;
};

// 🔧 Versões com empresa/filial embutidas (quando aplicável)
const addContexto = async (obj = {}) => {
  const empresa = await AsyncStorage.getItem("empresa");
  const filial = await AsyncStorage.getItem("filial");
  return {
    ...obj,
    ...(empresa && { empresa_id: empresa }),
    ...(filial && { filial_id: filial }),
  };
};

export const apiGetComContexto = async (endpoint, params = {}) => {
  const paramsComContexto = await addContexto(params);
  const response = await apiFetch(endpoint, "get", null, paramsComContexto);
  return response.data;
};

export const apiPostComContexto = async (endpoint, data = {}) => {
  const dataComContexto = await addContexto(data);
  const response = await apiFetch(endpoint, "post", dataComContexto);
  return response.data;
};

export const apiPutComContexto = async (endpoint, data = {}) => {
  const dataComContexto = await addContexto(data);
  const response = await apiFetch(endpoint, "put", dataComContexto);
  return response.data;
};

export const apiDeleteComContexto = async (endpoint) => {
  // DELETE normalmente não envia corpo, então só usamos params se precisar
  const paramsComContexto = await addContexto();
  const response = await apiFetch(endpoint, "delete", null, paramsComContexto);
  return response.data;
};
