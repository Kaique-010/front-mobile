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
import styles from '../componetsPisos/Styles/orcamentoStyles'
import BotaoTransformarOrcamento from '../componetsPisos/BotaoTransformarOrcamento'

const OrcamentoPisosItem = ({ item, onEdit, onDelete, onUpdateOrcamentos }) => (
  <View style={styles.card}>
    <View style={styles.cardContent}>
      <View style={styles.cardHeader}>
        <View style={styles.numeroContainer}>
          <Text style={styles.numeroLabel}>Orcamento</Text>
          <Text style={styles.numero}>#{item.orca_nume}</Text>
        </View>
        <View style={styles.dataContainer}>
          <Text style={styles.data}>{formatarData(item.orca_data)}</Text>
        </View>
      </View>

      <View style={styles.clienteSection}>
        <Text style={styles.clienteLabel}>Cliente</Text>
        <Text style={styles.cliente}>
          {item.cliente_nome || 'Cliente não informado'}
        </Text>
        <Text style={styles.clienteCodigo}>Cód: {item.orca_clie}</Text>
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
            {parseFloat(item.orca_tota || 0).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </Text>
        </View>
      </View>

      {item.orca_obse && (
        <View style={styles.observacaoSection}>
          <Text style={styles.sectionLabel}>Observações</Text>
          <Text style={styles.observacao}>{item.orca_obse}</Text>
        </View>
      )}

      {/* Informações específicas de pisos */}
      {(item.orca_mode_piso || item.orca_sent_piso || item.orca_obra_habi) && (
        <View style={styles.pisosInfo}>
          <Text style={styles.pisosTitle}>Detalhes do Piso</Text>
          {item.orca_mode_piso && (
            <View style={styles.pisosItem}>
              <Text style={styles.pisosLabel}>Modelo:</Text>
              <Text style={styles.pisosValue}>{item.orca_mode_piso}</Text>
            </View>
          )}
          {item.orca_sent_piso && (
            <View style={styles.pisosItem}>
              <Text style={styles.pisosLabel}>Sentido:</Text>
              <Text style={styles.pisosValue}>{item.orca_sent_piso}</Text>
            </View>
          )}
          {item.orca_obra_habi !== undefined && (
            <View style={styles.pisosItem}>
              <Text style={styles.pisosLabel}>Obra Habitada:</Text>
              <Text style={styles.pisosValue}>
                {item.orca_obra_habi ? 'Sim' : 'Não'}
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
    <BotaoTransformarOrcamento
        orcamentoId={item.orca_nume}
        onSuccess={() => {
          onUpdateOrcamentos((prev) =>
            prev.map((p) =>
              p.orca_nume === item.orca_nume && p.orcamento_estado === 'ORÇAMENTO'
                ? { ...p, orcamento_estado: 'PEDIDO' }
                : p
            )
          )
        }}
      />
  </View>
)


export default function OrcamentosPisos({ navigation }) {  
  const { empresaId, filialId } = useContextoApp()
  const [orcamentos, setOrcamentos] = useState([])
  const [searchCliente, setSearchCliente] = useState('')    
  const [searchNumero, setSearchNumero] = useState('')
  const [initialLoading, setInitialLoading] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (empresaId && filialId) {
      buscarOrcamentos(false, true)
    }
  }, [empresaId, filialId])

  const buscarOrcamentos = async (loadMore = false, isInitial = false) => {
    if (loadMore && isFetchingMore) return
    if (loadMore && !hasMore) return

    if (loadMore) {
      setIsFetchingMore(true)
    } else {
      if (isInitial) {
        setInitialLoading(true)
      }
      setPage(1)
      setOrcamentos([])
      setHasMore(true)
    }

    try {
      const currentPage = loadMore ? page + 1 : 1
      const params = {
        page: currentPage,
        page_size: 20,
        orca_empr: empresaId,
        orca_fili: filialId,
      }

      if (searchCliente) {
        params.cliente_nome__icontains = searchCliente
      }
      if (searchNumero) {
        params.orca_nume = searchNumero
      }

      const response = await apiGetComContexto('pisos/orcamentos-pisos/', params)
      const novosorcamentos = response.results || []

      if (loadMore) {
        setOrcamentos((prev) => [...prev, ...novosorcamentos])
        setPage(currentPage)
      } else {
        setOrcamentos(novosorcamentos)
        setPage(1)
      }

      setHasMore(novosorcamentos.length === 20)
    } catch (error) {
      console.error('Erro ao buscar orcamentos de pisos:', error)
      Alert.alert('Erro', 'Não foi possível carregar os orcamentos de pisos')
    } finally {
      setInitialLoading(false)
      setIsFetchingMore(false)
    }
  }

  const deletarOrcamento = async (orcamento) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir o orcamento ${orcamento.orca_nume}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiDeleteComContexto(
                `pisos/orcamentos-pisos/${orcamento.orca_nume}/`
              )
              setOrcamentos((prev) =>
                prev.filter((p) => p.orca_nume !== orcamento.orca_nume)
              )
              Alert.alert('Sucesso', 'Orçamento excluído com sucesso')
            } catch (error) {
              console.error('Erro ao excluir orcamento:', error)
              Alert.alert('Erro', 'Não foi possível excluir o orçamento')
            }
          },
        },
      ]
    )
  }

  const handleEdit = useCallback(
    (item) => {
      navigation.navigate('OrcamentosPisosForm', { orcamento: item })
    },
    [navigation]
  )

  const handleDelete = useCallback((item) => {
    deletarOrcamento(item)
  }, [])

  const renderOrcamentos = useCallback(
    ({ item }) => (
      <OrcamentoPisosItem
        item={item}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onUpdateOrcamentos={setOrcamentos}
      />
    ),
    [handleEdit, handleDelete, setOrcamentos]
  )

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Carregando orçamentos...</Text>
      </View>
    )
  }


  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.incluirButton}
        onPress={() => navigation.navigate('OrcamentosPisosForm')}>
        <MaterialIcons name="add" size={20} color="#ffffff" />
        <Text style={styles.incluirButtonText}>Novo orçamento</Text>
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
            placeholder="Nº orcamento"
            placeholderTextColor="#9ca3af"
            style={styles.input}
            keyboardType="numeric"
            value={searchNumero}
            onChangeText={setSearchNumero}
          />
        </View>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => buscarOrcamentos(false, false)}>
          <MaterialIcons name="search" size={20} color="#6366f1" />
        </TouchableOpacity>
      </View>
      

      <FlatList
        data={orcamentos}
        renderItem={renderOrcamentos}
        keyExtractor={(item, index) =>
          `${item.orca_nume}-${item.orca_empr}-${item.orca_clie}-${index}`
        }
        onEndReached={() => {
          if (hasMore && !isFetchingMore) buscarOrcamentos(true)
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
          {orcamentos.length} orcamento{orcamentos.length !== 1 ? 's' : ''} encontrado
          {orcamentos.length !== 1 ? 's' : ''}
        </Text>
      </View>
    </View> 
  )
}
