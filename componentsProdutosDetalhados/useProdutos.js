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
        const data = await apiGetComContextoSemFili(
          'produtos/produtosdetalhados/',
          {
            limit: 20,
            offset: atualOffset,
            search: searchTerm,
          }
        )

        const novos = data.results || []
        setProdutos(reset ? novos : [...produtos, ...novos])
        setOffset(atualOffset + 20)
        setHasMore(data.next !== null)
      } catch (error) {
        console.log('❌ Erro ao buscar produtos:', error.message)
        Toast.show({ type: 'error', text1: 'Erro ao buscar produtos' })
      } finally {
        setInitialLoading(false)
        setIsSearching(false)
        setIsFetchingMore(false)
      }
    },
    [slug, offset, searchTerm, isFetchingMore, produtos]
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

  const handleSearchSubmit = () => buscarProdutos({ reset: true })

  const handleLoadMore = () => {
    if (hasMore && !isFetchingMore && !initialLoading) {
      buscarProdutos({ reset: false })
    }
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
  }
}

export default useProdutos