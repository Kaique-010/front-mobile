import { useState, useEffect, useCallback } from 'react'
import { apiGetComContextoSemFili } from '../utils/api'
import database from '../componentsOrdemServico/schemas/database'
import { Q } from '@nozbe/watermelondb'
import NetInfo from '@react-native-community/netinfo'
import { getStoredData } from '../services/storageService'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Toast from 'react-native-toast-message'

// Cache para produtos
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

  // Novos estados para filtros
  const [marcaSelecionada, setMarcaSelecionada] = useState('')
  const [saldoFiltro, setSaldoFiltro] = useState('todos')
  const [marcas, setMarcas] = useState([])

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

  // Debounce para busca
  const [searchTimeout, setSearchTimeout] = useState(null)

  const buscarProdutos = useCallback(
    async ({ reset = false }) => {
      if (!slug || (isFetchingMore && !reset)) return

      // Preferir MegaProdutos para busca inicial sem filtros
      if (
        reset &&
        !searchTerm &&
        !marcaSelecionada &&
        saldoFiltro === 'todos'
      ) {
        try {
          const mega = database.collections.get('mega_produtos')
          const rows = await mega.query().fetch()
          if (rows.length > 0) {
            const mapped = rows.map((r) => ({
              codigo: r.prodCodi,
              nome: r.prodNome,
              marca_nome: r.marcaNome,
              saldo: r.saldo,
              preco_vista: r.precoVista,
              imagem_base64: r.imagemBase64,
            }))
            setProdutos(mapped)
            const marcasUnicas = [
              ...new Set(mapped.map((p) => p.marca_nome).filter(Boolean)),
            ]
            setMarcas(['Sem marca', ...marcasUnicas.sort()])
            setInitialLoading(false)
            setIsSearching(false)
            return
          }
        } catch {}
        try {
          const cacheData = await AsyncStorage.getItem(PRODUTOS_CACHE_KEY)
          if (cacheData) {
            const { results, marcas, timestamp } = JSON.parse(cacheData)
            const now = Date.now()
            if (now - timestamp < PRODUTOS_CACHE_DURATION) {
              setProdutos(results || [])
              setMarcas(marcas || [])
              setInitialLoading(false)
              setIsSearching(false)
              return
            }
          }
        } catch {}
      }

      const atualOffset = reset ? 0 : offset
      if (reset) {
        setInitialLoading(produtos.length === 0)
        setIsSearching(true)
        setOffset(0)
        setHasMore(true)
      } else {
        setIsFetchingMore(true)
      }

      try {
        const params = {
          limit: 20,
          offset: atualOffset,
          search: searchTerm,
        }

        // Adicionar filtros aos parâmetros
        if (marcaSelecionada) {
          if (marcaSelecionada === 'Sem marca') {
            params.marca_nome = '__sem_marca__'
          } else {
            params.marca_nome = marcaSelecionada
          }
        }

        if (saldoFiltro === 'com') {
          params.com_saldo = true
        } else if (saldoFiltro === 'sem') {
          params.sem_saldo = true
        }

        const data = await apiGetComContextoSemFili(
          'produtos/produtosdetalhados/',
          params
        )

        const novos = data.results || []
        setProdutos(reset ? novos : [...produtos, ...novos])
        setOffset(atualOffset + 20)
        setHasMore(data.next !== null)

        // Persistir em WatermelonDB
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
                    p.preco_vista ?? p.prod_preco_vista ?? 0
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
                    p.preco_vista ?? p.prod_preco_vista ?? 0
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
                    p.preco_vista ?? p.prod_preco_vista ?? 0
                  )
                  row.saldo = Number(p.saldo ?? 0)
                  row.marcaNome = p.marca_nome || null
                  row.imagemBase64 = p.imagem_base64 || null
                })
              } else {
                await mega.create((row) => {
                  row._raw.id = `${codigo}-${empr}`
                  row.prodCodi = codigo
                  row.prodEmpr = empr
                  row.prodNome = p.nome || p.prod_nome
                  row.precoVista = Number(
                    p.preco_vista ?? p.prod_preco_vista ?? 0
                  )
                  row.saldo = Number(p.saldo ?? 0)
                  row.marcaNome = p.marca_nome || null
                  row.imagemBase64 = p.imagem_base64 || null
                })
              }
            }
          })
        } catch {}

        // Extrair marcas únicas para o filtro
        if (reset) {
          const marcasUnicas = [
            ...new Set(novos.map((p) => p.marca_nome).filter(Boolean)),
          ]

          const marcasTratadas = ['Sem marca', ...marcasUnicas.sort()]

          setMarcas(marcasTratadas)

          // Salvar no cache persistente se for busca inicial sem filtros
          if (!searchTerm && !marcaSelecionada && saldoFiltro === 'todos') {
            try {
              const cacheData = {
                results: novos,
                marcas: marcasTratadas,
                timestamp: Date.now(),
              }
              await AsyncStorage.setItem(
                PRODUTOS_CACHE_KEY,
                JSON.stringify(cacheData)
              )
              console.log(
                '💾 [CACHE-ASYNC] Produtos salvos no cache persistente'
              )
            } catch (error) {
              console.log('⚠️ Erro ao salvar cache de produtos:', error)
            }
          }
        }
      } catch (error) {
        console.log('❌ Erro ao buscar produtos:', error.message)
        try {
          const online = await NetInfo.fetch()
          const mega = database.collections.get('mega_produtos')
          const clauses = []
          if (searchTerm) {
            const termos = searchTerm.split(/\s+/).filter(Boolean)
            clauses.push(...termos.map((t) => Q.like('prod_nome', `%${t}%`)))
          }
          if (marcaSelecionada) {
            if (marcaSelecionada === 'Sem marca') {
              clauses.push(Q.where('marca_nome', null))
            } else {
              clauses.push(Q.where('marca_nome', marcaSelecionada))
            }
          }
          if (saldoFiltro === 'com') clauses.push(Q.where('saldo', Q.gt(0)))
          if (saldoFiltro === 'sem') clauses.push(Q.where('saldo', 0))

          const query = mega.query(...clauses)
          const rows = await query.fetch()
          const mapped = rows.map((r) => ({
            codigo: r.prodCodi,
            nome: r.prodNome,
            marca_nome: r.marcaNome,
            saldo: r.saldo,
            preco_vista: r.precoVista,
            imagem_base64: r.imagemBase64,
            prod_ncm: r.prodNcm,
          }))
          setProdutos(reset ? mapped : [...produtos, ...mapped])
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
        setInitialLoading(false)
        setIsSearching(false)
        setIsFetchingMore(false)
      }
    },
    [
      slug,
      offset,
      searchTerm,
      marcaSelecionada,
      saldoFiltro,
      produtos,
      isFetchingMore,
    ]
  )

  // Debounce para busca por texto
  const debouncedSearch = useCallback(
    (term) => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }

      const timeout = setTimeout(() => {
        setSearchTerm(term)
      }, 500) // 500ms de delay

      setSearchTimeout(timeout)
    },
    [searchTimeout]
  )

  useEffect(() => {
    if (slug && produtos.length === 0 && !searchTerm) {
      buscarProdutos({ reset: true })
    }
  }, [slug])

  useEffect(() => {
    const delay = setTimeout(() => {
      if (slug && searchTerm !== '') {
        buscarProdutos({ reset: true })
      }
    }, 600)
    return () => clearTimeout(delay)
  }, [searchTerm])

  // Novo useEffect para filtros
  useEffect(() => {
    if (slug) {
      buscarProdutos({ reset: true })
    }
  }, [marcaSelecionada, saldoFiltro])

  const handleSearchSubmit = () => buscarProdutos({ reset: true })

  const handleLoadMore = () => {
    if (hasMore && !isFetchingMore && !initialLoading) {
      buscarProdutos({ reset: false })
    }
  }

  const handleMarcaChange = (marca) => {
    setMarcaSelecionada(marca)
  }

  const handleSaldoChange = (saldo) => {
    setSaldoFiltro(saldo)
  }

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
    // Novos retornos para filtros
    marcaSelecionada,
    setMarcaSelecionada,
    saldoFiltro,
    setSaldoFiltro,
    marcas,
    handleMarcaChange,
    handleSaldoChange,
  }
}

export default useProdutos
