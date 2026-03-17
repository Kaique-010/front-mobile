import React, {
  useCallback,
  useMemo,
  useState,
  useLayoutEffect,
  useEffect,
} from 'react'
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
import { request } from '../utils/api'

export default function CfopList({ navigation }) {
  const { hasModulo, empresaId, carregando } = useContextoApp()
  const [dados, setDados] = useState([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  // Filtros
  const [buscaCFOP, setBuscaCFOP] = useState('')

  const asData = (resp) => resp?.data ?? resp

  const campoValor = (item, campo) => {
    const listas = [item?.campos_padrao, item?.incidencias]
    for (const lista of listas) {
      if (!Array.isArray(lista)) continue
      const found = lista.find((c) => c?.campo === campo)
      if (found) return found.valor
    }
    return undefined
  }

  const buscarCfops = async ({ silent = false } = {}) => {
    if (!empresaId || carregando) return
    if (!silent) setLoading(true)
    setErro(null)
    try {
      const q = String(buscaCFOP || '').trim()
      const resp = await request({
        method: 'get',
        endpoint: 'cfop/cfop',
        params: q ? { q } : {},
      })
      const data = asData(resp)
      const lista = Array.isArray(data?.results) ? data.results : data
      setDados(Array.isArray(lista) ? lista : [])
    } catch (error) {
      setErro('Erro ao buscar CFOPs')
    } finally {
      if (!silent) setLoading(false)
    }
  }

  const excluirCfop = async (cfop_id) => {
    Alert.alert('Confirmar Exclusão', 'Deseja realmente excluir este CFOP?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await request({
              method: 'delete',
              endpoint: `cfop/cfop/${cfop_id}/`,
            })
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
                error.response?.data?.erro ||
                'Erro desconhecido ao excluir CFOP.',
            })
          }
        },
      },
    ])
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await buscarCfops({ silent: true })
    setRefreshing(false)
  }, [buscaCFOP, empresaId, carregando])

  useFocusEffect(
    useCallback(() => {
      buscarCfops({ silent: true })
    }, [empresaId, carregando]),
  )

  useEffect(() => {
    if (!empresaId || carregando) return
    const t = setTimeout(() => {
      buscarCfops()
    }, 300)
    return () => clearTimeout(t)
  }, [empresaId, carregando, buscaCFOP])

  const dadosFiltrados = useMemo(() => {
    return Array.isArray(dados) ? dados : []
  }, [dados, buscaCFOP])

  const labelCfop = (item) => {
    const codi = campoValor(item, 'cfop_codi')
    const desc = campoValor(item, 'cfop_desc')
    return {
      codi: codi != null ? String(codi) : '',
      desc: desc != null ? String(desc) : '',
    }
  }

  const renderItem = ({ item }) => (
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
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Carregando CFOPs...</Text>
      </View>
    )
  }

  if (erro) {
    return (
      <View style={styles.erroContainer}>
        <Text style={styles.erroTexto}>{erro}</Text>
        <TouchableOpacity
          style={styles.botaoTentarNovamente}
          onPress={() => buscarCfops()}>
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

      <FlatList
        data={dadosFiltrados}
        keyExtractor={(item, index) => {
          const key = item?.cfop_id ?? item?.cfop ?? `cfop-${index}`
          return String(key)
        }}
        renderItem={renderItem}
        style={styles.lista}
        contentContainerStyle={styles.listaContent}
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
