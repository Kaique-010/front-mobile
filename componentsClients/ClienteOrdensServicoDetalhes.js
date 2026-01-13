import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { fetchClienteOrdensServico } from '../services/clienteService'
import { formatCurrency, formatDate } from '../utils/formatters'

const ClienteOrdensServicoDetalhes = ({ route, navigation }) => {
  const { ordemId } = route.params
  const [ordem, setOrdem] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarOrdem()
  }, [ordemId])

  const carregarOrdem = async () => {
    try {
      setLoading(true)
      const ordens = await fetchClienteOrdensServico()
      const ordemEncontrada = ordens.find((o) => o.id === ordemId)

      if (ordemEncontrada) {
        setOrdem(ordemEncontrada)
      } else {
        Alert.alert('Erro', 'Ordem de serviço não encontrada')
        navigation.goBack()
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes da ordem:', error)
      Alert.alert(
        'Erro',
        'Não foi possível carregar os detalhes da ordem de serviço'
      )
      navigation.goBack()
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    // Handle string or number status
    const statusStr = String(status)
    const statusNum = Number(status)

    if (
      statusNum === 0 ||
      statusStr === '0' ||
      statusStr === 'A' ||
      statusStr === 'aberta'
    )
      return '#93e0d6ff'
    if (statusNum === 1 || statusStr === '1') return '#ada15cff'
    if (statusNum === 2 || statusStr === '2') return '#78bbc9ff'
    if (statusNum === 3 || statusStr === '3') return '#6cac8eff'
    if (
      statusNum === 4 ||
      statusStr === '4' ||
      statusStr === 'C' ||
      statusStr === 'Finalizada'
    )
      return '#94d89dff'
    if (
      statusNum === 5 ||
      statusStr === '5' ||
      statusStr === 'X' ||
      statusStr === 'cancelada'
    )
      return '#d65661ff'
    if (statusNum === 20 || statusStr === '20') return '#FFD700'
    if (statusNum === 21 || statusStr === '21') return '#af4e56ff'
    if (statusNum === 22 || statusStr === '22') return '#72ac91ff'
    return '#8B8BA7'
  }

  const formatStatus = (status) => {
    switch (status) {
      case 'aberta':
      case 'A':
      case 0:
        return 'Aberta'
      case 1:
        return 'Orçamento Gerado'
      case 2:
        return 'Aguardando liberação'
      case 3:
        return 'Liberada'
      case 4:
        return 'Finalizada'
      case 5:
        return 'Reprovada'
      case 20:
        return 'Parcial'
      case 21:
        return 'Em atraso'
      case 22:
        return 'Em Estoque'
      case 'em_andamento':
      case 'E':
        return 'Em Andamento'
      case 'concluida':
      case 'C':
        return 'Concluída'
      case 'cancelada':
      case 'X':
        return 'Cancelada'
      default:
        // Verifica se status é string antes de tentar usar métodos de string
        if (typeof status === 'string') {
          return (
            status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')
          )
        }
        return 'Desconhecido'
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#00D4FF" />
          <Text style={styles.loadingText}>
            Carregando detalhes da ordem...
          </Text>
        </View>
      </View>
    )
  }

  if (!ordem) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#d65661ff" />
        <Text style={styles.errorText}>Ordem de serviço não encontrada</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          OS #{ordem.orde_nume || ordem.id}
        </Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(ordem.orde_stat_orde) },
          ]}>
          <Text style={styles.statusText}>
            {formatStatus(ordem.orde_stat_orde)}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações Gerais</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>DATA DE ABERTURA</Text>
            <Text style={styles.infoValue}>
              {formatDate(ordem.orde_data_aber)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>PREVISÃO</Text>
            <Text style={styles.infoValue}>
              {formatDate(ordem.orde_data_prev)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>VALOR TOTAL</Text>
            <Text style={styles.infoValue}>
              {formatCurrency(ordem.orde_tota)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Descrição do Serviço</Text>
        <View style={styles.descricaoCard}>
          <Text style={styles.descricaoText}>
            {ordem.orde_defe_desc || 'Nenhuma descrição informada'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Serviços</Text>
        {ordem.servicos && ordem.servicos.length > 0 ? (
          ordem.servicos.map((servico, index) => (
            <View key={index} style={styles.itemCard}>
              <Text style={styles.itemNome}>{servico.servico_nome}</Text>
              <View style={styles.itemDetails}>
                <View style={styles.itemRow}>
                  <Text style={styles.itemLabel}>QUANTIDADE</Text>
                  <Text style={styles.itemValue}>{servico.serv_quan}</Text>
                </View>
                <View style={styles.itemRow}>
                  <Text style={styles.itemLabel}>VALOR UNITÁRIO</Text>
                  <Text style={styles.itemValue}>
                    {formatCurrency(servico.serv_unit)}
                  </Text>
                </View>
                <View style={styles.itemRow}>
                  <Text style={styles.itemLabel}>SUBTOTAL</Text>
                  <Text style={styles.itemValue}>
                    {formatCurrency(
                      servico.serv_tota || servico.serv_quan * servico.serv_unit
                    )}
                  </Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Nenhum serviço encontrado</Text>
          </View>
        )}
      </View>
      

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resumo de Valores</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>SUBTOTAL</Text>
            <Text style={styles.infoValue}>
              {formatCurrency(ordem.orde_tota || ordem.orde_tota)}
            </Text>
          </View>
          {ordem.orde_desc > 0 && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>DESCONTO</Text>
              <Text style={styles.infoValue}>
                - {formatCurrency(ordem.orde_desc)}
              </Text>
            </View>
          )}
          <View style={[styles.infoRow, styles.totalRow]}>
            <Text style={[styles.infoLabel, styles.totalLabel]}>TOTAL</Text>
            <Text style={[styles.infoValue, styles.totalValue]}>
              {formatCurrency(ordem.orde_tota)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.goBack()}>
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
  descricaoCard: {
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
  descricaoText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    fontWeight: '400',
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

export default ClienteOrdensServicoDetalhes
