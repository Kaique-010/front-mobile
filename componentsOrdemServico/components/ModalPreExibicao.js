import React, { useState } from 'react'
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native'

const ModalPreExibicao = ({ visible, onCancel, onConfirm, dados }) => {
  const [detalhesVisiveis, setDetalhesVisiveis] = useState(false)

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
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <Text style={styles.label}>Total de Horas:</Text>
                <TouchableOpacity
                  onPress={() => setDetalhesVisiveis(!detalhesVisiveis)}
                  style={styles.btnExpandir}>
                  <Text style={styles.btnExpandirTexto}>
                    {detalhesVisiveis ? '-' : '+'}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.value}>
                {dados?.totalHoras
                  ? Number(dados.totalHoras).toFixed(2)
                  : '0.00'}{' '}
                h
              </Text>

              {detalhesVisiveis && dados?.detalhesHoras?.length > 0 && (
                <View style={styles.listaHoras}>
                  {dados.detalhesHoras.map((item, index) => (
                    <View key={index} style={styles.itemHora}>
                      <Text style={styles.itemData}>{item.data}</Text>
                      <View style={styles.itemPeriodos}>
                        <Text style={styles.itemTexto}>
                          M: {item.manhaIni || '--'} - {item.manhaFim || '--'}
                        </Text>
                        <Text style={styles.itemTexto}>
                          T: {item.tardeIni || '--'} - {item.tardeFim || '--'}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
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
  btnExpandir: {
    backgroundColor: '#10a2a7',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  btnExpandirTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 18,
  },
  listaHoras: {
    marginTop: 10,
    backgroundColor: '#1a2f3d',
    borderRadius: 8,
    padding: 8,
  },
  itemHora: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#2c3e50',
  },
  itemData: {
    color: '#10a2a7',
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemPeriodos: {
    alignItems: 'flex-end',
  },
  itemTexto: {
    color: '#fff',
    fontSize: 11,
  },
})

export default ModalPreExibicao
