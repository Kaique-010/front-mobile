import { useState, useEffect, useCallback } from 'react'
import { apiGetComContextoSemFili } from '../utils/api'
import { getStoredData } from '../services/storageService'
import Toast from 'react-native-toast-message'

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

  const buscarProdutos = useCallback(
    async ({ reset = false }) => {
      if (!slug || (isFetchingMore && !reset)) return

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
            params.marca_nome = '__sem_marca__' // Valor especial para produtos sem marca
          } else {
            params.marca_nome = marcaSelecionada
          }
        }
        // Remover estas duas linhas que estão causando o erro:
        // params.marca = marcaSelecionada
        // }

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

        // Extrair marcas únicas para o filtro
        if (reset) {
          const marcasUnicas = [
            ...new Set(novos.map((p) => p.marca_nome).filter(Boolean)),
          ]
          
          // Criar lista de marcas tratadas incluindo "Sem marca"
          const marcasTratadas = [
            'Sem marca', // Opção para produtos sem marca
            ...marcasUnicas.sort() // Marcas existentes em ordem alfabética
          ]
          
          setMarcas(marcasTratadas)
        }
      } catch (error) {
        console.log('❌ Erro ao buscar produtos:', error.message)
        Toast.show({ type: 'error', text1: 'Erro ao buscar produtos' })
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
      isFetchingMore,
      produtos,
    ]
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
