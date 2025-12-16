import React, { useState, useCallback, useEffect } from 'react'
import {
  View,
  Text,
  Button,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import Toast from 'react-native-toast-message'
import { apiPostComContexto } from '../utils/api'
import ItensModal from '../componentsPedidos/ItensModal'
import useContextApp from '../hooks/useContextoApp'
import { useNavigation } from '@react-navigation/native'

const AbaProdutos = ({ numeroVenda, onAvancar, onTotalChange, onSetLimparCallback }) => {
  const [itens, setItens] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const { contextData } = useContextApp()

  // Registrar função de limpar itens no componente pai
  const limparItens = useCallback(() => {
    console.log('🧹 Limpando itens da aba produtos')
    setItens([])
  }, [])

  useEffect(() => {
    if (onSetLimparCallback) {
      onSetLimparCallback(limparItens)
    }
  }, [onSetLimparCallback, limparItens])

  // Função para adicionar item à lista local
  const adicionarItemLocal = (novoItem, itemEditando) => {
    const itemFormatado = {
      produto: novoItem.iped_prod,
      nome_produto: novoItem.produto_nome,
      quantidade: novoItem.iped_quan,
      valor_unitario: novoItem.iped_unit,
      valor_total: novoItem.iped_tota,
    }

    setItens((prevItens) => {
      const itemExistente = prevItens.find(
        (item) => item.produto === itemFormatado.produto
      )

      if (itemExistente) {
        // Atualizar item existente
        return prevItens.map((item) =>
          item.produto === itemFormatado.produto
            ? {
                ...item,
                quantidade: item.quantidade + itemFormatado.quantidade,
                valor_total:
                  (item.quantidade + itemFormatado.quantidade) *
                  item.valor_unitario,
              }
            : item
        )
      } else {
        return [...prevItens, itemFormatado]
      }
    })

    Toast.show({
      type: 'success',
      text1: 'Item adicionado',
      text2: `${itemFormatado.nome_produto} adicionado à lista`,
    })
  }

  const removerItem = (produtoId) => {
    setItens((prevItens) =>
      prevItens.filter((item) => item.produto !== produtoId)
    )
    Toast.show({
      type: 'info',
      text1: 'Item removido',
      text2: 'Item removido da lista',
    })
  }


  const enviarItensLote = async () => {
    if (itens.length === 0) {
      Toast.show({
        type: 'warning',
        text1: 'Atenção',
        text2: 'Adicione pelo menos um item antes de continuar',
      })
      return
    }

    setLoading(true)

    try {
      const itemData = {
        numero_venda: numeroVenda,
        itens: itens.map((item) => ({
          produto: item.produto,
          quantidade: item.quantidade,
          valor_unitario: item.valor_unitario,
        })),
      }

      console.log('🚀 ENVIANDO ITENS EM LOTE:', itemData)

      const response = await apiPostComContexto(
        'caixadiario/movicaixa/adicionar_itens_lote/',
        itemData
      )

      console.log('✅ RESPOSTA DA API:', response)

      if (response.status === 'Itens adicionados com sucesso') {
        Toast.show({
          type: 'success',
          text1: 'Sucesso!',
          text2: `${
            response.total_itens
          } itens adicionados. Total: R$ ${response.total_pedido.toFixed(2)}`,
        })
        
        // Passar o total para o componente pai
        if (onTotalChange) {
          onTotalChange(response.total_pedido)
        }
        
        // NÃO limpar os itens - manter até finalizar a venda
        // setItens([])

        if (onAvancar) {
          onAvancar()
        }
      } else {
        throw new Error(response.detail || 'Erro desconhecido')
      }
    } catch (error) {
      console.error('❌ ERRO AO ENVIAR ITENS:', error)
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: error.message || 'Erro ao adicionar itens ao pedido',
      })
    } finally {
      setLoading(false)
    }
  }

  const totalLista = itens.reduce((total, item) => total + item.valor_total, 0)

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemNome}>{item.nome_produto}</Text>
        <Text style={styles.itemDetalhes}>
          Qtd: {item.quantidade} x R$ {item.valor_unitario.toFixed(2)}
        </Text>
        <Text style={styles.itemTotal}>
          Total: R$ {item.valor_total.toFixed(2)}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removerItem(item.produto)}>
        <Text style={styles.removeButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>+ Adicionar Produto</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>Produtos do Pedido #{numeroVenda}</Text>

      {itens.length > 0 ? (
        <>
          <FlatList
            data={itens}
            renderItem={renderItem}
            keyExtractor={(item) => item.produto.toString()}
            style={styles.lista}
          />

          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>
              Total da Lista: R$ {totalLista.toFixed(2)}
            </Text>
            <Text style={styles.totalItens}>
              {itens.length} {itens.length === 1 ? 'item' : 'itens'}
            </Text>
          </View>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhum item adicionado</Text>
          <Text style={styles.emptySubtext}>
            Toque em "Adicionar Produto" para começar
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <Button
          title={loading ? 'Enviando...' : 'Confirmar e Avançar'}
          onPress={enviarItensLote}
          disabled={loading || itens.length === 0}
        />
        {loading && <ActivityIndicator style={styles.loader} />}
      </View>

      <ItensModal
        visivel={modalVisible}
        onFechar={() => setModalVisible(false)}
        onAdicionar={adicionarItemLocal}
        numeroVenda={numeroVenda}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#202a34',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    textAlign: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 80,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  lista: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  itemInfo: {
    flex: 1,
  },
  itemNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  itemDetalhes: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007bff',
  },
  removeButton: {
    backgroundColor: '#dc3545',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
    elevation: 2,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  totalItens: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  footer: {
    marginTop: 40,
    marginBottom: 50,
  },
  loader: {
    marginTop: 8,
  },
})

export default AbaProdutos
