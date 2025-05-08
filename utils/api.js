import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const BASE_URL = "http://192.168.10.55:8000";

// Função para renovar o token
const refreshToken = async () => {
  const refresh = await AsyncStorage.getItem("refresh");
  if (!refresh) throw new Error("Refresh token não encontrado");

  try {
    const response = await axios.post(`${BASE_URL}/api/auth/token/refresh/`, {
      refresh,
    });
    const newAccess = response.data.access;
    await AsyncStorage.setItem("access", newAccess); // Atualiza o token de acesso
    return newAccess;
  } catch (error) {
    console.log(
      "❌ Erro ao renovar token:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Função para obter os cabeçalhos de autenticação
const getAuthHeaders = async () => {
  const empresa = await AsyncStorage.getItem("empresa");
  const filial = await AsyncStorage.getItem("filial");
  const docu = await AsyncStorage.getItem("docu");
  const usuario_id = await AsyncStorage.getItem("usuario_id");
  const username = await AsyncStorage.getItem("username");

  return {
    "X-Empresa": empresa || "",
    "X-Filial": filial || "",
    "X-Docu": docu || "",
    "X-Usuario-Id": usuario_id || "",
    "X-Username": username || "",
  };
};

// Função principal de requisição
const apiFetch = async (
  endpoint,
  method = "get",
  data = null,
  params = null
) => {
  let token = await AsyncStorage.getItem("access");
  const headersExtras = await getAuthHeaders();

  const buildConfig = (tk) => ({
    method,
    url: `${BASE_URL}${endpoint}`,
    headers: {
      Authorization: `Bearer ${tk}`,
      ...headersExtras, // Inclui os cabeçalhos adicionais com user_id e username
    },
    ...(data && { data }),
    ...(params && { params }),
  });

  try {
    const config = buildConfig(token);
    return await axios(config); // Faz a requisição
  } catch (error) {
    if (error.response?.status === 401) {
      console.log("🔄 Token expirado, tentando renovar...");
      try {
        token = await refreshToken();
        const retryConfig = buildConfig(token); // Cria a configuração com o novo token
        return await axios(retryConfig); // Tenta novamente a requisição
      } catch (refreshError) {
        console.log("🚫 Não foi possível renovar o token.");
        throw refreshError;
      }
    }
    throw error; // Lança o erro caso não seja 401 ou outro erro de autenticação
  }
};

// Funções auxiliares para métodos HTTP

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

export const apiDelete = async (endpoint, params = {}) => {
  const response = await apiFetch(endpoint, "delete", null, params);
  return response.data;
};

// Função para adicionar contexto de empresa/filial no corpo da requisição
export const addContexto = async (obj = {}, prefixo = "") => {
  const empresa = await AsyncStorage.getItem("empresa");
  const filial = await AsyncStorage.getItem("filial");
  const usuario_id = await AsyncStorage.getItem("usuario_id");

  return {
    ...obj,
    ...(empresa && { [`${prefixo}empr`]: empresa }),
    ...(filial && { [`${prefixo}fili`]: filial }),
    ...(usuario_id && { [`${prefixo}usua`]: usuario_id }),
  };
};

// Funções com contexto (empresa/filial)
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
  const paramsComContexto = await addContexto();
  const response = await apiFetch(endpoint, "delete", null, paramsComContexto);
  return response.data;
};

export const apiPostSemContexto = async (endpoint, data = {}) => {
  const response = await apiFetch(endpoint, "post", data);
  return response.data;
};
