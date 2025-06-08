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
import { apiPostComContexto, apiGetComContextoos } from '../utils/api'
import { Ionicons } from '@expo/vector-icons'
import useContextoApp from '../hooks/useContextoApp'

export default function AbaPecas({ pecas = [], setPecas, os_os }) {
  const { empresaId, filialId } = useContextoApp()
  const [removidos, setRemovidos] = useState([])
  const [modalVisivel, setModalVisivel] = useState(false)
  const [itemEditando, setItemEditando] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [produtos, setProdutos] = useState(pecas)

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

  const carregarPecasExistentes = async () => {
    if (!os_os || !empresaId || !filialId) {
      console.warn('Parâmetros incompletos, ignorando chamada')
      return
    }

    try {
      setIsLoading(true)
      console.log('Carregando peças para OS:', os_os)

      const response = await apiGetComContextoos('Os/pecas/', {
        peca_os: os_os,
        peca_empr: empresaId,
        peca_fili: filialId,
      })

      console.log('Resposta da API:', response)
      const pecasArray = response?.results || response || []

      if (Array.isArray(pecasArray) && pecasArray.length > 0) {
        const pecasFormatadas = pecasArray.map((peca) => ({
          peca_prod: peca.peca_prod,
          peca_quan: parseFloat(peca.peca_quan),
          peca_unit: parseFloat(peca.peca_unit),
          peca_tota: parseFloat(peca.peca_tota),
          produto_nome: peca.produto_nome || 'Produto',
          peca_os: os_os,
          peca_empr: empresaId,
          peca_fili: filialId,
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
      Toast.show({
        type: 'error',
        text1: 'Erro ao carregar peças',
        text2: Array.isArray(error.response?.data)
          ? error.response.data[0]
          : 'Não foi possível carregar as peças existentes',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const salvarPecas = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const prepararPecas = (pecasArray) =>
        pecasArray.map((p) => ({
          ...p,
          peca_os: os_os,
          peca_empr: empresaId,
          peca_fili: filialId,
          peca_codi: p.peca_codi || p.peca_prod, // ajuste se necessário
        }))

      const adicionar = prepararPecas(produtos.filter((p) => !p.peca_item))
      const editar = prepararPecas(
        produtos.filter((p) => p.peca_item && !removidos.includes(p))
      )
      const remover = removidos.map((p) => p.peca_item)

      const payload = {
        adicionar,
        editar,
        remover,
        empr: empresaId,
        fili: filialId,
        os: os_os,
      }

      console.log('Enviando payload:', payload)

      await apiPostComContexto('Os/pecas/update-lista/', payload)

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
      Toast.show({
        type: 'error',
        text1: 'Erro ao salvar peças',
        text2: Array.isArray(err.response?.data)
          ? err.response.data[0]
          : 'Tente novamente mais tarde',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Interface melhorada do outro componente
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.botaoAdicionar}
        onPress={() => {
          setItemEditando(null)
          setModalVisivel(true)
        }}>
        <Ionicons
          name="add-circle"
          size={24}
          color="white"
          style={styles.icone}
        />
        <Text style={styles.textoBotao}>Adicionar Produto</Text>
      </TouchableOpacity>

      <FlatList
        data={produtos}
        keyExtractor={(item) =>
          item.peca_item?.toString() || `temp-${item.peca_prod}-${Date.now()}`
        }
        renderItem={({ item }) => (
          <View style={styles.produto}>
            <View style={styles.produtoHeader}>
              <Text style={styles.prodNome}>
                {item.produto_nome || 'Sem nome'}
              </Text>
              <View style={styles.botoesContainer}>
                <TouchableOpacity
                  style={[styles.botaoAcao, styles.botaoEditar]}
                  onPress={() => {
                    setItemEditando(item)
                    setModalVisivel(true)
                  }}>
                  <Ionicons name="pencil" size={18} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.botaoAcao, styles.botaoRemover]}
                  onPress={() => {
                    const atualizados = produtos.filter((p) => p !== item)
                    setProdutos(atualizados)
                    setPecas(atualizados)
                    if (item.peca_item) setRemovidos((prev) => [...prev, item])
                    Toast.show({
                      type: 'success',
                      text1: 'Produto removido',
                      text2: item.produto_nome,
                    })
                  }}>
                  <Ionicons name="trash" size={18} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.produtoInfo}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Quantidade:</Text>
                <Text style={styles.infoValor}>
                  {Number(item.peca_quan || 0).toFixed(4)}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Valor Unitário:</Text>
                <Text style={styles.infoValor}>
                  {Number(item.peca_unit || 0).toFixed(4)}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Valor Total:</Text>
                <Text style={styles.infoValor}>
                  {Number(item.peca_tota || 0).toFixed(4)}
                </Text>
              </View>
            </View>
          </View>
        )}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={48} color="#666" />
            <Text style={styles.emptyText}>Nenhuma peça adicionada</Text>
            <Text style={styles.emptySubtext}>
              Toque no botão acima para adicionar peças
            </Text>
          </View>
        }
      />

      {produtos.length > 0 && !isLoading && (
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
            </>
          )}
        </TouchableOpacity>
      )}

      <ItensModalOs
        visivel={modalVisivel}
        onFechar={() => setModalVisivel(false)}
        onAdicionar={(novo) => {
          if (!novo.peca_prod) {
            Toast.show({
              type: 'error',
              text1: 'Produto inválido',
              text2: 'Selecione um produto',
            })
            return
          }
          if (!novo.peca_quan || novo.peca_quan <= 0) {
            Toast.show({ type: 'error', text1: 'Quantidade inválida' })
            return
          }
          if (!novo.peca_unit || novo.peca_unit <= 0) {
            Toast.show({ type: 'error', text1: 'Preço inválido' })
            return
          }

          let atualizados
          if (itemEditando?.peca_item) {
            atualizados = produtos.map((p) =>
              p.peca_item === itemEditando.peca_item ? novo : p
            )
          } else if (itemEditando) {
            atualizados = produtos.map((p) =>
              !p.peca_item && p.peca_prod === itemEditando.peca_prod ? novo : p
            )
          } else {
            const existe = produtos.some(
              (p) => !p.peca_item && p.peca_prod === novo.peca_prod
            )
            if (existe) {
              Toast.show({ type: 'error', text1: 'Produto já adicionado' })
              return
            }
            atualizados = [...produtos, novo]
          }

          setProdutos(atualizados)
          setPecas(atualizados)
          Toast.show({
            type: 'success',
            text1: itemEditando ? 'Produto atualizado' : 'Produto adicionado',
            text2: novo.produto_nome,
          })
        }}
        itemEditando={itemEditando}
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
})
