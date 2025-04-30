import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { apiGet, apiPostComContexto, apiPutComContexto } from "../utils/api";
import styles from "../styles/listaStyles";

export default function ListaCasamentoForm({ route, navigation }) {
  const lista = route.params?.lista;

  const [form, setForm] = useState({
    list_data: new Date().toISOString().split("T")[0],
    list_clie: "",
    list_stat: "0",
    list_usua: "",
  });

  const [usuario, setUsuario] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [clienteNome, setClienteNome] = useState("");

  const handleChange = (field, value) => {
    setForm((prevForm) => ({
      ...prevForm,
      [field]: value,
    }));
  };

  useEffect(() => {
    const init = async () => {
      const usuarioId = await AsyncStorage.getItem("usuario_id");
      setUsuario(usuarioId);
      handleChange("list_usua", usuarioId);

      if (lista) {
        setForm({
          list_data: lista.list_data,
          list_clie: lista.list_clie,
          list_stat: String(lista.list_stat),
          list_usua: usuarioId,
        });
        setClienteNome(lista.cliente_nome || ""); // opcional
      }
    };

    init();
  }, [lista]);

  const buscarClientes = async (texto) => {
    setClienteNome(texto);
    try {
      const data = await apiGet("/api/entidades/", { search: texto });
      setClientes(data);
    } catch (e) {
      console.log("Erro ao buscar clientes", e.message);
    }
  };

  const salvarLista = async () => {
    if (!form.list_clie || !form.list_data) {
      Alert.alert("Erro", "Preencha os campos obrigatórios.");
      return;
    }

    const payload = {
      ...form,
      list_usua: usuario,
    };

    try {
      if (lista) {
        await apiPutComContexto(
          `/api/listas-casamento/${lista.list_nume}/`,
          payload
        );
        Alert.alert("Sucesso", "Lista atualizada com sucesso!");
      } else {
        const novaLista = await apiPostComContexto(
          "/api/listas-casamento/",
          payload
        );
        Alert.alert("Sucesso", "Lista criada com sucesso!");
        navigation.navigate("ItensListaModal", {
          listaId: novaLista.list_nume,
        });
      }
    } catch (error) {
      console.log("❌ Erro ao salvar lista:", error.message);
      Alert.alert("Erro", "Falha ao salvar a lista.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <Text style={styles.label}>Cliente</Text>
          <TextInput
            style={styles.input}
            value={clienteNome}
            onChangeText={buscarClientes}
            placeholder="Buscar cliente..."
            placeholderTextColor="#aaa"
          />
          {clientes.length > 0 && (
            <FlatList
              data={clientes}
              keyExtractor={(item) => `${item.enti_clie}-${item.enti_fili}`}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    handleChange("list_clie", item.enti_clie);
                    setClienteNome(item.enti_nome);
                    setClientes([]);
                    Keyboard.dismiss();
                  }}
                  style={styles.sugestaoItem}
                >
                  <Text style={styles.sugestaoTexto}>
                    {item.enti_clie}-{item.enti_nome} —{" "}
                    {item.enti_cpf || item.enti_cnpj}
                  </Text>
                </TouchableOpacity>
              )}
              style={styles.sugestaoLista}
            />
          )}

          <Text style={styles.label}>Data</Text>
          <TextInput
            style={styles.input}
            value={form.list_data}
            onChangeText={(text) => handleChange("list_data", text)}
            placeholder="YYYY-MM-DD"
          />

          <Picker
            selectedValue={form.list_stat}
            onValueChange={(itemValue) => handleChange("list_stat", itemValue)}
            style={{
              color: "#fff",
              backgroundColor: "#222",
              marginBottom: 16,
              borderRadius: 8,
            }}
          >
            <Picker.Item label="Aberta" value="0" />
            <Picker.Item label="Aguardando" value="1" />
            <Picker.Item label="Finalizada" value="2" />
            <Picker.Item label="Cancelada" value="3" />
          </Picker>

          <TouchableOpacity style={styles.incluirButton} onPress={salvarLista}>
            <Text style={styles.incluirButtonText}>
              {lista ? "Salvar Alterações" : "Criar Lista"}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
