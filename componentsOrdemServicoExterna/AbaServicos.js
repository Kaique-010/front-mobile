import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import Toast from 'react-native-toast-message'
import ServModalOs from '../componentsOrdemServico/ServModalOs'
import { apiPostComContexto, apiGetComContexto } from '../utils/api'
import { Ionicons } from '@expo/vector-icons'
import useContextoApp from '../hooks/useContextoApp'

export default function AbaServicos({
  servicos = [],
  setServicos,
  os_os,
  financeiroGerado,
}) {
  const { empresaId, filialId } = useContextoApp()
  const [removidos, setRemovidos] = useState([])
  const [modalVisivel, setModalVisivel] = useState(false)
  const [itemEditando, setItemEditando] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [servicosLista, setServicosLista] = useState(servicos)

  useEffect(() => {
    if (os_os !== undefined && os_os !== null && empresaId && filialId) {
      carregarServicosExistentes()
    } else {
      setIsLoading(false)
    }
  }, [os_os, empresaId, filialId])

  const carregarServicosExistentes = async () => {
    try {
      setIsLoading(true)
      const response = await apiGetComContexto('osexterna/servicos/', {
        serv_os: String(os_os),
        serv_empr: Number(empresaId),
        serv_fili: Number(filialId),
      })

      console.log(
        'Resposta RAW API Servicos:',
        JSON.stringify(response, null, 2)
      )

      const servicosArray = response?.results || response || []

      if (Array.isArray(servicosArray)) {
        const servicosFormatados = servicosArray
          // Filter was removing items because serv_prod does not exist in Servicososexterna
          .filter((s) => s.serv_sequ)
          .map((servico) => ({
            serv_item: servico.serv_sequ, // Using serv_sequ as item ID
            serv_prod: servico.serv_desc, // Using description as product/service name
            serv_quan: parseFloat(servico.serv_quan || 0),
            serv_unit: parseFloat(servico.serv_valo_unit || 0),
            serv_tota: parseFloat(
              servico.serv_valo_tota != null
                ? servico.serv_valo_tota
                : servico.serv_valo_tota || 0
            ),
            serv_desc: servico.serv_desc || servico.serv_comp || '',
            servico_nome: servico.serv_desc || 'Serviço',
            serv_sequ: servico.serv_sequ,
          }))
        console.log('Serviços formatados:', servicosFormatados)
        setServicosLista(servicosFormatados)
        setServicos(servicosFormatados)
      } else {
        console.log('Nenhum serviço encontrado ou resposta inválida')
        setServicosLista([])
        setServicos([])
      }
    } catch (error) {
      console.error(
        'Erro ao carregar serviços:',
        error.response?.data || error.message
      )
      Toast.show({
        type: 'error',
        text1: 'Erro ao carregar serviços',
        text2:
          error.response?.data?.error ||
          'Não foi possível carregar os serviços existentes',
      })
      setServicosLista([])
      setServicos([])
    } finally {
      setIsLoading(false)
    }
  }

  const sincronizarComPai = (novos) => {
    setServicosLista(novos)
    setServicos(novos)
  }

  const abrirModalParaEditar = (item) => {
    setItemEditando(item)
    setModalVisivel(true)
  }

  const removerServico = (item) => {
    const atualizados = servicosLista.filter((s) => s !== item)
    sincronizarComPai(atualizados)
    if (item.serv_item) {
      setRemovidos((prev) => [...prev, item])
    }
    Toast.show({
      type: 'success',
      text1: 'Serviço removido',
      text2: item.servico_nome,
    })
  }

  const fecharModal = () => {
    setModalVisivel(false)
    setItemEditando(null)
  }

  const adicionarOuEditarServico = (novoItem, itemEditando) => {
    if (financeiroGerado) {
      Toast.show({
        type: 'error',
        text1: 'Operação não permitida',
        text2: 'Não é possível modificar serviços após gerar o financeiro',
      })
      return
    }
    let atualizados
    if (itemEditando?.serv_item) {
      atualizados = servicosLista.map((s) =>
        s.serv_item === itemEditando.serv_item ? { ...novoItem } : s
      )
    } else if (itemEditando) {
      atualizados = servicosLista.map((s) =>
        !s.serv_item && s.serv_prod === itemEditando.serv_prod
          ? { ...novoItem }
          : s
      )
    } else {
      const existe = servicosLista.some(
        (s) => !s.serv_item && s.serv_prod === novoItem.serv_prod
      )
      if (existe) {
        Toast.show({
          type: 'error',
          text1: 'Serviço já adicionado',
          text2: 'Este serviço já está na lista',
        })
        return
      }
      atualizados = [...servicosLista, novoItem]
    }

    fecharModal()
    sincronizarComPai(atualizados)
    Toast.show({
      type: 'success',
      text1: itemEditando ? 'Serviço atualizado' : 'Serviço adicionado',
      text2: novoItem.servico_nome,
    })
  }

  const salvarServicos = async () => {
    if (isSubmitting) return
    if (!os_os || os_os === 'undefined') {
      Toast.show({
        type: 'error',
        text1: 'Erro ao salvar serviços',
        text2: 'Número da OS inválido',
      })
      return
    }
    setIsSubmitting(true)
    try {
      const itens = servicosLista.map((s) => ({
        serv_empr: Number(empresaId),
        serv_fili: Number(filialId),
        serv_os: Number(os_os),
        serv_sequ: s.serv_item || undefined,
        serv_prod: Number(s.serv_prod),
        serv_quan: Number(s.serv_quan),
        serv_unit: Number(s.serv_unit),
        serv_valo_tota: Number(s.serv_tota),
        serv_desc: s.serv_desc || s.serv_obse || s.servico_nome || '',
      }))

      const response = await apiPostComContexto(
        'osexterna/servicos/update-lista/',
        { itens }
      )

      console.log('Resposta do servidor após salvar:', response)

      await carregarServicosExistentes()

      Toast.show({
        type: 'success',
        text1: 'Serviços salvos com sucesso',
        text2: `Itens atualizados: ${servicosLista.length}`,
      })
    } catch (err) {
      console.error('Erro ao salvar serviços:', err.response?.data || err)
      Toast.show({
        type: 'error',
        text1: 'Erro ao salvar serviços',
        text2:
          err.response?.data?.error ||
          err.message ||
          'Tente novamente mais tarde',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderItem = ({ item }) => (
    <View style={styles.servico}>
      <View style={styles.servicoHeader}>
        <Text style={styles.servNome}>{item.serv_desc || 'Sem nome'}</Text>
        <View style={styles.botoesContainer}>
          <TouchableOpacity
            style={[styles.botaoAcao, styles.botaoEditar]}
            onPress={() => abrirModalParaEditar(item)}>
            <Ionicons name="pencil" size={18} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.botaoAcao, styles.botaoRemover]}
            onPress={() => removerServico(item)}>
            <Ionicons name="trash" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.servicoInfo}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Quantidade:</Text>
          <Text style={styles.infoValor}>
            {Number(item.serv_quan || 0).toFixed(4)}
          </Text>
        </View>
        <View style={styles.infoItem}></View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Total:</Text>
          <Text style={styles.infoValor}>
            R$ {Number(item.serv_tota || 0).toFixed(4)}
          </Text>
        </View>
      </View>
    </View>
  )

  const renderBotaoAdicionar = () => {
    if (financeiroGerado) {
      return null
    }
    return (
      <TouchableOpacity
        style={styles.botaoAdicionar}
        onPress={() => setModalVisivel(true)}>
        <Ionicons name="add-circle" size={24} color="#10a2a7" />
        <Text style={styles.botaoAdicionarTexto}>Adicionar Serviço</Text>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      {renderBotaoAdicionar()}
      <FlatList
        data={isLoading ? [] : servicosLista}
        ListHeaderComponent={
          isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#10a2a7" />
              <Text style={styles.loadingText}>Carregando serviços...</Text>
            </View>
          ) : null
        }
        keyExtractor={(item, index) => {
          if (item?.serv_item) return String(item.serv_item)
          if (item?.serv_prod) return String(item.serv_prod)
          return `index-${index}`
        }}
        renderItem={renderItem}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          !isLoading && (
            <View style={styles.emptyContainer}>
              <Ionicons name="construct-outline" size={48} color="#666" />
              <Text style={styles.emptyText}>Nenhum serviço adicionado</Text>
              <Text style={styles.emptySubtext}>
                Toque no botão acima para adicionar serviços
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          servicosLista.length > 0 && !isLoading ? (
            <TouchableOpacity
              style={[
                styles.botaoSalvar,
                isSubmitting && styles.botaoDesabilitado,
              ]}
              onPress={salvarServicos}
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
                  <Text style={styles.textoBotao}>Salvar Serviços</Text>
                </>
              )}
            </TouchableOpacity>
          ) : null
        }
      />

      <ServModalOs
        visivel={modalVisivel}
        onFechar={fecharModal}
        onAdicionar={adicionarOuEditarServico}
        itemEditando={itemEditando}
        os_os={os_os}
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
  servico: {
    backgroundColor: '#232935',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  servicoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  servNome: {
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
  servicoInfo: {
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
  complemento: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#2c3e50',
  },
  complementoLabel: {
    color: '#999',
    fontSize: 14,
    marginBottom: 4,
  },
  complementoTexto: {
    color: 'white',
    fontSize: 14,
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
    marginTop: 15,
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
