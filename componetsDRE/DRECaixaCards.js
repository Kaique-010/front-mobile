import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Feather } from '@expo/vector-icons'

export default function DRECaixaCards({ dados }) {
  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(valor) || 0)
  }

  const calcularVariacao = (recebido, despesas) => {
    if (despesas === 0) return 100
    return ((recebido - despesas) / Math.abs(despesas)) * 100
  }

  const cards = [
    {
      titulo: 'Total Recebido',
      valor: dados.total_recebido || 0,
      icone: 'trending-up',
      cor: '#4CAF50',
      corFundo: '#E8F5E8',
    },
    {
      titulo: 'Total Despesas',
      valor: dados.total_despesas || 0,
      icone: 'trending-down',
      cor: '#F44336',
      corFundo: '#FFEBEE',
    },
    {
      titulo: 'Resultado Caixa',
      valor: dados.resultado_caixa || 0,
      icone: dados.resultado_caixa >= 0 ? 'dollar-sign' : 'alert-triangle',
      cor: dados.resultado_caixa >= 0 ? '#4CAF50' : '#F44336',
      corFundo: dados.resultado_caixa >= 0 ? '#E8F5E8' : '#FFEBEE',
    },
    {
      titulo: 'Variação %',
      valor: calcularVariacao(dados.total_recebido, dados.total_despesas),
      icone: 'percent',
      cor: dados.resultado_caixa >= 0 ? '#4CAF50' : '#F44336',
      corFundo: dados.resultado_caixa >= 0 ? '#E8F5E8' : '#FFEBEE',
      isPercentual: true,
    },
  ]

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>💰 Indicadores de Caixa</Text>
      <View style={styles.cardsContainer}>
        {cards.map((card, index) => (
          <View
            key={index}
            style={[
              styles.card,
              { backgroundColor: card.corFundo, borderLeftColor: card.cor },
            ]}>
            <View style={styles.cardHeader}>
              <Feather name={card.icone} size={20} color={card.cor} />
              <Text style={styles.cardTitulo}>{card.titulo}</Text>
            </View>
            <Text style={[styles.cardValor, { color: card.cor }]}>
              {card.isPercentual
                ? `${card.valor.toFixed(1)}%`
                : formatarMoeda(card.valor)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitulo: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    fontWeight: '500',
  },
  cardValor: {
    fontSize: 16,
    fontWeight: 'bold',
  },
})