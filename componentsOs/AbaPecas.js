import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import Toast from 'react-native-toast-message'
import ItensModalOs from './ItensModalOs'
import { apiPostComContexto, apiGetComContexto } from '../utils/api'
import { Ionicons } from '@expo/vector-icons'

export default function AbaPecas({ pecas = [], setPecas, orde_nume }) {
  const [removidos, setRemovidos] = useState([])
  const [modalVisivel, setModalVisivel] = useState(false)
  const [itemEditando, setItemEditando] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [produtos, setProdutos] = useState(pecas)

  // Carrega as peças existentes quando o componente monta ou quando o orde_nume muda
  useEffect(() => {
    if (orde_nume) {
      carregarPecasExistentes()
    }
  }, [orde_nume])

  const carregarPecasExistentes = async () => {
    try {
      setIsLoading(true)
      console.log('Carregando peças para OS:', orde_nume)

      const response = await apiGetComContexto('ordemdeservico/pecas/', {
        peca_orde: orde_nume,
        peca_empr: 1,
        peca_fili: 1,
      })

      // Verifica se a resposta tem a estrutura paginada
      const pecasArray = response?.results || response || []

      if (Array.isArray(pecasArray) && pecasArray.length > 0) {
        const pecasFormatadas = pecasArray.map((peca) => ({
          peca_id: peca.peca_id,
          peca_codi: peca.peca_codi,
          peca_quan: parseFloat(peca.peca_quan),
          peca_unit: parseFloat(peca.peca_unit),
          peca_tota: parseFloat(peca.peca_tota),
          produto_nome: peca.produto_nome || 'Produto',
        }))

        console.log('Peças formatadas:', pecasFormatadas)
        setProdutos(pecasFormatadas)
        setPecas(pecasFormatadas)
      } else {
        console.log('Nenhuma peça encontrada')
        setProdutos([])
        setPecas([])
      }
    } catch (error) {
      console.error(
        'Erro detalhado ao carregar peças:',
        error.response?.data || error.message
      )
      Toast.show({
        type: 'error',
        text1: 'Erro ao carregar peças',
        text2: Array.isArray(error.response?.data)
          ? error.response.data[0]
          : 'Não foi possível carregar as peças existentes',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const sincronizarComPai = (novos) => {
    setProdutos(novos)
    setPecas(novos)
  }

  const validarProduto = (novoItem) => {
    if (!novoItem.peca_codi) {
      Toast.show({
        type: 'error',
        text1: 'Produto inválido',
        text2: 'Selecione um produto válido',
      })
      return false
    }

    if (!novoItem.peca_quan || novoItem.peca_quan <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Quantidade inválida',
        text2: 'A quantidade deve ser maior que zero',
      })
      return false
    }

    if (!novoItem.peca_unit || novoItem.peca_unit <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Preço inválido',
        text2: 'O preço unitário deve ser maior que zero',
      })
      return false
    }

    return true
  }

  const adicionarOuEditarProduto = (novoItem, itemEditando) => {
    if (!validarProduto(novoItem)) return

    let atualizados
    if (itemEditando?.peca_id) {
      // Editando item salvo no back-end
      atualizados = produtos.map((p) =>
        p.peca_id === itemEditando.peca_id ? { ...novoItem } : p
      )
    } else if (itemEditando) {
      // Editando item novo, sem ID ainda
      atualizados = produtos.map((p) =>
        !p.peca_id && p.peca_codi === itemEditando.peca_codi
          ? { ...novoItem }
          : p
      )
    } else {
      // Adicionando novo produto
      const existe = produtos.some(
        (p) => !p.peca_id && p.peca_codi === novoItem.peca_codi
      )
      if (existe) {
        Toast.show({
          type: 'error',
          text1: 'Produto já adicionado',
          text2: 'Este produto já está na lista',
        })
        return
      }
      atualizados = [...produtos, novoItem]
    }

    sincronizarComPai(atualizados)
    Toast.show({
      type: 'success',
      text1: itemEditando ? 'Produto atualizado' : 'Produto adicionado',
      text2: novoItem.produto_nome,
    })
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
    const atualizados = produtos.filter((p) => p !== item)
    sincronizarComPai(atualizados)
    if (item.peca_id) {
      setRemovidos((prev) => [...prev, item])
    }
    Toast.show({
      type: 'success',
      text1: 'Produto removido',
      text2: item.produto_nome,
    })
  }

  const salvarPecas = async () => {
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
          peca_tota: p.peca_quan * p.peca_unit, // Calculando o total
          peca_empr: 1,
          peca_fili: 1,
        }))

      const editar = produtos
        .filter(
          (p) => p.peca_id && !removidos.find((r) => r.peca_id === p.peca_id)
        )
        .map((p) => ({
          peca_id: p.peca_id,
          peca_orde: orde_nume,
          peca_codi: p.peca_codi,
          peca_quan: p.peca_quan,
          peca_unit: p.peca_unit,
          peca_tota: p.peca_quan * p.peca_unit, // Calculando o total
          peca_empr: 1,
          peca_fili: 1,
        }))

      const remover = removidos
        .filter((r) => r.peca_id)
        .map((r) => ({
          peca_empr: 1,
          peca_fili: 1,
          peca_orde: orde_nume,
          peca_id: r.peca_id,
        }))

      const payload = { adicionar, editar, remover }

      console.log('Enviando payload:', payload)

      const response = await apiPostComContexto(
        'ordemdeservico/pecas/update-lista/',
        payload
      )

      console.log('Resposta do servidor após salvar:', response)

      // Após salvar com sucesso, recarrega as peças
      await carregarPecasExistentes()

      setRemovidos([])

      Toast.show({
        type: 'success',
        text1: 'Peças salvas com sucesso',
        text2: `${adicionar.length} adicionadas, ${editar.length} editadas, ${remover.length} removidas`,
      })
    } catch (err) {
      console.error(
        'Erro detalhado ao salvar:',
        err.response?.data || err.message
      )
      Toast.show({
        type: 'error',
        text1: 'Erro ao salvar peças',
        text2: Array.isArray(err.response?.data)
          ? err.response.data[0]
          : 'Tente novamente mais tarde',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderItem = ({ item }) => (
    <View style={styles.produto}>
      <View style={styles.produtoHeader}>
        <Text style={styles.prodNome}>{item.produto_nome || 'Sem nome'}</Text>
        <View style={styles.botoesContainer}>
          <TouchableOpacity
            style={[styles.botaoAcao, styles.botaoEditar]}
            onPress={() => abrirModalParaEditar(item)}>
            <Ionicons name="pencil" size={18} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.botaoAcao, styles.botaoRemover]}
            onPress={() => removerProduto(item)}>
            <Ionicons name="trash" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.produtoInfo}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Quantidade:</Text>
          <Text style={styles.infoValor}>{item.peca_quan.toFixed(4)}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Preço Unit.:</Text>
          <Text style={styles.infoValor}>R$ {item.peca_unit.toFixed(4)}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Total:</Text>
          <Text style={styles.infoValor}>R$ {item.peca_tota.toFixed(4)}</Text>
        </View>
      </View>
    </View>
  )

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#10a2a7" />
        <Text style={styles.loadingText}>Carregando peças...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.botaoAdicionar}
        onPress={abrirModalParaAdicionar}>
        <Ionicons
          name="add-circle"
          size={24}
          color="white"
          style={styles.icone}
        />
        <Text style={styles.textoBotao}>Adicionar Produto</Text>
      </TouchableOpacity>

      <FlatList
        data={produtos}
        keyExtractor={(item) =>
          item.peca_id?.toString() || `temp-${item.peca_codi}-${Date.now()}`
        }
        renderItem={renderItem}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={48} color="#666" />
            <Text style={styles.emptyText}>Nenhuma peça adicionada</Text>
            <Text style={styles.emptySubtext}>
              Toque no botão acima para adicionar peças
            </Text>
          </View>
        }
      />

      {produtos.length > 0 && !isLoading && (
        <TouchableOpacity
          style={[styles.botaoSalvar, isSubmitting && styles.botaoDesabilitado]}
          onPress={salvarPecas}
          disabled={isSubmitting}>
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons
                name="save"
                size={24}
                color="white"
                style={styles.icone}
              />
              <Text style={styles.textoBotao}>Salvar Peças</Text>
            </>
          )}
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
  container: {
    flex: 1,
    backgroundColor: '#1a2f3d',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  lista: {
    flexGrow: 1,
  },
  produto: {
    backgroundColor: '#232935',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  produtoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  prodNome: {
    color: '#10a2a7',
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1,
  },
  botoesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  botaoAcao: {
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoEditar: {
    backgroundColor: '#10a2a7',
  },
  botaoRemover: {
    backgroundColor: '#c0392b',
  },
  produtoInfo: {
    backgroundColor: '#1a2f3d',
    borderRadius: 6,
    padding: 10,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoLabel: {
    color: '#999',
    fontSize: 14,
  },
  infoValor: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  botaoAdicionar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10a2a7',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  botaoSalvar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#17a054',
    padding: 15,
    borderRadius: 8,
    marginBottom: 40,
  },
  botaoDesabilitado: {
    opacity: 0.7,
  },
  textoBotao: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  icone: {
    marginRight: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 40,
  },
  emptyText: {
    color: '#666',
    fontSize: 18,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
})
