// styles/listaStyles.js
import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  inner: {
    flex: 1,
    padding: 16,
  },
  label: {
    marginBottom: 4,
    fontWeight: '600',
    fontSize: 14,
    color: '#ddd',
  },
  input: {
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    color: '#fff',
    height: 44,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  incluirButton: {
    backgroundColor: '#0a84ff',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 20,
  },
  incluirButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  sugestaoLista: {
    maxHeight: 180,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#444',
  },

  sugestaoItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },

  sugestaoTexto: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  scanButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
})

export default styles
