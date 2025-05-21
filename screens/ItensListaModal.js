import React, { useState, useEffect } from 'react'
import {
  View,
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  TouchableOpacity,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
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
  const { listaId, clienteId, cliente, empresaId, filialId, usuarioId } =
    route.params

  const [isScanning, setIsScanning] = useState(false)
  const [slug, setSlug] = useState('')

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

  useEffect(() => {
    const carregarSlug = async () => {
      try {
        const data = await getStoredData()
        if (data.slug) setSlug(data.slug)
        else console.warn('Slug não encontrado')
      } catch (err) {
        console.error('Erro ao carregar slug:', err.message)
      }
    }
    carregarSlug()
  }, [])

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

 
  const enviarZapLista = async (itens, listaId) => {
    if (!itens || itens.length === 0) {
      Alert.alert('Sem itens', 'A lista está vazia.')
      return
    }

    try {
     
      const entidade = await apiGet(
        `/api/${slug}/entidades/entidades/${clienteId}/`
      )
      console.log('📦 Dados da entidade:', entidade)

      const numeroRaw = entidade.enti_celu || entidade.enti_fone || ''
      const numeroLimpo = numeroRaw.replace(/\D/g, '')
      if (numeroLimpo.length < 10) {
        Alert.alert(
          'Sem WhatsApp',
          'Essa entidade não possui número válido de WhatsApp.'
        )
        return
      }

      const numeroZap = `55${numeroLimpo}`
      const nomeNoiva = cliente || entidade.enti_nome || 'Noiva'

      const corpo = itens
        .map((item, idx) => {
          const nome = item.produto_nome || 'Sem nome'
          const codigo = item.item_prod || 'N/A'
          return `${idx + 1}. ${nome} (Cód: ${codigo})`
        })
        .join('\n')

      const mensagem =
        `💍 *Lista de Presentes - ${nomeNoiva}*\n` +
        `🆔 Lista Nº ${listaId}\n\n` +
        `${corpo}`

      const url = `https://wa.me/${numeroZap}?text=${encodeURIComponent(
        mensagem
      )}`
      Linking.openURL(url)
    } catch (error) {
      console.error('Erro ao enviar WhatsApp:', error)
      Alert.alert('Erro', 'Não foi possível enviar mensagem via WhatsApp.')
    }
  }

  if (carregando) {
    return <ActivityIndicator size="large" style={{ marginTop: 40 }} />
  }

  if (isScanning) {
    return (
      <LeitorCodigoBarras
        onProdutoLido={(codigo) => {
          onProdutoLido(codigo)
          setIsScanning(false)
        }}
        onCancelar={() => setIsScanning(false)}
      />
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <FlatList
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
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
        ListFooterComponent={<View style={{ height: 80 }} />}
      />

      {itensSalvos.length > 0 && (
        <TouchableOpacity
          onPress={() => enviarZapLista(itensSalvos, listaId)}
          style={{
            position: 'absolute',
            bottom: 60,
            right: 20,
            backgroundColor: '#25D366',
            padding: 14,
            borderRadius: 50,
            elevation: 5,
            shadowColor: '#000',
            shadowOpacity: 0.3,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 4,
          }}>
          <MaterialCommunityIcons name="whatsapp" size={28} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  )
}
