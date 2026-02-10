import { StyleSheet, Dimensions } from 'react-native'

const { width } = Dimensions.get('window')

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#2c3e50',
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#bdc3c7',
  },
  botaoGrafico: {
    backgroundColor: '#3498db',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8, // Adicionado para alinhar melhor
  },
  botaoGraficoTexto: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  filtrosContainer: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filtrosData: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  inputDataContainer: {
    flex: 0.48,
  },
  labelData: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  datePickerText: {
    fontSize: 14,
    color: '#333',
  },
  inputBusca: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
    backgroundColor: '#f8f9fa',
  },
  resumoContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filtrosBuscaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    padding: 4,
  },
  inputBuscaGroup: {
    flex: 1,
    marginHorizontal: 2,
  },
  labelBusca: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  inputBuscaInline: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 26,
    paddingVertical: 20,
    fontSize: 13, // Fonte menor
    backgroundColor: '#f8f9fa',
    marginHorizontal: 2,
  },
  resumoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    minWidth: 120,
    minHeight: 80,
    maxHeight: 90,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resumoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  resumoTitulo: {
    fontSize: 11, // Reduzido de 12 para 11
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },
  resumoValor: {
    fontSize: 16, // Reduzido de 18 para 16
    fontWeight: 'bold',
    marginTop: 2,
  },
  lista: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: -300,
  },
  listaContent: {
    paddingBottom: 20,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemPedido: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  itemData: {
    fontSize: 12,
    color: '#999',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  itemCliente: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
    marginBottom: 6,
  },
  itemDetalhes: {
    marginBottom: 12,
    marginTop: 8,
  },
  itemProdutosLabel: {
    fontSize: 13,
    color: '#34495e',
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 8,
  },
  itemVendedor: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '500',
    marginBottom: 8,
  },
  itemDescricao: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    lineHeight: 16,
  },
  itemTipoFinanceiroLabel: {
    fontSize: 13,
    color: '#34495e',
    fontWeight: '600',
    marginBottom: 4,
  },
  itemTipoFinanceiro: {
    fontSize: 12,
    color: '#e67e22',
    fontStyle: 'italic',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  itemQuantidadeContainer: {
    flex: 1,
    marginRight: 16,
  },
  itemQuantidadeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  itemQuantidadeValor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3498db',
  },
  itemTotalContainer: {
    alignItems: 'flex-end',
  },
  itemTotalLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  itemValor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
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
    padding: 20,
  },
  erroTexto: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginVertical: 16,
  },
  botaoTentarNovamente: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  botaoTentarNovamenteTexto: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#bdc3c7',
    marginTop: 16,
  },
  // Adicionar ao final do arquivo, antes do fechamento do StyleSheet.create:

  // Estilos para Pisos
  pisosInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  pisosDetalhe: {
    fontSize: 12,
    color: '#18b7df',
    marginBottom: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  vendedor: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  valor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  observacao: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  cabecalho: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 2,
  },
})
