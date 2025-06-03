import React, { useState } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import Toast from 'react-native-toast-message'
import ItensModalOs from './ItensModalOs'
import { apiPostComContexto } from '../utils/api'

export default function AbaProdutos({ onSalvarPecas, orde_nume }) {
  const [produtos, setProdutos] = useState([])
  const [removidos, setRemovidos] = useState([])
  const [modalVisivel, setModalVisivel] = useState(false)
  const [itemEditando, setItemEditando] = useState(null)

  const adicionarOuEditarProduto = (novoItem, itemEditando) => {
    if (itemEditando?.peca_id) {
      setProdutos((prev) =>
        prev.map((p) =>
          p.peca_id === itemEditando.peca_id ? { ...novoItem } : p
        )
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

  const removerProduto = (item) => {
    setProdutos((prev) => prev.filter((p) => p.peca_id !== item.peca_id))
    if (item.peca_id) setRemovidos((prev) => [...prev, item])
  }

  const [isSubmitting, setIsSubmitting] = useState(false)

  const salvarPecas = async () => {
    // Bloqueia múltiplos envios
    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      const adicionar = produtos
        .filter((p) => !p.peca_id)
        .map((p) => ({
          peca_orde: orde_nume,
          peca_codi: p.peca_codi,
          peca_quan: p.peca_quan,
          peca_unit: p.peca_unit,
          peca_tota: p.peca_tota,
          peca_empr: 1,
          peca_fili: 1,
        }))

      const editar = produtos
        .filter((p) => p.peca_id)
        .map((p) => ({
          peca_id: p.peca_id,
          peca_orde: orde_nume,
          peca_codi: p.peca_codi,
          peca_quan: p.peca_quan,
          peca_unit: p.peca_unit,
          peca_tota: p.peca_tota,
          peca_empr: 1,
          peca_fili: 1,
        }))

      const remover = removidos.map((r) => ({
        peca_empr: 1,
        peca_fili: 1,
        peca_orde: orde_nume,
        peca_id: r.peca_id,
      }))

      const payload = { adicionar, editar, remover }

      await apiPostComContexto(`ordemdeservico/pecas/update-lista/`, payload)

      Toast.show({ type: 'success', text1: 'Peças salvas com sucesso' })
      setRemovidos([])
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao salvar peças',
        text2: err.response?.data?.message || 'Tente novamente mais tarde',
      })
      console.error('❌ API ERROR:', err.response?.data || err.message)
    } finally {
      // Libera o botão após conclusão (sucesso ou erro)
      setIsSubmitting(false)
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
        keyExtractor={(item, index) =>
          item.peca_id ? `id-${item.peca_id}` : `novo-${index}`
        }
        renderItem={({ item, index }) => (
          <View style={styles.produto}>
            <Text style={styles.prodNome}>
              {index + 1}. {item.produto_nome || 'Sem nome'}
            </Text>
            <Text style={{ color: 'white' }}>Qtd: {item.peca_quan}</Text>
            <Text style={{ color: 'white' }}>
              Preço Unit.: R$ {item.peca_unit.toFixed(2)}
            </Text>
            <Text style={{ color: 'white' }}>
              Total: R$ {item.peca_tota.toFixed(2)}
            </Text>

            <TouchableOpacity
              style={styles.botaoEditar}
              onPress={() => abrirModalParaEditar(item)}>
              <Text style={styles.textoBotao}>Editar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.botaoEditar,
                { backgroundColor: '#c0392b', marginTop: 5 },
              ]}
              onPress={() => removerProduto(item)}>
              <Text style={styles.textoBotao}>Remover</Text>
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
          style={styles.botaoSalvar}
          onPress={salvarPecas}
          disabled={isSubmitting}
          title={isSubmitting ? 'Salvando...' : 'Salvar Peças'}>
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
    backgroundColor: '#17a054',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  textoBotao: { color: 'white', fontWeight: 'bold' },
})
