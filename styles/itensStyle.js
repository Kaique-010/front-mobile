import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#121212', // Fundo escuro
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#fff', // Texto branco
  },
  input: {
    height: 40,
    borderColor: '#555', // Cor de borda mais suave
    borderWidth: 1,
    borderRadius: 4,
    paddingLeft: 8,
    marginBottom: 16,
    fontSize: 16,
    color: '#fff', // Texto branco
    backgroundColor: '#333', // Fundo do input escuro
  },
  sugestaoItem: {
    padding: 12,
    backgroundColor: '#333', // Fundo escuro para itens
    borderRadius: 4,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sugestaoTexto: {
    fontSize: 16,
    color: '#fff', // Texto branco
  },
  scanButton: {
    padding: 8,
    backgroundColor: '#4CAF50', // Verde para o botão de escanear
    borderRadius: 4,
    marginLeft: 8,
  },
  incluirButtonText: {
    color: '#fff', // Texto branco
    fontWeight: 'bold',
  },
  incluirButton: {
    backgroundColor: '#007BFF', // Azul para o botão de salvar
    padding: 16,
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)', // Fundo escuro com opacidade para o modal
  },
  modalContent: {
    backgroundColor: '#121212', // Fundo escuro no modal
    padding: 20,
    borderRadius: 8,
    width: '80%',
  },
})

export default styles
