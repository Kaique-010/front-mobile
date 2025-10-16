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
import ServModalOs from './ServModalOs'
import { apiPostComContexto, apiGetComContexto } from '../utils/api'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function AbaServicos({ servicos = [], setServicos, orde_nume }) {
  const [removidos, setRemovidos] = useState([])
  const [modalVisivel, setModalVisivel] = useState(false)
  const [itemEditando, setItemEditando] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [servicosLista, setServicosLista] = useState(servicos)
  const [usuarioTemSetor, setUsusarioTemSetor] = useState(false)

  useEffect(() => {
    if (orde_nume) {
      carregarServicosExistentes()
    } else {
      setIsLoading(false)
    }
  }, [orde_nume])

  useEffect(() => {
    const verificarSetor = async () => {
      try{
        const setor = await AsyncStorage.getItem('setor')
        setUsusarioTemSetor(setor && setor !== null && setor !== 'null' && setor !== '0')
      }catch(error){
        console.error('Erro ao verificar setor:', error)
        setUsusarioTemSetor(false)
      }
    }
    verificarSetor()
  }, [])


  const carregarServicosExistentes = async () => {
    try {
      setIsLoading(true)
      console.log('Carregando serviços para OS:', orde_nume)

      const response = await apiGetComContexto('ordemdeservico/servicos/', {
        serv_orde: orde_nume,
        serv_empr: 1,
        serv_fili: 1,
      })

      console.log('Resposta da API:', response)

      const servicosArray = response?.results || response || []

      if (Array.isArray(servicosArray)) {
        const servicosFormatados = servicosArray.map((servico) => ({
          serv_id: servico.serv_id,
          serv_codi: servico.serv_codi,
          serv_quan: parseFloat(servico.serv_quan),
          serv_unit: parseFloat(servico.serv_unit),
          serv_tota: parseFloat(servico.serv_tota),
          serv_comp: servico.serv_comp,
          servico_nome: servico.servico_nome || 'Serviço',
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
    if (item.serv_id) {
      setRemovidos((prev) => [...prev, item])
    }
    Toast.show({
      type: 'success',
      text1: 'Serviço removido',
      text2: item.servico_nome,
    })
  }

  const adicionarOuEditarServico = (novoItem, itemEditando) => {
    let atualizados
    if (itemEditando?.serv_id) {
      atualizados = servicosLista.map((s) =>
        s.serv_id === itemEditando.serv_id ? { ...novoItem } : s
      )
    } else if (itemEditando) {
      atualizados = servicosLista.map((s) =>
        !s.serv_id && s.serv_codi === itemEditando.serv_codi
          ? { ...novoItem }
          : s
      )
    } else {
      const existe = servicosLista.some(
        (s) => s.serv_codi === novoItem.serv_codi
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
      if (!orde_nume) {
        throw new Error('Número da O.S não definido')
      }

      const adicionar = servicosLista
        .filter((s) => !s.serv_id)
        .map((s) => ({
          serv_orde: orde_nume.toString(),
          serv_codi: s.serv_codi,
          serv_quan: s.serv_quan,
          serv_unit: s.serv_unit,
          serv_tota: s.serv_quan * s.serv_unit,
          serv_comp: s.serv_comp || '',
          serv_empr: '1',
          serv_fili: '1',
        }))

      const editar = servicosLista
        .filter(
          (s) => s.serv_id && !removidos.find((r) => r.serv_id === s.serv_id)
        )
        .map((s) => ({
          serv_id: s.serv_id,
          serv_orde: orde_nume.toString(),
          serv_codi: s.serv_codi,
          serv_quan: s.serv_quan,
          serv_unit: s.serv_unit,
          serv_tota: s.serv_quan * s.serv_unit,
          serv_comp: s.serv_comp || '',
          serv_empr: '1',
          serv_fili: '1',
        }))

      const remover = removidos
        .filter((r) => r.serv_id)
        .map((r) => ({
          serv_id: r.serv_id,
          serv_orde: orde_nume.toString(),
          serv_empr: '1',
          serv_fili: '1',
        }))

      const payload = {
        adicionar,
        editar,
        remover,
        empr: '1',
        fili: '1',
      }

      console.log('Enviando payload:', payload)

      const response = await apiPostComContexto(
        'ordemdeservico/servicos/update-lista/',
        payload
      )

      console.log('Resposta do servidor após salvar:', response)

      await carregarServicosExistentes()
      setRemovidos([])

      Toast.show({
        type: 'success',
        text1: 'Serviços salvos com sucesso',
        text2: `${adicionar.length} adicionados, ${editar.length} editados, ${remover.length} removidos`,
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

  const renderItem = ({ item }) => {
    //Remover o preço quando usuario tem setor
    const precoOculto = usuarioTemSetor
    const precoReal = item.serv_unit.toFixed(2)
    const quantidadeNum = Number(item.serv_quan) || 0
    const totalReal = quantidadeNum * precoReal

    return (
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
          <Text style={styles.infoValor}>{item.serv_quan.toFixed(4)}</Text>
        </View>
        {!precoOculto && (
          <>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Preço Unit.:</Text>
              <Text style={styles.infoValor}>R$ {parseFloat(precoReal).toFixed(2)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Total:</Text>
              <Text style={styles.infoValor}>R$ {parseFloat(totalReal).toFixed(2)}</Text> 
            </View>
          </>
        )}
        {item.serv_comp ? (
          <View style={styles.complemento}>
            <Text style={styles.complementoLabel}>Complemento:</Text>
            <Text style={styles.complementoTexto}>{item.serv_comp}</Text>
          </View>
        ) : null}
      </View>
    </View>
    )}

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
        <Text style={styles.textoBotao}>Adicionar Serviço</Text>
      </TouchableOpacity>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10a2a7" />
          <Text style={styles.loadingText}>Carregando serviços...</Text>
        </View>
      ) : (
        <FlatList
          data={servicosLista}
          keyExtractor={(item) =>
            item.serv_id?.toString() || `temp-${item.serv_codi}-${Date.now()}`
          }
          renderItem={renderItem}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="construct-outline" size={48} color="#666" />
              <Text style={styles.emptyText}>Nenhum serviço adicionado</Text>
              <Text style={styles.emptySubtext}>
                Toque no botão acima para adicionar serviços
              </Text>
            </View>
          }
        />
      )}

      {servicosLista.length > 0 && !isLoading && (
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
      )}

      <ServModalOs
        visivel={modalVisivel}
        onFechar={() => setModalVisivel(false)}
        onAdicionar={adicionarOuEditarServico}
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
