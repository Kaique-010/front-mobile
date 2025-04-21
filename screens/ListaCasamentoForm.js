import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import Toast from "react-native-toast-message";
import axios from "axios";

export default function ListaCasamentoForm({ route, navigation }) {
  const { entidade } = route.params || {};
  const [data, setData] = useState("");
  const [salvando, setSalvando] = useState(false);

  const salvarLista = async () => {
    if (!data || !entidade) {
      Toast.show({
        type: "error",
        text1: "Campos obrigatórios",
        text2: "Preencha a data e selecione uma entidade.",
      });
      return;
    }

    setSalvando(true);
    try {
      const payload = {
        list_empr: 1, // ajustar se necessário
        list_fili: 1, // ajustar se necessário
        list_clie: entidade.enti_clie,
        list_data: data,
        list_stat: "0",
      };

      await axios.post(
        "http://192.168.0.13:8000/api/listas-casamento/",
        payload
      );

      Toast.show({
        type: "success",
        text1: "Lista criada com sucesso!",
      });

      navigation.navigate("ListaCasamento", {
        mensagemSucesso: "Lista de casamento criada.",
      });
    } catch (error) {
      console.error(
        "❌ Erro ao salvar lista:",
        error.response?.data || error.message
      );
      Toast.show({
        type: "error",
        text1: "Erro ao salvar",
        text2: "Verifique os dados e tente novamente.",
      });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Cliente:</Text>
      <Text style={styles.valor}>{entidade?.enti_nome}</Text>

      <Text style={styles.label}>Data da Lista:</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        value={data}
        onChangeText={setData}
      />

      <TouchableOpacity
        style={styles.botao}
        onPress={salvarLista}
        disabled={salvando}
      >
        {salvando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.botaoTexto}>Salvar Lista</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  label: { fontSize: 16, marginBottom: 5 },
  valor: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
  botao: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  botaoTexto: { color: "#fff", fontWeight: "bold" },
});
