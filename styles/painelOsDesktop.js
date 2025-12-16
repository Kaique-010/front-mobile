import { StyleSheet } from 'react-native'

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#182C39',
    padding: 16,
  },
  logo: {
    width: 120,
    height: 40,
    resizeMode: 'contain',
  },
  indicadores: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 6,
    paddingVertical: 6,
  },
  filtros: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  filtroButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.3)',
  },
  filtroButtonText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  titulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'rgba(0, 0, 0, 0.3)',
    marginBottom: 8,
  },

  botaoCriar: {
    backgroundColor: '#28a745',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    elevation: 4,
  },
  botaoCriarText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Colunas da tabela desktop
  colOS: { width: '10%' },
  colCliente: { width: '25%' },
  colStatus: { width: '12%' },
  colPrioridade: { width: '12%' },
  colSetor: { width: '15%' },
  colData: { width: '12%' },
  colProblema: { width: '14%' },
})
