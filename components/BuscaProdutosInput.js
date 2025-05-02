import React, { useState, useEffect } from "react";
import { FlatList, View } from "react-native";
import { TextInput, Card, Snackbar } from "react-native-paper";
import { apiGet } from "../utils/api";

export default function BuscaProdutoInput({ onSelect }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [produtos, setProdutos] = useState([]);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (searchTerm.trim() === "") {
        setProdutos([]);
        return;
      }
      try {
        const data = await apiGet("/api/produtos/", { search: searchTerm });
        setProdutos(data);
      } catch (err) {
        console.log("❌ Erro ao buscar produtos:", err.message);
      }
    }, 500);

    return () => clearTimeout(delay);
  }, [searchTerm]);

  const handleSelecionarProduto = (produto) => {
    onSelect(produto); // adiciona ao pai
    setSearchTerm(""); // limpa busca
    setProdutos([]); // limpa lista
    setSnackbarVisible(true); // mostra feedback
  };

  return (
    <View>
      <TextInput
        label="Buscar produto"
        value={searchTerm}
        onChangeText={setSearchTerm}
        right={<TextInput.Icon icon="magnify" />}
      />

      <FlatList
        data={produtos}
        keyExtractor={(item) => item.prod_codi.toString()}
        renderItem={({ item }) => (
          <Card
            onPress={() => handleSelecionarProduto(item)}
            style={{ marginVertical: 4 }}
          >
            <Card.Title
              title={item.prod_nome}
              subtitle={`Código: ${item.prod_codi} | Saldo: ${item.saldo_estoque}`}
            />
          </Card>
        )}
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={1500}
      >
        Produto adicionado com sucesso!
      </Snackbar>
    </View>
  );
}
