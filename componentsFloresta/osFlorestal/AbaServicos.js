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
import ServModalOs from '../../componentsFloresta/osFlorestal/ServModalOs'
import { apiPostComContexto, apiGetComContexto } from '../../utils/api'
import { Ionicons } from '@expo/vector-icons'
import useContextoApp from '../../hooks/useContextoApp'

export default function AbaServicos({ 
  servicos = [], 
  setServicos, 
  osfl_orde, 
  financeiroGerado, 
  osfl_forn, 
  osfl_empr, 
  osfl_fili 
}) {
  const { empresaId, filialId } = useContextoApp()
  const [removidos, setRemovidos] = useState([])
  const [modalVisivel, setModalVisivel] = useState(false)
  const [itemEditando, setItemEditando] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [servicosLista, setServicosLista] = useState(servicos)

  // Carrega os serviços existentes quando o componente monta ou quando o os_os muda
  useEffect(() => {
    if (
      osfl_orde !== undefined &&
      osfl_orde !== null &&
      osfl_empr !== undefined &&
      osfl_empr !== null &&
      osfl_fili !== undefined &&
      osfl_fili !== null
    ) {
      carregarServicosExistentes()
    }
  }, [osfl_orde, osfl_empr, osfl_fili])

  const carregarServicosExistentes = async () => {
    try {
      setIsLoading(true)
      console.log('Carregando serviços para OS:', osfl_orde)

      const response = await apiGetComContexto('Floresta/servicos-os/', {
        serv_orde: osfl_orde,
        serv_empr: osfl_empr,
        serv_fili: osfl_fili,
      })

      // Verifica se a resposta tem a estrutura paginada
      const servicosArray = response?.results || response || []

      if (Array.isArray(servicosArray) && servicosArray.length > 0) {
        const servicosFormatados = servicosArray.map((servico) => ({
          serv_item: servico.serv_item,
          serv_prod: servico.serv_prod,
          serv_quan: parseFloat(servico.serv_quan),
          serv_unit: parseFloat(servico.serv_unit),
          serv_tota: parseFloat(servico.serv_tota),
          serv_hect: parseFloat(servico.serv_hect || 0),
          serv_desc: parseFloat(servico.serv_desc || 0),
          serv_data: servico.serv_data || null,
          serv_obse: servico.serv_obse || '',
          servico_nome: servico.servico_nome || 'Serviço',
        }))

        console.log('Serviços formatados:', servicosFormatados)
        setServicosLista(servicosFormatados)
        setServicos(servicosFormatados)
      } else {
        console.log('Nenhum serviço encontrado')
        setServicosLista([])
        setServicos([])
      }
    } catch (error) {
      console.error(
        'Erro detalhado ao carregar serviços:',
        error.response?.data || error.message
      )
      Toast.show({
        type: 'error',
        text1: 'Erro ao carregar serviços',
        text2: Array.isArray(error.response?.data)
          ? error.response.data[0]
          : 'Não foi possível carregar os serviços existentes',
      })
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
    setIsSubmitting(true)

    try {
      const adicionar = servicosLista
        .filter((s) => !s.serv_item)
        .map((s) => ({
          serv_orde: osfl_orde,
          serv_prod: s.serv_prod,
          serv_quan: s.serv_quan,
          serv_unit: s.serv_unit,
          serv_tota: s.serv_quan * s.serv_unit, // Calculando o total
          serv_hect: s.serv_hect || 0,
          serv_desc: s.serv_desc || 0,
          serv_data: s.serv_data || null,
          serv_obse: s.serv_obse || '',
          serv_empr: osfl_empr,
          serv_fili: osfl_fili,
        }))

      const editar = servicosLista
        .filter(
          (s) =>
            s.serv_item && !removidos.find((r) => r.serv_item === s.serv_item)
        )
        .map((s) => ({
          serv_item: s.serv_item,
          serv_orde: osfl_orde,
          serv_prod: s.serv_prod,
          serv_quan: s.serv_quan,
          serv_unit: s.serv_unit,
          serv_tota: s.serv_quan * s.serv_unit, // Calculando o total
          serv_hect: s.serv_hect || 0,
          serv_desc: s.serv_desc || 0,
          serv_data: s.serv_data || null,
          serv_obse: s.serv_obse || '',
          serv_empr: osfl_empr,
          serv_fili: osfl_fili,
        }))

      const remover = removidos
        .filter((r) => r.serv_item)
        .map((r) => ({
          serv_empr: osfl_empr,
          serv_fili: osfl_fili,
          serv_orde: osfl_orde,
          serv_item: r.serv_item,
        }))

      const payload = { adicionar, editar, remover }

      console.log('Enviando payload:', payload)

      const response = await apiPostComContexto(
        'Floresta/servicos-os/update-lista/',
        payload
      )

      console.log('Resposta do servidor após salvar:', response)

      // Após salvar com sucesso, recarrega os serviços
      await carregarServicosExistentes()

      setRemovidos([])

      Toast.show({
        type: 'success',
        text1: 'Serviços salvos com sucesso',
        text2: `${adicionar.length} adicionados, ${editar.length} editados, ${remover.length} removidos`,
      })
    } catch (err) {
      console.error(
        'Erro detalhado ao salvar:',
        err.response?.data || err.message
      )
      Toast.show({
        type: 'error',
        text1: 'Erro ao salvar serviços',
        text2: Array.isArray(err.response?.data)
          ? err.response.data[0]
          : 'Tente novamente mais tarde',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderItem = ({ item }) => (
    <View style={styles.servico}>
      <View style={styles.servicoHeader}>
        <Text style={styles.servNome}>{item.servico_nome || 'Sem nome'}</Text>
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
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Preço Unit.:</Text>
          <Text style={styles.infoValor}>
            R$ {Number(item.serv_unit || 0).toFixed(4)}
          </Text>
        </View>
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
      return null; 
    }
    return (
      <TouchableOpacity
        style={styles.botaoAdicionar}
        onPress={() => setModalVisivel(true)}>
        <Ionicons name="add-circle" size={24} color="#10a2a7" />
        <Text style={styles.botaoAdicionarTexto}>Adicionar Serviço</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {renderBotaoAdicionar()}
    
      <FlatList
        data={isLoading ? [] : servicosLista}
        ListHeaderComponent={isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10a2a7" />
            <Text style={styles.loadingText}>Carregando serviços...</Text>
          </View>
        ) : null}
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
              style={[styles.botaoSalvar, isSubmitting && styles.botaoDesabilitado]}
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
        os_os={osfl_orde}
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
