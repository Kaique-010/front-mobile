import { StyleSheet } from 'react-native'

export default StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f0f2f5',
  },
  filtros: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontWeight: '600',
    marginBottom: 4,
    color: '#555',
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  botao: {
    backgroundColor: '#007bff',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  botaoTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cardTotais: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  linhaTotais: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'center',
  },
  recebido: {
    color: 'green',
    fontWeight: 'bold',
  },
  pago: {
    color: 'red',
    fontWeight: 'bold',
  },
  saldoFinal: {
    color: '#222',
    fontWeight: 'bold',
  },
  mesContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    elevation: 1,
  },
  mesTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  mesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007bff',
  },
  itemLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 0.3,
    borderColor: '#ddd',
  },
  entidade: {
    fontSize: 14,
    maxWidth: '70%',
  },
  valor: {
    fontWeight: 'bold',
  },
  loading: {
    padding: 20,
    fontSize: 16,
    textAlign: 'center',
  },
})
