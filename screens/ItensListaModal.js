import React, { useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { Button } from "react-native-paper";
import { apiPostComContexto } from "../utils/api";
import BuscaProdutoInput from "../components/BuscaProdutosInput";
import ProdutosSelecionados from "../components/ProdutosSelecionados";
import useContextoApp from "../hooks/useContextoApp";

export default function ItensListaModal({ route }) {
  const { listaId, clienteId } = route.params;
  const { usuarioId, empresaId, filialId, carregando } = useContextoApp();
  const [selecionados, setSelecionados] = useState([]);

  const adicionarProduto = (produto) => {
    if (!selecionados.find((p) => p.prod_codi === produto.prod_codi)) {
      setSelecionados([...selecionados, produto]);
    }
  };

  const removerProduto = (prod_codi) => {
    setSelecionados(selecionados.filter((p) => p.prod_codi !== prod_codi));
  };

  const salvarItens = async () => {
    if (selecionados.length === 0) {
      alert("Selecione ao menos um produto!");
      return;
    }

    try {
      const payload = selecionados.map((produto) => {
        const item = {
          item_empr: empresaId,
          item_fili: filialId,
          item_list: listaId,
          item_prod: produto.prod_codi,
          item_fina: false,
          item_clie: clienteId,
          item_pedi: 0,
          item_usua: usuarioId,
        };
        console.log("🧩 Produto selecionado:", produto);
        console.log("📦 Item preparado:", item);
        return item;
      });

      console.log("🚀 Payload final a ser enviado:", payload);

      // Chamada à API
      const response = await apiPostComContexto("itens-lista/", payload);

      console.log("🚀 Resposta da API:", response);
      alert("Itens salvos com sucesso!");
      setSelecionados([]);
    } catch (err) {
      console.error(
        "❌ Erro ao salvar itens:",
        err.message,
        err.response?.data
      );
      alert("Erro ao salvar os itens. Verifique o console.");
      Alert.alert(
        "Erro",
        `Falha ao salvar os itens. Detalhes: ${
          err.response?.data?.detail || err.message
        }`
      );
    }
  };

  if (carregando) {
    return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;
  }

  return (
    <View style={{ padding: 16 }}>
      <BuscaProdutoInput onSelect={adicionarProduto} />
      <ProdutosSelecionados
        produtos={selecionados}
        onRemover={removerProduto}
      />
      <Button
        mode="contained"
        onPress={salvarItens}
        disabled={selecionados.length === 0}
        style={{ marginTop: 16 }}
      >
        Salvar Itens
      </Button>
    </View>
  );
}
