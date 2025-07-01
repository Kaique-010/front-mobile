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

  mesSelectorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 8,
    gap: 6,
  },

  mesButtonGrid: {
    width: '20%',
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    marginBottom: 6,
    minHeight: 30,
  },

  mesSelecionado: {
    backgroundColor: '#203952',
  },

  mesTexto: {
    fontSize: 12,
    color: '#333',
  },

  mesTextoSelecionado: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },

  // Filtros
  filtros: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8,
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
  filtroTipoSelecionado: {
    backgroundColor: '#203952',
    shadowColor: '#007bff',
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

  // Lista
  lista: {
    flex: 1,
  },
  listaContent: {
    paddingBottom: 20,
  },

  // Card de resumo geral
  resumoGeralCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  resumoTituloGeral: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  resumoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  saldoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  saldoItem: {
    flex: 1,
    alignItems: 'center',
  },
  saldoLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 5,
    textAlign: 'center',
  },
  saldoValor: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultadoContainer: {
    alignItems: 'center',
    marginBottom: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  resultadoLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  resultadoValor: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  estatisticasContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  estatisticaItem: {
    alignItems: 'center',
  },
  estatisticaNumero: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  estatisticaLabel: {
    fontSize: 10,
    color: '#7f8c8d',
    marginTop: 2,
  },

  // Headers de grupo
  grupoHeaderContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  headerComIcone: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  tituloGrupoDetalhado: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },

  // Cards de centro de custo
  centroCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  centroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  centroInfo: {
    flex: 1,
  },
  centroTituloContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  centroCodigo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginRight: 8,
  },
  tipoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tipoBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 2,
  },
  centroNome: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  centroValores: {
    marginBottom: 12,
  },
  centroValorItem: {
    marginBottom: 8,
  },
  centroValorLabel: {
    fontSize: 11,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  centroValorTexto: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  centroResultado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  centroResultadoLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  centroResultadoTexto: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Progress bar
  progressContainer: {
    height: 4,
    backgroundColor: '#ecf0f1',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },

  // Estados de loading e erro
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6c757d',
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
    lineHeight: 24,
  },
  botaoTentarNovamente: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  botaoTentarNovamenteTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Novos estilos para o filtro de ano
  anoSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
  },
  anoSelectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginRight: 12,
  },
  anoButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  anoSelecionado: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  anoTexto: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },
  anoTextoSelecionado: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
})

export default styles
