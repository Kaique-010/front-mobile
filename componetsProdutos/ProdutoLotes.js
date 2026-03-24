import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useRoute } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Toast from 'react-native-toast-message'
import { apiGetComContexto } from '../utils/api'

export default function ProdutoLotes({ produto: propProduto, slug: propSlug }) {
  const route = useRoute()
  const params = route.params || {}

  const produto = propProduto || params.produto || {}
  const slug = propSlug || params.slug || ''
  const produtoId = produto?.prod_codi

  const [lotes, setLotes] = useState([])
  const [loading, setLoading] = useState(false)
  const fetchedIdRef = useRef(null)

  const formatarData = useCallback((value) => {
    if (!value) return ''
    const d = new Date(value)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleDateString('pt-BR')
  }, [])

  const formatarNumero = useCallback((value, opts = {}) => {
    const n = Number(value)
    if (Number.isNaN(n)) return ''
    try {
      return n.toLocaleString('pt-BR', opts)
    } catch {
      return String(n)
    }
  }, [])

  const carregarLotes = useCallback(async () => {
    if (!produtoId) return
    if (fetchedIdRef.current === produtoId) return

    setLoading(true)
    try {
      const empresaId = await AsyncStorage.getItem('empresaId')
      const empresa = empresaId ? parseInt(empresaId) : 1
      const endpoint = `produtos/produtos/${empresa}/${produtoId}/`
      const data = await apiGetComContexto(endpoint)

      const lista = Array.isArray(data?.lotes) ? data.lotes : []
      setLotes(lista)
      fetchedIdRef.current = produtoId
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível carregar os lotes do produto',
      })
    } finally {
      setLoading(false)
    }
  }, [produtoId])

  useEffect(() => {
    carregarLotes()
  }, [carregarLotes])

  const lotesOrdenados = useMemo(() => {
    const arr = Array.isArray(lotes) ? [...lotes] : []
    arr.sort((a, b) => {
      const aId = Number(a?.lote_lote ?? 0)
      const bId = Number(b?.lote_lote ?? 0)
      return bId - aId
    })
    return arr
  }, [lotes])

  const lotesComSaldo = useMemo(() => {
    return lotesOrdenados.filter((l) => Number(l?.lote_sald) > 0)
  }, [lotesOrdenados])

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Lotes</Text>

      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color="#93C5FD" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      ) : lotesComSaldo.length === 0 ? (
        <Text style={styles.empty}>Nenhum lote encontrado.</Text>
      ) : (
        lotesComSaldo.map((lote, idx) => (
          <View key={String(lote?.lote_lote ?? idx)} style={styles.card}>
            <Linha label="Código" value={lote?.lote_lote} />
            <Linha label="Saldo" value={formatarNumero(lote?.lote_sald)} />
            <Linha
              label="Unitário"
              value={formatarNumero(lote?.lote_unit, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            />
            <Linha
              label="Fabricação"
              value={formatarData(lote?.lote_data_fabr)}
            />
            <Linha
              label="Validade"
              value={formatarData(lote?.lote_data_vali)}
            />
            <Linha
              label="Status"
              value={lote?.lote_ativ ? 'Ativo' : 'Inativo'}
            />
          </View>
        ))
      )}
    </ScrollView>
  )
}

function Linha({ label, value }) {
  const v = useMemo(() => {
    return value === null || value === undefined || value === ''
      ? '-'
      : String(value)
  }, [value])
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{v}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B141A',
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  loadingText: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: '600',
  },
  empty: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#111f35ff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#345686',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  rowLabel: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
  },
  rowValue: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
})
