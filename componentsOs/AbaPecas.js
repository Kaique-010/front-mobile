import React, { useState } from 'react'
import {
  View,
  Text,
  Button,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import ItensModalOs from './ItensModalOs' // ajuste o caminho conforme seu projeto

export default function AbaProdutos({ onSalvarPecas }) {
  const [produtos, setProdutos] = useState([])
  const [modalVisivel, setModalVisivel] = useState(false)
  const [itemEditando, setItemEditando] = useState(null)

  const adicionarOuEditarProduto = (novoItem, itemEditando) => {
    if (itemEditando) {
      setProdutos((prev) =>
        prev.map((p) => (p.id === itemEditando.id ? novoItem : p))
      )
    } else {
      setProdutos((prev) => [...prev, novoItem])
    }
  }

  const abrirModalParaEditar = (item) => {
    setItemEditando(item)
    setModalVisivel(true)
  }

  const abrirModalParaAdicionar = () => {
    setItemEditando(null)
    setModalVisivel(true)
  }

  // Aqui ordena e salva as peças, manda pro callback externo
  const salvarPecas = () => {
    // a ordem da lista é a ordem natural do array
    onSalvarPecas(produtos)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Produtos da venda:</Text>

      {produtos.length === 0 && (
        <Text style={styles.vazio}>Nenhum produto adicionado.</Text>
      )}

      <FlatList
        data={produtos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.produto}>
            <Text style={styles.prodNome}>
              {index + 1}. {item.produto_nome || 'Sem nome'}
            </Text>
            <Text>Qtd: {item.peca_quan}</Text>
            <Text>Preço Unit.: R$ {item.peca_unit.toFixed(2)}</Text>
            <Text>Total: R$ {item.peca_tota.toFixed(2)}</Text>

            <TouchableOpacity
              style={styles.botaoEditar}
              onPress={() => abrirModalParaEditar(item)}>
              <Text style={styles.textoBotao}>Editar</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity
        style={styles.botaoAdicionar}
        onPress={abrirModalParaAdicionar}>
        <Text style={styles.textoBotao}>Adicionar Produto</Text>
      </TouchableOpacity>

      {produtos.length > 0 && (
        <TouchableOpacity style={styles.botaoSalvar} onPress={salvarPecas}>
          <Text style={styles.textoBotao}>Salvar Peças</Text>
        </TouchableOpacity>
      )}

      <ItensModalOs
        visivel={modalVisivel}
        onFechar={() => setModalVisivel(false)}
        onAdicionar={adicionarOuEditarProduto}
        itemEditando={itemEditando}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a2f3d', padding: 20 },
  titulo: {
    color: 'white',
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  vazio: {
    color: 'gray',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  produto: {
    backgroundColor: '#232935',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  prodNome: {
    color: '#10a2a7',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  botaoEditar: {
    marginTop: 10,
    backgroundColor: '#10a2a7',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  botaoAdicionar: {
    backgroundColor: '#10a2a7',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  botaoSalvar: {
    backgroundColor: '#ffa500',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  textoBotao: { color: 'white', fontWeight: 'bold' },
})
