import React, { useState, useEffect } from 'react'
import {
  View,
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  TouchableOpacity,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation } from '@react-navigation/native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Button } from 'react-native-paper'
import BuscaProdutoInput from '../components/BuscaProdutosInput'
import ProdutosSelecionados from '../components/ProdutosSelecionados'
import LeitorCodigoBarras from '../components/Leitor'
import useItensListaCasamento from '../componentsListaCasamento/useItensListaCasamento'
import ListaItens from '../componentsListaCasamento/ListaItens'
import { apiGet, safeSetItem } from '../utils/api'
import { getStoredData } from '../services/storageService'

// Cache para itens da lista e entidades
const ITENS_LISTA_CACHE_KEY = 'itens_lista_cache'
const ENTIDADES_CACHE_KEY = 'entidades_cache'
const PRODUTOS_BUSCA_CACHE_KEY = 'produtos_busca_barras_cache'
const CACHE_DURATION = 3 * 60 * 1000 // 3 minutos

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
    alterarQuantidade,
    alterarQuantidadeItem,
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
    console.log(`🔍 [DEBUG-LISTA] Código recebido do scanner: ${codigoBarras}`)
    console.log(`🔍 [DEBUG-LISTA] Tipo do código: ${typeof codigoBarras}`)
    console.log(`🔍 [DEBUG-LISTA] Comprimento do código: ${codigoBarras.length}`)
    
    // Cache desabilitado - sempre buscar dados atualizados
    console.log(`🚫 [CACHE-DISABLED] Cache desabilitado para busca de produtos`)
    
    try {
      console.log(`🔍 [BUSCA-BARRAS] Buscando produto para código: ${codigoBarras}`)
      console.log(`🔍 [DEBUG-LISTA] Parâmetro q enviado: ${codigoBarras}`)
      console.log(`🔍 [DEBUG-LISTA] URL completa: /api/${slug}/produtos/produtos/busca/?q=${codigoBarras}`)
      
      const produtos = await apiGet(`/api/${slug}/produtos/produtos/busca/`, {
        q: codigoBarras,
      })
      
      console.log(`🔍 [DEBUG-LISTA] Produtos retornados:`, produtos)
      console.log(`🔍 [DEBUG-LISTA] Primeiro produto:`, produtos[0])

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

    // Verificar cache da entidade primeiro
    try {
      const cacheKey = `${ENTIDADES_CACHE_KEY}_${clienteId}`
      const cacheData = await AsyncStorage.getItem(cacheKey)
      
      let entidade = null
      
      if (cacheData) {
        const { data, timestamp } = JSON.parse(cacheData)
        const now = Date.now()
        
        if ((now - timestamp) < CACHE_DURATION) {
          console.log(`📦 [CACHE-ENTIDADE] Usando cache para cliente: ${clienteId}`)
          entidade = data
        }
      }
      
      if (!entidade) {
        console.log(`🔍 [BUSCA-ENTIDADE] Buscando dados do cliente: ${clienteId}`)
        entidade = await apiGet(
          `/api/${slug}/entidades/entidades/${clienteId}/`
        )
        
        // Salvar no cache
        try {
          const cacheData = {
            data: entidade,
            timestamp: Date.now()
          }
          await safeSetItem(cacheKey, JSON.stringify(cacheData))
          console.log(`💾 [CACHE-ENTIDADE] Cliente salvo no cache`)
        } catch (error) {
          console.log('⚠️ Erro ao salvar cache de entidade:', error)
        }
      }
      
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

      // Calcular totais
      const totalItens = itens.length
      const totalValor = itens.reduce((total, item) => {
        return total + (item.item_quan || 1) * (item.prod_preco_vista || item.item_prec || 0)
      }, 0)

      const corpo = itens
        .map((item, idx) => {
          const nome = item.produto_nome || 'Sem nome'
          const codigo = item.item_prod || 'N/A'
          const quantidade = item.item_quan || 1
          const preco = item.prod_preco_vista || item.item_prec || 0
          const subtotal = quantidade * preco
          
          return (
            `${idx + 1}. *${nome}*\n` +
            `   📦 Qtd: ${quantidade}\n` +
            `   💰 Preço: R$ ${preco.toFixed(2)}\n` +
            `   🔸 Subtotal: R$ ${subtotal.toFixed(2)}\n` +
            `   🏷️ Código: ${codigo}\n`
          )
        })
        .join('\n')

      const mensagem =
        `💍 *LISTA DE PRESENTES*\n` +
        `👰 ${nomeNoiva}\n` +
        `🆔 Lista Nº ${listaId}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `${corpo}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `📊 *RESUMO DA LISTA*\n` +
        `🔢 Total de itens: ${totalItens}\n` +
        `💵 Valor total: R$ ${totalValor.toFixed(2)}\n\n` +
        `_Mensagem gerada automaticamente pelo sistema_`

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
              onAlterarQuantidade={alterarQuantidade}
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
              onQuantidadeChange={alterarQuantidadeItem}
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
            bottom: 80,
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
