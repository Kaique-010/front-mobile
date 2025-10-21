import React, { useState, useEffect } from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import PedidoPisosHeader from './PedidoPisosHeader'
import ItensListaPisos from '../componetsPisos/ItensListaPisos'
import ItensModalPisos from '../componetsPisos/ItensModalPisos'
import ResumoPedidoPisos from './ResumoPedidoPisos'
import {
  apiGetComContexto,
  apiPostComContexto,
  apiPutComContexto,
} from '../utils/api'
import { useContextoApp } from '../hooks/useContextoApp'
import { useNavigation } from '@react-navigation/native'

const PEDIDO_PISOS_CACHE_ID = 'pedido-pisos-edicao-cache'

const ABAS = {
  HEADER: 'header',
  PRODUTOS: 'produtos',
  RESUMO: 'resumo',
}

export default function PedidosPisosForm({ route, navigation }) {
  const { pedido: pedidoParam } = route.params || {}
  const { empresaId, filialId } = useContextoApp()
  const [pedido, setPedido] = useState({})
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [modalVisivel, setModalVisivel] = useState(false)
  const [itemEditando, setItemEditando] = useState(null)
  const [abaAtiva, setAbaAtiva] = useState(ABAS.HEADER)

  const calcularTotal = (itens) => {
    return itens.reduce((total, item) => {
      return total + (parseFloat(item.item_suto) || 0)
    }, 0)
  }

  const carregarContexto = async () => {
    const empresa = await AsyncStorage.getItem('empresaId')
    const filial = await AsyncStorage.getItem('filialId')
    return {
      empresaId: empresa,
      filialId: filial,
    }
  }

  useEffect(() => {
    const carregarPedido = async () => {
      setCarregando(true)
      try {
        const { empresaId, filialId } = await carregarContexto()

        if (pedidoParam && pedidoParam.pedi_nume) {
          const data = await apiGetComContexto(
            `pisos/pedidos-pisos/${pedidoParam.pedi_nume}/`
          )
          const itens = data.itens || []

          // Na carga do pedido existente
          const pedidoMapeado = {
            ...data,
            itens_input: itens.map((item) => ({
              ...item,
              desconto_item_disponivel: !!item.desconto_item_disponivel,
              percentual_desconto: Number(item.percentual_desconto || 0),
              desconto_valor: Number(item.desconto_valor || 0),
            })),
            pedi_tota: calcularTotal(itens),
            // Campos específicos de pisos
            pedi_mode_piso: data.pedi_mode_piso || '',
            pedi_mode_alum: data.pedi_mode_alum || '',
            pedi_mode_roda: data.pedi_mode_roda || '',
            pedi_mode_port: data.pedi_mode_port || '',
            pedi_mode_outr: data.pedi_mode_outr || '',
            pedi_sent_piso: data.pedi_sent_piso || '',
            pedi_ajus_port: data.pedi_ajus_port || false,
            pedi_degr_esca: data.pedi_degr_esca || false,
            pedi_obra_habi: data.pedi_obra_habi || false,
            pedi_movi_mobi: data.pedi_movi_mobi || false,
            pedi_remo_roda: data.pedi_remo_roda || false,
            pedi_remo_carp: data.pedi_remo_carp || false,
            pedi_croq_info: data.pedi_croq_info || '',
          }

          setPedido(pedidoMapeado)

          await AsyncStorage.setItem(
            PEDIDO_PISOS_CACHE_ID,
            JSON.stringify(pedidoMapeado)
          )
        } else {
          await AsyncStorage.removeItem(PEDIDO_PISOS_CACHE_ID)
          // Na inicialização do pedido novo
          setPedido({
            pedi_empr: empresaId,
            pedi_fili: filialId,
            pedi_clie: null,
            pedi_vend: null,
            pedi_data: new Date().toISOString().split('T')[0],
            pedi_data_prev_entr: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            pedi_stat: 0,
            pedi_obse: 'Pedido de Pisos Enviado por Mobile',
            itens_input: [],
            itens_removidos: [],
            pedi_tota: 0,
            // Campos específicos de pisos
            pedi_mode_piso: '',
            pedi_mode_alum: '',
            pedi_mode_roda: '',
            pedi_mode_port: '',
            pedi_mode_outr: '',
            pedi_sent_piso: '',
            pedi_ajus_port: 'false',
            pedi_degr_esca: 'false',
            pedi_obra_habi: false,
            pedi_movi_mobi: false,
            pedi_remo_roda: false,
            pedi_remo_carp: false,
            pedi_croq_info: '',
            pedi_ende: '',
            pedi_nume_ende: '',
            pedi_comp: '',
            pedi_bair: '',
            pedi_cida: '',
            pedi_esta: '',
            pedi_desc: 0,
            pedi_fret: 0,
          })
        }
      } catch (error) {
        console.error('Erro ao carregar pedido de pisos:', error)
        Alert.alert('Erro', 'Não foi possível carregar o pedido')
      } finally {
        setCarregando(false)
      }
    }

    carregarPedido()
  }, [pedidoParam])

  const handleAdicionarOuEditarItem = (novoItem, itemAnterior = null) => {
    let novosItens = [...pedido.itens_input]

    const index = itemAnterior
      ? novosItens.findIndex((i) => i.item_prod === itemAnterior.item_prod)
      : novosItens.findIndex((i) => i.item_prod === novoItem.item_prod)

    if (index !== -1) {
      novosItens[index] = novoItem
    } else {
      novosItens.push(novoItem)
    }

    const novoTotal = calcularTotal(novosItens)

    setPedido((prev) => ({
      ...prev,
      itens_input: novosItens,
      pedi_tota: novoTotal,
    }))

    setItemEditando(null)
    setModalVisivel(false)
  }

  const handleRemoverItem = (item) => {
    const novosItens = pedido.itens_input.filter(
      (i) => i.item_prod !== item.item_prod
    )

    const novosRemovidos = item.idExistente
      ? [...pedido.itens_removidos, item.item_prod]
      : pedido.itens_removidos

    const novoTotal = calcularTotal(novosItens)

    setPedido((prev) => ({
      ...prev,
      itens_input: novosItens,
      itens_removidos: novosRemovidos,
      pedi_tota: novoTotal,
    }))
    console.log('novosItens', novosItens)
    console.log('novosRemovidos', novosRemovidos)
    console.log('novoTotal', novoTotal)
    console.log('pedido', pedido)
  }

  const salvarPedido = async () => {
    if (!pedido.pedi_clie) {
      Alert.alert('Atenção', 'Selecione um cliente para o pedido')
      return
    }

    if (!pedido.itens_input || pedido.itens_input.length === 0) {
      Alert.alert('Atenção', 'Adicione pelo menos um item ao pedido')
      return
    }

    setSalvando(true)
    try {
      // Calcular total dos itens
      const totalItens = calcularTotal(pedido.itens_input)

      // Aplicar desconto geral e frete
      const descontoGeral = Number(pedido.pedi_desc) || 0
      const frete = Number(pedido.pedi_fret) || 0
      const totalFinal = totalItens - descontoGeral + frete

      const dadosPedido = {
        ...pedido,
        pedi_tota: totalFinal,
        // Converter boolean para string
        pedi_ajus_port: pedido.pedi_ajus_port ? 'true' : 'false',
        pedi_degr_esca: pedido.pedi_degr_esca ? 'true' : 'false',
      }

      let response
      if (pedidoParam && pedidoParam.pedi_nume) {
        response = await apiPutComContexto(
          `pisos/pedidos-pisos/${pedidoParam.pedi_nume}/`,
          dadosPedido
        )
        console.log('response dos dados enviados', response)
      } else {
        response = await apiPostComContexto('pisos/pedidos-pisos/', dadosPedido)
      }
      console.log('response dos dados enviados', response)

      await AsyncStorage.removeItem(PEDIDO_PISOS_CACHE_ID)

      Alert.alert(
        'Sucesso',
        `Pedido ${pedidoParam ? 'atualizado' : 'criado'} com sucesso!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
          {
            text: 'Voltar para Listagem',
            onPress: () => navigation.navigate('PedidosPisos'),
          },
        ]
      )
    } catch (error) {
      console.error('Erro ao salvar pedido:', error)
      Alert.alert(
        'Erro',
        error.response?.data?.detail || 'Não foi possível salvar o pedido'
      )
    } finally {
      setSalvando(false)
    }
  }

  const renderAbaHeader = () => {
    return (
      <View style={styles.abaContent}>
        <PedidoPisosHeader pedido={pedido} setPedido={setPedido} />
      </View>
    )
  }

  const renderAbaProdutos = () => {
    return (
      <View style={styles.abaContent}>
        <View style={styles.itensSection}>
          <View style={styles.itensSectionHeader}>
            <MaterialIcons name="inventory" size={20} color="#a8e6cf" />
            <Text style={styles.sectionTitle}>Produtos do Pedido</Text>
            <Text style={styles.itensCount}>
              {pedido.itens_input?.length || 0}{' '}
              {pedido.itens_input?.length === 1 ? 'item' : 'itens'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.botaoAdicionarItem}
            onPress={() => setModalVisivel(true)}
            activeOpacity={0.8}>
            <MaterialIcons name="add" size={20} color="#fff" />
            <Text style={styles.botaoAdicionarItemTexto}>
              Adicionar Produto
            </Text>
          </TouchableOpacity>

          <ItensListaPisos
            itens={pedido.itens_input || []}
            onEdit={(item) => {
              setItemEditando(item)
              setModalVisivel(true)
            }}
            onRemove={handleRemoverItem}
          />
        </View>
      </View>
    )
  }

  // No renderAbaResumo()
  const renderAbaResumo = () => {
    return (
      <View style={styles.abaContent}>
        <ResumoPedidoPisos
          pedido={pedido}
          itens={pedido.itens_input || []}
          onUpdatePedido={setPedido}
        />
      </View>
    )
  }

  const renderConteudoAba = () => {
    switch (abaAtiva) {
      case ABAS.HEADER:
        return renderAbaHeader()
      case ABAS.PRODUTOS:
        return renderAbaProdutos()
      case ABAS.RESUMO:
        return renderAbaResumo()
      default:
        return renderAbaHeader()
    }
  }

  const getAbaIcon = (aba) => {
    switch (aba) {
      case ABAS.HEADER:
        return 'info'
      case ABAS.PRODUTOS:
        return 'inventory'
      case ABAS.RESUMO:
        return 'receipt'
      default:
        return 'info'
    }
  }

  const getAbaLabel = (aba) => {
    switch (aba) {
      case ABAS.HEADER:
        return 'Informações'
      case ABAS.PRODUTOS:
        return 'Produtos'
      case ABAS.RESUMO:
        return 'Resumo'
      default:
        return 'Informações'
    }
  }

  const podeAvancarParaAba = (aba) => {
    switch (aba) {
      case ABAS.PRODUTOS:
        return !!pedido.pedi_clie
      case ABAS.RESUMO:
        return !!pedido.pedi_clie && pedido.itens_input?.length > 0
      default:
        return true
    }
  }

  if (carregando) {
    return (
      <View style={styles.carregandoContainer}>
        <ActivityIndicator size="large" color="#a8e6cf" />
        <Text style={styles.carregandoTexto}>Carregando pedido...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header da tela */}
      <View style={styles.headerContainer}>
        <MaterialIcons
          name="home"
          size={20}
          color="#a8e6cf"
          style={styles.headerIcon}
        />
        <Text style={styles.pageTitle}>
          {pedidoParam ? 'Editar Pedido de Pisos' : 'Novo Pedido de Pisos'}
        </Text>
      </View>

      {/* Navegação por abas */}
      <View style={styles.tabsContainer}>
        {Object.values(ABAS).map((aba) => {
          const isAtiva = abaAtiva === aba
          const podeAcessar = podeAvancarParaAba(aba)

          return (
            <TouchableOpacity
              key={aba}
              style={[
                styles.tab,
                isAtiva && styles.tabAtiva,
                !podeAcessar && styles.tabDesabilitada,
              ]}
              onPress={() => podeAcessar && setAbaAtiva(aba)}
              activeOpacity={podeAcessar ? 0.7 : 1}>
              <MaterialIcons
                name={getAbaIcon(aba)}
                size={18}
                color={isAtiva ? '#fff' : podeAcessar ? '#a8e6cf' : '#666'}
              />
              <Text
                style={[
                  styles.tabText,
                  isAtiva && styles.tabTextAtiva,
                  !podeAcessar && styles.tabTextDesabilitada,
                ]}>
                {getAbaLabel(aba)}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>

      {/* Conteúdo da aba ativa */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        {renderConteudoAba()}
      </ScrollView>

      {/* Botões de ação */}
      <View style={styles.footerButtons}>
        <TouchableOpacity
          style={styles.botaoCancelar}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}>
          <MaterialIcons name="close" size={20} color="#ff9999" />
          <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.botaoSalvar, salvando && styles.botaoDesabilitado]}
          onPress={salvarPedido}
          disabled={salvando}
          activeOpacity={0.8}>
          {salvando ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <MaterialIcons name="save" size={20} color="#fff" />
          )}
          <Text style={styles.botaoSalvarTexto}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal de itens com nova lógica de cálculo */}
      <ItensModalPisos
        visible={modalVisivel}
        onClose={() => {
          setModalVisivel(false)
          setItemEditando(null)
        }}
        onSave={handleAdicionarOuEditarItem}
        item={itemEditando}
        pedido={pedido}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: 'rgba(168, 230, 207, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: '#a8e6cf',
  },
  headerIcon: {
    marginRight: 8,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f5f5f5',
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    backgroundColor: 'transparent',
  },
  tabAtiva: {
    backgroundColor: 'rgba(168, 230, 207, 0.2)',
    borderBottomWidth: 3,
    borderBottomColor: '#a8e6cf',
  },
  tabDesabilitada: {
    opacity: 0.5,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#a8e6cf',
    marginLeft: 4,
  },
  tabTextAtiva: {
    color: '#fff',
    fontWeight: '600',
  },
  tabTextDesabilitada: {
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  abaContent: {
    flex: 1,
    padding: 0,
  },
  itensSection: {
    flex: 1,
    backgroundColor: 'rgba(168, 230, 207, 0.05)',
    borderRadius: 12,
    padding: 0,
    borderWidth: 1,
    borderColor: 'rgba(168, 230, 207, 0.3)',
  },
  itensSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f5f5f5',
    marginLeft: 15,
    flex: 1,
    marginBottom: 20,
    marginTop: 20,
  },
  itensCount: {
    fontSize: 12,
    color: '#a8e6cf',
    backgroundColor: 'rgba(168, 230, 207, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: '500',
  },
  botaoAdicionarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#a8e6cf',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#a8e6cf',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  botaoAdicionarItemTexto: {
    color: '#0a0a0a',
    fontWeight: '600',
    marginLeft: 8,
  },
  footerButtons: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#333',
    gap: 12,
    marginHorizontal: 30,
    marginBottom: 35,
  },
  botaoCancelar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 153, 153, 0.1)',
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff9999',
  },
  botaoCancelarTexto: {
    color: '#ff9999',
    fontWeight: '600',
    marginLeft: 8,
  },
  botaoSalvar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#a8e6cf',
    paddingVertical: 14,
    borderRadius: 8,
    shadowColor: '#a8e6cf',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  botaoSalvarTexto: {
    color: '#0a0a0a',
    fontWeight: '600',
    marginLeft: 8,
  },
  botaoDesabilitado: {
    opacity: 0.6,
  },
  carregandoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  carregandoTexto: {
    color: '#f5f5f5',
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
  },
})
