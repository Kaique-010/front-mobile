import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import Toast from 'react-native-toast-message'
import ItensModalOs from './ItensModalOs'
import { apiPostComContexto, apiGetComContexto } from '../utils/api'
import { handleApiError } from '../utils/errorHandler'
import { Ionicons } from '@expo/vector-icons'
import useContextoApp from '../hooks/useContextoApp'
import NetInfo from '@react-native-community/netinfo'
import { enqueueOperation } from 'componentsOrdemServico/services/syncService'
import database from './schemas/database'
import { Q } from '@nozbe/watermelondb'
import uuid from 'react-native-uuid'

export default function AbaPecas({
  pecas = [],
  setPecas,
  os_os,
  financeiroGerado,
}) {
  const { empresaId, filialId } = useContextoApp()
  const [removidos, setRemovidos] = useState([])
  const [modalVisivel, setModalVisivel] = useState(false)
  const [itemEditando, setItemEditando] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [produtos, setProdutos] = useState(pecas)
  const [online, setOnline] = useState(true)

  // Carrega as peças existentes quando o componente monta ou quando o os_os muda
  useEffect(() => {
    if (
      os_os !== undefined &&
      os_os !== null &&
      empresaId !== undefined &&
      empresaId !== null &&
      filialId !== undefined &&
      filialId !== null
    ) {
      carregarPecasExistentes()
    }
  }, [os_os, empresaId, filialId])

  useEffect(() => {
    const sub = NetInfo.addEventListener((state) =>
      setOnline(!!state.isConnected)
    )
    return () => sub && sub()
  }, [])

  const carregarDoBanco = async () => {
    try {
      setIsLoading(true)
      console.log('Carregando peças do banco local para OS:', os_os)
      const pecasCollection = database.collections.get('pecas_os')
      const produtosCollection = database.collections.get('mega_produtos')

      const localPecas = await pecasCollection
        .query(Q.where('peca_os', os_os))
        .fetch()

      const pecasFormatadas = await Promise.all(
        localPecas.map(async (p) => {
          let nome = 'Produto'
          try {
            const prods = await produtosCollection
              .query(Q.where('prod_codi', p.pecaProd))
              .fetch()
            if (prods.length > 0) nome = prods[0].prodNome
          } catch (e) {}

          return {
            peca_item: p.pecaItem,
            peca_prod: p.pecaProd,
            peca_quan: p.pecaQuan,
            peca_unit: p.pecaUnit,
            peca_tota: p.pecaTota,
            produto_nome: nome,
          }
        })
      )

      setProdutos(pecasFormatadas)
      setPecas(pecasFormatadas)
    } catch (e) {
      console.log('Erro ao carregar do banco:', e)
      Toast.show({
        type: 'error',
        text1: 'Erro local',
        text2: 'Falha ao ler dados offline',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const carregarPecasExistentes = async () => {
    const isLocalOS = String(os_os).startsWith('OFFLINE-')

    if (isLocalOS) {
      await carregarDoBanco()
      return
    }

    if (!online) {
      await carregarDoBanco()
      return
    }

    try {
      setIsLoading(true)
      console.log('Carregando peças para OS:', os_os)

      const response = await apiGetComContexto('Os/pecas/', {
        peca_os: os_os,
        peca_empr: empresaId,
        peca_fili: filialId,
      })

      // Verifica se a resposta tem a estrutura paginada
      const pecasArray = response?.results || response || []

      if (Array.isArray(pecasArray) && pecasArray.length > 0) {
        const pecasFormatadas = pecasArray.map((peca) => ({
          peca_item: peca.peca_item,
          peca_prod: peca.peca_prod,
          peca_quan: parseFloat(peca.peca_quan),
          peca_unit: parseFloat(peca.peca_unit),
          peca_tota: parseFloat(peca.peca_tota),
          produto_nome: peca.produto_nome || 'Produto',
        }))

        console.log('Peças formatadas:', pecasFormatadas)
        setProdutos(pecasFormatadas)
        setPecas(pecasFormatadas)
      } else {
        console.log('Nenhuma peça encontrada')
        setProdutos([])
        setPecas([])
      }
    } catch (error) {
      console.error(
        'Erro detalhado ao carregar peças:',
        error.response?.data || error.message
      )

      if (!error.response) {
        console.log('Erro de rede, tentando carregar do banco local...')
        await carregarDoBanco()
        return
      }

      handleApiError(
        error,
        'Não foi possível carregar as peças existentes',
        'Erro ao carregar peças'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const sincronizarComPai = (novos) => {
    setProdutos(novos)
    setPecas(novos)
  }

  const validarProduto = (novoItem) => {
    if (!novoItem.peca_prod) {
      Toast.show({
        type: 'error',
        text1: 'Produto inválido',
        text2: 'Selecione um produto válido',
      })
      return false
    }

    if (!novoItem.peca_quan || novoItem.peca_quan <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Quantidade inválida',
        text2: 'A quantidade deve ser maior que zero',
      })
      return false
    }

    if (!novoItem.peca_unit || novoItem.peca_unit <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Preço inválido',
        text2: 'O preço unitário deve ser maior que zero',
      })
      return false
    }

    return true
  }

  const adicionarOuEditarProduto = (novoItem, itemEditando) => {
    if (financeiroGerado) {
      Toast.show({
        type: 'error',
        text1: 'Operação não permitida',
        text2: 'Não é possível modificar peças após gerar o financeiro',
      })
      return
    }
    if (!validarProduto(novoItem)) return

    let atualizados
    if (itemEditando?.peca_item) {
      // Editando item salvo no back-end
      atualizados = produtos.map((p) =>
        p.peca_item === itemEditando.peca_item ? { ...novoItem } : p
      )
    } else if (itemEditando) {
      // Editando item novo, sem ID ainda
      atualizados = produtos.map((p) =>
        !p.peca_item && p.peca_prod === itemEditando.peca_prod
          ? { ...novoItem }
          : p
      )
    } else {
      // Adicionando novo produto
      const existe = produtos.some(
        (p) => String(p.peca_prod) === String(novoItem.peca_prod)
      )
      if (existe) {
        Toast.show({
          type: 'error',
          text1: 'Produto já adicionado',
          text2: 'Este produto já está na lista',
        })
        return
      }
      atualizados = [...produtos, novoItem]
    }

    sincronizarComPai(atualizados)
    Toast.show({
      type: 'success',
      text1: itemEditando ? 'Produto atualizado' : 'Produto adicionado',
      text2: novoItem.produto_nome,
    })
  }

  const abrirModalParaEditar = (item) => {
    setItemEditando(item)
    setModalVisivel(true)
  }

  const abrirModalParaAdicionar = () => {
    setItemEditando(null)
    setModalVisivel(true)
  }

  const removerProduto = (item) => {
    const atualizados = produtos.filter((p) => p !== item)
    sincronizarComPai(atualizados)
    if (item.peca_item) {
      setRemovidos((prev) => [...prev, item])
    }
    Toast.show({
      type: 'success',
      text1: 'Produto removido',
      text2: item.produto_nome,
    })
  }

  const salvarPecas = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)

    const isLocalOS = String(os_os).startsWith('OFFLINE-')

    // Preparar listas para API/Fila (removendo IDs locais se for adicionar)
    const adicionar = produtos
      .filter(
        (p) => !p.peca_item || String(p.peca_item).startsWith('OFFLINE-ITEM-')
      )
      .map((p) => ({
        peca_os: os_os,
        peca_prod: p.peca_prod,
        peca_quan: p.peca_quan,
        peca_unit: p.peca_unit,
        peca_tota: p.peca_quan * p.peca_unit,
        peca_empr: empresaId,
        peca_fili: filialId,
        // Não enviamos peca_item para adição (backend gera)
      }))

    // Filtra itens para edição, garantindo que peca_os esteja presente
    const editar = produtos
      .filter(
        (p) =>
          p.peca_item &&
          !String(p.peca_item).startsWith('OFFLINE-ITEM-') && // Apenas itens remotos
          !removidos.find((r) => r.peca_item === p.peca_item)
      )
      .map((p) => ({
        peca_item: p.peca_item,
        peca_os: p.peca_os || os_os, // Garante peca_os
        peca_prod: p.peca_prod,
        peca_quan: p.peca_quan,
        peca_unit: p.peca_unit,
        peca_tota: p.peca_quan * p.peca_unit,
        peca_empr: empresaId,
        peca_fili: filialId,
      }))

    const remover = removidos
      .filter(
        (r) => r.peca_item && !String(r.peca_item).startsWith('OFFLINE-ITEM-')
      )
      .map((r) => ({
        peca_empr: empresaId,
        peca_fili: filialId,
        peca_os: os_os,
        peca_item: r.peca_item,
      }))

    try {
      // 1. Salvar Localmente no WatermelonDB (Sempre, para UI otimista e Offline)
      await database.write(async () => {
        const pecasCollection = database.collections.get('pecas_os')

        // Adicionar novos (gerando IDs locais se necessário)
        // Nota: 'produtos' contém o estado atual da tela.
        // Precisamos identificar quais são *realmente* novos no banco.
        // Simplificação: Upsert ou Check existence?
        // Como 'produtos' pode ter misturado novos e velhos, vamos iterar.

        for (const p of produtos) {
          const isNewLocal = !p.peca_item
          const isExistingLocal = String(p.peca_item).startsWith(
            'OFFLINE-ITEM-'
          )

          if (isNewLocal) {
            // Criar novo registro local
            const novoId = `OFFLINE-ITEM-${uuid.v4()}`
            await pecasCollection.create((rec) => {
              rec.pecaOs = os_os
              rec.pecaEmpr = String(empresaId)
              rec.pecaFili = String(filialId)
              rec.pecaProd = String(p.peca_prod)
              rec.pecaQuan = p.peca_quan
              rec.pecaUnit = p.peca_unit
              rec.pecaTota = p.peca_quan * p.peca_unit
              rec.pecaItem = novoId
            })
            // Atualizar objeto em memória para ter o ID (hacky, mas útil para o reload não duplicar)
            p.peca_item = novoId
          } else if (isExistingLocal) {
            // Atualizar registro local existente
            const recs = await pecasCollection
              .query(
                Q.where('peca_os', os_os),
                Q.where('peca_item', p.peca_item)
              )
              .fetch()
            if (recs.length > 0) {
              await recs[0].update((rec) => {
                rec.pecaQuan = p.peca_quan
                rec.pecaUnit = p.peca_unit
                rec.pecaTota = p.peca_quan * p.peca_unit
              })
            }
          }
          // Se for item remoto (não começa com OFFLINE), o sync cuida, mas podemos atualizar localmente também?
          // Sim, para manter cache atualizado.
          else if (p.peca_item) {
            const recs = await pecasCollection
              .query(
                Q.where('peca_os', os_os),
                Q.where('peca_item', p.peca_item)
              )
              .fetch()
            if (recs.length > 0) {
              await recs[0].update((rec) => {
                rec.pecaQuan = p.peca_quan
                rec.pecaUnit = p.peca_unit
                rec.pecaTota = p.peca_quan * p.peca_unit
              })
            }
          }
        }

        // Remover deletados
        for (const r of removidos) {
          const recs = await pecasCollection
            .query(Q.where('peca_os', os_os), Q.where('peca_item', r.peca_item))
            .fetch()
          if (recs.length > 0) {
            await recs[0].markAsDeleted() // ou destroyPermanently
          }
        }
      })

      // 2. Se for Offline ou OS Local, Enfileirar
      if (isLocalOS || !online) {
        const payload = { adicionar, editar, remover }

        // Só enfileira se houver algo para fazer
        if (adicionar.length > 0 || editar.length > 0 || remover.length > 0) {
          await enqueueOperation(
            'Os/pecas/update-lista/',
            'post',
            payload,
            isLocalOS ? os_os : null
          )
        }

        Toast.show({
          type: 'success',
          text1: 'Salvo offline',
          text2: 'Alterações salvas localmente e enfileiradas',
        })

        await carregarDoBanco() // Recarrega do banco para garantir consistência
        setRemovidos([])
        setIsSubmitting(false)
        return
      }

      // 3. Se Online e OS Remota, enviar para API
      const payload = { adicionar, editar, remover }
      console.log('Enviando payload:', payload)

      const response = await apiPostComContexto(
        'Os/pecas/update-lista/',
        payload
      )

      console.log('Resposta do servidor após salvar:', response)

      // Após salvar com sucesso, recarrega as peças
      await carregarPecasExistentes()

      setRemovidos([])

      Toast.show({
        type: 'success',
        text1: 'Peças salvas com sucesso',
        text2: `${adicionar.length} adicionadas, ${editar.length} editadas, ${remover.length} removidas`,
      })
    } catch (err) {
      console.error(
        'Erro detalhado ao salvar:',
        err.response?.data || err.message
      )
      handleApiError(err, 'Erro ao salvar peças')

      // Fallback de erro de rede (caso caia aqui mesmo achando que estava online)
      if (!err.response) {
        try {
          const payload = { adicionar, editar, remover }
          await enqueueOperation(
            'Os/pecas/update-lista/',
            'post',
            payload,
            isLocalOS ? os_os : null
          )
          Toast.show({
            type: 'info',
            text1: 'Sem conexão',
            text2: 'Alterações enfileiradas para sincronizar quando online',
          })

          // Também salvar localmente se falhou na rede
          // (Idealmente o bloco de salvar localmente deveria ser executado antes da API,
          // mas aqui estamos no catch. Vamos simplificar e assumir que o usuário tentará novamente
          // ou o enqueue resolve.)
          // Para garantir, poderíamos chamar o bloco de escrita DB aqui também, mas ficaria duplicado.
          // Melhor estratégia: Sempre salvar no DB local PRIMEIRO (como fiz acima), depois tentar API.

          // Como movi o "Salvar Localmente" para o início do try, os dados JÁ ESTÃO no banco local!
          // Então basta recarregar.
          await carregarDoBanco()
          setRemovidos([])

          return
        } catch (e) {
          console.log('Falha ao enfileirar:', e)
        }
      }

      handleApiError(err, 'Erro ao salvar peças')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderItem = ({ item }) => (
    <View style={styles.produto}>
      <View style={styles.produtoHeader}>
        <Text style={styles.prodNome}>{item.produto_nome || 'Sem nome'}</Text>
        <View style={styles.botoesContainer}>
          <TouchableOpacity
            style={[styles.botaoAcao, styles.botaoEditar]}
            onPress={() => abrirModalParaEditar(item)}>
            <Ionicons name="pencil" size={18} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.botaoAcao, styles.botaoRemover]}
            onPress={() => removerProduto(item)}>
            <Ionicons name="trash" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.produtoInfo}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Quantidade:</Text>
          <Text style={styles.infoValor}>{item.peca_quan.toFixed(4)}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Preço Unit.:</Text>
          <Text style={styles.infoValor}>R$ {item.peca_unit.toFixed(4)}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Total:</Text>
          <Text style={styles.infoValor}>R$ {item.peca_tota.toFixed(4)}</Text>
        </View>
      </View>
    </View>
  )

  // Render segue padrão de AbaServicos: loading em ListHeaderComponent

  const renderBotaoAdicionar = () => {
    if (financeiroGerado) {
      return null // Não renderiza o botão se o financeiro estiver gerado
    }
    return (
      <TouchableOpacity
        style={styles.botaoAdicionar}
        onPress={abrirModalParaAdicionar}>
        <Ionicons name="add-circle" size={24} color="#10a2a7" />
        <Text style={styles.botaoAdicionarTexto}>Adicionar Peça</Text>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      {renderBotaoAdicionar()}
      <FlatList
        data={isLoading ? [] : produtos}
        ListHeaderComponent={
          isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#10a2a7" />
              <Text style={styles.loadingText}>Carregando peças...</Text>
            </View>
          ) : null
        }
        keyExtractor={(item) =>
          item.peca_item?.toString() || `temp-${item.peca_prod}-${Date.now()}`
        }
        renderItem={renderItem}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={48} color="#666" />
              <Text style={styles.emptyText}>Nenhuma peça adicionada</Text>
              <Text style={styles.emptySubtext}>
                Toque no botão acima para adicionar peças
              </Text>
            </View>
          ) : null
        }
      />

      {produtos.length > 0 && (
        <TouchableOpacity
          style={[styles.botaoSalvar, isSubmitting && styles.botaoDesabilitado]}
          onPress={salvarPecas}
          disabled={isSubmitting}>
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons
                name="save"
                size={24}
                color="white"
                style={styles.icone}
              />
              <Text style={styles.textoBotao}>Salvar Peças</Text>
              {!online && (
                <View style={styles.badgeOffline}>
                  <Ionicons name="cloud-offline" size={16} color="#fff" />
                  <Text style={styles.badgeText}>Offline</Text>
                </View>
              )}
            </>
          )}
        </TouchableOpacity>
      )}

      <ItensModalOs
        visivel={modalVisivel}
        onFechar={() => setModalVisivel(false)}
        onAdicionar={adicionarOuEditarProduto}
        itemEditando={itemEditando}
        itensExistentes={produtos}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a2f3d',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  lista: {
    flexGrow: 1,
  },
  produto: {
    backgroundColor: '#232935',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  produtoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  prodNome: {
    color: '#10a2a7',
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1,
  },
  botoesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  botaoAcao: {
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoEditar: {
    backgroundColor: '#10a2a7',
  },
  botaoRemover: {
    backgroundColor: '#c0392b',
  },
  produtoInfo: {
    backgroundColor: '#1a2f3d',
    borderRadius: 6,
    padding: 10,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoLabel: {
    color: '#999',
    fontSize: 14,
  },
  infoValor: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  botaoAdicionar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10a2a7',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  botaoSalvar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#17a054',
    padding: 15,
    borderRadius: 8,
    marginBottom: 40,
  },
  botaoDesabilitado: {
    opacity: 0.7,
  },
  badgeOffline: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#c0392b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  badgeText: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 12,
  },
  textoBotao: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  icone: {
    marginRight: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 40,
  },
  emptyText: {
    color: '#666',
    fontSize: 18,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
})
