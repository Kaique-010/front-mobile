import { StyleSheet } from 'react-native'


const styles = StyleSheet.create({
  // ====== Container Principal ======
  container: {
    flex: 1,
    backgroundColor: '#faf5ff',
  },

  listContent: {
    padding: 16,
    paddingBottom: 100,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#faf5ff',
  },

  loadingText: {
    marginTop: 12,
    color: '#6b7280',
    fontSize: 16,
  },

  // ====== Botão de Incluir ======
  incluirButton: {
    backgroundColor: '#8b5cf6',
    margin: 16,
    marginBottom: 8,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    shadowColor: '#8b5cf6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  incluirButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginLeft: 8,
  },

  // ====== Container de Busca ======
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },

  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  inputIcon: {
    marginRight: 8,
  },

  input: {
    flex: 1,
    height: 44,
    color: '#374151',
    fontSize: 15,
  },

  searchButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // ====== Cards ======
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#8b5cf6',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#8b5cf6',
  },

  cardContent: {
    padding: 20,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },

  numeroContainer: {
    flex: 1,
  },

  numeroLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 2,
  },

  numero: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    letterSpacing: 0.5,
  },

  dataContainer: {
    alignItems: 'flex-end',
  },

  data: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },

  // ====== Seção Cliente ======
  clienteSection: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },

  clienteLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 4,
  },

  cliente: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },

  clienteCodigo: {
    fontSize: 12,
    color: '#9ca3af',
  },

  // ====== Linha de Informações ======
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 16,
  },

  vendedorSection: {
    flex: 1,
  },

  valorSection: {
    alignItems: 'flex-end',
  },

  sectionLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 2,
  },

  vendedor: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },

  valor: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
  },

  // ====== Observações ======
  observacaoSection: {
    marginBottom: 12,
  },

  observacao: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
    fontStyle: 'italic',
  },

  // ====== Informações de Pisos ======
  pisosInfo: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },

  pisosTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#065f46',
    marginBottom: 8,
  },

  pisosItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },

  pisosLabel: {
    fontSize: 12,
    color: '#047857',
    fontWeight: '500',
    width: 80,
  },

  pisosValue: {
    fontSize: 12,
    color: '#065f46',
    fontWeight: '600',
    flex: 1,
  },

  // ====== Ações ======
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },

  editButton: {
    backgroundColor: '#f0f9ff',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },

  deleteButton: {
    backgroundColor: '#fef2f2',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#fecaca',
  },

  // ====== Rodapé ======
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },

  footerText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 13,
    fontWeight: '500',
  },
})

export default styles