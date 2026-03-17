import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react'
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
import styles from './Styles/NcmStyles'
import Toast from 'react-native-toast-message'
import useContextoApp from '../hooks/useContextoApp'
import { request } from '../utils/api'

export default function NcmList({ navigation }) {
  const { hasModulo, empresaId, carregando } = useContextoApp()
  const [dados, setDados] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [erro, setErro] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [page, setPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const requestSeq = useRef(0)
  const pageSize = 20

  // Filtros
  const [buscaNCM, setBuscaNCM] = useState('')

  const asData = (resp) => resp?.data ?? resp

  const toText = (v) => {
    if (v == null) return ''
    if (
      typeof v === 'string' ||
      typeof v === 'number' ||
      typeof v === 'boolean'
    )
      return String(v)
    if (typeof v === 'object') {
      return (
        v?.descricao ??
        v?.desc ??
        v?.label ??
        v?.nome ??
        v?.ncm ??
        v?.codigo ??
        v?.value ??
        JSON.stringify(v)
      )
    }
    return String(v)
  }

  const buscarNcms = async ({
    pagina = 1,
    append = false,
    silent = false,
    isRefresh = false,
  } = {}) => {
    if (!empresaId || carregando) return
    const seq = (requestSeq.current += 1)

    if (isRefresh) setRefreshing(true)
    if (!silent && pagina === 1) setLoading(true)
    if (pagina > 1) setLoadingMore(true)

    setErro(null)
    try {
      const q = String(buscaNCM || '').trim()
      const params = {
        page: pagina,
        page_size: pageSize,
        limit: pageSize,
      }
      const resp = await request({
        method: 'get',
        endpoint: 'produtos/ncmfiscalpadrao',
        params: q ? { ...params, q, search: q } : params,
      })
      if (seq !== requestSeq.current) return
      const data = asData(resp)
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
      setErro('Erro ao buscar NCMs')
    } finally {
      if (seq !== requestSeq.current) return
      setLoading(false)
      setLoadingMore(false)
      setRefreshing(false)
    }
  }

  const excluirNcm = async (id) => {
    Alert.alert('Confirmar Exclusão', 'Deseja realmente excluir este NCM?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await request({
              method: 'delete',
              endpoint: `produtos/ncmfiscalpadrao/${id}/`,
            })
            await buscarNcms({ silent: true })
            Toast.show({
              type: 'success',
              text1: 'Sucesso',
              text2: 'NCM excluído',
            })
          } catch (error) {
            Toast.show({
              type: 'error',
              text1: 'Erro ao excluir NCM',
              text2:
                error.response?.data?.erro ||
                'Erro desconhecido ao excluir NCM.',
            })
          }
        },
      },
    ])
  }

  const onRefresh = useCallback(async () => {
    await buscarNcms({
      pagina: 1,
      append: false,
      silent: true,
      isRefresh: true,
    })
  }, [buscaNCM, empresaId, carregando])

  useFocusEffect(
    useCallback(() => {
      if (!empresaId || carregando) return
      buscarNcms({ pagina: 1, append: false, silent: false })
    }, [empresaId, carregando]),
  )

  useEffect(() => {
    if (!empresaId || carregando) return
    const t = setTimeout(() => {
      buscarNcms({ pagina: 1, append: false, silent: true })
    }, 300)
    return () => clearTimeout(t)
  }, [empresaId, carregando, buscaNCM])

  const dadosFiltrados = useMemo(() => {
    return Array.isArray(dados) ? dados : []
  }, [dados, buscaNCM])

  const labelNcm = (item) => ({
    ncm_id: toText(item?.ncm_id),
    ncm: toText(item?.ncm),
    cfop: toText(item?.cfop),
    uf_origem: toText(item?.uf_origem),
    uf_destino: toText(item?.uf_destino),
  })

  const getNcmPk = (item) => {
    const pk = item?.id ?? item?.ncm_pk ?? item?.ncm_fiscal_id ?? item?.ncm_id
    return pk != null ? String(pk) : ''
  }

  const renderItem = ({ item }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemNcm}>
            NCM: {labelNcm(item).ncm_id || '-'}
          </Text>
          {labelNcm(item).ncm ? (
            <Text style={styles.itemDescricao}>{labelNcm(item).ncm}</Text>
          ) : null}
          {labelNcm(item).cfop ||
          labelNcm(item).uf_origem ||
          labelNcm(item).uf_destino ? (
            <Text style={styles.itemDescricao}>
              {[
                labelNcm(item).cfop ? `CFOP ${labelNcm(item).cfop}` : null,
                labelNcm(item).uf_origem && labelNcm(item).uf_destino
                  ? `${labelNcm(item).uf_origem} → ${labelNcm(item).uf_destino}`
                  : null,
              ]
                .filter(Boolean)
                .join(' • ')}
            </Text>
          ) : null}
        </View>
        <View style={styles.itemActions}>
          {hasModulo('Produtos') && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() =>
                navigation.navigate('NcmForm', {
                  ncmId: getNcmPk(item),
                  isEdit: true,
                })
              }>
              <MaterialIcons name="edit" size={20} color="#007bff" />
            </TouchableOpacity>
          )}
          {hasModulo('Produtos') && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => excluirNcm(getNcmPk(item))}>
              <MaterialIcons name="delete" size={20} color="#dc3545" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  )

  if (erro) {
    return (
      <View style={styles.erroContainer}>
        <Text style={styles.erroTexto}>{erro}</Text>
        <TouchableOpacity
          style={styles.botaoTentarNovamente}
          onPress={() => buscarNcms({ pagina: 1, append: false })}>
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
        <Text style={styles.loadingText}>Carregando NCMs...</Text>
      </View>
    )
  }

  const carregarMais = () => {
    if (loading || loadingMore || refreshing || !hasNextPage) return
    buscarNcms({ pagina: page + 1, append: true, silent: true })
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>NCMs</Text>
          <Text style={styles.headerSubtitle}>Gerenciar NCMs</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('NcmForm', { isEdit: false })}>
          <MaterialIcons name="add" size={20} color="#000" />
          <Text style={styles.addButtonText}>Incluir NCM</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filtrosContainer}>
        <TextInput
          style={styles.searchInput}
          value={buscaNCM}
          onChangeText={setBuscaNCM}
          placeholder="Buscar por NCM ou descrição"
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
          const key = getNcmPk(item) || `ncm-${index}`
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
            <Text style={styles.emptyText}>Nenhum NCM encontrado</Text>
          </View>
        }
      />
    </View>
  )
}
