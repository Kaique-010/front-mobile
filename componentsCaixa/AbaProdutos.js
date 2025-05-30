// components/AbaProdutos.js
import React, { useState } from 'react'
import { View, Text, Button, StyleSheet, FlatList } from 'react-native'
import ItensModal from '../componentsPedidos/ItensModal'

export default function AbaProdutos({ produtos, setProdutos }) {
  const [modalVisivel, setModalVisivel] = useState(false)

  const adicionarProduto = (novoItem, itemEditando = null) => {
    if (itemEditando) {
      setProdutos((prev) =>
        prev.map((p) => (p === itemEditando ? novoItem : p))
      )
    } else {
      setProdutos((prev) => [...prev, novoItem])
    }
  }

  return (
    <View style={styles.scene}>
      <Text style={styles.label}>Produtos da venda:</Text>

      {produtos.length === 0 && (
        <Text style={styles.empty}>Nenhum produto adicionado.</Text>
      )}

      <FlatList
        data={produtos}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.produto}>
            <Text style={styles.text}>
              Produto: {item.produtoNome || 'Sem nome'}
            </Text>
            <Text style={styles.text}>Quantidade: {item.iped_quan}</Text>
            <Text style={styles.text}>Preço: R$ {item.iped_unit}</Text>
            <Text style={styles.text}>Total: R$ {item.iped_tota}</Text>
          </View>
        )}
      />

      <Button title="Adicionar Produto" onPress={() => setModalVisivel(true)} />

      <ItensModal
        visivel={modalVisivel}
        onFechar={() => setModalVisivel(false)}
        onAdicionar={adicionarProduto}
        itemEditando={null}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  scene: { flex: 1, padding: 20 },
  label: { color: 'white', marginBottom: 10 },
  empty: { color: 'gray', fontStyle: 'italic' },
  produto: { marginBottom: 10 },
  text: { color: 'white' },
})
