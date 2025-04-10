// screens/ProdutoFormScreen.js
import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import axios from "axios";
import { BASE_URL } from "../utils/api";

export default function ProdutoFormScreen({ route, navigation }) {
  const produto = route.params?.produto;

  const [nome, setNome] = useState(produto?.prod_nome || "");
  const [unidade, setUnidade] = useState(produto?.prod_unme || "");
  const [ncm, setNcm] = useState(produto?.prod_ncm || "");

  const salvar = async () => {
    const data = {
      prod_nome: nome,
      prod_unme: unidade,
      prod_ncm: ncm,
      prod_empr: 1,
    };

    try {
      if (produto?.prod_codi) {
        // Atualizar produto existente
        await axios.put(`${BASE_URL}/api/produtos/${produto.prod_codi}/`, data);
        Alert.alert("Sucesso", "Produto atualizado com sucesso!");
      } else {
        // Criar novo produto
        const response = await axios.post(`${BASE_URL}/api/produtos/`, data);
        const novoCodigo = response.data.prod_codi;
        Alert.alert("Criado", `Produto criado com código: ${novoCodigo}`);
      }
      navigation.goBack();
    } catch (error) {
      console.error(
        "❌ Erro ao salvar produto:",
        error.response?.data || error.message
      );
      Alert.alert("Erro", "Não foi possível salvar o produto.");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Nome do Produto"
        value={nome}
        onChangeText={setNome}
        style={styles.input}
      />
      <TextInput
        placeholder="Unidade de Medida"
        value={unidade}
        onChangeText={setUnidade}
        style={styles.input}
      />
      <TextInput
        placeholder="NCM"
        value={ncm}
        onChangeText={setNcm}
        style={styles.input}
      />
      <TouchableOpacity onPress={salvar} style={styles.button}>
        <Text style={styles.buttonText}>Salvar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 12,
    padding: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});
