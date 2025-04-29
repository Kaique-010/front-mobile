import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { apiGet, apiPost } from "../utils/api";
import styles from "../styles/itensStyle";
import debounce from "lodash.debounce";

export default function ItensListaModal({ route, navigation }) {
  const { listaId } = route.params;
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState("");
  const [selecionados, setSelecionados] = useState([]);
  const [complemento, setComplemento] = useState('');
  const [itensLista, setItensLista] = useState([]);
  const [carregando, setCarregando] = useState(false);

  const buscarProdutos = useCallback(
    async () => {
      if (!busca.trim()) {
        setProdutos([]);
        return;
      }

      setCarregando(true);
      try {
        const response = await apiGet("/api/produtos/", { search: busca });
        setProdutos(response?.results || []);
      } catch (error) {
        console.log("Erro ao buscar produtos", error.message);
      } finally {
        setCarregando(false);
      }
    },
    [busca]
  );

  const debouncedBuscarProdutos = useCallback(
    debounce(() => buscarProdutos(), 500),
    [buscarProdutos]
  );

  useEffect(() => {
    debouncedBuscarProdutos();
  }, [busca, debouncedBuscarProdutos]);

  const buscarItensLista = async () => {
    try {
      const data = await apiGet('/api/itens-lista-casamento/', { lista: listaId });
      setItensLista(data?.results || []);
    } catch (error) {
      console.log('Erro ao carregar itens da lista', error.message);
    }
  };

  useEffect(() => {
    buscarItensLista();
  }, []);

  const adicionarItens = async () => {
    if (selecionados.length === 0) {
      Alert.alert("Erro", "Selecione pelo menos um produto.");
      return;
    }

    try {
      for (const produtoId of selecionados) {
        const payload = {
          item_list: listaId,
          item_prod: produtoId,
          item_comp: complemento,
        };
        await apiPost('/api/itens-lista-casamento/', payload);
      }
      Alert.alert('Sucesso', 'Itens adicionados!');
      setSelecionados([]);
      setComplemento('');
      buscarItensLista();
    } catch (error) {
      console.log('❌ Erro ao adicionar itens:', error.message);
      Alert.alert('Erro', 'Falha ao adicionar itens.');
    }
  };

  const toggleProduto = (produtoId) => {
    setSelecionados((prev) =>
      prev.includes(produtoId)
        ? prev.filter((id) => id !== produtoId)
        : [...prev, produtoId]
    );
  };

  return (
    <View style={styles.inner}>
      <TextInput
        placeholder="Buscar produto..."
        value={busca}
        onChangeText={setBusca}
        style={styles.input}
      />

      {carregando ? (
        <Text>Carregando...</Text>
      ) : (
        <FlatList
          data={produtos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => toggleProduto(item.id)}>
              <Text style={{ color: selecionados.includes(item.id) ? 'green' : 'black' }}>
                {item.nome}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      <TextInput
        placeholder="Complemento"
        value={complemento}
        onChangeText={setComplemento}
        style={styles.input}
      />

      <TouchableOpacity style={styles.incluirButton} onPress={adicionarItens}>
        <Text style={styles.incluirButtonText}>Adicionar Itens</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Itens adicionados:</Text>
      <FlatList
        data={itensLista}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View>
            <Text>{item.produto_nome}</Text> 
          </View>
        )}
      />
    </View>
  );
}
