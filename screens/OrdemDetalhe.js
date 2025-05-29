import React from 'react'
import { ScrollView, View, Text, StyleSheet } from 'react-native'

const OrdemDetalhe = ({ route }) => {
  const { ordem } = route.params

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>OS #{ordem.orde_nume}</Text>

      <View style={styles.item}>
        <Text style={styles.label}>Tipo:</Text>
        <Text>{ordem.orde_tipo || '-'}</Text>
      </View>

      <View style={styles.item}>
        <Text style={styles.label}>Status:</Text>
        <Text>{ordem.orde_stat || '-'}</Text>
      </View>

      <View style={styles.item}>
        <Text style={styles.label}>Prioridade:</Text>
        <Text>{ordem.orde_prio || '-'}</Text>
      </View>

      <View style={styles.item}>
        <Text style={styles.label}>Data abertura:</Text>
        <Text>{ordem.orde_data_aber || '-'}</Text>
      </View>

      <View style={styles.item}>
        <Text style={styles.label}>Hora abertura:</Text>
        <Text>{ordem.orde_hora_aber || '-'}</Text>
      </View>

      <View style={styles.item}>
        <Text style={styles.label}>Problema reportado:</Text>
        <Text>{ordem.orde_prob || '-'}</Text>
      </View>

      <View style={styles.item}>
        <Text style={styles.label}>Descrição defeito:</Text>
        <Text>{ordem.orde_defe_desc || '-'}</Text>
      </View>

      <View style={styles.item}>
        <Text style={styles.label}>Observações:</Text>
        <Text>{ordem.orde_obse || '-'}</Text>
      </View>

      <View style={styles.item}>
        <Text style={styles.label}>Placa:</Text>
        <Text>{ordem.orde_plac || '-'}</Text>
      </View>

      <View style={styles.item}>
        <Text style={styles.label}>Data fechamento:</Text>
        <Text>{ordem.orde_data_fech || '-'}</Text>
      </View>

      <View style={styles.item}>
        <Text style={styles.label}>Hora fechamento:</Text>
        <Text>{ordem.orde_hora_fech || '-'}</Text>
      </View>

      <View style={styles.item}>
        <Text style={styles.label}>Usuário abertura:</Text>
        <Text>{ordem.orde_usua_aber || '-'}</Text>
      </View>

      <View style={styles.item}>
        <Text style={styles.label}>Última alteração:</Text>
        <Text>{ordem.orde_ulti_alte || '-'}</Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: {
    fontWeight: 'bold',
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  item: { marginBottom: 12 },
  label: { fontWeight: 'bold', marginBottom: 4 },
})

export default OrdemDetalhe
