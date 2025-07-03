import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function DRECards({ dados }) {
  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(valor) || 0)
  }

  const calcularMargem = (lucro, receita) => {
    if (!receita || receita === 0) return '0%'
    return `${((lucro / receita) * 100).toFixed(1)}%`
  }

  const cards = [
    {
      titulo: '💰 Receita Bruta',
      valor: dados.receita_bruta,
      cor: '#4CAF50',
      icone: '📈',
    },
    {
      titulo: '📉 Deduções',
      valor: dados.deducoes,
      cor: '#FF9800',
      icone: '➖',
    },
    {
      titulo: '💵 Receita Líquida',
      valor: dados.receita_liquida,
      cor: '#2196F3',
      icone: '💎',
    },
    {
      titulo: '🏭 CMV',
      valor: dados.cmv,
      cor: '#F44336',
      icone: '🔧',
    },
    {
      titulo: '🎯 Lucro Bruto',
      valor: dados.lucro_bruto,
      cor: '#8BC34A',
      icone: '🏆',
      margem: calcularMargem(dados.lucro_bruto, dados.receita_liquida),
    },
    {
      titulo: '💸 Total Despesas',
      valor: dados.total_despesas,
      cor: '#E91E63',
      icone: '📊',
    },
    {
      titulo: '🎉 Resultado Operacional',
      valor: dados.resultado_operacional,
      cor: dados.resultado_operacional >= 0 ? '#4CAF50' : '#F44336',
      icone: dados.resultado_operacional >= 0 ? '✅' : '❌',
      margem: calcularMargem(dados.resultado_operacional, dados.receita_liquida),
    },
  ]

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>📊 Indicadores DRE</Text>
      
      <View style={styles.cardsContainer}>
        {cards.map((card, index) => (
          <View key={index} style={[styles.card, { borderLeftColor: card.cor }]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcone}>{card.icone}</Text>
              <Text style={styles.cardTitulo}>{card.titulo}</Text>
            </View>
            
            <Text style={[styles.cardValor, { color: card.cor }]}>
              {formatarMoeda(card.valor)}
            </Text>
            
            {card.margem && (
              <Text style={styles.cardMargem}>
                Margem: {card.margem}
              </Text>
            )}
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
    fontSize: 20,
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
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: '48%',
    borderLeftWidth: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardIcone: {
    fontSize: 20,
    marginRight: 8,
  },
  cardTitulo: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    flex: 1,
  },
  cardValor: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardMargem: {
    fontSize: 11,
    color: '#888',
    fontStyle: 'italic',
  },
})