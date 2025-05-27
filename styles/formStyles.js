import { StyleSheet } from 'react-native'

export default StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#fff',
  },
  label: {
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 5,
    backgroundColor: '#fafafa',
  },
  choiceButton: {
    padding: 10,
    borderRadius: 5,
    marginVertical: 3,
    backgroundColor: '#eee',
  },
  choiceButtonSelected: {
    backgroundColor: '#007bff',
  },
  choiceButtonText: {
    color: '#333',
  },
  choiceButtonTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: '#777',
    marginRight: 10,
    borderRadius: 4,
  },
  checkboxChecked: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  datePickerWrapper: {
    marginTop: 15,
  },
  dateButton: {
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 5,
  },
  dateButtonText: {
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 6,
    marginVertical: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
})
