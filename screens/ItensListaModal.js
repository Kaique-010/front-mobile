import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, Text, Alert, FlatList } from "react-native";
import { Button } from "react-native-paper";
import BuscaProdutoInput from "../components/BuscaProdutosInput";
import ProdutosSelecionados from "../components/ProdutosSelecionados";
import useContextoApp from "../hooks/useContextoApp";

export default function ItensListaModal({ route }) {
  const { listaId, clienteId } = route.params;
  const { usuarioId, empresaId, filialId, carregando } = useContextoApp();

  const [selecionados, setSelecionados] = useState([]);
  const [itensSalvos, setItensSalvos] = useState([]);
  const [salvando, setSalvando] = useState(false);

  // Carregar os itens da lista especificada
  const carregarItensPorLista = async () => {
    try {
      const response = await fetch(
        `http://192.168.0.13:8000/api/itens-lista-casamento/?item_list=${listaId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erro na resposta da API: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Itens carregados da lista: ", data);

      // Filtra apenas os itens com o listaId correto
      const itensFiltrados = data.filter((item) => item.item_list === listaId);

      // Atualiza o estado com os itens filtrados pela lista
      setItensSalvos(itensFiltrados);
    } catch (err) {
      console.error("Erro ao carregar itens:", err.message);
    }
  };

  // Quando o listaId mudar, recarregar os itens
  useEffect(() => {
    carregarItensPorLista();
  }, [listaId]);

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
      setSalvando(true);

      const payload = selecionados.map((produto) => ({
        item_empr: empresaId,
        item_fili: filialId,
        item_list: listaId,
        item_prod: String(produto.prod_codi),
        item_fina: false,
        item_clie: clienteId,
        item_pedi: 0,
        item_usua: usuarioId,
      }));

      const response = await fetch(
        "http://192.168.0.13:8000/api/itens-lista-casamento/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`Erro na resposta da API: ${response.statusText}`);
      }

      await response.json();
      alert("Itens salvos com sucesso!");
      setSelecionados([]); // Limpar itens selecionados após salvar
      carregarItensPorLista(); // Recarregar os itens da lista após salvar
    } catch (err) {
      console.error("❌ Erro ao salvar itens:", err.message);
      Alert.alert("Erro", `Detalhes do erro: ${err.message}`);
    } finally {
      setSalvando(false);
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
        disabled={selecionados.length === 0 || salvando}
        loading={salvando}
        style={{ marginTop: 16 }}
      >
        Salvar Itens
      </Button>

      {itensSalvos.length > 0 && (
        <View style={{ marginTop: 24 }}>
          <Text style={{ fontWeight: "bold", marginBottom: 8 }}>
            Itens já adicionados à lista:
          </Text>
          <FlatList
            data={itensSalvos}
            keyExtractor={(item) => `${item.item_prod}-${item.item_item}`} // Garantir chave única
            renderItem={({ item }) => (
              <Text style={{ marginBottom: 4 }}>
                • Produto: {item.produto_nome} (ID: {item.item_prod})
              </Text>
            )}
          />
        </View>
      )}
    </View>
  );
}
