// styles/produtosStyles.js
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  // ====== Container Principal ======
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 10,
  },

  // ====== Input de Busca ======
  searchContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "#222",
    borderColor: "#007bff",
    borderRadius: 8,
    borderWidth: 1,
    color: "#fff",
    height: 40,
    marginRight: 8,
    paddingHorizontal: 10,
  },

  // ====== Botão de Buscar ======
  searchButton: {
    backgroundColor: "#007bff",
    borderRadius: 8,
    justifyContent: "center",
    paddingHorizontal: 15,
  },
  searchButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  // ====== Botão de Incluir Produto ======
  incluirButton: {
    backgroundColor: "#007bff",
    borderRadius: 8,
    marginBottom: 10,
    padding: 10,
  },
  incluirButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },

  // ====== Cartões de Produto ======
  card: {
    backgroundColor: "#1a1a1a",
    borderColor: "#007bff",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
    padding: 15,
  },
  nome: {
    color: "#C0C0C0",
    fontSize: 18,
    fontWeight: "bold",
  },
  codigo: {
    color: "#aaa",
    marginTop: 5,
  },
  unidade: {
    color: "#aaa",
    marginTop: 2,
  },
  saldo: {
    color: "#fff",
  },

  // ====== Ações (Editar / Excluir) ======
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  botao: {
    marginLeft: 10,
  },
  botaoTexto: {
    color: "#007bff",
    fontSize: 18,
  },
});

export default styles;
