import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Home() {
  const [user, setUser] = useState(null);
  const [empresaNome, setEmpresaNome] = useState(null);
  const [filialNome, setFilialNome] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        const storedEmpresa = await AsyncStorage.getItem("empresa");
        const storedFilialNome = await AsyncStorage.getItem("filialNome");

        if (storedUser) setUser(JSON.parse(storedUser));
        if (storedEmpresa) setEmpresaNome(storedEmpresa);
        if (storedFilialNome) setFilialNome(storedFilialNome);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00bfff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>
        👋 Bem-vindo, {user?.username || "Usuário"}!
      </Text>
      <View style={styles.card}>
        <Text style={styles.label}>Empresa:</Text>
        <Text style={styles.value}>{empresaNome || "Não selecionada"}</Text>
        <Text style={styles.label}>Filial:</Text>
        <Text style={styles.value}>{filialNome || "Não selecionada"}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
  },
  welcome: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "600",
    marginBottom: 25,
  },
  card: {
    backgroundColor: "#1e1e1e",
    padding: 20,
    borderRadius: 12,
    width: "90%",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  label: {
    fontSize: 16,
    color: "#aaa",
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    color: "#00bfff",
    fontWeight: "bold",
    marginBottom: 12,
  },
});
