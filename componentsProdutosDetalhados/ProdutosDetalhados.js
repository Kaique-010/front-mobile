import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Box } from 'native-base'
import { ActivityIndicator } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { useFocusEffect } from '@react-navigation/native'
import ProdutoCard from './ProdutoCard'
import SearchBar from './SearchBar'
import ProdutoModal from './ProdutoModal'
import LoadingScreen from './LoadingScreen'
import ProductCounter from './ProductCounter'
import useProdutos from './useProdutos'

const ITEM_HEIGHT = 120

export default function ProdutosList() {
  const {
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
    saldoFiltro,
    marcas,
    handleMarcaChange,
    handleSaldoChange,
    recarregarLista,
  } = useProdutos()

  const [produtoSelecionado, setProdutoSelecionado] = useState(null)
  const didFocusOnce = useRef(false)
  const recarregarListaRef = useRef(recarregarLista)

  useEffect(() => {
    recarregarListaRef.current = recarregarLista
  }, [recarregarLista])

  useFocusEffect(
    useCallback(() => {
      if (didFocusOnce.current) {
        recarregarListaRef.current?.()
      } else {
        didFocusOnce.current = true
      }
      return () => {}
    }, []),
  )

  const renderItem = useCallback(
    ({ item }) => <ProdutoCard item={item} onPress={setProdutoSelecionado} />,
    [],
  )

  const keyExtractor = useCallback(
    (item, index) => String(item?.codigo ?? item?.prod_codi ?? index),
    [],
  )

  const getItemLayout = useCallback(
    (_, index) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    [],
  )

  if (initialLoading) {
    return <LoadingScreen />
  }

  return (
    <Box flex={1} bg="gray.50">
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchSubmit={handleSearchSubmit}
        isSearching={isSearching}
        marcaSelecionada={marcaSelecionada}
        onMarcaChange={handleMarcaChange}
        saldoFiltro={saldoFiltro}
        onSaldoChange={handleSaldoChange}
        marcas={marcas}
      />

      <FlashList
        data={produtos}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        estimatedItemSize={ITEM_HEIGHT}
        getItemLayout={getItemLayout}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={
          isFetchingMore ? (
            <ActivityIndicator
              size="small"
              color="#007bff"
              style={{ margin: 10 }}
            />
          ) : null
        }
        contentContainerStyle={{ paddingVertical: 8 }}
        showsVerticalScrollIndicator={false}
      />

      <ProductCounter count={produtos.length} />

      <ProdutoModal
        produto={produtoSelecionado}
        visible={!!produtoSelecionado}
        onClose={() => setProdutoSelecionado(null)}
      />
    </Box>
  )
}
