import { useFocusEffect } from '@react-navigation/native'
import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'
import debounce from 'lodash.debounce'
import { apiDeleteComContexto, apiGetComContexto, safeSetItem } from '../utils/api'
import styles from '../styles/pedidosStyle'
import { getStoredData } from '../services/storageService'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { apiDelete, apiGet } from '../utils/api'

const statusPedidos = {
  0: 'Aberto',
  1: 'Faturado',
  2: 'Cancelado',
}

// Item memoizado, evita rerender quando props não mudam
const PedidoItem = React.memo(
  ({ item, onEdit, onDelete }) => {
    // Calcular totais corretamente
    const calcularTotais = () => {
      const bruto = Number(item.pedi_topr || item.pedi_tota || 0)
      const desc = Number(item.pedi_desc || 0)
      const liquido = Math.max(0, bruto - desc)

      return { bruto, desc, liquido }
    }

    const { bruto, desc, liquido } = calcularTotais()

    return (
      <View style={styles.card}>
        <Text style={styles.status}>
          Status: {statusPedidos[item.pedi_stat] ?? 'Desconhecido'}
        </Text>
        <Text style={styles.numero}>Nº Pedido: {item.pedi_nume}</Text>
        <Text style={styles.data}>Data: {item.pedi_data}</Text>
        <Text style={styles.cliente}>Cliente: {item.cliente_nome}</Text>

        {/* Exibir totais */}
        <Text style={styles.total}>
          Total Bruto:{' '}
          {bruto.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })}
        </Text>

        {desc > 0 && (
          <Text style={[styles.total, { color: '#ff7b7b', fontSize: 12 }]}>
            Desconto: -
            {desc.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </Text>
        )}

        <Text style={[styles.total, { color: '#18b7df', fontWeight: 'bold' }]}>
          Total Líquido:{' '}
          {liquido.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })}
        </Text>

        <Text style={styles.empresa}>
          Empresa: {item.empresa_nome || '---'}
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.botao} onPress={() => onEdit(item)}>
            <Text style={styles.botaoTexto}>✏️</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.botao} onPress={() => onDelete(item)}>
            <Text style={styles.botaoTexto}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.item.pedi_nume === nextProps.item.pedi_nume &&
      prevProps.item.pedi_stat === nextProps.item.pedi_stat &&
      prevProps.item.pedi_tota === nextProps.item.pedi_tota &&
      prevProps.item.pedi_desc === nextProps.item.pedi_desc
    )
  }
)

// Item memoizado, evita rerender quando props não mudam

// Cache para pedidos
const PEDIDOS_CACHE_KEY = 'pedidos_cache'
const PEDIDOS_CACHE_DURATION = 12 * 60 * 60 * 1000 // 12 horas

export default function Pedidos({ navigation }) {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [slug, setSlug] = useState('')

  useEffect(() => {
    const carregarSlug = async () => {
      try {
        const { slug } = await getStoredData()
        if (slug) setSlug(slug)
      } catch (err) {
        console.error('Erro ao carregar slug:', err.message)
      }
    }
    carregarSlug()
  }, [])

  const buscarPedidos = async () => {
    if (!slug) return
    
    setIsSearching(true)
    
    // Verificar cache persistente para busca inicial
    if (!searchTerm) {
      try {
        const cacheData = await AsyncStorage.getItem(PEDIDOS_CACHE_KEY)
        if (cacheData) {
          const { results, timestamp } = JSON.parse(cacheData)
          const now = Date.now()
          
          if ((now - timestamp) < PEDIDOS_CACHE_DURATION) {
            console.log('📦 [CACHE-PEDIDOS] Usando dados em cache persistente')
            setPedidos(results || [])
            setLoading(false)
            setIsSearching(false)
            return
          }
        }
      } catch (error) {
        console.log('⚠️ Erro ao ler cache de pedidos:', error)
      }
    }
    
    try {
      console.log(`🔍 [PEDIDOS] Buscando pedidos${searchTerm ? ` para: "${searchTerm}"` : ''}`)
      
      const data = await apiGet('pedidos/pedidos/', {
        search: searchTerm,
        limit: 50,
        ordering: '-pedi_data'
      })

      const resultados = data.results || []
      console.log(`✅ [PEDIDOS] Encontrados ${resultados.length} pedidos`)
      
      setPedidos(resultados)
      
      // Salvar no cache persistente se for busca inicial
      if (!searchTerm) {
        try {
          const cacheData = {
            results: resultados,
            timestamp: Date.now()
          }
          await safeSetItem(PEDIDOS_CACHE_KEY, JSON.stringify(cacheData))
          console.log(`💾 [CACHE-PEDIDOS] Salvos ${resultados.length} pedidos no cache`)
        } catch (error) {
          console.log('⚠️ Erro ao salvar cache de pedidos:', error)
        }
      }
      
    } catch (error) {
      console.log('❌ Erro ao buscar pedidos:', error.message)
    } finally {
      setIsSearching(false)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (slug) {
      buscarPedidos()
    }
  }, [slug, searchTerm])

  const excluirPedido = async (id) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este pedido?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiDelete(`pedidos/pedidos/${id}/`)
              
              // Limpar cache após exclusão
              await AsyncStorage.removeItem(PEDIDOS_CACHE_KEY)
              console.log('🗑️ [CACHE-PEDIDOS] Cache limpo após exclusão')
              
              buscarPedidos()
              Alert.alert('Sucesso', 'Pedido excluído com sucesso!')
            } catch (error) {
              console.error('Erro ao excluir pedido:', error)
              Alert.alert('Erro', 'Não foi possível excluir o pedido')
            }
          },
        },
      ]
    )
  }

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.numero}>Pedido #{item.pedi_nume}</Text>
      <Text style={styles.cliente}>{item.cliente_nome}</Text>
      <Text style={styles.data}>Data: {new Date(item.pedi_data).toLocaleDateString('pt-BR')}</Text>
      <Text style={styles.valor}>Valor: R$ {item.pedi_valo?.toFixed(2) || '0,00'}</Text>
      
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('PedidosForm', { pedido: item })}
        >
          <Text style={styles.buttonText}>Editar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => excluirPedido(item.pedi_codi)}
        >
          <Text style={styles.buttonText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Carregando pedidos...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar pedidos..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          onSubmitEditing={buscarPedidos}
        />
        
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('PedidosForm')}
        >
          <Text style={styles.addButtonText}>+ Novo</Text>
        </TouchableOpacity>
      </View>

      {isSearching && (
        <View style={styles.searchingContainer}>
          <ActivityIndicator size="small" color="#007bff" />
          <Text>Buscando...</Text>
        </View>
      )}

      <FlatList
        data={pedidos}
        renderItem={renderItem}
        keyExtractor={(item) => item.pedi_codi.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  )
}
