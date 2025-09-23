import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  // ====== Container Principal ======
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    padding: 10,
  },

  // ====== Loading States ======
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  loadingFooter: {
    padding: 20,
    alignItems: 'center',
  },

  // ====== Filtros de Busca ======
  searchContainer: {
    backgroundColor: '#1a2f3d',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  input: {
    backgroundColor: '#2a3f4d',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#345686',
    color: '#fff',
    fontSize: 14,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateInput: {
    flex: 0.48,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },

  // ====== Botões de Ação ======
  searchButton: {
    backgroundColor: '#345686',
    padding: 12,
    borderRadius: 6,
    flex: 0.48,
  },
  searchButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 6,
    flex: 0.48,
  },
  clearButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },

  // ====== Botões de Ação ======
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 10,
  },
  incluirButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    elevation: 2,
    flex: 1,
  },
  incluirButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emitirButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    elevation: 2,
    flex: 1,
  },
  emitirButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // ====== Item da Lista ======
  itemContainer: {
    backgroundColor: '#1a2f3d',
    marginBottom: 10,
    borderRadius: 8,
    padding: 15,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#345686',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  numeroNota: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  // ====== Conteúdo do Item ======
  itemContent: {
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    color: '#bbb',
    fontSize: 13,
    flex: 1,
  },
  value: {
    color: '#fff',
    fontSize: 13,
    flex: 1.5,
    textAlign: 'right',
  },
  valueAmount: {
    color: '#28a745',
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1.5,
    textAlign: 'right',
  },

  // ====== Ações do Item ======
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  actionButton: {
    backgroundColor: '#345686',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginBottom: 5,
    minWidth: '22%',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  xmlButton: {
    backgroundColor: '#17a2b8',
  },
  editButton: {
    backgroundColor: '#ffc107',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },

  // ====== Estados Vazios ======
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    color: '#bbb',
    fontSize: 16,
    textAlign: 'center',
  },

  // ====== Informações de Paginação ======
  paginationInfo: {
    backgroundColor: '#1a2f3d',
    padding: 10,
    borderRadius: 6,
    marginTop: 5,
  },
  paginationText: {
    color: '#bbb',
    fontSize: 12,
    textAlign: 'center',
  },

  // ====== Responsividade ======
  '@media (max-width: 400)': {
    actionButton: {
      minWidth: '45%',
    },
  },
})

export default styles