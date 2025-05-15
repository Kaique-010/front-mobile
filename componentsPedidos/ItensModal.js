import React, { useState } from 'react'
import { Modal, View, TextInput, Button, Text } from 'react-native'

export default function ItensModal({ visivel, onFechar, onAdicionar }) {
  const [produtoId, setProdutoId] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [preco, setPreco] = useState('')
  const [itemEditando, setItemEditando] = useState(null)
  const [modalVisivel, setModalVisivel] = useState(false)

  const handleEditarItem = (item) => {
    setItemEditando(item)
    setModalVisivel(true)
  }

  const adicionar = () => {
    const item = {
      iped_prod: parseInt(produtoId),
      iped_quan: parseFloat(quantidade),
      iped_unit: parseFloat(preco),
      iped_tota: parseFloat(quantidade) * parseFloat(preco),
    }
    onAdicionar(item)
    setProdutoId('')
    setQuantidade('')
    setPreco('')
  }

  return (
    <Modal visible={visivel} animationType="slide">
      <View>
        <Text>ID Produto:</Text>
        <TextInput
          keyboardType="numeric"
          value={produtoId}
          onChangeText={setProdutoId}
        />

        <Text>Quantidade:</Text>
        <TextInput
          keyboardType="numeric"
          value={quantidade}
          onChangeText={setQuantidade}
        />

        <Text>Preço Unitário:</Text>
        <TextInput
          keyboardType="numeric"
          value={preco}
          onChangeText={setPreco}
        />

        <Text>
          Total: R$ {parseFloat(quantidade || 0) * parseFloat(preco || 0)}
        </Text>

        <Button title="Adicionar" onPress={adicionar} />
        <Button title="Cancelar" onPress={onFechar} />
      </View>
    </Modal>
  )
}
