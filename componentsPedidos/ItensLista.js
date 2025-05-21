// ItensList.js
import React from 'react'
import {
  FlatList,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'

export default function ItensList({ itens, onEdit, onRemove }) {
  return (
    <FlatList
      data={itens}
      keyExtractor={(item) => item.iped_prod.toString()}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <Text style={styles.text} numberOfLines={1} ellipsizeMode="tail">
            {(item?.produto_nome || 'Sem nome').slice(0, 10)} qtd -
            {(Number(item.iped_quan) || 0).toFixed(2)} x{' '}
            {(Number(item.iped_unit) || 0).toFixed(2)} ={' '}
            {(Number(item.iped_tota) || 0).toFixed(2)}
          </Text>
          <View style={styles.botoesContainer}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => onEdit(item)}>
              <Text style={styles.editText}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.removerButton}
              onPress={() => onRemove(item)}>
              <Text style={[styles.editText, { color: 'white' }]}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  item: {
    marginVertical: 6,
    backgroundColor: '#2c2c2c',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  text: {
    color: '#faebd7',
    fontWeight: '700',
    fontSize: 12,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    flex: 1,
  },
  botoesContainer: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  editButton: {
    backgroundColor: '#fffaaf',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    justifyContent: 'center',
  },
  removerButton: {
    backgroundColor: '#ff7b7b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    justifyContent: 'center',
    marginLeft: 10,
  },
  editText: {
    color: '#1a1a1a',
    fontWeight: '700',
  },
})
