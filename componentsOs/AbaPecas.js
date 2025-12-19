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
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function AbaPecas({ orde_nume, pecas = [], onPecasChange }) {
  const [removidos, setRemovidos] = useState([])
  const [modalVisivel, setModalVisivel] = useState(false)
  const [itemEditando, setItemEditando] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [produtos, setProdutos] = useState(pecas)
  const [usuarioTemSetor, setUsuarioTemSetor] = useState(false)

  // Verifica se o usuário tem setor
  useEffect(() => {
    const verificarSetor = async () => {
      try {
        const setor = await AsyncStorage.getItem('setor')
        setUsuarioTemSetor(setor && setor !== '0' && setor !== 'null')
      } catch (error) {
        console.error('Erro ao verificar setor:', error)
        setUsuarioTemSetor(false)
      }
    }
    verificarSetor()
  }, [])

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
        peca_orde: orde_nume || '',
        peca_empr: 1,
        peca_fili: 1,
      })

      if (response.data && Array.isArray(response.data)) {
        const produtosFormatados = response.data.map((item) => ({
          ...item,
          peca_quan: parseFloat(item.peca_quan || 0),
          peca_unit: parseFloat(item.peca_unit || 0),
          peca_tota: parseFloat(item.peca_tota || 0),
          // Sempre preservar o preço real do produto
          peca_unit_real: parseFloat(item.peca_unit_real || item.peca_unit || 0)
        }))

        setProdutos(produtosFormatados)
        if (onPecasChange) {
          onPecasChange(produtosFormatados)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar peças:', error)
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Falha ao carregar peças da ordem de serviço',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const sincronizarComPai = (novos) => {
    setProdutos(novos)
    if (onPecasChange) {
      onPecasChange(novos)
    }
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

   

    return true
  }

  const adicionarOuEditarProduto = (novoItem, itemEditando) => {
    if (!validarProduto(novoItem)) return

    // Proteção extra: não adicionar itens sem nome ou código válido
    if (!novoItem.produto_nome || !novoItem.peca_codi) {
        return
    }

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
      // Função para validar e formatar valores numéricos
      const formatarValorNumerico = (valor) => {
        const num = parseFloat(valor) || 0
        // Limita a 15 dígitos totais com 4 casas decimais (conforme serializer)
        return Math.min(Math.max(num, 0), 99999999999.9999)
      }

      const adicionar = produtos
        .filter((p) => !p.peca_id)
        .map((p) => {
          const quan = formatarValorNumerico(p.peca_quan)
          // Mesmo com setor, enviar preço real
          const precoReal = p.peca_unit_real || p.peca_unit
          const unit = formatarValorNumerico(precoReal)
          const tota = formatarValorNumerico(quan * unit)
          
          return {
            peca_orde: orde_nume,
            peca_codi: p.peca_codi,
            peca_quan: quan,
            peca_unit: unit,
            peca_tota: tota,
            peca_empr: 1,
            peca_fili: 1,
          }
        })

      const editar = produtos
        .filter(
          (p) => p.peca_id && !removidos.find((r) => r.peca_id === p.peca_id)
        )
        .map((p) => {
          const quan = formatarValorNumerico(p.peca_quan)
          const precoReal = p.peca_unit_real || p.peca_unit
          const unit = formatarValorNumerico(precoReal)
          const tota = formatarValorNumerico(quan * unit)
          
          return {
            peca_id: p.peca_id,
            peca_orde: orde_nume,
            peca_codi: p.peca_codi,
            peca_quan: quan,
            peca_unit: unit,
            peca_tota: tota,
            peca_empr: 1,
            peca_fili: 1,
          }
        })

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

  const renderItem = ({ item }) => {
    // Ocultar preços quando usuário tem setor
    const precoOculto = usuarioTemSetor
    const precoReal = item.peca_unit_real || item.peca_unit || 0
    const quantidadeNum = parseFloat(item.peca_quan) || 0
    const totalReal = quantidadeNum * precoReal

    return (
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
            <Text style={styles.infoValor}>{quantidadeNum.toFixed(2)}</Text>
          </View>
          {!precoOculto && (
            <>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Preço Unit.:</Text>
                <Text style={styles.infoValor}>R$ {parseFloat(precoReal).toFixed(2)}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Total:</Text>
                <Text style={styles.infoValor}>R$ {totalReal.toFixed(2)}</Text>
              </View>
            </>
          )}
        </View>
      </View>
    )
  }

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
        nestedScrollEnabled={true}
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
        itensExistentes={produtos}
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
