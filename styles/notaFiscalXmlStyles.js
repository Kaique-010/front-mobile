import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  // ====== Container Principal ======
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },

  // ====== Header ======
  headerContainer: {
    backgroundColor: '#1a2f3d',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#345686',
  },
  headerInfo: {
    marginBottom: 15,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    color: '#bbb',
    fontSize: 14,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#345686',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 6,
    flex: 1,
  },
  actionButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  shareButton: {
    backgroundColor: '#28a745',
  },
  danfeButton: {
    backgroundColor: '#dc3545',
  },

  // ====== Conteúdo XML ======
  xmlContainer: {
    flex: 1,
    backgroundColor: '#0d1117',
    margin: 10,
    borderRadius: 8,
    elevation: 2,
  },
  xmlContent: {
    padding: 15,
  },
  xmlText: {
    color: '#c9d1d9',
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 18,
    textAlign: 'left',
  },

  // ====== Informações Adicionais ======
  infoContainer: {
    backgroundColor: '#1a2f3d',
    padding: 10,
    margin: 10,
    borderRadius: 6,
  },
  infoText: {
    color: '#bbb',
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
})

export default styles