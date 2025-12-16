// styles/produtosStyles.js
import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  // ====== Container Principal ======
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    padding: 10,
  },

  // ====== Input de Busca ======
  searchContainer: {
    backgroundColor: '#1a2f3d',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  input: {
    backgroundColor: '#1a2f3d',
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#345686',
    color: '#fff',
  },

  // ====== Botão de Buscar ======
  searchButton: {
    backgroundColor: '#345686',
    padding: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  searchButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },

  // ====== Botão de Incluir Lista ======
  incluirButton: {
    backgroundColor: '#345686',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  incluirButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // ====== Cartões de Lista ======
  card: {
    backgroundColor: '#1a2f3d',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#345686',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e2e8f0',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    color: '#a0aec0',
    fontSize: 14,
    flex: 1,
  },
  infoValue: {
    color: '#e2e8f0',
    fontSize: 14,
    flex: 2,
    textAlign: 'right',
  },
  valorDestaque: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4cd137',
  },
  valorDestaqueStatus: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d6a333',
  },
  // ====== Ações (Editar / Excluir) ======
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#345686',
    paddingTop: 12,
    marginTop: 8,
  },
  botao: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  botaoEditar: {
    backgroundColor: '#345686',
  },
  botaoExcluir: {
    backgroundColor: '#e74c3c',
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
  inputcliente: {
    color: '#fff',
  },
  scanButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  footerText: {
    textAlign: 'center',
    color: '#a0aec0',
    padding: 10,
    fontSize: 14,
  },
})

export default styles
