import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { getStoredData } from "../services/storageService";
import { fetchDashboardData } from "../services/apiService";
import SaldosChart from "../components/SaldosChart";
import PedidosChart from "../components/PedidosChart";

export default function Home() {
  const [user, setUser] = useState(null);
  const [empresaNome, setEmpresaNome] = useState(null);
  const [filialNome, setFilialNome] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const stored = await getStoredData();
        setUser(stored.user);
        setEmpresaNome(stored.empresaNome);
        setFilialNome(stored.filialNome);

        if (stored.user && stored.empresaNome && stored.filialNome) {
          const dashboard = await fetchDashboardData();
          setDashboardData(dashboard);
        } else {
          console.warn(
            "⚠️ Empresa ou Filial não encontrados. Dashboard não carregado."
          );
          setDashboardData(null);
        }
      } catch (err) {
        console.error("❌ Erro ao carregar dados:", err);
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

  const chartConfig = {
    backgroundGradientFrom: "#121212",
    backgroundGradientTo: "#121212",
    color: (opacity = 1) => `rgba(0, 191, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#121212" }}
      contentContainerStyle={styles.container}
    >
      <Text style={styles.welcome}>
        ✔️ Bem-vindo, {user?.username || "Usuário"}!
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Empresa:</Text>
        <Text style={styles.value}>{empresaNome || "Não selecionada"}</Text>
        <Text style={styles.label}>Filial:</Text>
        <Text style={styles.value}>{filialNome || "Não selecionada"}</Text>
      </View>

      {dashboardData ? (
        <>
          <Text style={styles.chartTitle}>Saldos de Produtos</Text>
          <SaldosChart
            data={dashboardData.saldos_produto || []}
            chartConfig={chartConfig}
          />

          <Text style={styles.chartTitle}>Pedidos por Cliente</Text>
          <PedidosChart
            data={dashboardData.pedidos_por_cliente || []}
            chartConfig={chartConfig}
          />
        </>
      ) : (
        <Text style={styles.noDataText}>
          📊 Sem dados de dashboard disponíveis.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
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
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#1e1e1e",
    padding: 10,
    borderRadius: 12,
    width: "100%",
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    color: "#aaa",
    marginBottom: 4,
  },
  value: {
    fontSize: 13,
    color: "#00bfff",
    fontWeight: "bold",
    marginBottom: 12,
  },
  chartTitle: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 10,
    alignSelf: "flex-start",
  },
  noDataText: {
    fontSize: 14,
    color: "#aaa",
    marginTop: 20,
    textAlign: "center",
  },
});
