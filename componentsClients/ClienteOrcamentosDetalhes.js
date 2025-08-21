import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { fetchClienteOrcamentos } from '../services/clienteService'
import { formatCurrency, formatDate } from '../utils/formatters'

const ClienteOrcamentosDetalhes = ({ route, navigation }) => {
  const { orcamentoId } = route.params
  const [orcamento, setOrcamento] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarOrcamento()
  }, [orcamentoId])

  const carregarOrcamento = async () => {
    try {
      setLoading(true)
      const orcamentos = await fetchClienteOrcamentos()
      const orcamentoEncontrado = orcamentos.find(o => o.id === orcamentoId)
      
      if (orcamentoEncontrado) {
        setOrcamento(orcamentoEncontrado)
      } else {
        Alert.alert('Erro', 'Orçamento não encontrado')
        navigation.goBack()
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes do orçamento:', error)
      Alert.alert('Erro', 'Não foi possível carregar os detalhes do orçamento')
      navigation.goBack()
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendente':
      case 'P':
        return '#FFD700'
      case 'aprovado':
      case 'A':
        return '#00FF88'
      case 'recusado':
      case 'R':
        return '#FF4757'
      case 'vencido':
      case 'V':
        return '#8B8BA7'
      default:
        return '#8B8BA7'
    }
  }

  const formatStatus = (status) => {
    switch (status) {
      case 'pendente': case 'P': return 'Pendente'
      case 'aprovado': case 'A': return 'Aprovado'
      case 'recusado': case 'R': return 'Recusado'
      case 'vencido': case 'V': return 'Vencido'
      default: return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Desconhecido'
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#00D4FF" />
          <Text style={styles.loadingText}>Carregando detalhes do orçamento...</Text>
        </View>
      </View>
    )
  }

  if (!orcamento) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#FF4757" />
        <Text style={styles.errorText}>Orçamento não encontrado</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Orçamento #{orcamento.numero || orcamento.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(orcamento.status) }]}>
          <Text style={styles.statusText}>{formatStatus(orcamento.status)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações Gerais</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>DATA DO ORÇAMENTO</Text>
            <Text style={styles.infoValue}>{formatDate(orcamento.data_orcamento)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>VALIDADE</Text>
            <Text style={styles.infoValue}>{formatDate(orcamento.data_validade)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>VALOR TOTAL</Text>
            <Text style={styles.infoValue}>{formatCurrency(orcamento.valor_total)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>VENDEDOR</Text>
            <Text style={styles.infoValue}>{orcamento.vendedor || 'Não informado'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Itens do Orçamento</Text>
        {orcamento.itens && orcamento.itens.length > 0 ? (
          orcamento.itens.map((item, index) => (
            <View key={index} style={styles.itemCard}>
              <Text style={styles.itemNome}>{item.produto || item.descricao}</Text>
              <View style={styles.itemDetails}>
                <View style={styles.itemRow}>
                  <Text style={styles.itemLabel}>QUANTIDADE</Text>
                  <Text style={styles.itemValue}>{item.quantidade}</Text>
                </View>
                <View style={styles.itemRow}>
                  <Text style={styles.itemLabel}>VALOR UNITÁRIO</Text>
                  <Text style={styles.itemValue}>{formatCurrency(item.valor_unitario)}</Text>
                </View>
                <View style={styles.itemRow}>
                  <Text style={styles.itemLabel}>SUBTOTAL</Text>
                  <Text style={styles.itemValue}>{formatCurrency(item.subtotal || (item.quantidade * item.valor_unitario))}</Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Nenhum item encontrado</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resumo de Valores</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>SUBTOTAL</Text>
            <Text style={styles.infoValue}>{formatCurrency(orcamento.subtotal || orcamento.valor_total)}</Text>
          </View>
          {orcamento.desconto > 0 && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>DESCONTO</Text>
              <Text style={styles.infoValue}>- {formatCurrency(orcamento.desconto)}</Text>
            </View>
          )}
          <View style={[styles.infoRow, styles.totalRow]}>
            <Text style={[styles.infoLabel, styles.totalLabel]}>TOTAL</Text>
            <Text style={[styles.infoValue, styles.totalValue]}>{formatCurrency(orcamento.valor_total)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.bottomSpacing} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F0F23',
  },
  loadingContent: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '500',
    color: '#8B8BA7',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F0F23',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8B8BA7',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  backButton: {
    backgroundColor: '#00D4FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#16213E',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    borderWidth: 0.8,
    borderColor: '#2D2D44',
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D44',
  },
  infoLabel: {
    fontSize: 10,
    color: '#8B8BA7',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  totalRow: {
    marginTop: 8,
    borderBottomWidth: 0,
    paddingTop: 16,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#00D4FF',
  },
  itemCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    borderWidth: 0.8,
    borderColor: '#2D2D44',
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  itemDetails: {
    marginTop: 4,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemLabel: {
    fontSize: 10,
    color: '#8B8BA7',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  itemValue: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  emptyCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    borderWidth: 0.8,
    borderColor: '#2D2D44',
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#8B8BA7',
    fontStyle: 'italic',
    fontSize: 14,
    fontWeight: '500',
  },
  actions: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  actionButton: {
    backgroundColor: '#00D4FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
  bottomSpacing: {
    height: 32,
  },
})

export default ClienteOrcamentosDetalhes