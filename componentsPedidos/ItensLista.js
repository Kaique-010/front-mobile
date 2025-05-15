import React from 'react'
import {
  FlatList,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'

export default function ItensList({ itens, onEdit }) {
  return (
    <FlatList
      data={itens}
      keyExtractor={(_, index) => index.toString()}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <Text style={styles.text}>
            Produto {item.iped_prod} - {item.iped_quan} x {item.iped_unit} ={' '}
            {item.iped_tota}
          </Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => onEdit(item)}>
            <Text style={styles.editText}>Editar</Text>
          </TouchableOpacity>
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
    color: '#d4af37',
    fontWeight: '700',
    fontSize: 12,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    flex: 1,
  },
  editButton: {
    backgroundColor: '#d4af37',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 10,
    justifyContent: 'center',
  },
  editText: {
    color: '#1a1a1a',
    fontWeight: '700',
  },
})
