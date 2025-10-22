import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Switch,
} from 'react-native'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import { styles } from './styles/AbaStyles'
import {
  apiGetComContexto,
  apiPostComContexto,
  apiDeleteComContexto,
  apiPutComContexto,
} from '../utils/api'
import BuscaProdutoInput from '../components/BuscaProdutosInput'
import BuscaServicoInput from '../components/BuscaServicoInput'

const ItemVisitaCard = ({ item, onEdit, onDelete }) => {
  return (
    <View style={localStyles.itemCard}>
      <View style={localStyles.itemHeader}>
        <Text style={localStyles.itemProduto}>{item.item_prod}</Text>
        <View style={localStyles.itemActions}>
          <TouchableOpacity
            style={localStyles.editButton}
            onPress={() => onEdit(item)}>
            <Ionicons name="pencil" size={16} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={localStyles.deleteButton}
            onPress={() => onDelete(item)}>
            <Ionicons name="trash" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      
      {item.item_descricao && (
        <Text style={localStyles.itemDescricao}>{item.item_desc_prod}</Text>
      )}
      
      {item.pisos_quantidade && (
        <View style={localStyles.pisosInfo}>
          <Text style={localStyles.pisosLabel}>Informações de Pisos</Text>
          <Text style={{ color: '#17a2b8', fontWeight: '600' }}>
            {item.pisos_quantidade} pisos × {(parseFloat(item.pisos_largura) || 0).toFixed(2)}m × {(parseFloat(item.pisos_comprimento) || 0).toFixed(2)}m
          </Text>
        </View>
      )}
      
      <View style={localStyles.itemDetalhesVertical}>
        <View style={localStyles.detalheItemVertical}>
          <Text style={localStyles.detalheLabel}>Quantidade</Text>
          <Text style={localStyles.detalheValor}>{(parseFloat(item.item_quan) || 0).toFixed(2)}</Text>
        </View>
        
        <View style={localStyles.detalheItemVertical}>
          <Text style={localStyles.detalheLabel}>Unidade</Text>
          <Text style={localStyles.itemUnidade}>{item.item_unli || ''}</Text>
        </View>
        
        <View style={localStyles.detalheItemVertical}>
          <Text style={localStyles.detalheLabel}>Valor Unitário</Text>
          <Text style={localStyles.detalheValor}>R$ {(parseFloat(item.item_unit) || 0).toFixed(2)}</Text>
        </View>
        
        <View style={localStyles.detalheItemVertical}>
          <Text style={localStyles.detalheLabel}>Valor Total</Text>
          <Text style={localStyles.itemTotal}>R$ {(parseFloat(item.item_tota) || 0).toFixed(2)}</Text>
        </View>
      </View>
    </View>
  )
}

