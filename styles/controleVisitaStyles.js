import { StyleSheet } from 'react-native'

export const controleVisitaStyles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1,
    backgroundColor: '#0d1421',
  },
  
  // Header
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#1a252f',
    borderBottomWidth: 1,
    borderBottomColor: '#2c3e50',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },

  // Cards
  card: {
    backgroundColor: '#1a252f',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#2c3e50',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },

  // Etapas
  etapaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  etapaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  etapaText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  etapaProspeccao: {
    backgroundColor: '#e74c3c',
  },
  etapaQualificacao: {
    backgroundColor: '#f39c12',
  },
  etapaProposta: {
    backgroundColor: '#f1c40f',
  },
  etapaNegociacao: {
    backgroundColor: '#3498db',
  },
  etapaFechamento: {
    backgroundColor: '#2ecc71',
  },

  // Formulário
  formContainer: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a252f',
    borderWidth: 1,
    borderColor: '#2c3e50',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  inputFocused: {
    borderColor: '#2ecc71',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },

  // Botões
  button: {
    backgroundColor: '#2ecc71',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonSecondary: {
    backgroundColor: '#3498db',
  },
  buttonDanger: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#666',
  },

  // Lista
  listContainer: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#666',
    fontSize: 18,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },

  // Filtros
  filtersContainer: {
    backgroundColor: '#1a252f',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2c3e50',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterInput: {
    flex: 1,
    backgroundColor: '#2c3e50',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    marginRight: 8,
  },
  filterButton: {
    backgroundColor: '#2ecc71',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
  },

  // Dashboard específico
  dashboardCard: {
    backgroundColor: '#1a252f',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    alignItems: 'center',
  },
  dashboardNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2ecc71',
    marginVertical: 8,
  },
  dashboardLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },

  // Status
  statusActive: {
    color: '#2ecc71',
  },
  statusInactive: {
    color: '#e74c3c',
  },
  statusPending: {
    color: '#f39c12',
  },

  // Detalhes
  detailsContainer: {
    backgroundColor: '#1a252f',
    borderRadius: 12,
    padding: 16,
    margin: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2c3e50',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0d1421',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
  },

  // Modais
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#1a252f',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },

  // Floating Action Button
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#2ecc71',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#2ecc71',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  // Chips/Tags
  chip: {
    backgroundColor: '#2c3e50',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  chipSelected: {
    backgroundColor: '#2ecc71',
  },

  // Separadores
  separator: {
    height: 1,
    backgroundColor: '#2c3e50',
    marginVertical: 16,
  },

  // Texto auxiliar
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#e74c3c',
    marginTop: 4,
  },
  successText: {
    fontSize: 12,
    color: '#2ecc71',
    marginTop: 4,
  },
})

export default controleVisitaStyles