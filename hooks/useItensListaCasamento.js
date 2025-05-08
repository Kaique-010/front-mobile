// useItensListaCasamento.js
import { useState, useEffect } from "react";
import { apiGet, apiPost } from "../utils/api";
import { Alert } from "react-native";

export default function useItensListaCasamento({
  listaId,
  empresaId,
  filialId,
}) {
  const [itensSalvos, setItensSalvos] = useState([]);
  const [selecionados, setSelecionados] = useState([]);
  const [remocoesPendentes, setRemocoesPendentes] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const carregarItens = async () => {
    setCarregando(true);
    try {
      const data = await apiGet("/api/itens-lista-casamento/", {
        item_list: listaId,
        item_empr: empresaId,
        item_fili: filialId,
      });
      setItensSalvos(data);
    } catch (e) {
      console.error("Erro ao carregar:", e);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (listaId) carregarItens();
  }, [listaId]);

  const adicionarProduto = (produto) => {
    if (!selecionados.find((p) => p.prod_codi === produto.prod_codi)) {
      setSelecionados((prev) => [...prev, produto]);
    }
  };

  const removerProduto = (prod_codi) => {
    setSelecionados((prev) => prev.filter((p) => p.prod_codi !== prod_codi));
  };

  const marcarParaRemocao = (item) => {
    const chave = (x) =>
      `${x.item_empr}-${x.item_fili}-${x.item_list}-${x.item_item}`;
    const chaveItem = chave(item);

    if (!remocoesPendentes.some((r) => chave(r) === chaveItem)) {
      setRemocoesPendentes((prev) => [...prev, item]);
      setItensSalvos((prev) => prev.filter((i) => chave(i) !== chaveItem));
    }
  };

  const salvarItens = async () => {
    setSalvando(true);
    try {
      const payload = {
        remover: remocoesPendentes,
        adicionar: selecionados.map((item) => ({
          item_empr: empresaId,
          item_fili: filialId,
          item_list: listaId,
          item_item: item.prod_codi, // ajuste se necessário
          ...item,
        })),
      };

      await apiPost("/api/itens-lista-casamento/update-lista/", payload);

      Alert.alert("Sucesso", "Alterações salvas com sucesso!");
      setSelecionados([]);
      setRemocoesPendentes([]);
      await carregarItens();
    } catch (err) {
      console.error("Erro ao salvar:", err);
      Alert.alert("Erro", err.message || "Erro ao salvar alterações");
    } finally {
      setSalvando(false);
    }
  };

  return {
    itensSalvos,
    selecionados,
    adicionarProduto,
    removerProduto,
    marcarParaRemocao,
    salvarItens,
    carregando,
    salvando,
    remocoesPendentes,
  };
}
