import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { useContextoApp } from '../hooks/useContextoApp'
import { apiGetComContexto, apiDeleteComContexto } from '../utils/api'
import { formatarData } from '../utils/formatters'

const PedidoPisosItem = ({ item, onEdit, onDelete }) => (
  <View style={styles.card}>
    <View style={styles.cardContent}>
      <View style={styles.cardHeader}>
        <View style={styles.numeroContainer}>
          <Text style={styles.numeroLabel}>Pedido</Text>
          <Text style={styles.numero}>#{item.pedi_nume}</Text>
        </View>
        <View style={styles.dataContainer}>
          <Text style={styles.data}>{formatarData(item.pedi_data)}</Text>
        </View>
      </View>

      <View style={styles.clienteSection}>
        <Text style={styles.clienteLabel}>Cliente</Text>
        <Text style={styles.cliente}>
          {item.cliente_nome || 'Cliente não informado'}
        </Text>
        <Text style={styles.clienteCodigo}>Cód: {item.pedi_clie}</Text>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.vendedorSection}>
          <Text style={styles.sectionLabel}>Vendedor</Text>
          <Text style={styles.vendedor}>
            {item.vendedor_nome || 'Não informado'}
          </Text>
        </View>

        <View style={styles.valorSection}>
          <Text style={styles.sectionLabel}>Total</Text>
          <Text style={styles.valor}>
            {parseFloat(item.pedi_tota || 0).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </Text>
        </View>
      </View>

      {item.pedi_obse && (
        <View style={styles.observacaoSection}>
          <Text style={styles.sectionLabel}>Observações</Text>
          <Text style={styles.observacao}>{item.pedi_obse}</Text>
        </View>
      )}

      {/* Informações específicas de pisos */}
      {(item.pedi_mode_piso || item.pedi_sent_piso || item.pedi_obra_habi) && (
        <View style={styles.pisosInfo}>
          <Text style={styles.pisosTitle}>Detalhes do Piso</Text>
          {item.pedi_mode_piso && (
            <View style={styles.pisosItem}>
              <Text style={styles.pisosLabel}>Modelo:</Text>
              <Text style={styles.pisosValue}>{item.pedi_mode_piso}</Text>
            </View>
          )}
          {item.pedi_sent_piso && (
            <View style={styles.pisosItem}>
              <Text style={styles.pisosLabel}>Sentido:</Text>
              <Text style={styles.pisosValue}>{item.pedi_sent_piso}</Text>
            </View>
          )}
          {item.pedi_obra_habi !== undefined && (
            <View style={styles.pisosItem}>
              <Text style={styles.pisosLabel}>Obra Habitada:</Text>
              <Text style={styles.pisosValue}>
                {item.pedi_obra_habi ? 'Sim' : 'Não'}
              </Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => onEdit(item)}>
          <MaterialIcons name="edit" size={18} color="#6366f1" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(item)}>
          <MaterialIcons name="delete" size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  </View>
)

export default function PedidosPisos({ navigation }) {
  const { empresaId, filialId } = useContextoApp()
  const [pedidos, setPedidos] = useState([])
  const [searchCliente, setSearchCliente] = useState('')
  const [searchNumero, setSearchNumero] = useState('')
  const [initialLoading, setInitialLoading] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (empresaId && filialId) {
      buscarPedidos(false, true)
    }
  }, [empresaId, filialId])

  const buscarPedidos = async (loadMore = false, isInitial = false) => {
    if (loadMore && isFetchingMore) return
    if (loadMore && !hasMore) return

    if (loadMore) {
      setIsFetchingMore(true)
    } else {
      if (isInitial) {
        setInitialLoading(true)
      }
      setPage(1)
      setPedidos([])
      setHasMore(true)
    }

    try {
      const currentPage = loadMore ? page + 1 : 1
      const params = {
        page: currentPage,
        page_size: 20,
        pedi_empr: empresaId,
        pedi_fili: filialId,
      }

      if (searchCliente) {
        params.cliente_nome__icontains = searchCliente
      }
      if (searchNumero) {
        params.pedi_nume = searchNumero
      }

      const response = await apiGetComContexto('pisos/pedidos-pisos/', params)
      const novosPedidos = response.results || []

      if (loadMore) {
        setPedidos((prev) => [...prev, ...novosPedidos])
        setPage(currentPage)
      } else {
        setPedidos(novosPedidos)
        setPage(1)
      }

      setHasMore(novosPedidos.length === 20)
    } catch (error) {
      console.error('Erro ao buscar pedidos de pisos:', error)
      Alert.alert('Erro', 'Não foi possível carregar os pedidos de pisos')
    } finally {
      setInitialLoading(false)
      setIsFetchingMore(false)
    }
  }

  const deletarPedido = (pedido) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir o pedido ${pedido.pedi_nume}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiDeleteComContexto(
                `pisos/pedidos-pisos/${pedido.pedi_nume}/`
              )
              setPedidos((prev) =>
                prev.filter((p) => p.pedi_nume !== pedido.pedi_nume)
              )
              Alert.alert('Sucesso', 'Pedido excluído com sucesso')
            } catch (error) {
              console.error('Erro ao excluir pedido:', error)
              Alert.alert('Erro', 'Não foi possível excluir o pedido')
            }
          },
        },
      ]
    )
  }

  const handleEdit = useCallback(
    (item) => {
      navigation.navigate('PedidosPisosForm', { pedido: item })
    },
    [navigation]
  )

  const handleDelete = useCallback((item) => {
    deletarPedido(item)
  }, [])

  const renderPedidos = useCallback(
    ({ item }) => (
      <PedidoPisosItem
        item={item}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    ),
    [handleEdit, handleDelete]
  )

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Carregando pedidos...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.incluirButton}
        onPress={() => navigation.navigate('PedidosPisosForm')}>
        <MaterialIcons name="add" size={20} color="#ffffff" />
        <Text style={styles.incluirButtonText}>Novo Pedido</Text>
      </TouchableOpacity>

      <View style={styles.searchContainer}>
        <View style={styles.inputContainer}>
          <MaterialIcons
            name="search"
            size={20}
            color="#9ca3af"
            style={styles.inputIcon}
          />
          <TextInput
            placeholder="Cliente"
            placeholderTextColor="#9ca3af"
            style={styles.input}
            value={searchCliente}
            onChangeText={setSearchCliente}
          />
        </View>
        <View style={styles.inputContainer}>
          <MaterialIcons
            name="tag"
            size={20}
            color="#9ca3af"
            style={styles.inputIcon}
          />
          <TextInput
            placeholder="Nº Pedido"
            placeholderTextColor="#9ca3af"
            style={styles.input}
            keyboardType="numeric"
            value={searchNumero}
            onChangeText={setSearchNumero}
          />
        </View>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => buscarPedidos(false, false)}>
          <MaterialIcons name="search" size={20} color="#6366f1" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={pedidos}
        renderItem={renderPedidos}
        keyExtractor={(item, index) =>
          `${item.pedi_nume}-${item.pedi_empr}-${item.pedi_clie}-${index}`
        }
        onEndReached={() => {
          if (hasMore && !isFetchingMore) buscarPedidos(true)
        }}
        onEndReachedThreshold={0.2}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={3}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews={true}
        getItemLayout={(data, index) => ({
          length: 200,
          offset: 200 * index,
          index,
        })}
        ListFooterComponent={
          isFetchingMore ? (
            <ActivityIndicator
              size="small"
              color="#8b5cf6"
              style={{ marginVertical: 20 }}
            />
          ) : null
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>
          {pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''} encontrado
          {pedidos.length !== 1 ? 's' : ''}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  // ====== Container Principal ======
  container: {
    flex: 1,
    backgroundColor: '#faf5ff',
  },

  listContent: {
    padding: 16,
    paddingBottom: 100,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#faf5ff',
  },

  loadingText: {
    marginTop: 12,
    color: '#6b7280',
    fontSize: 16,
  },

  // ====== Botão de Incluir ======
  incluirButton: {
    backgroundColor: '#8b5cf6',
    margin: 16,
    marginBottom: 8,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    shadowColor: '#8b5cf6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  incluirButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginLeft: 8,
  },

  // ====== Container de Busca ======
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },

  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  inputIcon: {
    marginRight: 8,
  },

  input: {
    flex: 1,
    height: 44,
    color: '#374151',
    fontSize: 15,
  },

  searchButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // ====== Cards ======
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#8b5cf6',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#8b5cf6',
  },

  cardContent: {
    padding: 20,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },

  numeroContainer: {
    flex: 1,
  },

  numeroLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 2,
  },

  numero: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    letterSpacing: 0.5,
  },

  dataContainer: {
    alignItems: 'flex-end',
  },

  data: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },

  // ====== Seção Cliente ======
  clienteSection: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },

  clienteLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 4,
  },

  cliente: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },

  clienteCodigo: {
    fontSize: 12,
    color: '#9ca3af',
  },

  // ====== Linha de Informações ======
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 16,
  },

  vendedorSection: {
    flex: 1,
  },

  valorSection: {
    alignItems: 'flex-end',
  },

  sectionLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 2,
  },

  vendedor: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },

  valor: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
  },

  // ====== Observações ======
  observacaoSection: {
    marginBottom: 12,
  },

  observacao: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
    fontStyle: 'italic',
  },

  // ====== Informações de Pisos ======
  pisosInfo: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },

  pisosTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#065f46',
    marginBottom: 8,
  },

  pisosItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },

  pisosLabel: {
    fontSize: 12,
    color: '#047857',
    fontWeight: '500',
    width: 80,
  },

  pisosValue: {
    fontSize: 12,
    color: '#065f46',
    fontWeight: '600',
    flex: 1,
  },

  // ====== Ações ======
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },

  editButton: {
    backgroundColor: '#f0f9ff',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },

  deleteButton: {
    backgroundColor: '#fef2f2',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#fecaca',
  },

  // ====== Rodapé ======
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },

  footerText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 13,
    fontWeight: '500',
  },
})
