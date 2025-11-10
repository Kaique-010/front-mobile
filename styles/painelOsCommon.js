import { StyleSheet } from 'react-native'

export default StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    paddingVertical: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modeButton: {
    backgroundColor: '#28a745',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    gap: 4,
    elevation: 4,
  },
  modeButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  refreshButton: {
    backgroundColor: '#284665',
    padding: 6,
    borderRadius: 15,
    elevation: 4,
  },

  // Indicadores
  indicador: {
    flex: 1,
    marginHorizontal: 1,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    elevation: 4,
  },
  indicadorLabel: {
    fontWeight: 'bold',
    fontSize: 9,
    marginBottom: 2,
    opacity: 0.7,
    color: '#000000ff',
  },
  indicadorValor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000ff',
  },

  // Filtros
  filtroSection: {
    marginBottom: 2,
  },
  filtroLabel: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 3,
  },
  
  filtroScroll: {
    flexDirection: 'row',
  },

  // Tabela
  tableContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1a3a52',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  tableHeaderText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
  tableHeaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tableScrollView: {
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderLeftWidth: 4,
    minHeight: 55,
    alignItems: 'flex-start',
  },
  tableCellText: {
    fontSize: 11,
    color: '#000000ff',
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 2,
    marginLeft: 10,
  },
  osNumber: {
    fontWeight: 'bold',
    color: '#070707ff',
    fontSize: 12,
  },

  // Prioridade
  prioridadeCellContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  prioridadeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 60,
    alignItems: 'center',
  },
  prioridadeBadgeText: {
    fontSize: 9,
    color: '#fff',
    fontWeight: 'bold',
  },

  // Cards (para modo lista)
  card: {
    flex: 1,
    margin: 2,
    padding: 8,
    borderRadius: 6,
    borderLeftWidth: 4,
    elevation: 3,
    maxWidth: '32%',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  numeroContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  numeroLabel: {
    fontSize: 10,
    color: '#666',
    marginRight: 3,
  },
  numero: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  prioridadeContainer: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  prioridade: {
    fontSize: 9,
    color: '#fff',
    fontWeight: 'bold',
  },
  cardBody: {
    gap: 4,
  },
  clienteNome: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  statusLabel: {
    fontSize: 10,
    color: '#000000ff',
  },
  status: {
    fontSize: 10,
    fontWeight: '500',
  },
  data: {
    fontSize: 9,
    color: '#666',
  },
  problema: {
    fontSize: 10,
    color: '#555',
    fontStyle: 'italic',
  },
  setorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  setorLabel: {
    fontSize: 10,
    color: '#666',
  },
  setor: {
    fontSize: 10,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },

  // Estados
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  listContainer: {
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
})
