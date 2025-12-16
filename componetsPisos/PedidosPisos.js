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
import styles from '../componetsPisos/Styles/PedidosStyles'

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