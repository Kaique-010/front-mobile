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
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 10,
  },
  cardSmall: {
    flex: 1,
    backgroundColor: '#111f35ff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#345686',
  },
  cardEmitidas: {
    borderColor: '#28a745',
    shadowColor: '#b3e4beff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  cardInutilizadas: {
    borderColor: '#6c757d',
    shadowColor: '#b3e4beff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  cardCanceladas: {
    borderColor: '#dc3545',
    shadowColor: '#e4b3b3ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  cardLabel: {
    color: '#d1d0c3ff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  cardValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
    textAlign: 'center',
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
    gap: 6,
  },
  dateInput: {
    flex: 0.49,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },

  // ====== Botões de Ação ======
  searchButton: {
    backgroundColor: '#13253dff',
    borderWidth: 1,
    borderColor: '#5a6f8dff',
    padding: 12,
    borderRadius: 6,
    flex: 0.49,
    elevation: 2,
  },
  searchButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: '#505050ff',
    borderWidth: 1,
    borderColor: '#5a818dff',
    padding: 12,
    borderRadius: 6,
    flex: 0.49,
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
    borderWidth: 1,
    borderColor: '#218838',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'center',
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
    borderWidth: 1,
    borderColor: '#007AFF',
    paddingVertical: 8,
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
    borderRadius: 12,
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
    color: '#111827',
    fontSize: 11,
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
    color: '#A7F3D0',
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1.5,
    textAlign: 'right',
  },

  // ====== Ações do Item ======
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  actionButton: {
    backgroundColor: '#C7D2FE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    flexShrink: 1,
  },
  actionButtonText: {
    color: '#111827',
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '600',
  },
  xmlButton: {
    backgroundColor: '#A7F3D0',
  },
  transmitirButton: {
    backgroundColor: '#BBF7D0',
  },
  consultarButton: {
    backgroundColor: '#BFDBFE',
  },
  inutilizarButton: {
    backgroundColor: '#FED7AA',
  },
  cancelarButton: {
    backgroundColor: '#FECACA',
  },
  editButton: {
    backgroundColor: '#FDE68A',
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
