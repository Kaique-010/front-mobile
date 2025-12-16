import React, { useState, useEffect, useRef } from 'react'
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
  const [lista, setLista] = useState(servicos)
  const [usuarioTemSetor, setUsuarioTemSetor] = useState(false)
  const [empresaId, setEmpresaId] = useState(null)
  const [filialId, setFilialId] = useState(null)

  // ID LOCAL para evitar key mudar sempre
  const nextLocalId = useRef(1)

  // --- carregar setor
  useEffect(() => {
    const verificarSetor = async () => {
      try {
        const setor = await AsyncStorage.getItem('setor')
        setUsuarioTemSetor(setor && setor !== '0' && setor !== 'null')
      } catch (error) {
        console.error('Erro setor:', error)
        setUsuarioTemSetor(false)
      }
    }
    verificarSetor()
  }, [])

  useEffect(() => {
    const carregarContexto = async () => {
      try {
        const [empr, fili] = await Promise.all([
          AsyncStorage.getItem('empresaId'),
          AsyncStorage.getItem('filialId'),
        ])
        setEmpresaId(empr)
        setFilialId(fili)
      } catch (e) {
        setEmpresaId(null)
        setFilialId(null)
      }
    }
    carregarContexto()
  }, [])

  useEffect(() => {
    const withIds = (arr) =>
      (arr || []).map((s) => ({
        ...s,
        serv_quan: parseFloat(s?.serv_quan ?? 0),
        serv_unit: parseFloat(s?.serv_unit ?? 0),
        _local_id: s?._local_id ?? nextLocalId.current++,
      }))
    setLista(withIds(servicos))
  }, [servicos])

  // --- sincroniza com API
  useEffect(() => {
    if (orde_nume) carregarServicosExistentes()
    else setIsLoading(false)
  }, [orde_nume])

  const carregarServicosExistentes = async () => {
    try {
      setIsLoading(true)
      let empr = empresaId
      let fili = filialId
      if (!empr || !fili) {
        const [emprS, filiS] = await Promise.all([
          AsyncStorage.getItem('empresaId'),
          AsyncStorage.getItem('filialId'),
        ])
        empr = emprS
        fili = filiS
      }
      const response = await apiGetComContexto('ordemdeservico/servicos/', {
        serv_orde: orde_nume,
        serv_empr: empr,
        serv_fili: fili,
      })

      const raw = response?.data ?? response?.results ?? response ?? []
      const arr = raw.map((s) => ({
        ...s,
        serv_quan: parseFloat(s.serv_quan),
        serv_unit: parseFloat(s.serv_unit),
        _local_id: nextLocalId.current++, // id estável
      }))

      setLista(arr)
      setServicos(arr)
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao carregar serviços',
        text2: 'Verifique sua conexão',
      })
      setLista([])
      setServicos([])
    } finally {
      setIsLoading(false)
    }
  }

  const syncPai = (novaLista) => {
    setLista(novaLista)
    setServicos(novaLista)
  }

  const abrirModalParaEditar = (item) => {
    setItemEditando(item)
    setModalVisivel(true)
  }

  const removerServico = (item) => {
    syncPai(lista.filter((s) => s._local_id !== item._local_id))
    if (item.serv_id) {
      setRemovidos((prev) => [...prev, item])
    }

    Toast.show({
      type: 'success',
      text1: 'Serviço removido',
      text2: item.servico_nome,
    })
  }

  const adicionarOuEditarServico = (novo, antigo) => {
    let novaLista = []

    // EDITAR EXISTENTE
    if (antigo) {
      const coerced = {
        ...novo,
        serv_quan: parseFloat(novo?.serv_quan ?? 0),
        serv_unit: parseFloat(novo?.serv_unit ?? 0),
      }
      novaLista = lista.map((s) =>
        s._local_id === antigo._local_id
          ? { ...coerced, _local_id: antigo._local_id }
          : s
      )
    }
    // ADICIONAR NOVO
    else {
      const jaExiste = lista.some((s) => s.serv_codi === novo.serv_codi)
      if (jaExiste) {
        return Toast.show({
          type: 'error',
          text1: 'Serviço já adicionado',
        })
      }

      novaLista = [
        ...lista,
        {
          ...novo,
          serv_quan: parseFloat(novo?.serv_quan ?? 0),
          serv_unit: parseFloat(novo?.serv_unit ?? 0),
          _local_id: nextLocalId.current++,
        },
      ]
    }

    syncPai(novaLista)

    Toast.show({
      type: 'success',
      text1: antigo ? 'Serviço atualizado' : 'Serviço adicionado',
      text2: novo.servico_nome,
    })
  }

  const salvarServicos = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      if (!orde_nume) throw new Error('Número da OS ausente')
      let empr = empresaId
      let fili = filialId
      if (!empr || !fili) {
        const [emprS, filiS] = await Promise.all([
          AsyncStorage.getItem('empresaId'),
          AsyncStorage.getItem('filialId'),
        ])
        empr = emprS
        fili = filiS
      }

      const adicionar = lista
        .filter((s) => !s.serv_id)
        .map((s) => ({
          serv_orde: orde_nume.toString(),
          serv_codi: s.serv_codi,
          serv_quan: s.serv_quan,
          // Mesmo com setor, enviar preço real
          serv_unit: s.serv_unit,
          serv_tota: s.serv_quan * s.serv_unit,
          serv_comp: s.serv_comp || '',
          serv_empr: empr,
          serv_fili: fili,
        }))

      const editar = lista
        .filter(
          (s) => s.serv_id && !removidos.some((r) => r.serv_id === s.serv_id)
        )
        .map((s) => ({
          serv_id: s.serv_id,
          serv_orde: orde_nume.toString(),
          serv_codi: s.serv_codi,
          serv_quan: s.serv_quan,
          serv_unit: s.serv_unit,
          serv_tota: s.serv_quan * s.serv_unit,
          serv_comp: s.serv_comp || '',
          serv_empr: empr,
          serv_fili: fili,
        }))

      const remover = removidos.map((r) => ({
        serv_id: r.serv_id,
        serv_orde: orde_nume.toString(),
        serv_empr: empr,
        serv_fili: fili,
      }))

      const payload = { adicionar, editar, remover, empr, fili }

      await apiPostComContexto('ordemdeservico/servicos/update-lista/', payload)

      await carregarServicosExistentes()
      setRemovidos([])

      Toast.show({
        type: 'success',
        text1: 'Serviços salvos',
      })
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao salvar',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderItem = ({ item }) => {
    const precoOculto = usuarioTemSetor
    const quantidade =
      typeof item.serv_quan === 'number'
        ? item.serv_quan
        : parseFloat(item.serv_quan) || 0
    const unit =
      typeof item.serv_unit === 'number'
        ? item.serv_unit
        : parseFloat(item.serv_unit) || 0
    const total = quantidade * unit

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
            <Text style={styles.infoValor}>{quantidade.toFixed(4)}</Text>
          </View>

          {!precoOculto && (
            <>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Preço Unit.:</Text>
                <Text style={styles.infoValor}>R$ {unit.toFixed(2)}</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Total:</Text>
                <Text style={styles.infoValor}>R$ {total.toFixed(2)}</Text>
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
    )
  }

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
          data={lista || []}
          keyExtractor={(item, index) =>
            (
              item?._local_id ??
              item?.serv_id ??
              `${item?.serv_codi || 'novo'}-${index}`
            ).toString()
          }
          renderItem={renderItem}
          nestedScrollEnabled
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

      {lista.length > 0 && !isLoading && (
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
