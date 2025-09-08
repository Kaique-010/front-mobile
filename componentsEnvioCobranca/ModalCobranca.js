import React from 'react'
import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native'
import styles from '../styles/cobrancasStyles'

export default function modalCobranca({
  modalVisible,
  setModalVisible,
  selectedCobranca,
  enviarCobrancaWhatsApp,
  loadingWhats,
  formatarData,
  formatarValor,
}) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}>
      <View style={styles.modalContainer}>
        <ScrollView style={styles.modalContent}>
          <Text style={styles.modalTitle}>Detalhes da Cobrança</Text>
          <Text>Cliente: {selectedCobranca?.cliente_nome}</Text>
          <Text>Título: {selectedCobranca?.numero_titulo}</Text>
          <Text>Parcela: {selectedCobranca?.parcela}</Text>
          <Text>Vencimento: {formatarData(selectedCobranca?.vencimento)}</Text>
          <Text>Valor: {formatarValor(selectedCobranca?.valor)}</Text>
          {/* Adicione mais detalhes se necessário */}
          <TouchableOpacity
            style={styles.enviarButton}
            onPress={enviarCobrancaWhatsApp}
            disabled={loadingWhats}>
            <Text style={styles.enviarButtonText}>
              {loadingWhats ? 'Enviando...' : 'Enviar WhatsApp'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.fecharButton}
            onPress={() => setModalVisible(false)}>
            <Text style={styles.fecharButtonText}>Fechar</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  )
}
