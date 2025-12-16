import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  // ====== Container Principal ======
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },

  // ====== Loading ======
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

  // ====== Header ======
  headerContainer: {
    backgroundColor: '#1a2f3d',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#345686',
  },
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  numeroNota: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#345686',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    flex: 0.48,
  },
  actionButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  xmlButton: {
    backgroundColor: '#17a2b8',
  },

  // ====== Seções ======
  section: {
    backgroundColor: '#1a2f3d',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#345686',
    paddingBottom: 5,
  },

  // ====== Grid de Informações ======
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    marginBottom: 12,
  },
  label: {
    color: '#bbb',
    fontSize: 12,
    marginBottom: 4,
  },
  value: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },

  // ====== Destinatário ======
  destinatarioContainer: {
    backgroundColor: '#2a3f4d',
    padding: 12,
    borderRadius: 6,
  },
  destinatarioNome: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  destinatarioDoc: {
    color: '#bbb',
    fontSize: 14,
    marginBottom: 5,
  },
  destinatarioEndereco: {
    color: '#bbb',
    fontSize: 13,
    lineHeight: 18,
  },

  // ====== Valores ======
  valoresContainer: {
    backgroundColor: '#2a3f4d',
    padding: 12,
    borderRadius: 6,
  },
  valorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#345686',
  },
  valorLabel: {
    color: '#bbb',
    fontSize: 14,
  },
  valorValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  valorDesconto: {
    color: '#dc3545',
  },
  valorTotal: {
    borderBottomWidth: 0,
    borderTopWidth: 2,
    borderTopColor: '#345686',
    paddingTop: 10,
    marginTop: 5,
  },
  valorTotalLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  valorTotalValue: {
    color: '#28a745',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // ====== Impostos ======
  impostosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  impostoItem: {
    backgroundColor: '#2a3f4d',
    padding: 10,
    borderRadius: 6,
    width: '48%',
    marginBottom: 8,
    alignItems: 'center',
  },
  impostoLabel: {
    color: '#bbb',
    fontSize: 12,
    marginBottom: 4,
  },
  impostoValue: {
    color: '#ffc107',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // ====== Observações ======
  observacoes: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    backgroundColor: '#2a3f4d',
    padding: 12,
    borderRadius: 6,
  },

  // ====== Chave de Acesso ======
  chaveAcesso: {
    color: '#17a2b8',
    fontSize: 12,
    fontFamily: 'monospace',
    backgroundColor: '#2a3f4d',
    padding: 12,
    borderRadius: 6,
    textAlign: 'center',
  },

  // ====== Ações Finais ======
  actionsContainer: {
    padding: 15,
    paddingBottom: 30,
  },
  editButton: {
    backgroundColor: '#ffc107',
    padding: 15,
    borderRadius: 8,
    elevation: 2,
  },
  editButtonText: {
    color: '#000',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
})

export default styles