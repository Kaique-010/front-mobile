import React, { useState, useEffect } from 'react'
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Keyboard,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { apiGetComContexto } from '../utils/api'

// Debounce simples
function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}

const parseNumberBR = (v) => {
  if (typeof v === 'number') return v
  if (v === null || v === undefined) return 0
  const s = String(v).trim()
  if (!s) return 0
  if (s.includes(',') && s.includes('.')) {
    return parseFloat(s.replace(/\./g, '').replace(',', '.')) || 0
  }
  if (s.includes(',')) {
    return parseFloat(s.replace(',', '.')) || 0
  }
  return parseFloat(s.replace(/[^\d.-]/g, '')) || 0
}

export default function BuscaProdutoInputLotes({
  onSelect,
  initialValue = '',
  valorAtual = '',
  quantidadeSolicitada,
}) {
  const [searchTerm, setSearchTerm] = useState(initialValue || valorAtual)
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(false)
  const [usuarioTemSetor, setUsuarioTemSetor] = useState(false)
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [showResults, setShowResults] = useState(false)
  const [selecionando, setSelecionando] = useState(false)

  useEffect(() => {
    const verificarSetor = async () => {
      const setor = await AsyncStorage.getItem('setor')
      setUsuarioTemSetor(!!setor && setor !== '0' && setor !== 'null')
    }
    verificarSetor()
  }, [])

  // Atualiza valor inicial
  useEffect(() => {
    const v = initialValue || valorAtual
    if (v) setSearchTerm(v)
  }, [initialValue, valorAtual])

  // Busca produtos
  useEffect(() => {
    if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) {
      setProdutos([])
      setShowResults(false)
      return
    }

    const buscar = async () => {
      setLoading(true)
      setShowResults(true)

      try {
        const data = await apiGetComContexto(
          'produtos/produtos/',
          {
            search: debouncedSearchTerm,
            limit: 10,
          },
          'prod_',
        )

        const validos = data.results.filter(
          (p) => p?.prod_codi && !isNaN(Number(p.prod_codi)),
        )

        setProdutos(validos)
      } catch (err) {
        console.error('Erro ao buscar produtos:', err)
        setProdutos([])
      } finally {
        setLoading(false)
      }
    }

    buscar()
  }, [debouncedSearchTerm])

  const handleSelecionar = async (produto) => {
    Keyboard.dismiss()
    setSelecionando(true)
    try {
      let consumoData = null
      const qtdNum = parseNumberBR(quantidadeSolicitada)
      if (
        quantidadeSolicitada !== undefined &&
        quantidadeSolicitada !== null &&
        !isNaN(qtdNum) &&
        qtdNum > 0
      ) {
        consumoData = await apiGetComContexto(
          'pedidos/pedidos/lotes-produtos-desc/',
          {
            prod_codi: produto.prod_codi,
            qtd: qtdNum,
          },
          'pedi_',
        )
      }

      const consumoPorLote = Array.isArray(consumoData?.consumo)
        ? consumoData.consumo
            .filter(
              (c) =>
                (c?.origem === 'LOTE' || c?.origem === 'SEM_LOTE') &&
                Number(c?.quantidade || 0) > 0,
            )
            .map((c) => ({
              iped_lote_vend:
                c?.origem === 'LOTE' ? Number(c?.lote_lote) : null,
              iped_quan: Number(c?.quantidade || 0),
            }))
        : []

      const ipedLoteVend =
        consumoPorLote.length > 0 ? consumoPorLote[0].iped_lote_vend : null

      console.log('[BUSCA_PROD_LOTES] Selecionado:', {
        prod_codi: produto?.prod_codi,
        prod_nome: produto?.prod_nome,
        quantidadeSolicitada:
          quantidadeSolicitada !== undefined && quantidadeSolicitada !== null
            ? Number(quantidadeSolicitada)
            : null,
        iped_lote_vend: ipedLoteVend,
      })
      if (consumoData?.consumo) {
        console.log('[BUSCA_PROD_LOTES] Consumo FIFO:', consumoData.consumo)
        const porLote = (consumoData.consumo || []).reduce((acc, c) => {
          const chave =
            c?.origem === 'LOTE' ? `LOTE_${c?.lote_lote}` : 'SEM_LOTE'
          const qtd = Number(c?.quantidade || 0)
          acc[chave] = (acc[chave] || 0) + qtd
          return acc
        }, {})
        console.log('[BUSCA_PROD_LOTES] Consumo por lote:', porLote)
        console.log(
          '[BUSCA_PROD_LOTES] Saldo faltante:',
          consumoData?.saldo_faltante,
        )
      }

      // ENVIO 100% CONSISTENTE DOS PREÇOS
      onSelect &&
        onSelect({
          prod_codi: produto.prod_codi,
          prod_nome: produto.prod_nome,
          prod_preco_vista: produto.prod_preco_vista,
          prod_preco_normal: produto.prod_preco_normal,
          preco_final:
            produto.prod_preco_vista > 0
              ? produto.prod_preco_vista
              : (produto.prod_preco_normal ?? 0),
          lotes: consumoData?.results ?? produto?.lotes ?? [],
          saldo_total: consumoData?.saldo_total,
          saldo_lotes: consumoData?.saldo_lotes,
          saldo_sem_lote: consumoData?.saldo_sem_lote,
          consumo: consumoData?.consumo ?? [],
          consumo_por_lote: consumoPorLote,
          iped_lote_vend: ipedLoteVend,
          saldo_faltante: consumoData?.saldo_faltante ?? null,
        })

      setSearchTerm(produto.prod_nome)
      setProdutos([])
      setShowResults(false)
    } catch (err) {
      console.error('Erro ao carregar lotes/consumo:', err)
    } finally {
      setSelecionando(false)
    }
  }

  const mostrarPrecoAoUsuario = (p) =>
    !usuarioTemSetor && (p.prod_preco_vista > 0 || p.prod_preco_normal > 0)

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#232935',
          borderRadius: 10,
          paddingHorizontal: 10,
          marginBottom: 10,
        }}>
        <Ionicons
          name="pricetag"
          size={20}
          color="#aaa"
          style={{ marginRight: 8 }}
        />

        <TextInput
          style={{
            flex: 1,
            height: 45,
            color: 'white',
            fontSize: 15,
          }}
          placeholder="Buscar produto"
          placeholderTextColor="#aaa"
          value={searchTerm}
          onChangeText={(text) => {
            setSearchTerm(text)
            setShowResults(text.length >= 2)
          }}
        />

        {loading ? <ActivityIndicator size="small" color="#01ff16" /> : null}
        {selecionando ? (
          <ActivityIndicator
            size="small"
            color="#ffb401"
            style={{ marginLeft: 6 }}
          />
        ) : null}
      </View>

      {showResults && produtos.length > 0 && (
        <FlatList
          data={produtos}
          keyExtractor={(item) => `prod-${item.prod_codi}-${item.prod_empr}`}
          style={{
            maxHeight: 250,
            backgroundColor: '#1c1c1c',
            borderRadius: 8,
            paddingHorizontal: 4,
          }}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleSelecionar(item)}
              style={{
                padding: 10,
                borderBottomWidth: 1,
                borderBottomColor: '#333',
              }}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>
                {item.prod_nome}
              </Text>

              <Text style={{ color: '#bbb', marginTop: 2 }}>
                Código: {item.prod_codi} | UM: {item.prod_unme} | Saldo:{' '}
                {item.saldo_estoque}
              </Text>

              {mostrarPrecoAoUsuario(item) && (
                <Text style={{ color: '#0fdd79', marginTop: 2 }}>
                  Preço: R${' '}
                  {(
                    item.prod_preco_vista ||
                    item.prod_preco_normal ||
                    0
                  ).toFixed(2)}
                </Text>
              )}
              {Array.isArray(item.lotes) && item.lotes.length > 0 && (
                <Text style={{ color: '#8ab4f8', marginTop: 2 }}>
                  Lotes: {item.lotes.length}
                </Text>
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  )
}
