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
import OrcamentoPisosHeader from './OrcamentoPisosHeader'
import ItensListaPisos from './ItensListaPisos'
import ItensModalPisosOrcamentos from './ItensModalPisosOrcamentos'
import ResumoOrcamentoPisos from './ResumoOrcamentoPisos'
import {
  apiGetComContexto,
  apiPostComContexto,
  apiPutComContexto,
} from '../utils/api'
import { useContextoApp } from '../hooks/useContextoApp'
import { processarSalvarOrcamento, calcularTotal } from './salvarOrcamento'

const ORCAMENTO_PISOS_CACHE_ID = 'orcamento-pisos-edicao-cache'

const ABAS = {
  HEADER: 'header',
  PRODUTOS: 'produtos',
  RESUMO: 'resumo',
}

export default function OrcamentosPisosForm({ route, navigation }) {
  const { orcamento: orcamentoParam } = route.params || {}
  const { empresaId, filialId } = useContextoApp()
  const [orcamento, setOrcamento] = useState({})
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [modalVisivel, setModalVisivel] = useState(false)
  const [itemEditando, setItemEditando] = useState(null)
  const [abaAtiva, setAbaAtiva] = useState(ABAS.HEADER)

  const carregarContexto = async () => {
    const empresa = await AsyncStorage.getItem('empresaId')
    const filial = await AsyncStorage.getItem('filialId')
    return {
      empresaId: empresa,
      filialId: filial,
    }
  }

  useEffect(() => {
    const carregarOrcamento = async () => {
      setCarregando(true)
      try {
        const { empresaId, filialId } = await carregarContexto()

        if (orcamentoParam && orcamentoParam.orca_nume) {
          const data = await apiGetComContexto(
            `pisos/orcamentos-pisos/${orcamentoParam.orca_nume}/`,
          )
          const itens = data.itens || []

          // Na carga do orcamento existente
          const orcamentoMapeado = {
            ...data,
            itens_input: itens.map((item) => ({
              ...item,
            })),
            orca_tota: calcularTotal(itens),
            // Campos específicos de pisos
            orca_mode_piso: data.orca_mode_piso || '',
            orca_mode_alum: data.orca_mode_alum || '',
            orca_mode_roda: data.orca_mode_roda || '',
            orca_mode_port: data.orca_mode_port || '',
            orca_mode_outr: data.orca_mode_outr || '',
            orca_sent_piso: data.orca_sent_piso || '',
            orca_ajus_port: data.orca_ajus_port || false,
            orca_degr_esca: data.orca_degr_esca || false,
            orca_obra_habi: data.orca_obra_habi || false,
            orca_movi_mobi: data.orca_movi_mobi || false,
            orca_remo_roda: data.orca_remo_roda || false,
            orca_remo_carp: data.orca_remo_carp || false,
            orca_croq_info: data.orca_croq_info || '',
          }

          setOrcamento(orcamentoMapeado)

          await AsyncStorage.setItem(
            ORCAMENTO_PISOS_CACHE_ID,
            JSON.stringify(orcamentoMapeado),
          )
        } else {
          await AsyncStorage.removeItem(ORCAMENTO_PISOS_CACHE_ID)
          // Na inicialização do orcamento novo
          setOrcamento({
            orca_empr: empresaId,
            orca_fili: filialId,
            orca_clie: null,
            orca_vend: null,
            orca_data: new Date().toISOString().split('T')[0],
            orca_data_prev_entr: new Date(
              new Date().getTime() + 30 * 24 * 60 * 60 * 1000,
            )
              .toISOString()
              .split('T')[0],
            orca_stat: 0,
            orca_obse: 'Orçamento de Pisos Enviado por Mobile',
            itens_input: [],
            itens_removidos: [],
            orca_tota: 0,
            // Campos específicos de pisos
            orca_mode_piso: '',
            orca_mode_alum: '',
            orca_mode_roda: '',
            orca_mode_port: '',
            orca_mode_outr: '',
            orca_sent_piso: '',
            orca_ajus_port: 'false',
            orca_degr_esca: 'false',
            orca_obra_habi: false,
            orca_movi_mobi: false,
            orca_remo_roda: false,
            orca_remo_carp: false,
            orca_croq_info: '',
            orca_ende: '',
            orca_nume_ende: '',
            orca_comp: '',
            orca_bair: '',
            orca_cida: '',
            orca_esta: '',
            orca_desc: 0,
            orca_fret: 0,
          })
        }
      } catch (error) {
        console.error('Erro ao carregar orcamento de pisos:', error)
        Alert.alert('Erro', 'Não foi possível carregar o orcamento')
      } finally {
        setCarregando(false)
      }
    }

    carregarOrcamento()
  }, [orcamentoParam])

  const handleAdicionarOuEditarItem = (novoItem, itemAnterior = null) => {
    console.log('🔍 [ORCAMENTO-FORM] Adicionando/editando item')
    console.log('🔍 [ORCAMENTO-FORM] Novo item:', novoItem)
    console.log('🔍 [ORCAMENTO-FORM] Item anterior:', itemAnterior)
    console.log('🔍 [ORCAMENTO-FORM] Estado atual do orçamento:', orcamento)

    let novosItens = [...orcamento.itens_input]

    const index = itemAnterior
      ? novosItens.findIndex((i) => i.item_prod === itemAnterior.item_prod)
      : novosItens.findIndex((i) => i.item_prod === novoItem.item_prod)

    console.log('🔍 [ORCAMENTO-FORM] Índice encontrado:', index)

    if (index !== -1) {
      console.log(
        '🔍 [ORCAMENTO-FORM] Editando item existente no índice:',
        index,
      )
      novosItens[index] = novoItem
    } else {
      console.log('🔍 [ORCAMENTO-FORM] Adicionando novo item')
      novosItens.push(novoItem)
    }

    const novoTotal = calcularTotal(novosItens)
    console.log('🔍 [ORCAMENTO-FORM] Novo total calculado:', novoTotal)
    console.log('🔍 [ORCAMENTO-FORM] Novos itens:', novosItens)

    setOrcamento((prev) => {
      const novoEstado = {
        ...prev,
        itens_input: novosItens,
        orca_tota: novoTotal,
      }
      console.log(
        '✅ [ORCAMENTO-FORM] Novo estado do orçamento após adicionar item:',
        novoEstado,
      )
      return novoEstado
    })

    setItemEditando(null)
    setModalVisivel(false)
  }

  const handleRemoverItem = (item) => {
    const novosItens = orcamento.itens_input.filter(
      (i) => i.item_prod !== item.item_prod,
    )

    const novosRemovidos = item.idExistente
      ? [...orcamento.itens_removidos, item.item_prod]
      : orcamento.itens_removidos

    const novoTotal = calcularTotal(novosItens)

    setOrcamento((prev) => ({
      ...prev,
      itens_input: novosItens,
      itens_removidos: novosRemovidos,
      orca_tota: novoTotal,
    }))
    console.log('novosItens', novosItens)
    console.log('novosRemovidos', novosRemovidos)
    console.log('novoTotal', novoTotal)
    console.log('orcamento', orcamento)
  }

  const salvarOrcamento = async () => {
    try {
      await processarSalvarOrcamento({
        orcamento,
        orcamentoParam,
        setSalvando,
        navigation,
      })
      Alert.alert(
        'Sucesso',
        `Orçamento ${orcamentoParam ? 'atualizado' : 'criado'} com sucesso!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ],
      )
    } catch (error) {
      // O erro já foi tratado dentro do processarSalvarOrcamento (console.error e Alert)
      // Aqui só precisamos garantir que não tente fazer mais nada
    }
  }

  const renderAbaHeader = () => {
    return (
      <View style={styles.abaContent}>
        <OrcamentoPisosHeader
          orcamento={orcamento}
          setOrcamento={setOrcamento}
        />
      </View>
    )
  }

  const renderAbaProdutos = () => {
    return (
      <View style={styles.abaContent}>
        <View style={styles.itensSection}>
          <View style={styles.itensSectionHeader}>
            <MaterialIcons name="inventory" size={20} color="#a8e6cf" />
            <Text style={styles.sectionTitle}>Produtos do Orçamento</Text>
            <Text style={styles.itensCount}>
              {orcamento.itens_input?.length || 0}{' '}
              {orcamento.itens_input?.length === 1 ? 'item' : 'itens'}
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
            itens={orcamento.itens_input || []}
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
        <ResumoOrcamentoPisos
          orcamento={orcamento}
          itens={orcamento.itens_input || []}
          onUpdateOrcamento={setOrcamento}
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
        return !!orcamento.orca_clie
      case ABAS.RESUMO:
        return !!orcamento.orca_clie && orcamento.itens_input?.length > 0
      default:
        return true
    }
  }

  if (carregando) {
    return (
      <View style={styles.carregandoContainer}>
        <ActivityIndicator size="large" color="#a8e6cf" />
        <Text style={styles.carregandoTexto}>Carregando orçamento...</Text>
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
          {orcamentoParam ? 'Editar Orçamento' : 'Novo Orçamento'}
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
          onPress={salvarOrcamento}
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
      <ItensModalPisosOrcamentos
        visible={modalVisivel}
        onClose={() => {
          setModalVisivel(false)
          setItemEditando(null)
        }}
        onSave={handleAdicionarOuEditarItem}
        item={itemEditando}
        orcamento={orcamento}
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
