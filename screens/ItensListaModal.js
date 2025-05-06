import React, { useState, useEffect, useLayoutEffect } from 'react'
import {
  View,
  ActivityIndicator,
  Text,
  Alert,
  FlatList,
  TouchableOpacity,
} from 'react-native'
import { apiGet } from '../utils/api'
import { useNavigation } from '@react-navigation/native'
import { Button } from 'react-native-paper'
import BuscaProdutoInput from '../components/BuscaProdutosInput'
import ProdutosSelecionados from '../components/ProdutosSelecionados'
import useContextoApp from '../hooks/useContextoApp'
import LeitorCodigoBarras from '../components/Leitor'

export default function ItensListaModal({ route }) {
  const navigation = useNavigation()

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Editar Itens',
      headerShown: true,
    })
  }, [navigation])

  const { listaId, clienteId } = route.params
  const { usuarioId, empresaId, filialId, carregando } = useContextoApp()

  const [selecionados, setSelecionados] = useState([])
  const [itensSalvos, setItensSalvos] = useState([])
  const [remocoesPendentes, setRemocoesPendentes] = useState([])
  const [salvando, setSalvando] = useState(false)
  const [isScanning, setIsScanning] = useState(false)

  const carregarItensPorLista = async () => {
    try {
      const response = await fetch(
        `http://192.168.10.55:8000/api/itens-lista-casamento/?item_list=${listaId}`
      )
      const data = await response.json()
      const filtrados = data.filter((item) => item.item_list === listaId)
      setItensSalvos(filtrados)
    } catch (err) {
      console.error('Erro ao carregar itens:', err.message)
    }
  }

  useEffect(() => {
    carregarItensPorLista()
  }, [listaId])

  const adicionarProduto = (produto) => {
    if (!selecionados.find((p) => p.prod_codi === produto.prod_codi)) {
      setSelecionados([...selecionados, produto])
    }
  }

  const removerProduto = (prod_codi) => {
    setSelecionados(selecionados.filter((p) => p.prod_codi !== prod_codi))
  }

  const marcarParaRemocao = (itemId) => {
    setRemocoesPendentes((prev) => [...prev, itemId])
    setItensSalvos((prev) => prev.filter((item) => item.item_item !== itemId))
  }

  const salvarItens = async () => {
    setSalvando(true)
    try {
      for (const itemId of remocoesPendentes) {
        await fetch(
          `http://192.168.10.55:8000/api/itens-lista-casamento/${itemId}/`,
          {
            method: 'DELETE',
          }
        )
      }

      if (selecionados.length > 0) {
        const payload = selecionados.map((produto) => ({
          item_empr: empresaId,
          item_fili: filialId,
          item_list: listaId,
          item_prod: String(produto.prod_codi),
          item_fina: false,
          item_clie: clienteId,
          item_pedi: 0,
          item_usua: usuarioId,
        }))

        await fetch('http://192.168.10.55:8000/api/itens-lista-casamento/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })
      }

      alert('Alterações salvas com sucesso!')
      setSelecionados([])
      setRemocoesPendentes([])
      carregarItensPorLista()
    } catch (err) {
      console.error('Erro ao salvar:', err)
      Alert.alert('Erro', `Erro ao salvar: ${err.message}`)
    } finally {
      setSalvando(false)
    }
  }

  const onProdutoLido = async (codigoBarras) => {
    try {
      const produtos = await apiGet('/api/produtos/busca/', {
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
    } finally {
      setIsScanning(false)
    }
  }

  if (carregando) {
    return <ActivityIndicator size="large" style={{ marginTop: 40 }} />
  }

  if (isScanning) {
    return <LeitorCodigoBarras onProdutoLido={onProdutoLido} />
  }

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: '#000', padding: 16 }}
      data={itensSalvos}
      keyExtractor={(item) => `${item.item_item}`}
      ListHeaderComponent={
        <>
          {/* Scanner botão */}
          <TouchableOpacity onPress={() => setIsScanning(true)}>
            <Button
              icon="barcode-scan"
              mode="outlined"
              onPress={() => setIsScanning(true)}
              labelStyle={{ color: 'green' }}
              style={{ marginBottom: 20, borderColor: 'green' }}>
              Escanear código de barras
            </Button>
          </TouchableOpacity>

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
            style={{ marginTop: 16 }}>
            Salvar Itens
          </Button>

          {itensSalvos.length > 0 && (
            <Text
              style={{
                fontWeight: 'bold',
                marginTop: 24,
                marginBottom: 8,
                color: 'white',
              }}>
              Itens já adicionados à lista:
            </Text>
          )}
        </>
      }
      renderItem={({ item }) => (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 8,
          }}>
          <Text style={{ color: 'white' }}>
            • {item.produto_nome} (ID: {item.item_prod})
          </Text>
          <TouchableOpacity onPress={() => marcarParaRemocao(item.item_item)}>
            <Text style={{ color: 'red' }}>Remover</Text>
          </TouchableOpacity>
        </View>
      )}
      ListFooterComponent={<View style={{ height: 40 }} />} // padding final
    />
  )
}
