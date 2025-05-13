import React, { useState, useEffect } from 'react'
import { View, ActivityIndicator, Alert, FlatList } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Button } from 'react-native-paper'
import BuscaProdutoInput from '../components/BuscaProdutosInput'
import ProdutosSelecionados from '../components/ProdutosSelecionados'
import LeitorCodigoBarras from '../components/Leitor'
import useItensListaCasamento from '../hooks/useItensListaCasamento'
import ListaItens from '../components/ListaItens'
import { apiGet } from '../utils/api'
import { getStoredData } from '../services/storageService'

export default function ItensListaModal({ route }) {
  const navigation = useNavigation()
  const { listaId, clienteId, empresaId, filialId, usuarioId } = route.params
  console.log('🔍 Params recebidos:', {
    listaId,
    clienteId,
    empresaId,
    filialId,
  })

  const [isScanning, setIsScanning] = useState(false)

  const {
    itensSalvos,
    selecionados,
    adicionarProduto,
    removerProduto,
    remocoesPendentes,
    marcarParaRemocao,
    salvarItens,
    carregando,
    salvando,
  } = useItensListaCasamento({
    listaId,
    clienteId,
    empresaId,
    filialId,
    usuarioId,
  })

  const [slug, setSlug] = useState('')
  useEffect(() => {
    const carregarSlug = async () => {
      try {
        const { slug } = await getStoredData()
        if (slug) setSlug(slug)
        else console.warn('Slug não encontrado')
      } catch (err) {
        console.error('Erro ao carregar slug:', err.message)
      }
    }
    carregarSlug()
  }, [])
  console.log('Slug:', slug)

  useEffect(() => {
    navigation.setOptions({
      title: 'Editar Itens',
      headerShown: true,
    })
  }, [navigation])

  const onProdutoLido = async (codigoBarras) => {
    try {
      const produtos = await apiGet(`/api/${slug}/produtos/produtos/busca/`, {
        q: codigoBarras,
      })

      if (!produtos.length) {
        Alert.alert('Produto não encontrado')
        return
      }

      adicionarProduto(produtos[0])
    } catch (err) {
      console.error('Erro ao buscar produto escaneado:', err)
      Alert.alert('Erro', 'Erro ao buscar produto escaneado')
    }
  }

  if (carregando) {
    return <ActivityIndicator size="large" style={{ marginTop: 40 }} />
  }

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: '#000', padding: 16 }}
      data={itensSalvos}
      keyExtractor={(item) =>
        `${item.item_empr}-${item.item_fili}-${item.item_list}-${item.item_item}`
      }
      ListHeaderComponent={
        <>
          <Button
            icon="barcode-scan"
            mode="outlined"
            labelStyle={{ color: '#01ff16' }}
            style={{ marginBottom: 20, borderColor: 'green', margin: 20 }}
            onPress={() => setIsScanning(true)}>
            Escanear código de barras
          </Button>

          <BuscaProdutoInput onSelect={adicionarProduto} />

          <ProdutosSelecionados
            produtos={selecionados}
            onRemover={removerProduto}
          />

          <Button
            mode="contained"
            onPress={salvarItens}
            disabled={salvando}
            loading={salvando}
            style={{
              marginTop: 16,
              backgroundColor: '#284880',
              paddingVertical: 6,
              borderRadius: 20,
            }}>
            Salvar Itens
          </Button>

          <ListaItens
            itensSalvos={itensSalvos}
            marcarParaRemocao={marcarParaRemocao}
            removidos={remocoesPendentes}
            listaId={listaId}
          />
        </>
      }
      ListFooterComponent={<View style={{ height: 40 }} />}
    />
  )
}
