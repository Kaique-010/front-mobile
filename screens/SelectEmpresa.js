// SelectEmpresa.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { BASE_URL } from "../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from "../styles/loginStyles";

export default function SelectEmpresa({ navigation }) {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmpresa, setSelectedEmpresa] = useState(null);

  useEffect(() => {
    async function fetchEmpresas() {
      try {
        const accessToken = await AsyncStorage.getItem("access");

        if (!accessToken) {
          console.error("[ERROR] Token de acesso não encontrado.");
          return;
        }

        const response = await axios.get(
          `${BASE_URL}/api/auth/user-empresas/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setEmpresas(response.data);
      } catch (error) {
        console.error("Erro ao carregar empresas:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchEmpresas();
  }, []);

  const handleSelectEmpresa = async (empresaId) => {
    setSelectedEmpresa(empresaId);

    try {
      await AsyncStorage.setItem("empresaId", empresaId.toString());
      console.log("[STORAGE] Empresa salva:", empresaId);

      // Redireciona para a tela de seleção de filial
      navigation.navigate("SelectFilial", { empresaId });
    } catch (error) {
      console.error("Erro ao salvar empresa:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Selecione a Empresa</Text>
      <FlatList
        data={empresas}
        keyExtractor={(item) => item.empr_codi.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleSelectEmpresa(item.empr_codi)}
            style={styles.button}
          >
            <Text style={styles.buttonText}>{item.empr_nome}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
