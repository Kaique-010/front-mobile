import { StyleSheet } from 'react-native'

export default StyleSheet.create({
  containerTV: {
    flex: 1,
    backgroundColor: '#182C39',
    padding: 24,
  },

  // Header otimizado para TV
  headerTV: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },

  headerTitleTV: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },

  logoTV: {
    width: 180,
    height: 60,
    resizeMode: 'contain',
  },

  // Indicadores otimizados para TV (horizontal, mais espaçados)
  indicadoresTV: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 16,
  },

  indicadorTV: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    minHeight: 100,
  },

  indicadorLabelTV: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '600',
  },

  indicadorValorTV: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },

  // Filtros otimizados para TV (2 linhas)
  filtrosTV: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },

  filtroSectionTV: {
    marginBottom: 16,
  },

  filtroLabelTV: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },

  filtroScrollTV: {
    flexDirection: 'row',
  },

  filtroButtonTV: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    minWidth: 120,
    alignItems: 'center',
  },

  filtroButtonTextTV: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Busca otimizada para TV
  searchContainerTV: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 12,
  },

  inputTV: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },

  searchButtonTV: {
    backgroundColor: '#007bff',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },

  searchButtonTextTV: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  botaoCriarTV: {
    backgroundColor: '#28a745',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 10,
    elevation: 6,
    flex: 1,
    justifyContent: 'center',
    minHeight: 100,
  },

  botaoCriarTextTV: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Tabela otimizada para TV
  tableContainerTV: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    overflow: 'hidden',
  },

  tableHeaderTV: {
    flexDirection: 'row',
    backgroundColor: '#284665',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
  },

  tableHeaderTextTV: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  tableRowTV: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    borderLeftWidth: 6,
    minHeight: 70,
    alignItems: 'center',
  },

  tableCellTextTV: {
    fontSize: 15,
    color: '#fff',
    fontWeight: 'bold',
    paddingHorizontal: 8,
  },

  osNumberTV: {
    fontWeight: 'bold',
    fontSize: 17,
    color: '#fff',
  },

  prioridadeBadgeTV: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    alignSelf: 'center',
  },

  prioridadeBadgeTextTV: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },

  // Colunas da tabela TV (proporções ajustadas para paisagem)
  colOSTV: { width: '8%', alignItems: 'center' },
  colClienteTV: { width: '22%' },
  colStatusTV: { width: '14%', alignItems: 'center' },
  colPrioridadeTV: { width: '12%', alignItems: 'center' },
  colSetorTV: { width: '14%', alignItems: 'center' },
  colDataTV: { width: '10%', alignItems: 'center' },
  colProblemaTV: { width: '20%' },

  // Estados de carregamento e vazio
  loadingContainerTV: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },

  loadingTextTV: {
    color: '#fff',
    fontSize: 18,
    marginTop: 16,
  },

  emptyContainerTV: {
    padding: 60,
    alignItems: 'center',
  },

  emptyTextTV: {
    color: '#fff',
    fontSize: 20,
    opacity: 0.7,
  },

  // Refresh button para TV
  refreshButtonTV: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    marginLeft: 16,
  },

  // Modo button para TV
  modeButtonTV: {
    backgroundColor: '#6c757d',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
    marginLeft: 16,
  },

  modeButtonTextTV: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
})
