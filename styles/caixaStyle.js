import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#202a34',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f5f5f5',
    marginTop: 10,
  },
  label: {
    fontSize: 16,
    color: '#f5f5f5',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#222',
    borderColor: '#007bff',
    borderRadius: 8,
    borderWidth: 1,
    color: '#faebd7',
    height: 44,
    paddingHorizontal: 12,
    paddingRight: 40,
    marginBottom: 10,
    textAlign: 'center',
  },
  buttonGroup: {
    marginTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#00cc66',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    gap: 10,
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
})

export default styles
