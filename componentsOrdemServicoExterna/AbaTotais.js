import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import { apiPatchComContexto } from '../utils/api'
import Toast from 'react-native-toast-message'
import { gerarPdfServidor as gerarPdfServidorComp } from './OsPdfView'

export default function AbaTotais({
  servicos = [],
  os_os,
  os_clie,
  os_empr,
  os_fili,
}) {
  const [loading, setLoading] = useState(false)
  const totalServicos = servicos.reduce((acc, servico) => {
    const valor = Number(servico.serv_tota) || 0
    return acc + valor
  }, 0)

  const totalGeral = totalServicos

  useEffect(() => {
    const atualizarTotalOrdem = async () => {
      if (!os_os) return
      try {
        await apiPatchComContexto(`osexterna/ordens/${os_os}/`, {
          osex_valo_tota: Number(totalGeral),
          osex_empr: Number(os_empr),
          osex_fili: Number(os_fili),
        })
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Erro ao atualizar total',
          text2: 'Não foi possível salvar o total da ordem de serviço',
        })
      }
    }
    atualizarTotalOrdem()
  }, [totalGeral, os_os, os_empr, os_fili])

  const imprimirServidor = async () => {
    try {
      await gerarPdfServidorComp({
        osex_codi: os_os,
        osex_empr: os_empr,
        osex_fili: os_fili,
      })
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Falha ao gerar o PDF',
      })
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Resumo da Ordem de Serviço</Text>
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Total de Serviços:</Text>
            <Text style={styles.valor}>R$ {totalServicos.toFixed(2)}</Text>
          </View>
          <View style={styles.divisor} />
          <View style={styles.infoRow}>
            <Text style={[styles.label, styles.total]}>Total Geral:</Text>
            <Text style={[styles.valor, styles.totalValor]}>
              R$ {totalGeral.toFixed(2)}
            </Text>
          </View>
        </View>
        <View style={styles.divisor} />
        <TouchableOpacity style={styles.button} onPress={imprimirServidor}>
          <Text style={styles.buttonText}>Gerar/Imprimir O.S.</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a2f3d',
  },
  card: {
    backgroundColor: '#232935',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardTitle: {
    color: '#10a2a7',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: '#1a2f3d',
    borderRadius: 8,
    padding: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  label: {
    color: '#999',
    fontSize: 16,
  },
  valor: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divisor: {
    height: 1,
    backgroundColor: '#2c3e50',
    marginVertical: 20,
  },
  total: {
    color: '#10a2a7',
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValor: {
    color: '#10a2a7',
    fontSize: 20,
  },
  formContainer: {
    backgroundColor: '#1a2f3d',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  pickerLabel: {
    color: '#999',
    fontSize: 16,
    marginBottom: 5,
  },
  pickerContainer: {
    backgroundColor: '#232935',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2c3e50',
  },
  picker: {
    color: '#fff',
    height: 50,
  },
  pickerItem: {
    color: '#fff',
    backgroundColor: '#232935',
  },
  input: {
    marginBottom: 10,
    backgroundColor: '#232935',
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#10a2a7',
    padding: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonDanger: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  titulosContainer: {
    backgroundColor: '#1a2f3d',
    borderRadius: 8,
    padding: 15,
  },
  simulacaoContainer: {
    backgroundColor: '#232935',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  parcelaSimulada: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2c3e50',
  },
  parcelaTexto: {
    color: '#fff',
    fontSize: 14,
  },
  parcelaData: {
    color: '#999',
    fontSize: 14,
  },
  subtitulo: {
    color: '#10a2a7',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tituloItem: {
    backgroundColor: '#232935',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  tituloRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  tituloLabel: {
    color: '#999',
    fontSize: 14,
  },
  tituloValor: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#666',
    opacity: 0.7,
  },
  semTitulosContainer: {
    backgroundColor: '#1a2f3d',
    borderRadius: 8,
    padding: 15,
    marginTop: 15,
    alignItems: 'center',
  },
  semTitulosTexto: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
  },
  buttonErrorText: {
    color: '#ff9999',
    fontSize: 12,
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  printCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  printTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  printRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  printLabel: { color: '#333' },
  printValue: { color: '#000', fontWeight: 'bold' },
  printSection: { color: '#000', fontWeight: 'bold', marginBottom: 6 },
  printHoursRow: { flexDirection: 'row', justifyContent: 'space-between' },
  printHoursCol: { color: '#000', fontSize: 12 },
  signRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  signBox: {
    width: '48%',
    height: 100,
    borderWidth: 1,
    borderColor: '#999',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signImage: { width: '100%', height: '100%', resizeMode: 'contain' },
  signPlaceholder: { color: '#999' },
  modalContent: {
    backgroundColor: '#232935',
    borderRadius: 8,
    padding: 20,
  },
  modalTitle: {
    color: '#10a2a7',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    marginBottom: 15,
    backgroundColor: '#1a2f3d',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonCancel: {
    backgroundColor: '#666',
  },
  modalButtonSave: {
    backgroundColor: '#10a2a7',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tituloHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tituloNumero: {
    color: '#10a2a7',
    fontSize: 16,
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: '#10a2a7',
    padding: 8,
    borderRadius: 6,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: '#10a2a7',
    marginTop: 10,
    fontSize: 16,
  },
  statusAberta: {
    color: '#ffd700',
  },
  statusPago: {
    color: '#00ff00',
  },
  statusCancelado: {
    color: '#ff0000',
  },
})
