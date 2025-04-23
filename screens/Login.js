import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../utils/api";
import { useFonts, FaunaOne_400Regular } from "@expo-google-fonts/fauna-one";
import styles from "../styles/loginStyles";

export default function Login({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [docu, setDocu] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    FaunaOne_400Regular,
  });

  if (!fontsLoaded) return null;

  const handleLogin = async () => {
    if (!docu || !username || !password) {
      setError("Preencha todos os campos.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/login/`, {
        username,
        password,
        docu,
      });

      const { access, refresh, user } = response.data;

      await AsyncStorage.multiSet([
        ["access", access],
        ["refresh", refresh],
        ["user", JSON.stringify(user)],
        ["docu", docu],
      ]);

      navigation.navigate("SelectEmpresa");
    } catch (err) {
      console.error("[LOGIN ERROR]", err?.response?.data || err.message);
      setError("Login falhou. Verifique suas credenciais.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>SPARTACUS MOBILE</Text>

      {/* CNPJ */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>CNPJ</Text>
        <View style={styles.inputBox}>
          <FontAwesome
            name="building"
            size={20}
            color="#ccc"
            style={styles.icon}
          />
          <TextInput
            value={docu}
            onChangeText={setDocu}
            placeholder="00.000.000/0001-00"
            placeholderTextColor="#aaa"
            keyboardType="numeric"
            style={styles.input}
          />
        </View>
      </View>

      {/* Usuário */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Usuário</Text>
        <View style={styles.inputBox}>
          <FontAwesome name="user" size={20} color="#ccc" style={styles.icon} />
          <TextInput
            value={username}
            onChangeText={(text) => setUsername(text.toLowerCase())}
            placeholder="Digite seu usuário"
            placeholderTextColor="#aaa"
            style={styles.input}
            autoCapitalize="none"
          />
        </View>
      </View>

      {/* Senha */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Senha</Text>
        <View style={styles.inputBox}>
          <FontAwesome name="lock" size={20} color="#ccc" style={styles.icon} />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor="#aaa"
            style={styles.input}
            secureTextEntry
          />
        </View>
      </View>

      {/* Botão */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Entrar</Text>
        )}
      </TouchableOpacity>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}