export default function AbaItens({ visitaId, formData, empresaId, filialId }) {
  const [itens, setItens] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [tipoItem, setTipoItem] = useState('produto')
  const [isPisos, setIsPisos] = useState(false)
  const [calculandoMetragem, setCalculandoMetragem] = useState(false)
  const [dadosCalculo, setDadosCalculo] = useState(null) // Novo estado para dados de cálculo
  const [itemForm, setItemForm] = useState({
    item_prod: '',
    item_desc_prod: '',
    item_quan: '',
    item_unit: '',
    item_unli: '',
    item_desc: '0',
    item_obse: '',
    item_codigo: '',
    // Campos específicos para pisos
    item_m2: '',
    item_nome_ambi: '',
    item_queb: '0',
    item_caix: '',
    item_tipo_calculo: 'normal',
  })

  useEffect(() => {
    if (visitaId) {
      carregarItens()
    }
  }, [visitaId])

  const carregarItens = async () => {
    try {
      setLoading(true)
      const response = await apiGetComContexto(
        `controledevisitas/itens-visita/?item_visita=${visitaId}`
      )
      setItens(response?.results || response || [])
    } catch (error) {
      console.error('Erro ao carregar itens:', error)
      Alert.alert('Erro', 'Não foi possível carregar os itens')
    } finally {
      setLoading(false)
    }
  }

  const calcularMetragemPisos = async () => {
    if (!itemForm.item_m2 || !itemForm.item_codigo) {
      Alert.alert('Erro', 'Informe a metragem e selecione um produto')
      return
    }

    try {
      setCalculandoMetragem(true)
      const response = await apiPostComContexto(
        'controledevisitas/itens-visita/calcular-metragem-pisos/',
        {
          tamanho_m2: parseFloat(itemForm.item_m2),
          percentual_quebra: parseFloat(itemForm.item_queb) || 0,
          produto_id: itemForm.item_codigo,
          condicao: 'vista',
        }
      )

      // Armazenar dados de cálculo para usar na função calcularTotal
      setDadosCalculo(response)

      // Calcular quantidade baseada na unidade de medida (igual ao ItensModalPisos.js)
      const caixasCalculadas = Number(response.caixas_necessarias) || 0
      const unidadeMedida = (itemForm.item_unli || '').toUpperCase()
      
      let quantidadeCalculada = 0
      if (unidadeMedida === 'M2' || unidadeMedida === 'M²' || unidadeMedida === 'METRO QUADRADO') {
        // Para M2: usar m2_por_caixa × caixas
        quantidadeCalculada = (Number(response.m2_por_caixa) || 0) * caixasCalculadas
      } else {
        // Para PC/PEÇA: usar pc_por_caixa × caixas
        quantidadeCalculada = (Number(response.pc_por_caixa) || 0) * caixasCalculadas
      }

      setItemForm({
        ...itemForm,
        item_quan: quantidadeCalculada.toFixed(2),
        item_unit: response.preco_unitario?.toString() || '0',
        item_caix: response.caixas_necessarias?.toString() || '1',
      })

      Alert.alert(
        'Cálculo Realizado',
        `Metragem total: ${response.metragem_total} m²\nCaixas necessárias: ${
          response.caixas_necessarias
        }\nPeças necessárias: ${
          response.pecas_necessarias
        }\nValor total: R$ ${response.valor_total?.toFixed(2)}`
      )
    } catch (error) {
      console.error('Erro ao calcular metragem:', error)
      Alert.alert('Erro', 'Não foi possível calcular a metragem')
    } finally {
      setCalculandoMetragem(false)
    }
  }

  // Função para calcular total baseado na unidade de medida (similar ao ItensModalPisos.js)
  const calcularTotal = () => {
    // Se temos o valor_total da API, usar ele diretamente (já inclui impostos/margens)
    if (dadosCalculo?.valor_total) {
      return Number(dadosCalculo.valor_total)
    }

    const preco = Number(itemForm.item_unit) || 0
    const unid = (itemForm.item_unli || '').toUpperCase()
      .replace('METRO QUADRADO', 'M2')
      .replace('M²', 'M2')
      .replace('PEÇA', 'PC')
      .replace('PÇ', 'PC')
      .replace('BARRA', 'PC')
    
    // Para produtos de pisos, usar sempre as caixas como base
    if (isPisos && dadosCalculo) {
      const caixas = Number(dadosCalculo.caixas_necessarias) || Number(itemForm.item_quan) || 0
      
      // Para produtos com unidade M2, calcular baseado na metragem real
      if (unid === 'M2' || unid === 'M²' || unid === 'm2' || unid === 'm²') {
        // Se temos metragem_real da API, usar ela
        if (dadosCalculo?.metragem_real) {
          return Number(dadosCalculo.metragem_real) * preco
        }
        // Senão, calcular baseado em caixas e m2_por_caixa
        if (dadosCalculo?.m2_por_caixa > 0) {
          return caixas * Number(dadosCalculo.m2_por_caixa) * preco
        }
      }
      
      // Para produtos com unidade PC (peças), usar peças por caixa se disponível
      if (unid === 'PC' || unid === 'PÇ' || unid === 'PEÇA') {
        if (dadosCalculo?.pc_por_caixa > 0) {
          return caixas * Number(dadosCalculo.pc_por_caixa) * preco
        }
        // Se não tem pc_por_caixa, usar as peças necessárias diretamente
        if (dadosCalculo?.pecas_necessarias > 0) {
          return Number(dadosCalculo.pecas_necessarias) * preco
        }
      }
      
      // Fallback: usar caixas * preço
      return caixas * preco
    }
    
    // Para itens normais (não pisos)
    const quantidade = Number(itemForm.item_quan) || 0
    return quantidade * preco
  }

  const salvarItem = async () => {
    try {
      if (!itemForm.item_prod.trim()) {
        Alert.alert('Erro', 'Produto/Serviço é obrigatório')
        return
      }

      // Validar campos específicos de pisos
      if (isPisos) {
        if (!itemForm.item_m2 || !itemForm.item_nome_ambi) {
          Alert.alert(
            'Erro',
            'Para pisos, informe a metragem e o nome do ambiente'
          )
          return
        }
      }

      // Validar produto duplicado
      const produtoExistente = itens.find(
        (item) =>
          item.item_prod.toLowerCase() ===
            itemForm.item_prod.trim().toLowerCase() &&
          (!editingItem || item.item_id !== editingItem.item_id)
      )

      if (produtoExistente) {
        Alert.alert(
          'Produto Duplicado',
          `O produto "${itemForm.item_prod}" já foi adicionado à esta visita.\n\nDeseja editar o item existente?`,
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Editar Existente',
              onPress: () => {
                editarItem(produtoExistente)
              },
            },
          ]
        )
        return
      }

      const quantidade = parseFloat(itemForm.item_quan)
      const valorUnit = parseFloat(itemForm.item_unit)
      const desconto = parseFloat(itemForm.item_desc) || 0

      if (!quantidade || quantidade <= 0) {
        Alert.alert('Erro', 'Quantidade deve ser maior que zero')
        return
      }

      if (!valorUnit || valorUnit <= 0) {
        Alert.alert('Erro', 'Valor unitário deve ser maior que zero')
        return
      }

      // Validar se visitaId e formData existem
      if (!visitaId) {
        Alert.alert('Erro', 'ID da visita não encontrado')
        return
      }

      // Usar os props passados ou fallback para formData
      const empresaIdToUse = empresaId || formData?.ctrl_empresa
      const filialIdToUse = filialId || formData?.ctrl_filial

      if (!visitaId) {
        Alert.alert('Erro', 'Salve a visita antes de adicionar itens')
        return
      }

      if (!empresaIdToUse || !filialIdToUse) {
        Alert.alert('Erro', 'Dados da empresa/filial não encontrados')
        return
      }

      const itemData = {
        item_prod: itemForm.item_prod.trim(),
        item_desc_prod: itemForm.item_desc_prod?.trim() || '',
        item_quan: quantidade,
        item_unit: valorUnit,
        item_desc: desconto,
        item_unli: itemForm.item_unli || '',
        item_obse: itemForm.item_obse?.trim() || '',
        item_visita: parseInt(visitaId),
        item_empr: parseInt(empresaIdToUse),
        item_fili: parseInt(filialIdToUse),
        // Campos específicos de pisos
        item_m2: isPisos ? parseFloat(itemForm.item_m2) || null : null,
        item_nome_ambi: isPisos
          ? itemForm.item_nome_ambi?.trim() || null
          : null,
        item_queb: isPisos ? parseFloat(itemForm.item_queb) || 10 : null,
        item_caix: isPisos ? parseFloat(itemForm.item_caix) || null : null,
        item_tipo_calculo: isPisos ? 'pisos' : 'normal',
      }

      console.log('Dados enviados:', itemData) // Para debug

      if (editingItem) {
        await apiPutComContexto(
          `controledevisitas/itens-visita/${editingItem.item_id}/`,
          itemData
        )
      } else {
        await apiPostComContexto('controledevisitas/itens-visita/', itemData)
      }

      setModalVisible(false)
      resetForm()
      carregarItens()
    } catch (error) {
      console.error('Erro ao salvar item:', error)
      console.error('Detalhes do erro:', error.response?.data)
      Alert.alert(
        'Erro',
        `Não foi possível salvar o item: ${
          error.response?.data?.detail || error.message
        }`
      )
    }
  }

  const editarItem = (item) => {
    setEditingItem(item)
    setIsPisos(item.item_tipo_calculo === 'pisos')
    setItemForm({
      item_prod: item.item_prod,
      item_desc_prod: item.item_desc_prod || '',
      item_quan: item.item_quan?.toString() || '',
      item_unit: item.item_unit?.toString() || '',
      item_unli: item.item_unli || '',
      item_desc: item.item_desc?.toString() || '0',
      item_obse: item.item_obse || '',
      item_codigo: item.item_codigo || '',
      // Campos específicos de pisos
      item_m2: item.item_m2?.toString() || '',
      item_nome_ambi: item.item_nome_ambi || '',
      item_queb: item.item_queb?.toString() || '0',
      item_caix: item.item_caix?.toString() || '',
      item_tipo_calculo: item.item_tipo_calculo || 'normal',
    })
    setModalVisible(true)
  }

  
  const excluirItem = (item) => {
    // Validação defensiva para evitar erros
    if (!item || !item.item_prod) {
      Alert.alert('Erro', 'Item inválido para exclusão')
      return
    }

    Alert.alert(
      'Confirmar Exclusão',
      `Deseja excluir o item "${item.item_prod}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiDeleteComContexto(
                `controledevisitas/itens-visita/${item.item_id}/`
              )
              carregarItens()
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o item')
            }
          },
        },
      ]
    )
  }

  const exportarParaOrcamento = () => {
    if (itens.length === 0) {
      Alert.alert('Aviso', 'Adicione itens antes de exportar para orçamento')
      return
    }

    Alert.alert(
      'Exportar para Orçamento',
      'Deseja criar um orçamento com os itens desta visita?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Exportar',
          onPress: async () => {
            try {
              setLoading(true)
              const response = await apiPostComContexto(
                'controledevisitas/itens-visita/exportar-para-orcamento/',
                { visita_id: visitaId }
              )

              Alert.alert(
                'Sucesso',
                `Orçamento ${response.orcamento_numero} criado com ${
                  response.total_itens
                } itens.\nValor total: R$ ${response.valor_total.toFixed(2)}`
              )
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível exportar para orçamento')
            } finally {
              setLoading(false)
            }
          },
        },
      ]
    )
  }

  const resetForm = () => {
    setItemForm({
      item_prod: '',
      item_desc_prod: '',
      item_quan: '',
      item_unit: '',
      item_unli: '',
      item_desc: '0',
      item_obse: '',
      item_codigo: '',
      // Campos específicos para pisos
      item_m2: '',
      item_nome_ambi: '',
      item_queb: '0',
      item_caix: '',
      item_tipo_calculo: 'normal',
    })
    setEditingItem(null)
    setTipoItem('produto')
    setIsPisos(false)
    setDadosCalculo(null) // Limpar dados de cálculo
  }

  const handleSelecionarProduto = (produto) => {
    setItemForm({
      ...itemForm,
      item_prod: produto.prod_codi,
      item_desc_prod: produto.prod_nome,
      item_unit: produto.prod_preco_vista?.toString() || '0',
      item_codigo: produto.prod_codi,
      item_unli: produto.prod_unme || '',
    })
  }

  const handleSelecionarServico = (servico) => {
    setItemForm({
      ...itemForm,
      item_prod: servico.serv_nome,
      item_desc_prod: '',
      item_unit: servico.serv_preco?.toString() || '0',
      item_codigo: servico.serv_prod,
      item_unli: servico.serv_unme || '',
    })
  }

  const valorTotal = Array.isArray(itens)
    ? itens.reduce((total, item) => {
        const itemTotal = parseFloat(item.item_tota) || 0
        return total + itemTotal
      }, 0)
    : 0

  return (
    <View style={styles.tabContent}>
      <View style={localStyles.headerItens}>
        <Text style={styles.tabTitle}>Itens da Visita (Pré-Orçamento)</Text>
        <Text style={localStyles.valorTotal}>
          Total: R$ {Number(valorTotal).toFixed(2)}
        </Text>
      </View>

      <View style={localStyles.actionsContainer}>
        <TouchableOpacity
          style={localStyles.addButton}
          onPress={() => {
            resetForm()
            setModalVisible(true)
          }}>
          <Ionicons name="add" size={20} color="black" />
          <Text style={localStyles.addButtonText}>Adicionar Item</Text>
        </TouchableOpacity>

        {itens.length > 0 && (
          <TouchableOpacity
            style={localStyles.exportButton}
            onPress={exportarParaOrcamento}>
            <MaterialIcons name="file-download" size={20} color="#fff" />
            <Text style={localStyles.exportButtonText}>
              Exportar p/ Orçamento
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#10a2a7"
          style={localStyles.loading}
        />
      ) : (
        <FlatList
          data={itens}
          keyExtractor={(item) => item.item_id?.toString()}
          renderItem={({ item }) => (
            <ItemVisitaCard
              item={item}
              onEdit={editarItem}
              onDelete={excluirItem}
            />
          )}
          ListEmptyComponent={
            <Text style={localStyles.emptyText}>Nenhum item adicionado</Text>
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Modal melhorado */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setModalVisible(false)
          resetForm()
        }}>
        <View style={localStyles.modalContainer}>
          <View style={localStyles.modalContent}>
            <View style={localStyles.modalHeader}>
              <Text style={localStyles.modalTitle}>
                {editingItem ? 'Editar Item' : 'Adicionar Item'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false)
                  resetForm()
                }}
                style={localStyles.closeButton}>
                <Ionicons name="close" size={24} color="#10a2a7" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={localStyles.scrollContent}
              showsVerticalScrollIndicator={false}>
              {/* Seletor de tipo melhorado */}
              <View style={localStyles.tipoSelector}>
                <TouchableOpacity
                  style={[
                    localStyles.tipoButton,
                    tipoItem === 'produto' && localStyles.tipoButtonActive,
                  ]}
                  onPress={() => {
                    setTipoItem('produto')
                    setItemForm({
                      ...itemForm,
                      item_prod: '',
                      item_unit: '',
                      item_codigo: '',
                    })
                  }}>
                  <Ionicons
                    name="cube"
                    size={16}
                    color={tipoItem === 'produto' ? '#fff' : '#10a2a7'}
                  />
                  <Text
                    style={[
                      localStyles.tipoButtonText,
                      tipoItem === 'produto' &&
                        localStyles.tipoButtonTextActive,
                    ]}>
                    Produto
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    localStyles.tipoButton,
                    tipoItem === 'servico' && localStyles.tipoButtonActive,
                  ]}
                  onPress={() => {
                    setTipoItem('servico')
                    setIsPisos(false)
                    setItemForm({
                      ...itemForm,
                      item_prod: '',
                      item_unit: '',
                      item_codigo: '',
                    })
                  }}>
                  <Ionicons
                    name="construct"
                    size={16}
                    color={tipoItem === 'servico' ? '#fff' : '#10a2a7'}
                  />
                  <Text
                    style={[
                      localStyles.tipoButtonText,
                      tipoItem === 'servico' &&
                        localStyles.tipoButtonTextActive,
                    ]}>
                    Serviço
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Switch para cálculo de pisos */}
              {tipoItem === 'produto' && (
                <View style={localStyles.pisosSwitch}>
                  <View style={localStyles.pisosSwitchContent}>
                    <Ionicons name="grid" size={20} color="#10a2a7" />
                    <Text style={localStyles.pisosSwitchLabel}>
                      Cálculo para Pisos
                    </Text>
                  </View>
                  <Switch
                    value={isPisos}
                    onValueChange={(value) => {
                      setIsPisos(value)
                      if (!value) {
                        setItemForm({
                          ...itemForm,
                          item_m2: '',
                          item_nome_ambi: '',
                          item_queb: '0',
                          item_caix: '',
                          item_tipo_calculo: 'normal',
                        })
                      } else {
                        setItemForm({
                          ...itemForm,
                          item_tipo_calculo: 'pisos',
                        })
                      }
                    }}
                    trackColor={{ false: '#ddd', true: '#10a2a7' }}
                    thumbColor={isPisos ? '#fff' : '#f4f3f4'}
                  />
                </View>
              )}

              {/* Campo de busca */}
              <View style={styles.fieldGroup}>
                <View style={styles.fieldIcon}>
                  <Ionicons name="search" size={20} color="#10a2a7" />
                </View>
                <View style={styles.fieldContent}>
                  <Text style={styles.fieldLabel}>
                    {tipoItem === 'produto'
                      ? 'Buscar Produto'
                      : 'Buscar Serviço'}
                  </Text>
                  {tipoItem === 'produto' ? (
                    <BuscaProdutoInput
                      onSelect={handleSelecionarProduto}
                      initialValue={itemForm.item_prod}
                    />
                  ) : (
                    <BuscaServicoInput
                      onSelect={handleSelecionarServico}
                      valorAtual={itemForm.item_prod}
                    />
                  )}
                </View>
              </View>

              {/* Campos específicos para pisos */}
              {isPisos && (
                <View style={localStyles.pisosSection}>
                  <Text style={localStyles.pisosSectionTitle}>
                    <Ionicons name="grid" size={16} color="#10a2a7" /> Dados do
                    Ambiente
                  </Text>

                  {/* Nome do ambiente */}
                  <View style={styles.fieldGroup}>
                    <View style={styles.fieldIcon}>
                      <Ionicons name="home" size={20} color="#10a2a7" />
                    </View>
                    <View style={styles.fieldContent}>
                      <Text style={styles.fieldLabel}>Nome do Ambiente *</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Ex: Sala, Quarto, Cozinha"
                        placeholderTextColor="#666"
                        value={itemForm.item_nome_ambi}
                        onChangeText={(text) =>
                          setItemForm({ ...itemForm, item_nome_ambi: text })
                        }
                      />
                    </View>
                  </View>

                  {/* Metragem e Quebra */}
                  <View style={localStyles.row}>
                    <View
                      style={[styles.fieldGroup, { flex: 1, marginRight: 8 }]}>
                      <View style={styles.fieldIcon}>
                        <Ionicons name="resize" size={20} color="#10a2a7" />
                      </View>
                      <View style={styles.fieldContent}>
                        <Text style={styles.fieldLabel}>Metragem (m²) *</Text>
                        <TextInput
                          style={styles.textInput}
                          placeholder="0,00"
                          placeholderTextColor="#666"
                          value={itemForm.item_m2}
                          onChangeText={(text) =>
                            setItemForm({ ...itemForm, item_m2: text })
                          }
                          keyboardType="numeric"
                        />
                      </View>
                    </View>
                    <View
                      style={[styles.fieldGroup, { flex: 1, marginLeft: 8 }]}>
                      <View style={styles.fieldIcon}>
                        <Ionicons
                          name="trending-up"
                          size={20}
                          color="#10a2a7"
                        />
                      </View>
                      <View style={styles.fieldContent}>
                        <Text style={styles.fieldLabel}>Quebra (%)</Text>
                        <TextInput
                          style={styles.textInput}
                          placeholder="10"
                          placeholderTextColor="#666"
                          value={itemForm.item_queb}
                          onChangeText={(text) =>
                            setItemForm({ ...itemForm, item_queb: text })
                          }
                          keyboardType="numeric"
                        />
                      </View>
                    </View>
                  </View>

                  {/* Botão calcular metragem */}
                  <TouchableOpacity
                    style={[
                      localStyles.calcularButton,
                      (calculandoMetragem ||
                        !itemForm.item_m2 ||
                        !itemForm.item_codigo) &&
                        localStyles.calcularButtonDisabled,
                    ]}
                    onPress={calcularMetragemPisos}
                    disabled={
                      calculandoMetragem ||
                      !itemForm.item_m2 ||
                      !itemForm.item_codigo
                    }>
                    {calculandoMetragem ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Ionicons name="calculator" size={16} color="#fff" />
                    )}
                    <Text style={localStyles.calcularButtonText}>
                      {calculandoMetragem
                        ? 'Calculando...'
                        : !itemForm.item_codigo
                        ? 'Selecione um produto primeiro'
                        : !itemForm.item_m2
                        ? 'Informe a metragem'
                        : 'Calcular Metragem'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Descrição adicional */}
              <View style={styles.fieldGroup}>
                <View style={styles.fieldIcon}>
                  <Ionicons name="document-text" size={20} color="#10a2a7" />
                </View>
                <View style={styles.fieldContent}>
                  <Text style={styles.fieldLabel}>Descrição Adicional</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    placeholder="Descrição adicional do item"
                    placeholderTextColor="#666"
                    value={itemForm.item_desc_prod}
                    onChangeText={(text) =>
                      setItemForm({ ...itemForm, item_desc_prod: text })
                    }
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </View>

              {/* Campos específicos para pisos */}
              {isPisos && (
                <View style={localStyles.pisosQuantidades}>
                  <Text style={localStyles.pisosSectionTitle}>
                    <Ionicons name="calculator" size={16} color="#10a2a7" /> Quantidades Calculadas
                  </Text>
                  
                  <View style={localStyles.row}>
                    <View style={[styles.fieldGroup, { flex: 1, marginRight: 8 }]}>
                      <View style={styles.fieldIcon}>
                        <Ionicons name="cube-outline" size={20} color="#10a2a7" />
                      </View>
                      <View style={styles.fieldContent}>
                        <Text style={styles.fieldLabel}>Caixas Necessárias</Text>
                        <TextInput
                          style={[styles.textInput, localStyles.readOnlyInput]}
                          placeholder="0"
                          placeholderTextColor="#666"
                          value={dadosCalculo?.caixas_necessarias?.toString() || itemForm.item_quan || '0'}
                          editable={false}
                        />
                      </View>
                    </View>
                    
                    <View style={[styles.fieldGroup, { flex: 1, marginLeft: 8 }]}>
                      <View style={styles.fieldIcon}>
                        <Ionicons name="apps" size={20} color="#10a2a7" />
                      </View>
                      <View style={styles.fieldContent}>
                        <Text style={styles.fieldLabel}>
                          {(() => {
                            const unid = (itemForm.item_unli || '').toUpperCase()
                              .replace('METRO QUADRADO', 'M2')
                              .replace('M²', 'M2')
                              .replace('PEÇA', 'PC')
                              .replace('PÇ', 'PC')
                              .replace('BARRA', 'PC');
                            
                            if (unid === 'M2' || unid === 'M²' || unid === 'm2' || unid === 'm²') {
                              return 'Metros Quadrados';
                            } else if (unid === 'PC' || unid === 'PÇ' || unid === 'PEÇA') {
                              return 'Peças Totais';
                            } else {
                              return 'Quantidade Total';
                            }
                          })()}
                        </Text>
                        <TextInput
                          style={[styles.textInput, localStyles.readOnlyInput]}
                          placeholder="0"
                          placeholderTextColor="#666"
                          value={(() => {
                            const unid = (itemForm.item_unli || '').toUpperCase()
                              .replace('METRO QUADRADO', 'M2')
                              .replace('M²', 'M2')
                              .replace('PEÇA', 'PC')
                              .replace('PÇ', 'PC')
                              .replace('BARRA', 'PC');
                            
                            if (unid === 'M2' || unid === 'M²' || unid === 'm2' || unid === 'm²') {
                              // Para M2, mostrar a metragem real calculada
                              return dadosCalculo?.metragem_real?.toString() || 
                                     (dadosCalculo?.caixas_necessarias && dadosCalculo?.m2_por_caixa ? 
                                      (Number(dadosCalculo.caixas_necessarias) * Number(dadosCalculo.m2_por_caixa)).toString() : '0');
                            } else if (unid === 'PC' || unid === 'PÇ' || unid === 'PEÇA') {
                              // Para peças, mostrar as peças necessárias
                              return dadosCalculo?.pecas_necessarias?.toString() || 
                                     (dadosCalculo?.caixas_necessarias && dadosCalculo?.pc_por_caixa ? 
                                      (Number(dadosCalculo.caixas_necessarias) * Number(dadosCalculo.pc_por_caixa)).toString() : '0');
                            } else {
                              // Para outras unidades, mostrar as caixas
                              return dadosCalculo?.caixas_necessarias?.toString() || '0';
                            }
                          })()}
                          editable={false}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              )}

              {/* Quantidade e Unidade */}
              <View style={localStyles.row}>
                <View style={[styles.fieldGroup, { flex: 1, marginRight: 8 }]}>
                  <View style={styles.fieldIcon}>
                    <Ionicons name="calculator" size={20} color="#10a2a7" />
                  </View>
                  <View style={styles.fieldContent}>
                    <Text style={styles.fieldLabel}>Quantidade *</Text>
                    <TextInput
                      style={[
                        styles.textInput,
                        isPisos && localStyles.readOnlyInput
                      ]}
                      placeholder="0"
                      placeholderTextColor="#666"
                      value={(() => {
                        if (isPisos && dadosCalculo) {
                          const unid = (itemForm.item_unli || '').toUpperCase()
                            .replace('METRO QUADRADO', 'M2')
                            .replace('M²', 'M2')
                            .replace('PEÇA', 'PC')
                            .replace('PÇ', 'PC')
                            .replace('BARRA', 'PC');
                          
                          if (unid === 'M2' || unid === 'M²' || unid === 'm2' || unid === 'm²') {
                            // Para M2, usar a metragem real calculada
                            return dadosCalculo?.metragem_real?.toString() || 
                                   (dadosCalculo?.caixas_necessarias && dadosCalculo?.m2_por_caixa ? 
                                    (Number(dadosCalculo.caixas_necessarias) * Number(dadosCalculo.m2_por_caixa)).toString() : '0');
                          } else if (unid === 'PC' || unid === 'PÇ' || unid === 'PEÇA') {
                            // Para peças, usar as peças necessárias
                            return dadosCalculo?.pecas_necessarias?.toString() || 
                                   (dadosCalculo?.caixas_necessarias && dadosCalculo?.pc_por_caixa ? 
                                    (Number(dadosCalculo.caixas_necessarias) * Number(dadosCalculo.pc_por_caixa)).toString() : '0');
                          } else {
                            // Para outras unidades, usar as caixas
                            return dadosCalculo?.caixas_necessarias?.toString() || '0';
                          }
                        }
                        return itemForm.item_quan;
                      })()}
                      onChangeText={(text) =>
                        setItemForm({ ...itemForm, item_quan: text })
                      }
                      keyboardType="numeric"
                      editable={!isPisos}
                    />
                  </View>
                </View>
                <View style={[styles.fieldGroup, { flex: 1, marginLeft: 8 }]}>
                  <View style={styles.fieldIcon}>
                    <Ionicons name="cube" size={20} color="#10a2a7" />
                  </View>
                  <View style={styles.fieldContent}>
                    <Text style={styles.fieldLabel}>Unidade</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="UN"
                      placeholderTextColor="#666"
                      value={itemForm.item_unli}
                      onChangeText={(text) =>
                        setItemForm({ ...itemForm, item_unli: text })
                      }
                      editable={!isPisos}
                    />
                  </View>
                </View>
              </View>

              {/* Valor Unitário e Desconto */}
              <View style={localStyles.row}>
                <View style={[styles.fieldGroup, { flex: 1, marginRight: 8 }]}>
                  <View style={styles.fieldIcon}>
                    <Ionicons name="cash" size={20} color="#10a2a7" />
                  </View>
                  <View style={styles.fieldContent}>
                    <Text style={styles.fieldLabel}>Valor Unitário *</Text>
                    <TextInput
                      style={[
                        styles.textInput,
                        isPisos && localStyles.readOnlyInput
                      ]}
                      placeholder="0,00"
                      placeholderTextColor="#666"
                      value={itemForm.item_unit}
                      onChangeText={(text) =>
                        setItemForm({ ...itemForm, item_unit: text })
                      }
                      keyboardType="numeric"
                      editable={!isPisos}
                    />
                  </View>
                </View>
                <View style={[styles.fieldGroup, { flex: 1, marginLeft: 8 }]}>
                  <View style={styles.fieldIcon}>
                    <Ionicons name="pricetag" size={20} color="#10a2a7" />
                  </View>
                  <View style={styles.fieldContent}>
                    <Text style={styles.fieldLabel}>Desconto (%)</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="0"
                      placeholderTextColor="#666"
                      value={itemForm.item_desc}
                      onChangeText={(text) =>
                        setItemForm({ ...itemForm, item_desc: text })
                      }
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>

              {/* Observações */}
              <View style={styles.fieldGroup}>
                <View style={styles.fieldIcon}>
                  <Ionicons name="chatbox" size={20} color="#10a2a7" />
                </View>
                <View style={styles.fieldContent}>
                  <Text style={styles.fieldLabel}>Observações</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    placeholder="Observações sobre o item"
                    placeholderTextColor="#666"
                    value={itemForm.item_obse}
                    onChangeText={(text) =>
                      setItemForm({ ...itemForm, item_obse: text })
                    }
                    multiline
                    numberOfLines={2}
                  />
                </View>
              </View>
            </ScrollView>

            {/* Exibir valor total calculado */}
            {(isPisos && dadosCalculo) || (!isPisos && itemForm.item_quan && itemForm.item_unit) ? (
              <View style={localStyles.totalContainer}>
                <Text style={localStyles.totalLabel}>Total do Item:</Text>
                <Text style={localStyles.totalValue}>
                  R$ {calcularTotal().toFixed(2)}
                </Text>
              </View>
            ) : null}

            {/* Botões do modal melhorados */}
            <View style={localStyles.modalButtons}>
              <TouchableOpacity
                style={localStyles.modalButtonCancel}
                onPress={() => {
                  setModalVisible(false)
                  resetForm()
                }}>
                <Ionicons name="close" size={16} color="#666" />
                <Text style={localStyles.modalButtonCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={localStyles.modalButtonSave}
                onPress={salvarItem}>
                <Ionicons name="checkmark" size={16} color="#fff" />
                <Text style={localStyles.modalButtonSaveText}>
                  {editingItem ? 'Atualizar' : 'Adicionar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

// Estilos locais melhorados com dark mode e UX aprimorada
const localStyles = {
  headerItens: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  valorTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10a2a7',
    backgroundColor: '#1a252f',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a3441',
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  addButton: {
    flex: 1,
    backgroundColor: '#10a2a7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 15,
  },
  exportButton: {
    flex: 1,
    backgroundColor: '#28a745',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  exportButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 15,
  },
  itemCard: {
    backgroundColor: '#1a252f',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#2a3441',
    borderLeftWidth: 4,
    borderLeftColor: '#10a2a7',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemProduto: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    marginRight: 12,
    lineHeight: 22,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#ffc107',
    padding: 10,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  itemDescricao: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 12,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  pisosInfo: {
    backgroundColor: '#0d1421',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a3441',
    borderLeftWidth: 3,
    borderLeftColor: '#17a2b8',
  },
  pisosLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemDetalhes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0d1421',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a3441',
    marginTop: 8,
  },
  detalhesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  detalheItem: {
    alignItems: 'center',
    flex: 1,
  },
  itemDetalhesVertical: {
    backgroundColor: '#0d1421',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a3441',
    marginTop: 8,
    gap: 12,
  },
  detalheItemVertical: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detalheLabel: {
    fontSize: 11,
    color: '#9ca3af',
    marginBottom: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detalheValor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  itemQuantidade: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  itemUnidade: {
    fontSize: 14,
    color: '#10a2a7',
    fontWeight: '600',
  },
  itemValor: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
  },
  loading: {
    marginTop: 50,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 16,
    marginTop: 50,
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a252f',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    elevation: 15,
    borderWidth: 1,
    borderColor: '#2a3441',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#2a3441',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 8,
    backgroundColor: '#2a3441',
    borderRadius: 8,
  },
  scrollContent: {
    padding: 24,
    maxHeight: 500,
  },
  tipoSelector: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: '#0d1421',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#2a3441',
  },
  tipoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  tipoButtonActive: {
    backgroundColor: '#10a2a7',
    elevation: 2,
  },
  tipoButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
  },
  tipoButtonTextActive: {
    color: '#fff',
  },
  pisosSwitch: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0d1421',
    padding: 18,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2a3441',
  },
  pisosSwitchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pisosSwitchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  pisosSection: {
    backgroundColor: '#0d1421',
    padding: 18,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2a3441',
    borderLeftWidth: 3,
    borderLeftColor: '#10a2a7',
  },
  pisosQuantidades: {
    backgroundColor: '#1a2332',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2a3441',
  },
  readOnlyInput: {
    backgroundColor: '#2a3441',
    color: '#adb5bd',
    opacity: 0.8,
  },
  pisosSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10a2a7',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  calcularButton: {
    backgroundColor: '#17a2b8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
    elevation: 3,
  },
  calcularButtonDisabled: {
    backgroundColor: '#6c757d',
    opacity: 0.6,
  },
  calcularButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#2a3441',
    gap: 12,
  },
  modalButtonCancel: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#2a3441',
    borderWidth: 1,
    borderColor: '#3a4651',
    gap: 8,
  },
  modalButtonCancelText: {
    color: '#9ca3af',
    fontWeight: '600',
    fontSize: 15,
  },
  modalButtonSave: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#10a2a7',
    elevation: 3,
    gap: 8,
  },
  modalButtonSaveText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#0d1421',
    borderTopWidth: 1,
    borderTopColor: '#2a3441',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10a2a7',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
  },
}
