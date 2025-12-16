// styles/listaSaidasStyles.js
import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  // ====== Container Principal ======
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 10,
  },

  // ====== Input de Busca ======
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#222',
    borderColor: '#007bff',
    borderRadius: 8,
    borderWidth: 1,
    color: '#fff',
    height: 44,
    marginRight: 8,
    paddingHorizontal: 10,
  },

  // ====== Botão de Buscar ======
  searchButton: {
    backgroundColor: '#345686',
    borderRadius: 8,
    justifyContent: 'center',
    padding: 10,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  // ====== Botão de Incluir Lista ======
  incluirButton: {
    backgroundColor: '#345686',
    borderRadius: 8,
    marginBottom: 10,
    padding: 10,
  },
  incluirButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // ====== Cartões de Lista ======
  card: {
    backgroundColor: '#1a1a1a',
    borderColor: '#007bff',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
    padding: 15,
  },
  numero: {
    color: '#faebd7',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  data: {
    color: '#aaa',
    marginBottom: 30,
  },
  datalist: {
    color: '#aaa',
    marginBottom: 10,
  },
  cliente: {
    color: '#aaa',
    marginTop: 5,
    marginBottom: 20,
  },
  quantidade: {
    color: '#aaa',
    marginTop: 5,
    marginBottom: 20,
  },
  total: {
    color: '#aaa',
    marginTop: 5,
    marginBottom: 20,
  },
  empresa: {
    color: '#faebd7',
  },
  produto: {
    color: '#faebd7',
  },
  sequencia: {
    color: '#faebd7',
    marginLeft: 250,
  },
  // ====== Ações (Editar / Excluir) ======
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  botao: {
    marginLeft: 10,
  },
  botaoTexto: {
    color: '#007bff',
    fontSize: 18,
  },
  inner: {
    flex: 1,
    padding: 25,
    color: 'white',
  },
  label: {
    marginBottom: 10,
    marginTop: 10,
    fontWeight: '600',
    fontSize: 14,
    color: '#ddd',
  },

  forminput: {
    backgroundColor: '#222',
    borderColor: '#007bff',
    borderRadius: 8,
    borderWidth: 1,
    color: '#fff',
    marginRight: 8,
    paddingHorizontal: 10,
  },

  sugestaoLista: {
    maxHeight: 180,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#444',
  },

  sugestaoItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },

  sugestaoTexto: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  scanButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  footerText: {
    marginTop: 10,
    marginBottom: 25,
  },
})

export default styles
