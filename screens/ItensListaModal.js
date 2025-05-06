import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  View,
  ActivityIndicator,
  Text,
  Alert,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { apiGet } from "../utils/api";
import { useNavigation } from "@react-navigation/native";
import { Button } from "react-native-paper";
import BuscaProdutoInput from "../components/BuscaProdutosInput";
import ProdutosSelecionados from "../components/ProdutosSelecionados";
import useContextoApp from "../hooks/useContextoApp";
import LeitorCodigoBarras from "../components/Leitor";

export default function ItensListaModal({ route }) {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Editar Itens",
      headerShown: true,
    });
  }, [navigation]);

  const { listaId, clienteId } = route.params;
  const { usuarioId, empresaId, filialId, carregando } = useContextoApp();

  const [selecionados, setSelecionados] = useState([]);
  const [itensSalvos, setItensSalvos] = useState([]);
  const [remocoesPendentes, setRemocoesPendentes] = useState([]);
  const [salvando, setSalvando] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const carregarItensPorLista = async () => {
    try {
      const response = await fetch(
        `http://192.168.0.13:8000/api/itens-lista-casamento/?item_list=${listaId}`
      );
      const data = await response.json();
      const filtrados = data.filter((item) => item.item_list === listaId);
      setItensSalvos(filtrados);
    } catch (err) {
      console.error("Erro ao carregar itens:", err.message);
    }
  };

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

  const marcarParaRemocao = (itemId) => {
    setRemocoesPendentes((prev) => [...prev, itemId]);
    setItensSalvos((prev) => prev.filter((item) => item.item_item !== itemId));
  };

  const salvarItens = async () => {
    setSalvando(true);

    try {
      // 1. Deletar os itens marcados para remoção
      for (const itemId of remocoesPendentes) {
        await fetch(
          `http://192.168.0.13:8000/api/itens-lista-casamento/${itemId}/`,
          {
            method: "DELETE",
          }
        );
      }

      // 2. Criar novos itens, se houver
      if (selecionados.length > 0) {
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

        await fetch("http://192.168.0.13:8000/api/itens-lista-casamento/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      }

      alert("Alterações salvas com sucesso!");
      setSelecionados([]);
      setRemocoesPendentes([]);
      carregarItensPorLista();
    } catch (err) {
      console.error("Erro ao salvar:", err);
      Alert.alert("Erro", `Erro ao salvar: ${err.message}`);
    } finally {
      setSalvando(false);
    }
  };

  const onProdutoLido = async (codigoBarras) => {
    try {
      const produtos = await apiGet("/api/produtos/busca/", {
        q: codigoBarras,
      });

      if (!produtos.length) {
        Alert.alert("Produto não encontrado");
        return;
      }

      const produto = produtos[0];
      adicionarProduto(produto);
    } catch (err) {
      console.error("Erro ao buscar produto escaneado:", err);
      Alert.alert("Erro", "Erro ao buscar produto escaneado");
    } finally {
      setIsScanning(false);
    }
  };

  if (carregando) {
    return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;
  }

  return (
    <View
      style={{
        padding: 16,
        flex: 1,
        backgroundColor: "#000",
      }}
    >
      {/* Botão para abrir o scanner de código de barras */}
      <TouchableOpacity onPress={() => setIsScanning(true)}>
        <Text
          style={{
            fontSize: 18,
            marginBottom: 20,
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            color: "green",
          }}
        >
          📸 Escanear código de barras
        </Text>
      </TouchableOpacity>

      {isScanning ? (
        <LeitorCodigoBarras onProdutoLido={onProdutoLido} />
      ) : (
        <>
          <BuscaProdutoInput onSelect={adicionarProduto} />

          <ProdutosSelecionados
            produtos={selecionados}
            onRemover={removerProduto}
          />

          <Button
            mode="contained"
            onPress={salvarItens}
            disabled={salvando}
            loading={salvando}
            style={{ marginTop: 16 }}
          >
            Salvar Itens
          </Button>

          {/*Itens já salvos na lista*/}
          {itensSalvos.length > 0 && (
            <View style={{ marginTop: 24 }}>
              <Text
                style={{ fontWeight: "bold", marginBottom: 8, color: "white" }}
              >
                Itens já adicionados à lista:
              </Text>
              <FlatList
                data={itensSalvos}
                keyExtractor={(item) => `${item.item_item}`}
                renderItem={({ item }) => (
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ color: "white" }}>
                      • {item.produto_nome} (ID: {item.item_prod})
                    </Text>
                    <TouchableOpacity
                      onPress={() => marcarParaRemocao(item.item_item)}
                    >
                      <Text style={{ color: "red" }}>Remover</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            </View>
          )}
        </>
      )}
    </View>
  );
}
