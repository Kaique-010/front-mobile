// src/screens/PedidosForm.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Alert,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
} from "react-native";
import { apiPost, apiPut, apiDelete } from "../utils/api";

const InputField = ({ label, value, onChangeText, ...rest }) => (
  <>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      {...rest}
    />
  </>
);

export default function PedidosForm({ route, navigation }) {
  const pedidos = route.params?.pedidos;

  const [empresa, setEmpresa] = useState(pedidos?.pedi_empr || "");
  const [filial, setFilial] = useState(pedidos?.pedi_fili || "");
  const [numero, setNumero] = useState(pedidos?.pedi_nume || "");
  const [cliente, setCliente] = useState(pedidos?.pedi_forn || "");
  const [date, setDate] = useState(pedidos?.pedi_data || "");
  const [total, setTotal] = useState(pedidos?.pedi_tota || "");
  const [financeiro, setFinanceiro] = useState(pedidos?.pedi_fina || "");
  const [vendedor, setVendedor] = useState(pedidos?.pedi_vend || "");
  const [status, setStatus] = useState(pedidos?.pedi_stat || "");
  const [loading, setLoading] = useState(false);
  const [dots, setDots] = useState("");

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setDots((prev) => (prev.length < 3 ? prev + "." : ""));
      }, 500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const salvar = async () => {
    if (!empresa || !filial || !numero) {
      Alert.alert(
        "Erro",
        "Preencha os campos obrigatórios: Empresa, Filial e Nº Pedido."
      );
      return;
    }

    setLoading(true);

    const data = {
      empresa,
      filial,
      numero,
      cliente,
      date,
      total,
      financeiro,
      vendedor,
      status,
    };

    try {
      if (pedidos?.pedi_nume) {
        await apiPut(`/api/pedidos/${pedidos.pedi_nume}/`, data);
        Alert.alert("Sucesso", "Pedido atualizado com sucesso!");
      } else {
        const response = await apiPost(`/api/pedidos/`, data);
        const novoPedido = response.pedi_nume;
        Alert.alert("Criado", `Pedido criado com código: ${novoPedido}`);
      }
      navigation.goBack();
    } catch (error) {
      console.error(
        "❌ Erro ao salvar pedido:",
        error.response?.data || error.message
      );
      Alert.alert("Erro", "Não foi possível salvar o pedido.");
    } finally {
      setLoading(false);
      setDots("");
    }
  };

  const excluir = () => {
    Alert.alert("Confirmar", "Tem certeza que deseja excluir o pedido?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await apiDelete(`/api/pedidos/${pedidos.pedi_nume}/`);
            Alert.alert("Excluído", "Pedido removido com sucesso.");
            navigation.goBack();
          } catch (error) {
            console.error(
              "❌ Erro ao excluir:",
              error.response?.data || error.message
            );
            Alert.alert("Erro", "Não foi possível excluir o pedido.");
          }
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <InputField
          label="Empresa"
          value={empresa}
          onChangeText={setEmpresa}
          keyboardType="number-pad"
        />
        <InputField label="Filial" value={filial} onChangeText={setFilial} />
        <InputField label="Nº Pedido" value={numero} onChangeText={setNumero} />
        <InputField
          label="Data"
          value={date}
          onChangeText={setDate}
          keyboardType="number-pad"
        />
        <InputField
          label="Financeiro"
          value={financeiro}
          onChangeText={setFinanceiro}
        />
        <InputField
          label="Vendedor"
          value={vendedor}
          onChangeText={setVendedor}
        />
        <InputField label="Cliente" value={cliente} onChangeText={setCliente} />
        <InputField label="Status" value={status} onChangeText={setStatus} />
        <InputField
          label="Total"
          value={total}
          onChangeText={setTotal}
          keyboardType="decimal-pad"
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity
            onPress={salvar}
            style={[styles.button, loading && { opacity: 0.6 }]}
            disabled={loading}
          >
            <View style={styles.rowCenter}>
              <Text style={styles.buttonText}>
                {loading ? `Gravando${dots}` : "Salvar"}
              </Text>
              {loading && (
                <ActivityIndicator
                  size="small"
                  color="#fff"
                  style={{ marginLeft: 8 }}
                />
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.button, styles.cancelButton]}
          >
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>

        {pedidos?.pedi_nume && (
          <TouchableOpacity onPress={excluir} style={styles.deleteButton}>
            <Text style={styles.buttonText}>Excluir</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    padding: 35,
    backgroundColor: "#0B141A",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 12,
    padding: 10,
    fontSize: 16,
    color: "white",
  },
  button: {
    backgroundColor: "#0058A2",
    padding: 12,
    borderRadius: 8,
    width: "48%",
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "red",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#666",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  label: {
    marginBottom: 4,
    fontWeight: "bold",
    fontSize: 14,
    color: "#fff",
  },
  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
});
