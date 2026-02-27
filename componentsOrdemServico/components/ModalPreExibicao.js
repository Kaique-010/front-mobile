import React from 'react'
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native'

const ModalPreExibicao = ({ visible, onCancel, onConfirm, dados }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Confirmação da O.S</Text>

          <ScrollView style={styles.scrollView}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Cliente:</Text>
              <Text style={styles.value}>{dados?.cliente || '-'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Atendente:</Text>
              <Text style={styles.value}>{dados?.atendente || '-'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Local:</Text>
              <Text style={styles.value}>{dados?.local || '-'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Observações:</Text>
              <Text style={styles.value}>{dados?.observacoes || '-'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Total de Horas:</Text>
              <Text style={styles.value}>
                {dados?.totalHoras
                  ? Number(dados.totalHoras).toFixed(2)
                  : '0.00'}{' '}
                h
              </Text>
            </View>
          </ScrollView>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalButtonCancel}
              onPress={onCancel}>
              <Text style={styles.modalButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButtonConfirm}
              onPress={onConfirm}>
              <Text style={styles.modalButtonText}>Confirmar e Assinar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#232935',
    padding: 20,
    borderRadius: 10,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#10a2a7',
    textAlign: 'center',
  },
  scrollView: {
    marginBottom: 20,
  },
  infoRow: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2c3e50',
    paddingBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#10a2a7',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalButtonCancel: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#666',
  },
  modalButtonConfirm: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#10a2a7',
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
})

export default ModalPreExibicao
