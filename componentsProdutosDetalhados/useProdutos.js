import { useState, useEffect, useCallback, useRef } from 'react'
import { apiGetComContexto } from '../utils/api'
import database from '../componentsOrdemServico/schemas/database'
import { Q } from '@nozbe/watermelondb'
import NetInfo from '@react-native-community/netinfo'
import { getStoredData } from '../services/storageService'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Toast from 'react-native-toast-message'

const PRODUTOS_CACHE_KEY = 'produtos_detalhados_cache'
const PRODUTOS_CACHE_DURATION = 12 * 60 * 60 * 1000 // 12 horas

const useProdutos = () => {
  const [produtos, setProdutos] = useState([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [slug, setSlug] = useState('')
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState(false)

  const [marcaSelecionada, setMarcaSelecionada] = useState('')
  const [saldoFiltro, setSaldoFiltro] = useState('todos')
  const [marcas, setMarcas] = useState([])

  // FIX: ref para controlar se já fez a carga inicial
  // (evita rebuscar desnecessariamente em re-renders normais)
  const slugCarregado = useRef(false)
  const [searchTimeout, setSearchTimeout] = useState(null)
  const fetchLock = useRef(false)
  const offsetRef = useRef(0)
  const produtosCountRef = useRef(0)

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

  useEffect(() => {
    offsetRef.current = offset
  }, [offset])

  useEffect(() => {
    produtosCountRef.current = produtos.length
  }, [produtos.length])

  const buscarProdutos = useCallback(
    async ({ reset = false, forceRefresh = false } = {}) => {
      if (!slug || fetchLock.current) return
      fetchLock.current = true
      try {
        const limit = 20

        const getCodigo = (p) => String(p?.codigo ?? p?.prod_codi ?? '')
        const mergeDedupe = (prev, next) => {
          const map = new Map()
          for (const p of prev || []) {
            const k = getCodigo(p)
            if (k) map.set(k, p)
          }
          for (const p of next || []) {
            const k = getCodigo(p)
            if (k) map.set(k, { ...(map.get(k) || {}), ...p })
          }
          return Array.from(map.values())
        }

        const net = await NetInfo.fetch().catch(() => null)
        const isOnline =
          !!net?.isConnected && (net?.isInternetReachable ?? true)

        if (
          reset &&
          !forceRefresh &&
          !searchTerm &&
          !marcaSelecionada &&
          saldoFiltro === 'todos' &&
          !isOnline
        ) {
          try {
            const empresaId = await AsyncStorage.getItem('empresaId')
            const mega = database.collections.get('mega_produtos')
            const clauses = []
            if (empresaId) clauses.push(Q.where('prod_empr', String(empresaId)))
            const rows = await mega.query(...clauses).fetch()
            if (rows.length > 0) {
              const mapped = rows.map((r) => ({
                codigo: r.prodCodi,
                nome: r.prodNome,
                marca_nome: r.marcaNome,
                saldo: r.saldoEstoque ?? 0,
                preco_vista: r.precoVista,
                imagem_base64: r.imagemBase64,
                prod_ncm: r.prodNcm,
                unidade: r.prodUnme,
                empresa: r.prodEmpr,
              }))
              setProdutos(mapped)
              const marcasUnicas = [
                ...new Set(mapped.map((p) => p.marca_nome).filter(Boolean)),
              ]
              setMarcas(['Sem marca', ...marcasUnicas.sort()])
              setOffset(mapped.length)
              setHasMore(false)
              return
            }
          } catch (e) {}

          try {
            const cacheData = await AsyncStorage.getItem(PRODUTOS_CACHE_KEY)
            if (cacheData) {
              const { results, marcas, timestamp } = JSON.parse(cacheData)
              const now = Date.now()
              if (now - timestamp < PRODUTOS_CACHE_DURATION) {
                const cachedResults = Array.isArray(results) ? results : []
                setProdutos(cachedResults)
                setMarcas(marcas || [])
                setOffset(cachedResults.length)
                setHasMore(cachedResults.length === limit)
                return
              }
            }
          } catch (e) {}
        }

        const atualOffset = reset ? 0 : offsetRef.current
        if (reset) {
          setInitialLoading(produtosCountRef.current === 0)
          setIsSearching(true)
          setOffset(0)
          setHasMore(true)
        } else {
          setIsFetchingMore(true)
        }

        const params = {
          limit,
          offset: atualOffset,
        }
        if (searchTerm) params.search = searchTerm

        if (marcaSelecionada) {
          params.marca_nome =
            marcaSelecionada === '__sem_marca__'
              ? '__sem_marca__'
              : marcaSelecionada
        }
        if (saldoFiltro === 'com') params.com_saldo = true
        if (saldoFiltro === 'sem') params.sem_saldo = true

        // Não enviar `empresa`/`filial` como query param.
        // O contexto já vai pelos headers e evita o DjangoFilterBackend aplicar filtro exato.

        const data = await apiGetComContexto(
          'produtos/produtosdetalhados/',
          params,
        )

        const novos = data.results || []
        setProdutos((prev) => {
          const nextList = reset ? novos : mergeDedupe(prev, novos)
          const progressed = reset || nextList.length > prev.length
          setHasMore(progressed && data?.next != null)
          return nextList
        })
        setOffset(atualOffset + novos.length)

        // Persistir no WatermelonDB
        try {
          await database.write(async () => {
            const col = database.collections.get('produtos_detalhados')
            const mega = database.collections.get('mega_produtos')
            for (const p of novos) {
              const codigo = String(p.codigo || p.prod_codi)
              const existentes = await col
                .query(Q.where('codigo', codigo))
                .fetch()
              if (existentes.length) {
                await existentes[0].update((row) => {
                  row.nome = p.nome || p.prod_nome
                  row.marcaNome = p.marca_nome || null
                  row.saldo = Number(p.saldo ?? 0)
                  row.precoVista = Number(
                    p.preco_vista ?? p.prod_preco_vista ?? 0,
                  )
                  row.imagemBase64 = p.imagem_base64 || null
                })
              } else {
                await col.create((row) => {
                  row._raw.id = codigo
                  row.codigo = codigo
                  row.nome = p.nome || p.prod_nome
                  row.marcaNome = p.marca_nome || null
                  row.saldo = Number(p.saldo ?? 0)
                  row.precoVista = Number(
                    p.preco_vista ?? p.prod_preco_vista ?? 0,
                  )
                  row.imagemBase64 = p.imagem_base64 || null
                })
              }
              const empr = String(p.prod_empr || p.empr || '1')
              const megaRows = await mega
                .query(Q.where('prod_codi', codigo), Q.where('prod_empr', empr))
                .fetch()
              if (megaRows.length) {
                await megaRows[0].update((row) => {
                  row.prodNome = p.nome || p.prod_nome
                  row.precoVista = Number(
                    p.preco_vista ?? p.prod_preco_vista ?? 0,
                  )
                  row.saldoEstoque = Number(p.saldo ?? p.saldo_estoque ?? 0)
                  row.marcaNome = p.marca_nome || null
                  row.imagemBase64 = p.imagem_base64 || null
                  row.prodNcm = p.prod_ncm || p.prodNcm || p.ncm || null
                  row.prodUnme = p.prod_unme || p.unidade || null
                })
              } else {
                await mega.create((row) => {
                  row._raw.id = `${codigo}-${empr}`
                  row.prodCodi = codigo
                  row.prodEmpr = empr
                  row.prodNome = p.nome || p.prod_nome
                  row.precoVista = Number(
                    p.preco_vista ?? p.prod_preco_vista ?? 0,
                  )
                  row.saldoEstoque = Number(p.saldo ?? p.saldo_estoque ?? 0)
                  row.marcaNome = p.marca_nome || null
                  row.imagemBase64 = p.imagem_base64 || null
                  row.prodNcm = p.prod_ncm || p.prodNcm || p.ncm || null
                  row.prodUnme = p.prod_unme || p.unidade || null
                })
              }
            }
          })
        } catch (e) {}

        if (reset) {
          const marcasUnicas = [
            ...new Set(novos.map((p) => p.marca_nome).filter(Boolean)),
          ]
          const marcasTratadas = ['Sem marca', ...marcasUnicas.sort()]
          setMarcas(marcasTratadas)

          if (!searchTerm && !marcaSelecionada && saldoFiltro === 'todos') {
            try {
              await AsyncStorage.setItem(
                PRODUTOS_CACHE_KEY,
                JSON.stringify({
                  results: novos,
                  marcas: marcasTratadas,
                  timestamp: Date.now(),
                }),
              )
            } catch (e) {}
          }
        }
      } catch (error) {
        console.log('❌ Erro ao buscar produtos:', error.message)
        try {
          const empresaId = await AsyncStorage.getItem('empresaId')
          const mega = database.collections.get('mega_produtos')
          const clauses = []
          if (searchTerm) {
            const termos = searchTerm.split(/\s+/).filter(Boolean)
            for (const t of termos) {
              const sanitized = Q.sanitizeLikeString(t)
              clauses.push(
                Q.or(
                  Q.where('prod_nome', Q.like(`%${sanitized}%`)),
                  Q.where('prod_codi', Q.like(`%${sanitized}%`)),
                ),
              )
            }
          }
          if (marcaSelecionada) {
            if (marcaSelecionada === '__sem_marca__') {
              clauses.push(Q.where('marca_nome', null))
            } else {
              clauses.push(Q.where('marca_nome', marcaSelecionada))
            }
          }
          if (saldoFiltro === 'com')
            clauses.push(Q.where('saldo_estoque', Q.gt(0)))
          if (saldoFiltro === 'sem') {
            clauses.push(
              Q.or(Q.where('saldo_estoque', 0), Q.where('saldo_estoque', null)),
            )
          }
          if (empresaId) clauses.push(Q.where('prod_empr', String(empresaId)))

          const rows = await mega.query(...clauses).fetch()
          const mapped = rows.map((r) => ({
            codigo: r.prodCodi,
            nome: r.prodNome,
            marca_nome: r.marcaNome,
            saldo: r.saldoEstoque ?? 0,
            preco_vista: r.precoVista,
            imagem_base64: r.imagemBase64,
            prod_ncm: r.prodNcm,
            unidade: r.prodUnme,
            empresa: r.prodEmpr,
          }))
          setProdutos((prev) => (reset ? mapped : mergeDedupe(prev, mapped)))
          setHasMore(false)
        } catch (e) {
          Toast.show({
            type: 'error',
            text1: 'Erro ao buscar produtos',
            text2: 'Sem dados offline disponíveis',
            visibilityTime: 3000,
          })
        }
      } finally {
        fetchLock.current = false
        setInitialLoading(false)
        setIsSearching(false)
        setIsFetchingMore(false)
      }
    },
    [slug, searchTerm, marcaSelecionada, saldoFiltro],
  )

  // FIX: expõe recarregarLista para o ProdutosList usar no useFocusEffect
  // invalida o cache e força busca na API para pegar produtos recém-salvos
  const recarregarLista = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(PRODUTOS_CACHE_KEY)
    } catch {}
    await buscarProdutos({ reset: true, forceRefresh: true })
  }, [buscarProdutos])

  // Carga inicial quando slug fica disponível
  useEffect(() => {
    if (slug && !slugCarregado.current) {
      slugCarregado.current = true
      buscarProdutos({ reset: true })
    }
  }, [slug])

  // Debounce de busca por texto
  useEffect(() => {
    if (!slug) return
    const delayMs = searchTerm === '' ? 0 : 500
    const delay = setTimeout(() => {
      buscarProdutos({ reset: true })
    }, delayMs)
    return () => clearTimeout(delay)
  }, [slug, searchTerm, buscarProdutos])

  // Recarrega ao mudar filtros
  useEffect(() => {
    if (slug) buscarProdutos({ reset: true })
  }, [marcaSelecionada, saldoFiltro])

  const handleSearchSubmit = useCallback(
    () => buscarProdutos({ reset: true, forceRefresh: true }),
    [buscarProdutos],
  )

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isFetchingMore && !initialLoading) {
      buscarProdutos({ reset: false })
    }
  }, [hasMore, isFetchingMore, initialLoading, buscarProdutos])

  const handleMarcaChange = useCallback(
    (marca) => setMarcaSelecionada(marca),
    [],
  )
  const handleSaldoChange = useCallback((saldo) => setSaldoFiltro(saldo), [])

  return {
    produtos,
    initialLoading,
    isSearching,
    searchTerm,
    setSearchTerm,
    hasMore,
    isFetchingMore,
    handleSearchSubmit,
    handleLoadMore,
    marcaSelecionada,
    setMarcaSelecionada,
    saldoFiltro,
    setSaldoFiltro,
    marcas,
    handleMarcaChange,
    handleSaldoChange,
    // FIX: exposto para o ProdutosList usar no useFocusEffect
    recarregarLista,
  }
}

export default useProdutos
