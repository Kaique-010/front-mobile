import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import styles from './Styles/CfopStyles'
import Toast from 'react-native-toast-message'
import useContextoApp from '../hooks/useContextoApp'
import { apiGetComContexto, apiDeleteComContexto } from '../utils/api'

export default function CfopList({ navigation }) {
  const { hasModulo, empresaId, carregando } = useContextoApp()
  const [dados, setDados] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [erro, setErro] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [page, setPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const requestSeq = useRef(0)
  const isFocusedRef = useRef(false)
  const didInitialFetch = useRef(false)
  const pageSize = 20

  const [buscaCFOP, setBuscaCFOP] = useState('')

  const campoValor = (item, campo) => {
    const listas = [item?.campos_padrao, item?.incidencias]
    for (const lista of listas) {
      if (!Array.isArray(lista)) continue
      const found = lista.find((c) => c?.campo === campo)
      if (found) return found.valor
    }
    return undefined
  }

  // FIX: usa apiGetComContexto igual às telas que funcionam (notas, dashboard)
  // resolve o slug via contexto, sem depender do AsyncStorage isoladamente
  const buscarCfops = useCallback(
    async ({
      pagina = 1,
      append = false,
      silent = false,
      isRefresh = false,
    } = {}) => {
      if (!empresaId || carregando) return
      const seq = (requestSeq.current += 1)
      let finished = false

      if (isRefresh) setRefreshing(true)
      if (!silent && pagina === 1) setLoading(true)
      if (pagina > 1) setLoadingMore(true)
      setErro(null)

      try {
        const q = String(buscaCFOP || '').trim()
        const params = {
          page: pagina,
          page_size: pageSize,
          limit: pageSize,
          ...(q ? { q } : {}),
        }

        const data = await apiGetComContexto('cfop/cfop', params)

        if (seq !== requestSeq.current) return
        finished = true

        const lista = Array.isArray(data?.results) ? data.results : data
        const itens = Array.isArray(lista) ? lista : []

        if (append) {
          setDados((prev) => [...prev, ...itens])
        } else {
          setDados(itens)
        }
        setHasNextPage(!!data?.next)
        setPage(pagina)
      } catch (error) {
        if (seq !== requestSeq.current) return
        finished = true
        setErro('Erro ao buscar CFOPs')
      } finally {
        if (finished) {
          setLoading(false)
          setLoadingMore(false)
          setRefreshing(false)
        }
      }
    },
    [empresaId, carregando, buscaCFOP],
  )

  const excluirCfop = useCallback(
    async (cfop_id) => {
      Alert.alert('Confirmar Exclusão', 'Deseja realmente excluir este CFOP?', [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              // FIX: usa apiDeleteComContexto em vez de request()
              await apiDeleteComContexto(`cfop/cfop/${cfop_id}/`)
              await buscarCfops({ silent: true })
              Toast.show({
                type: 'success',
                text1: 'Sucesso',
                text2: 'CFOP excluído',
              })
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Erro ao excluir CFOP',
                text2:
                  error?.response?.data?.erro ||
                  error?.message ||
                  'Erro desconhecido ao excluir CFOP.',
              })
            }
          },
        },
      ])
    },
    [buscarCfops],
  )

  const onRefresh = useCallback(async () => {
    await buscarCfops({ pagina: 1, append: false, silent: true, isRefresh: true })
  }, [buscarCfops])

  useFocusEffect(
    useCallback(() => {
      if (!empresaId || carregando) return
      isFocusedRef.current = true
      buscarCfops({ pagina: 1, append: false, silent: false }).finally(() => {
        didInitialFetch.current = true
      })
      return () => {
        isFocusedRef.current = false
      }
    }, [empresaId, carregando, buscarCfops]),
  )

  useEffect(() => {
    if (!empresaId || carregando) return
    if (!isFocusedRef.current || !didInitialFetch.current) return
    const t = setTimeout(() => {
      buscarCfops({ pagina: 1, append: false, silent: true })
    }, 300)
    return () => clearTimeout(t)
  }, [empresaId, carregando, buscaCFOP, buscarCfops])

  const dadosFiltrados = useMemo(() => {
    return Array.isArray(dados) ? dados : []
  }, [dados])

  const labelCfop = (item) => {
    const codi = campoValor(item, 'cfop_codi')
    const desc = campoValor(item, 'cfop_desc')
    return {
      codi: codi != null ? String(codi) : '',
      desc: desc != null ? String(desc) : '',
    }
  }

  const carregarMais = useCallback(() => {
    if (loading || loadingMore || refreshing || !hasNextPage) return
    buscarCfops({ pagina: page + 1, append: true, silent: true })
  }, [loading, loadingMore, refreshing, hasNextPage, page, buscarCfops])

  const renderItem = useCallback(
    ({ item }) => (
      <View style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemCfop}>
              CFOP: {labelCfop(item).codi || item?.cfop_id || '-'}
            </Text>
            {labelCfop(item).desc ? (
              <Text style={styles.itemDescricao}>{labelCfop(item).desc}</Text>
            ) : null}
          </View>
          <View style={styles.itemActions}>
            {hasModulo('Entidades') && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() =>
                  navigation.navigate('CfopForm', {
                    cfopId: item.cfop_id ?? item?.id,
                    isEdit: true,
                  })
                }>
                <MaterialIcons name="edit" size={20} color="#007bff" />
              </TouchableOpacity>
            )}
            {hasModulo('Entidades') && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => excluirCfop(item.cfop_id ?? item?.id)}>
                <MaterialIcons name="delete" size={20} color="#dc3545" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    ),
    [hasModulo, navigation, excluirCfop],
  )

  if (erro) {
    return (
      <View style={styles.erroContainer}>
        <Text style={styles.erroTexto}>{erro}</Text>
        <TouchableOpacity
          style={styles.botaoTentarNovamente}
          onPress={() => buscarCfops({ pagina: 1, append: false })}>
          <MaterialIcons name="refresh" size={18} color="#fff" />
          <Text style={styles.botaoTentarNovamenteTexto}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (loading && (!dadosFiltrados || dadosFiltrados.length === 0)) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Carregando CFOPs...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>CFOPs</Text>
          <Text style={styles.headerSubtitle}>Gerenciar CFOPs</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CfopForm', { isEdit: false })}>
          <MaterialIcons name="add" size={20} color="#000" />
          <Text style={styles.addButtonText}>Incluir CFOP</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filtrosContainer}>
        <TextInput
          style={styles.searchInput}
          value={buscaCFOP}
          onChangeText={setBuscaCFOP}
          placeholder="Buscar por CFOP ou descrição"
          placeholderTextColor="#666"
        />
      </View>

      {loading ? (
        <View style={{ paddingVertical: 10 }}>
          <ActivityIndicator size="small" color="#01ff16" />
        </View>
      ) : null}

      <FlatList
        data={dadosFiltrados}
        keyExtractor={(item, index) => {
          const key = item?.cfop_id ?? item?.cfop ?? `cfop-${index}`
          return String(key)
        }}
        renderItem={renderItem}
        style={styles.lista}
        contentContainerStyle={styles.listaContent}
        keyboardShouldPersistTaps="handled"
        onEndReached={carregarMais}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          loadingMore ? (
            <View style={{ paddingVertical: 12 }}>
              <ActivityIndicator size="small" color="#01ff16" />
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="money-off" size={64} color="#bdc3c7" />
            <Text style={styles.emptyText}>Nenhum CFOP encontrado</Text>
          </View>
        }
      />
    </View>
  )
}