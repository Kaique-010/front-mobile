import React, { useState } from 'react'
import {
  View,
  Text,
  Button,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import Toast from 'react-native-toast-message'
import ItensModalOs from './ItensModalOs'
import { apiPostComContexto } from '../utils/api'

export default function AbaProdutos({ onSalvarPecas, ordemId }) {
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
  const salvarPecas = async (produtos) => {
    try {
      const payload = produtos.map((p) => ({
        peca_prod: p.peca_prod,
        peca_quan: p.peca_quan,
        peca_unit: p.peca_unit,
        peca_tota: p.peca_tota,
        ordem_codigo: ordemId, // Certifique-se que ordemId existe!
      }))

      await apiPostComContexto('/ordemservicopecas/', payload)
      Toast.show({ type: 'success', text1: 'Peças salvas com sucesso' })
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Erro ao salvar peças' })
      console.error(err)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Produtos da O.S:</Text>

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
        <TouchableOpacity
          style={[styles.botaoSalvar, !produtos.length && { opacity: 0.5 }]}
          onPress={() => salvarPecas(produtos)}
          disabled={!produtos.length}>
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
