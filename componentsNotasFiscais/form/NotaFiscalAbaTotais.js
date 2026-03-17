import React from 'react'
import { View, Text } from 'react-native'
import { notasFiscaisUtils } from '../notasFiscaisService'

export default function NotaFiscalAbaTotais({ styles, totais }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Totais</Text>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Produtos</Text>
        <Text style={styles.totalValue}>
          {notasFiscaisUtils.formatarMoeda(totais.produtos)}
        </Text>
      </View>
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Desconto</Text>
        <Text style={styles.totalValue}>
          {notasFiscaisUtils.formatarMoeda(totais.desconto)}
        </Text>
      </View>
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Tributos (informados)</Text>
        <Text style={styles.totalValue}>
          {notasFiscaisUtils.formatarMoeda(totais.tributos)}
        </Text>
      </View>
      <View style={[styles.totalRow, styles.totalRowStrong]}>
        <Text style={styles.totalLabelStrong}>Total</Text>
        <Text style={styles.totalValueStrong}>
          {notasFiscaisUtils.formatarMoeda(totais.total)}
        </Text>
      </View>
    </View>
  )
}
