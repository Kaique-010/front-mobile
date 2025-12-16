import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import styles from '../styles/cobrancasStyles'

export default function itemCobranca({
  item,
  selecionadas,
  toggleSelecionada,
  abrirModalCobranca,
  formatarData,
  formatarValor,
}) {
  const isSelecionada = selecionadas.includes(item.id || item.numero_titulo)
  return (
    <TouchableOpacity
      style={[
        styles.itemContainer,
        isSelecionada && { borderColor: '#4caf50', borderWidth: 2 },
      ]}
      onPress={() => toggleSelecionada(item)}
      onLongPress={() => abrirModalCobranca(item)}>
      <View style={styles.itemHeader}>
        <Text style={styles.clienteNome}>{item.cliente_nome}</Text>
        <Text style={styles.valor}>{formatarValor(item.valor)}</Text>
      </View>
      <View style={styles.itemDetails}>
        <Text style={styles.detailText}>Título: {item.numero_titulo}</Text>
        <Text style={styles.detailText}>
          Vencimento: {formatarData(item.vencimento)}
        </Text>
      </View>
      <View style={styles.itemFooter}>
        <Text style={styles.formaRecebimento}>
          {item.forma_recebimento_nome}
        </Text>
        <Text
          style={[
            styles.status,
            new Date(item.vencimento) < new Date()
              ? styles.vencido
              : styles.aVencer,
          ]}>
          {new Date(item.vencimento) < new Date() ? 'VENCIDO' : 'A VENCER'}
        </Text>
      </View>
    </TouchableOpacity>
  )
}
