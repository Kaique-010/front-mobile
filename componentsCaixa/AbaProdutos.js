// components/AbaProdutos.js
import React, { useState } from 'react'
import {
  View,
  Text,
  Button,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native'
import Toast from 'react-native-toast-message'
import { apiPostComContexto } from '../utils/api'
import ItensModal from '../componentsPedidos/ItensModal'

export default function AbaProdutos({ produtos, setProdutos, mov, onAvancar }) {
  const [modalVisivel, setModalVisivel] = useState(false)
  const [loading, setLoading] = useState(false)
  const handleAvancar = async () => {
    if (produtos.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Adicione pelo menos um produto'
      })
      return
    }

    try {
      const produtosFormatados = produtos.map(produto => ({
        movi_empr: mov.movi_empr,
        movi_fili: mov.movi_fili,
        movi_nume_vend: mov.movi_nume_vend,
        movi_prod: produto.prod_codigo,
        movi_quan: produto.iped_quan,
        movi_valo: produto.iped_unit,
        movi_tota: produto.iped_tota
      }))

      await apiPostComContexto('caixa/movicaixa/adicionar_produtos/', {
        produtos: produtosFormatados
      })

      onAvancar()
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: error.response?.data?.detail || 'Erro ao salvar produtos'
      })
    }
  }

  return (
    <View style={{ flex: 1 }}>
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

        <Button
          title="Adicionar Produto"
          onPress={() => setModalVisivel(true)}
        />

        <ItensModal
          visivel={modalVisivel}
          onFechar={() => setModalVisivel(false)}
          onAdicionar={adicionarProduto}
          itemEditando={null}
        />
      </View>
      <View style={styles.rodape}>
        <Text style={styles.total}>Total: R$ {calcularTotal().toFixed(2)}</Text>
        <TouchableOpacity
          style={[styles.botaoAvancar, loading && styles.botaoDesabilitado]}
          onPress={handleAvancar}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botaoTexto}>Avançar</Text>
          )}
        </TouchableOpacity>
      </View>
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
