import { StyleSheet } from 'react-native'

export default StyleSheet.create({
  containerMobile: {
    flex: 1,
    backgroundColor: '#182C39',
    padding: 8,
  },
  logoMobile: {
    width: 140,
    height: 45,
    resizeMode: 'contain',
    alignSelf: 'flex-start',
  },
  indicadoresMobile: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  indicadorMobile: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    width: '23%',
    marginBottom: 8,
  },
  indicadorLabelMobile: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#000000ff',
    marginBottom: 4,
    textAlign: 'center',
  },
  indicadorValorMobile: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000ff',
    textAlign: 'center',
  },
  filtrosMobileFiltro: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom:15,
    marginTop:15,

  },
  filtrosMobile: {
    backgroundColor: '#182C39',
    borderRadius: 8,
    padding: 10,
    marginBottom: 4,
  },
  searchButton: {
    paddingHorizontal: 10,
    paddingVertical: 10,

    borderRadius: 4,
    marginRight: 6,
  },
  filtroButtonMobile: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  filtroButtonTextMobile: {
    color: 'rgba(0, 0, 0, 0.8)',
    fontSize: 13,
    fontWeight: 'bold',
  },
  botaoCriarMobile: {
    backgroundColor: '#28a745',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    width: '23%',
    marginBottom: 10,
    marginTop: 10,
  },
  botaoCriarTextMobile: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  

  // Colunas da tabela mobile
  colOSMobile: { width: '15%' },
  colClienteMobile: { width: '30%' },
  colStatusMobile: { width: '15%' },
  colSetorMobile: { width: '20%' },
  colPrioridadeMobile: { width: '20%' },
  colDataMobile: { width: '0%' }, // Oculta no mobile
  colProblemaMobile: { width: '0%' }, // Oculta no mobile
})
