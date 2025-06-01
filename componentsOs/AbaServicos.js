import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native'
import ItensModalOs from '../componentsOs/ItensModalOs'

export default function AbaServicos({ servicos, setServicos }) {
  const [modalVisivel, setModalVisivel] = useState(false)
  const [itemEditando, setItemEditando] = useState(null)

  const abrirModal = (item = null) => {
    setItemEditando(item)
    setModalVisivel(true)
  }

  const fecharModal = () => {
    setItemEditando(null)
    setModalVisivel(false)
  }

  const adicionarOuEditarItem = (novoItem, itemAntigo) => {
    if (itemAntigo) {
      setServicos((itens) =>
        itens.map((i) => (i.id === itemAntigo.id ? { ...i, ...novoItem } : i))
      )
    } else {
      setServicos((itens) => [...itens, { ...novoItem, id: Date.now() }])
    }
    fecharModal()
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.item} onPress={() => abrirModal(item)}>
      <Text style={{ color: 'white' }}>{item.servicoNome || 'Serviço'}</Text>
      <Text style={{ color: 'white' }}>
        Qtde: {item.iped_quan} Preço: R$ {item.iped_unit}
      </Text>
    </TouchableOpacity>
  )

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <FlatList
        data={servicos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={{ color: 'white', textAlign: 'center', marginTop: 20 }}>
            Nenhum serviço adicionado
          </Text>
        }
      />

      <TouchableOpacity
        style={styles.botaoAdicionar}
        onPress={() => abrirModal()}>
        <Text style={{ color: 'white', fontWeight: 'bold' }}>
          Adicionar Serviço
        </Text>
      </TouchableOpacity>

      <ItensModalOs
        visivel={modalVisivel}
        onFechar={fecharModal}
        onAdicionar={adicionarOuEditarItem}
        itemEditando={itemEditando}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: '#1a2f3d',
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
  },
  botaoAdicionar: {
    marginTop: 10,
    backgroundColor: '#10a2a7',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
})
