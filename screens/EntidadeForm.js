import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Dimensions,
  StyleSheet,
} from "react-native";
import { ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { apiPost, apiPut } from "../utils/api";
import styles from "../styles/entidadeStyles";

export default function EntidadeForm({ navigation, route }) {
  const entidade = route.params?.entidade;
  const isEdicao = !!entidade;

  const [formData, setFormData] = useState({
    enti_nome: "",
    enti_tipo_enti: "CL",
    enti_cpf: "",
    enti_cnpj: "",
    enti_cep: "",
    enti_ende: "",
    enti_nume: "",
    enti_cida: "",
    enti_esta: "",
    enti_fone: "",
    enti_celu: "",
    enti_emai: "",
  });

  useEffect(() => {
    if (isEdicao) setFormData({ ...entidade });
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const salvarEntidade = async () => {
    try {
      if (isEdicao) {
        await apiPut(`/api/entidades/${entidade.enti_clie}/`, formData);
        Alert.alert("Sucesso", "Entidade atualizada!");
      } else {
        await apiPost("/api/entidades/", formData);
        Alert.alert("Sucesso", "Entidade cadastrada!");
      }
      navigation.goBack();
    } catch (error) {
      console.log("Erro ao salvar entidade:", error.message);
      Alert.alert("Erro", "Não foi possível salvar a entidade.");
    }
  };

  // Abas
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "dados", title: "Dados" },
    { key: "endereco", title: "Endereço" },
    { key: "contato", title: "Contato" },
  ]);

  const DadosRoute = () => (
    <View style={styles.innerContainer}>
      <Text style={styles.label}>Nome</Text>
      <TextInput
        style={styles.input}
        value={formData.enti_nome}
        onChangeText={(text) => handleChange("enti_nome", text)}
      />
      <Text style={styles.label}>Tipo</Text>
      <Picker
        selectedValue={formData.enti_tipo_enti}
        onValueChange={(value) => handleChange("enti_tipo_enti", value)}
        style={styles.input}
      >
        <Picker.Item label="Cliente" value="CL" />
        <Picker.Item label="Fornecedor" value="FO" />
        <Picker.Item label="Ambos" value="AM" />
        <Picker.Item label="Funcionário" value="FU" />
        <Picker.Item label="Vendedor" value="VE" />
        <Picker.Item label="Outros" value="OU" />
      </Picker>
      <Text style={styles.label}>CPF</Text>
      <TextInput
        style={styles.input}
        value={formData.enti_cpf}
        onChangeText={(text) => handleChange("enti_cpf", text)}
        keyboardType="numeric"
      />
      <Text style={styles.label}>CNPJ</Text>
      <TextInput
        style={styles.input}
        value={formData.enti_cnpj}
        onChangeText={(text) => handleChange("enti_cnpj", text)}
        keyboardType="numeric"
      />
    </View>
  );

  const EnderecoRoute = () => (
    <View style={styles.innerContainer}>
      <Text style={styles.label}>CEP</Text>
      <TextInput
        style={styles.input}
        value={formData.enti_cep}
        onChangeText={(text) => handleChange("enti_cep", text)}
        keyboardType="numeric"
      />
      <Text style={styles.label}>Endereço</Text>
      <TextInput
        style={styles.input}
        value={formData.enti_ende}
        onChangeText={(text) => handleChange("enti_ende", text)}
      />
      <Text style={styles.label}>Número</Text>
      <TextInput
        style={styles.input}
        value={formData.enti_nume}
        onChangeText={(text) => handleChange("enti_nume", text)}
        keyboardType="numeric"
      />
      <Text style={styles.label}>Cidade</Text>
      <TextInput
        style={styles.input}
        value={formData.enti_cida}
        onChangeText={(text) => handleChange("enti_cida", text)}
      />
      <Text style={styles.label}>Estado</Text>
      <TextInput
        style={styles.input}
        value={formData.enti_esta}
        onChangeText={(text) => handleChange("enti_esta", text)}
        maxLength={2}
      />
    </View>
  );

  const ContatoRoute = () => (
    <View style={styles.innerContainer}>
      <Text style={styles.label}>Telefone</Text>
      <TextInput
        style={styles.input}
        value={formData.enti_fone}
        onChangeText={(text) => handleChange("enti_fone", text)}
        keyboardType="phone-pad"
      />
      <Text style={styles.label}>Celular</Text>
      <TextInput
        style={styles.input}
        value={formData.enti_celu}
        onChangeText={(text) => handleChange("enti_celu", text)}
        keyboardType="phone-pad"
      />
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={formData.enti_emai}
        onChangeText={(text) => handleChange("enti_emai", text)}
        keyboardType="email-address"
      />
    </View>
  );

  const renderScene = SceneMap({
    dados: DadosRoute,
    endereco: EnderecoRoute,
    contato: ContatoRoute,
  });

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Cadastro de Entidades</Text>

      <View style={{ flex: 1 }}>
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: Dimensions.get("window").width }}
          renderTabBar={(props) => (
            <TabBar
              {...props}
              indicatorStyle={{ backgroundColor: "#007bff" }}
              style={{ backgroundColor: "#0B141A" }}
              labelStyle={{ color: "#fff" }}
            />
          )}
        />
      </View>

      <TouchableOpacity style={styles.botaoSalvar} onPress={salvarEntidade}>
        <Text style={styles.botaoTexto}>
          {isEdicao ? "Salvar Alterações" : "Cadastrar Entidade"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
