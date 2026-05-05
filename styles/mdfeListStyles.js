import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 10,
  },
  incluirButton: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    marginBottom: 10,
    padding: 10,
  },
  incluirButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#222',
    borderColor: '#007bff',
    borderRadius: 8,
    borderWidth: 1,
    color: '#fff',
    height: 40,
    marginRight: 8,
    paddingHorizontal: 10,
  },
  searchButton: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderColor: '#007bff',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
    padding: 15,
  },
  titulo: {
    color: '#C0C0C0',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  linha: {
    color: '#aaa',
    marginTop: 2,
  },
  footerLoading: {
    paddingVertical: 16,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#C0C0C0',
  },
  footerText: {
    margin: 20,
    color: '#C0C0C0',
  },
})

export default styles
