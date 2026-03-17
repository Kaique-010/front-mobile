import React, { useCallback, useMemo, useState, useEffect } from 'react'
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
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [ready, setReady] = useState(false)

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

  const buscarNcms = async ({ silent = false } = {}) => {
    if (!empresaId || carregando) return
    if (!silent) setLoading(true)
    setErro(null)
    try {
      const q = String(buscaNCM || '').trim()
      const resp = await request({
        method: 'get',
        endpoint: 'produtos/ncmfiscalpadrao',
        params: q ? { q, search: q } : {},
      })
      const data = asData(resp)
      const lista = Array.isArray(data?.results) ? data.results : data
      setDados(Array.isArray(lista) ? lista : [])
    } catch (error) {
      setErro('Erro ao buscar NCMs')
    } finally {
      if (!silent) setLoading(false)
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
    setRefreshing(true)
    await buscarNcms({ silent: true })
    setRefreshing(false)
  }, [buscaNCM, empresaId, carregando])

  useFocusEffect(
    useCallback(() => {
      setReady(false)
      buscarNcms({ silent: true }).finally(() => setReady(true))
    }, [empresaId, carregando]),
  )

  useEffect(() => {
    if (!empresaId || carregando || !ready) return
    const t = setTimeout(() => {
      buscarNcms({ silent: true })
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
          onPress={() => buscarNcms()}>
          <MaterialIcons name="refresh" size={18} color="#fff" />
          <Text style={styles.botaoTentarNovamenteTexto}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    )
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
