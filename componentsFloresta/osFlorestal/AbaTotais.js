import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'
import Toast from 'react-native-toast-message'
import { apiPostComContexto, apiGetComContexto } from '../../utils/api' 
import { Ionicons } from '@expo/vector-icons'
import useContextoApp from '../../hooks/useContextoApp'

export default function AbaTotais({
  pecas = [],
  servicos = [],
  totaisOs,
  setTotaisOs,
  osfl_orde,
  financeiroGerado,
  onFinanceiroGerado,
}) {
  const { empresaId, filialId } = useContextoApp()
  const [carregando, setCarregando] = useState(false)

  // Estado inicial dos totais
  const [totaisIniciais] = useState({
    osfl_tota_hect: 0,
    osfl_desc: 0,
    osfl_outr: 0,
    osfl_tota: 0,
  })

  // Calcula automaticamente o total quando peças ou serviços mudam
  useEffect(() => {
    calcularTotalAutomatico()
  }, [pecas, servicos])

  // Carrega os totais da OS quando o componente monta
  useEffect(() => {
    if (
      osfl_orde !== undefined &&
      osfl_orde !== null &&
      empresaId !== undefined &&
      empresaId !== null &&
      filialId !== undefined &&
      filialId !== null
    ) {
      carregarTotaisOs()
    }
  }, [osfl_orde, empresaId, filialId])

  const carregarTotaisOs = async () => {
    try {
      setCarregando(true)
      console.log('Carregando totais para OS:', osfl_orde)

      const response = await apiGetComContexto(`Floresta/osflorestal/${osfl_orde}/`, {
        osfl_empr: empresaId,
        osfl_fili: filialId,
      })

      if (response) {
        setTotaisOs({
          osfl_tota_hect: parseFloat(response.osfl_tota_hect || 0),
          osfl_desc: parseFloat(response.osfl_desc || 0),
          osfl_outr: parseFloat(response.osfl_outr || 0),
          osfl_tota: parseFloat(response.osfl_tota || 0),
        })
      }
    } catch (error) {
      console.error(
        'Erro ao carregar totais da OS:',
        error.response?.data || error.message
      )
      // Não mostra toast de erro aqui pois pode ser uma OS nova
    } finally {
      setCarregando(false)
    }
  }

  const calcularTotalAutomatico = () => {
    const totalPecas = pecas.reduce((acc, peca) => acc + (peca.peca_tota || 0), 0)
    const totalServicos = servicos.reduce((acc, servico) => acc + (servico.serv_tota || 0), 0)
    
    const totalGeral = totalPecas + totalServicos + (totaisOs?.osfl_outr || 0)

    setTotaisOs(prev => ({
      ...prev,
      osfl_tota: totalGeral
    }))
  }

  const salvarTotais = async () => {
    try {
      setCarregando(true)
      const payload = {
        osfl_orde: osfl_orde,
        osfl_empr: empresaId,
        osfl_fili: filialId,
        osfl_tota_hect: totaisOs?.osfl_tota_hect || 0,
        osfl_desc: totaisOs?.osfl_desc || 0,
        osfl_outr: totaisOs?.osfl_outr || 0,
        osfl_tota: totaisOs?.osfl_tota || 0,
      }

      await apiPostComContexto(
        `Floresta/osflorestal/${osfl_orde}/update-totais/`,
        payload
      )

      Toast.show({
        type: 'success',
        text1: 'Totais salvos com sucesso!',
        text2: `Total da OS: R$ ${(totaisOs?.osfl_tota || 0).toFixed(2)}`,
      })
    } catch (error) {
      console.error('Erro ao salvar totais:', error)
      Toast.show({
        type: 'error',
        text1: 'Erro ao salvar totais',
        text2: error.message || 'Tente novamente',
      })
    } finally {
      setCarregando(false)
    }
  }

  const gerarFinanceiro = async () => {
    if (financeiroGerado) {
      Alert.alert(
        'Financeiro já gerado',
        'O financeiro desta OS já foi gerado. Deseja regerar?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Regerar', onPress: () => processarFinanceiro() },
        ]
      )
    } else {
      processarFinanceiro()
    }
  }

  const processarFinanceiro = async () => {
    try {
      setCarregando(true)
      const payload = {
        osfl_orde: osfl_orde,
        osfl_empr: empresaId,
        osfl_fili: filialId,
      }

      await apiPostComContexto(
        `Floresta/osflorestal/${osfl_orde}/gerar-financeiro/`,
        payload
      )

      Toast.show({
        type: 'success',
        text1: 'Financeiro gerado com sucesso!',
        text2: 'A OS foi finalizada',
      })

      if (onFinanceiroGerado) {
        onFinanceiroGerado(true)
      }
    } catch (error) {
      console.error('Erro ao gerar financeiro:', error)
      Toast.show({
        type: 'error',
        text1: 'Erro ao gerar financeiro',
        text2: error.message || 'Tente novamente',
      })
    } finally {
      setCarregando(false)
    }
  }

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor || 0)
  }

  // Calcula totais para exibição
  const totalPecas = pecas.reduce((acc, peca) => {
    const total = (peca.peca_quan || 0) * (peca.peca_unit || 0)
    const desconto = peca.peca_desc || 0
    return acc + total - desconto
  }, 0)

  const totalServicos = servicos.reduce((acc, servico) => {
    const total = (servico.serv_quan || 0) * (servico.serv_unit || 0)
    const desconto = servico.serv_desc || 0
    return acc + total - desconto
  }, 0)

  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Carregando totais...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Resumo Financeiro</Text>
        
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Peças:</Text>
          <Text style={styles.totalValue}>{formatarMoeda(totalPecas)}</Text>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Serviços:</Text>
          <Text style={styles.totalValue}>{formatarMoeda(totalServicos)}</Text>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Hectares:</Text>
          <Text style={styles.totalValue}>{(totaisOs?.osfl_tota_hect || 0).toFixed(2)} ha</Text>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Desconto Geral:</Text>
          <Text style={styles.totalValue}>{formatarMoeda(totaisOs?.osfl_desc || 0)}</Text>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Outros Valores:</Text>
          <Text style={styles.totalValue}>{formatarMoeda(totaisOs?.osfl_outr || 0)}</Text>
        </View>

        <View style={[styles.totalRow, styles.totalFinal]}>
          <Text style={styles.totalFinalLabel}>TOTAL GERAL:</Text>
          <Text style={styles.totalFinalValue}>{formatarMoeda(totaisOs?.osfl_tota || 0)}</Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={salvarTotais}
          disabled={carregando}
        >
          {carregando ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="save-outline" size={20} color="#fff" />
              <Text style={styles.buttonText}>Salvar Totais</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            financeiroGerado ? styles.regenerateButton : styles.generateButton
          ]}
          onPress={gerarFinanceiro}
          disabled={carregando}
        >
          {carregando ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons 
                name={financeiroGerado ? "refresh-outline" : "cash-outline"} 
                size={20} 
                color="#fff" 
              />
              <Text style={styles.buttonText}>
                {financeiroGerado ? 'Regerar Financeiro' : 'Gerar Financeiro'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  totalFinal: {
    borderBottomWidth: 0,
    borderTopWidth: 2,
    borderTopColor: '#007bff',
    marginTop: 8,
    paddingTop: 12,
  },
  totalFinalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
  },
  totalFinalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
  },
  actionsContainer: {
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  saveButton: {
    backgroundColor: '#28a745',
  },
  generateButton: {
    backgroundColor: '#007bff',
  },
  regenerateButton: {
    backgroundColor: '#ffc107',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
