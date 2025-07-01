import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#203952',
    paddingTop: 30,
    paddingBottom: 10,
    paddingHorizontal: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
    marginTop: 4,
  },
  filtrosContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8, // Reduzido de 10 para 8
  },
  inputBusca: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 14,
    marginBottom: 8, // Reduzido de 10 para 8
  },
  filtrosData: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  inputDataContainer: {
    flex: 1,
  },
  labelData: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '600',
  },
  inputData: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 14,
  },
  datePickerButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  datePickerText: {
    fontSize: 14,
    color: '#333',
  },
  datePickerPlaceholder: {
    fontSize: 14,
    color: '#999',
  },
  filtros: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8, // Reduzido de 16 para 8
  },
  filtroButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filtroSelecionado: {
    backgroundColor: '#28a745',
    shadowColor: '#28a745',
    shadowOpacity: 0.3,
  },
  filtroTexto: {
    color: '#333',
    fontWeight: '600',
    fontSize: 12,
  },
  filtroTextoSelecionado: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  resumoContainer: {
    paddingHorizontal: 10,
  },
  resumoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    minWidth: 80,
    maxHeight: 80,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 0,
  },
  resumoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
  },
  resumoTitulo: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
  },
  resumoValor: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  lista: {
    flex: 1,
    marginTop: -350,
  },

  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemInfo: {
    flex: 1,
  },
  itemPedido: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  itemCliente: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
    marginTop: 2,
  },
  itemData: {
    fontSize: 12,
    color: '#666',
  },
  itemDetalhes: {
    marginBottom: 12,
  },
  itemProduto: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
  },
  itemDescricao: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemQuantidade: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemQuantidadeLabel: {
    fontSize: 12,
    color: '#666',
  },
  itemQuantidadeValor: {
    fontSize: 12,
    color: '#333',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  itemForma: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  itemFormaTexto: {
    fontSize: 10,
    color: '#203952',
    fontWeight: '600',
  },
  itemValor: {
    fontSize: 14,
    color: '#27ae60',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  erroContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 32,
  },
  erroTexto: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginVertical: 16,
  },
  botaoTentarNovamente: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  botaoTentarNovamenteTexto: {
    color: '#fff',
    fontWeight: 'bold',
  },
})

export default styles
