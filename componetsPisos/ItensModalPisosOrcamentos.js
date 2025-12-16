import React, { useState, useEffect } from 'react'
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import BuscaProdutosInput from '../components/BuscaProdutosInput'
import { apiGetComContexto, apiPostComContexto } from '../utils/api'
import { useContextoApp } from '../hooks/useContextoApp'

export default function ItensModalPisosOrcamentos({
  visible,
  onClose,
  onSave,
  item = null,
  orcamento = {},
}) {
  const { cliente } = useContextoApp()
  const [produto, setProduto] = useState(null)
  const [quantidade, setQuantidade] = useState('')
  const [precoUnitario, setPrecoUnitario] = useState('')
  const [areaM2, setAreaM2] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [carregandoProduto, setCarregandoProduto] = useState(false)
  const [calculandoMetragem, setCalculandoMetragem] = useState(false)
  const [dadosCalculo, setDadosCalculo] = useState(null)
  const [quebra, setQuebra] = useState('0')
  const [condicaoPagamento, setCondicaoPagamento] = useState('0')
  const [ambiente, setAmbiente] = useState('')
  const [nomeAmbiente, setNomeAmbiente] = useState('')

  useEffect(() => {
    if (item) {
      // Editando item existente
      setProduto({
        prod_codi: item.item_prod,
        prod_nome: item.produto_nome,
        prod_prec: item.item_unit,
        prod_area: item.area_m2,
        

      })
      setQuantidade(String(item.item_quan || ''))
      setPrecoUnitario(String(item.item_unit || ''))
      setAreaM2(String(item.area_m2 || ''))
      setObservacoes(item.observacoes || '')
      setAmbiente(item.ambiente || '')
      setNomeAmbiente(item.nome_ambiente || '')
      setQuebra(item.item_queb || '')
    } else {
      // Novo item
      limparCampos()
    }
  }, [item, visible])

  const limparCampos = () => {
    setProduto(null)
    setQuantidade('')
    setPrecoUnitario('')
    setAreaM2('')
    setObservacoes('')
    setDadosCalculo(null)
    setQuebra('')
    setCondicaoPagamento('0')
    setAmbiente('')
    setNomeAmbiente('')
  }

  const buscarDadosProduto = async (produtoSelecionado) => {
    if (!produtoSelecionado?.prod_codi) return

    setCarregandoProduto(true)
    try {
      // Validar cliente - usar cliente do contexto ou do orçamento
      const clienteId = cliente?.clie_codi || orcamento?.orca_clie
      
      if (!clienteId) {
        Alert.alert('Erro', 'Cliente não identificado. Verifique se há um cliente selecionado.')
        setCarregandoProduto(false)
        return
      }
      
      // Corrigir: usar POST e enviar dados no body
      const response = await apiPostComContexto(
        'pisos/produtos-pisos/calcular_metragem/',
        {
          produto_id: produtoSelecionado.prod_codi,
          tamanho_m2: parseFloat(areaM2) || 0,
          percentual_quebra: parseFloat(quebra) || 0,
          cliente_id: clienteId,
          condicao: condicaoPagamento,
          ambiente: ambiente,
          nome_ambiente: nomeAmbiente,

        }
      )

      if (response) {
      setProduto({
        ...produtoSelecionado,
        prod_prec: response.preco_unitario || produtoSelecionado.prod_prec,
        prod_unme: response.unidade_medida || produtoSelecionado.prod_unme, // <- unidade (PC, M2, etc)
      })
      setPrecoUnitario(
        String(response.preco_unitario || produtoSelecionado.prod_prec || '')
      )
    } else {
      setProduto({
        ...produtoSelecionado,
        prod_unme: produtoSelecionado.prod_unme || 'M2',
      })
      setPrecoUnitario(String(produtoSelecionado.prod_prec || ''))
    }

    } finally {
      setCarregandoProduto(false)
    }
  }

  const calcularMetragem = async () => {
    console.log('🚀 [ORCAMENTOS-MODAL] calcularMetragem INICIADA')
    console.log('📊 [ORCAMENTOS-MODAL] Dados atuais:', {
      produto: produto?.prod_nome,
      areaM2,
      quebra,
      condicaoPagamento,
      ambiente,
      nomeAmbiente,
      orcamento_completo: orcamento
    })
    setCalculandoMetragem(true)
    try {
    
      const clienteId = orcamento?.orca_clie
      const dadosRequisicao = {
        produto_id: produto.prod_codi,
        tamanho_m2: parseFloat(areaM2),
        percentual_quebra: parseFloat(quebra) || 0,
        cliente_id: clienteId,
        condicao: condicaoPagamento,
        ambiente: ambiente,
        nome_ambiente: nomeAmbiente,
      }
      
      console.log('📤 [ORCAMENTOS-MODAL] Dados da requisição:', dadosRequisicao)
      
      const response = await apiPostComContexto(
        'pisos/produtos-pisos/calcular_metragem/',
        dadosRequisicao
      )

      console.log('✅ [ORCAMENTOS-MODAL] Resposta do cálculo:', response)

      if (response && response.caixas_necessarias && response.preco_unitario) {
        console.log('✅ [ORCAMENTOS-MODAL] Dados válidos recebidos:', {
          caixas_necessarias: response.caixas_necessarias,
          preco_unitario: response.preco_unitario,  
          m2_por_caixa: response.m2_por_caixa,
          pc_por_caixa: response.pc_por_caixa,  
        })
        
        setDadosCalculo(response)
        const caixasCalc = Number(response.caixas_necessarias) || 0
        setQuantidade(String(caixasCalc))
        setPrecoUnitario(String(response.preco_unitario))
        console.log('✅ [ORCAMENTOS-MODAL] Valores atualizados com sucesso')
      } else {
        console.log('⚠️ [ORCAMENTOS-MODAL] Resposta inválida ou incompleta:', response)
        
      }
    } catch (error) {
      console.error('❌ [ORCAMENTOS-MODAL] Erro ao calcular metragem:', error)
      Alert.alert(
        'Erro',
        'Não foi possível calcular a metragem. Verifique os dados do produto.'
      )
    } finally {
      setCalculandoMetragem(false)
      console.log('🏁 [ORCAMENTOS-MODAL] calcularMetragem FINALIZADA')
    }
  }

    const calcularTotal = () => {
    // Se temos o valor_total da API, usar ele diretamente (já inclui impostos/margens)
    if (dadosCalculo?.valor_total) {
      return Number(dadosCalculo.valor_total)
    }

    const preco = Number(precoUnitario) || 0
    const unid = (produto?.prod_unme || '').toUpperCase()
      .replace('METRO QUADRADO', 'M2')
      .replace('M²', 'M2')
      .replace('PEÇA', 'PC')
      .replace('PÇ', 'PC')
      .replace('BARRA', 'PC')
    const caixas = Number(dadosCalculo?.caixas_necessarias) || Number(quantidade) || 0

    // Para produtos com unidade M2, calcular baseado na metragem real
    if (unid === 'M2' || unid === 'M²' || unid === 'm2' || unid === 'm²') {
      // Se temos metragem_real da API, usar ela
      if (dadosCalculo?.metragem_real) {
        return Number(dadosCalculo.metragem_real) * preco
      }
      // Senão, calcular baseado em caixas e m2_por_caixa
      if (dadosCalculo?.m2_por_caixa > 0) {
        const totalM2 = Number(dadosCalculo.m2_por_caixa) * caixas
        return totalM2 * preco
      }
    }

    // Para produtos com unidade PC (peças), calcular baseado nas peças
    if (['PC', 'PÇ', 'PEÇA', 'BARRA'].includes(unid)) {
      // Se temos metragem_real da API (que para peças representa a quantidade real), usar ela
      if (dadosCalculo?.metragem_real) {
        return Number(dadosCalculo.metragem_real) * preco
      }
      // Senão, calcular baseado em caixas e pc_por_caixa
      if (dadosCalculo?.pc_por_caixa > 0) {
        const totalPecas = Number(dadosCalculo.pc_por_caixa) * caixas
        return totalPecas * preco
      }
    }

    // Fallback: usar área M2 diretamente
    const m2 = Number(areaM2) || 0
    return m2 * preco
  }



  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor || 0)
  }

  const validarCampos = () => {
    console.log('🔍 [ITENS-MODAL] Iniciando validação de campos')
    console.log('🔍 [ITENS-MODAL] Estado do orçamento:', orcamento)
    
    // Validação do cliente - usar a mesma lógica do cálculo de metragem
    const clienteId = orcamento?.orca_clie
    console.log('🔍 [ITENS-MODAL] Cliente ID:', clienteId)
    
    if (!clienteId && !orcamento?.orca_nume) {
      console.log('❌ [ITENS-MODAL] Cliente não selecionado')
     
      return false
    }
    console.log('✅ [ITENS-MODAL] Cliente validado')
    
    console.log('🔍 [ITENS-MODAL] Produto selecionado:', produto)
    
    if (!produto?.prod_codi) {
      console.log('❌ [ITENS-MODAL] Produto não selecionado')
      Alert.alert('Erro', 'Selecione um produto')
      return false
    }
    console.log('✅ [ITENS-MODAL] Produto validado')
    
    console.log('🔍 [ITENS-MODAL] Área M2:', areaM2)
    
    if (!areaM2 || Number(areaM2) <= 0) {
      console.log('❌ [ITENS-MODAL] Área M2 inválida')
      Alert.alert('Erro', 'Informe a metragem do ambiente (m²)')
      return false
    }
    console.log('✅ [ITENS-MODAL] Área M2 validada')
    
    console.log('🔍 [ITENS-MODAL] Preço unitário:', precoUnitario)
    
    if (!precoUnitario || Number(precoUnitario) < 0) {
      console.log('❌ [ITENS-MODAL] Preço unitário inválido')
      Alert.alert('Erro', 'Informe um preço unitário válido')
      return false
    }
    console.log('✅ [ITENS-MODAL] Preço unitário validado')
    console.log('✅ [ITENS-MODAL] Todas as validações passaram')
    
    return true
  }

  const handleSalvar = () => {  
    if (!validarCampos()) {
      console.log('❌ [ITENS-MODAL] Validação falhou, cancelando salvamento')
      return
    }

    const caixasCalculadas = dadosCalculo
      ? Number(dadosCalculo?.caixas_necessarias) || 0
      : Number(quantidade) || 0

    const itemData = {
      // Campos obrigatórios do modelo
      item_empr: orcamento.orca_empr || empresaId,
      item_fili: orcamento.orca_fili || filialId,
      item_orca: orcamento.orca_nume || '0', // Usar '0' em vez de null
      item_prod: produto.prod_codi,
      item_queb: quebra,
      produto_nome: produto.prod_nome,
      item_caix: caixasCalculadas,

      item_m2: Number(areaM2) || 0,

      item_quan:
      produto?.prod_unme?.toUpperCase() === 'M2'
        ? (Number(dadosCalculo?.m2_por_caixa) || 0) * caixasCalculadas
        : (Number(dadosCalculo?.pc_por_caixa) || 0) * caixasCalculadas,

      item_unit: Number(precoUnitario),
      item_suto: calcularTotal(),
      // Observações mapeadas para campo correto
      item_obse: observacoes.trim() || null,
      item_ambi: ambiente.trim() || null, // Campo obrigatório
      item_nome_ambi: nomeAmbiente.trim() || null, // Campo obrigatório
      // Campos específicos para pisos
      produto_tipo: 'PISO',
      desconto_item_disponivel: false,
      percentual_desconto: 0,
      // Dados do cálculo se disponível
      dados_calculo: dadosCalculo,
    }

    console.log('💾 [ITENS-MODAL] Item data construído:', itemData)
    console.log('💾 [ITENS-MODAL] item_empr:', itemData.item_empr)
    console.log('💾 [ITENS-MODAL] item_fili:', itemData.item_fili)
    console.log('💾 [ITENS-MODAL] item_orca:', itemData.item_orca)
    console.log('💾 [ITENS-MODAL] Chamando onSave com itemData')

    onSave(itemData)
    onClose()
  }

  const handleFechar = () => {
    limparCampos()
    onClose()
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleFechar}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleFechar} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color="#ff9999" />
          </TouchableOpacity>
          <Text style={styles.title}>
            {item ? 'Editar Item' : 'Adicionar Item'}
          </Text>
          <TouchableOpacity onPress={handleSalvar} style={styles.saveButton}>
            <MaterialIcons name="check" size={24} color="#a8e6cf" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Produto</Text>
            <BuscaProdutosInput
              value={produto}
              onSelect={buscarDadosProduto}
              placeholder="Buscar produto..."
              loading={carregandoProduto}
            />
          </View>

          {produto && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Nº Ambiente</Text>
                <TextInput
                  style={styles.input}
                  value={ambiente}
                  onChangeText={setAmbiente}
                  placeholder="000"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                />
                <Text style={styles.sectionTitle}>Nome Ambiente</Text>
                <TextInput
                  style={styles.input}
                  value={nomeAmbiente}
                  onChangeText={setNomeAmbiente}
                  placeholder="Nome do Ambiente"
                  placeholderTextColor="#666"
                />
                <Text style={styles.sectionTitle}>Cálculo de Metragem</Text>

                <View style={styles.calculoContainer}>
                  <View style={styles.fieldRow}>
                    <View style={styles.fieldContainer}>
                      <Text style={styles.label}>Área (m²) *</Text>
                      <TextInput
                        style={styles.input}
                        value={areaM2}
                        onChangeText={setAreaM2}
                        placeholder="0,00"
                        placeholderTextColor="#666"
                        keyboardType="numeric"
                      />
                    </View>

                    <View style={styles.fieldContainer}>
                      <Text style={styles.label}>Quebra (%)</Text>
                      <TextInput
                        style={styles.input}
                        value={quebra}
                        onChangeText={setQuebra}
                        placeholder="5"
                        placeholderTextColor="#666"
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Condição de Pagamento</Text>
                    <View style={styles.condicaoContainer}>
                      <TouchableOpacity
                        style={[
                          styles.condicaoButton,
                          condicaoPagamento === '0' &&
                            styles.condicaoButtonAtiva,
                        ]}
                        onPress={() => setCondicaoPagamento('0')}>
                        <Text
                          style={[
                            styles.condicaoText,
                            condicaoPagamento === '0' &&
                              styles.condicaoTextAtiva,
                          ]}>
                          À Vista
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.condicaoButton,
                          condicaoPagamento === '1' &&
                            styles.condicaoButtonAtiva,
                        ]}
                        onPress={() => setCondicaoPagamento('1')}>
                        <Text
                          style={[
                            styles.condicaoText,
                            condicaoPagamento === '1' &&
                              styles.condicaoTextAtiva,
                          ]}>
                          A Prazo
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.botaoCalcular}
                    onPress={calcularMetragem}
                    disabled={calculandoMetragem}>
                    {calculandoMetragem ? (
                      <ActivityIndicator size="small" color="#0a0a0a" />
                    ) : (
                      <MaterialIcons
                        name="calculate"
                        size={20}
                        color="#0a0a0a"
                      />
                    )}
                    <Text style={styles.botaoCalcularTexto}>
                      {calculandoMetragem
                        ? 'Calculando...'
                        : 'Calcular Metragem'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {dadosCalculo && (
                  <View style={styles.resultadoCalculo}>
                    <Text style={styles.resultadoTitulo}>
                      Resultado do Cálculo
                    </Text>

                    <View style={styles.resultadoItem}>
                      <Text style={styles.resultadoLabel}>Área real (com perda):</Text>
                      <Text style={styles.resultadoValor}>
                        {dadosCalculo?.metragem_total ?? '—'} m²
                      </Text>
                    </View>

                    <View style={styles.resultadoItem}>
                      <Text style={styles.resultadoLabel}>
                        Caixas necessárias:
                      </Text>
                      <Text style={styles.resultadoValor}>
                        {dadosCalculo?.caixas_necessarias}
                      </Text>
                    </View>

                    <View style={styles.resultadoItem}>
                      <Text style={styles.resultadoLabel}>Total de peças:</Text>
                      <Text style={styles.resultadoValor}>
                        {dadosCalculo?.pecas_necessarias}
                      </Text>
                    </View>

                    <View style={styles.resultadoItem}>
                      <Text style={styles.resultadoLabel}>Valor total:</Text>
                      <Text style={styles.resultadoValor}>
                        {formatarMoeda(dadosCalculo?.valor_total)}
                      </Text>
                      <Text style={[styles.resultadoValor, { marginTop: 4 }]}>
                        Unidade: {produto?.prod_unme || '—'}
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Detalhes do Item</Text>

                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Quantidade de Caixas*</Text>
                  <TextInput
                    style={styles.input}
                    value={quantidade}
                    onChangeText={setQuantidade}
                    placeholder="0,00"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Preço Unitário *</Text>
                  <TextInput
                    style={styles.input}
                    value={precoUnitario}
                    onChangeText={setPrecoUnitario}
                    placeholder="0,00"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Observações</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={observacoes}
                    onChangeText={setObservacoes}
                    placeholder="Observações sobre o item..."
                    placeholderTextColor="#666"
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </View>
            </>
          )}

          {produto && quantidade && precoUnitario && (
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total do Item:</Text>
              <Text style={styles.totalValue}>
                {formatarMoeda(calcularTotal())}
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    color: '#f5f5f5',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#a8e6cf',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  calculoContainer: {
    backgroundColor: 'rgba(168, 230, 207, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(168, 230, 207, 0.3)',
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 12,
  },
  fieldContainer: {
    flex: 1,
    marginBottom: 16,
  },
  label: {
    color: '#f5f5f5',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 8,
    color: '#f5f5f5',
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  condicaoContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  condicaoButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
  },
  condicaoButtonAtiva: {
    backgroundColor: 'rgba(168, 230, 207, 0.2)',
    borderColor: '#a8e6cf',
  },
  condicaoText: {
    color: '#f5f5f5',
    fontSize: 14,
    fontWeight: '500',
  },
  condicaoTextAtiva: {
    color: '#a8e6cf',
    fontWeight: '600',
  },
  botaoCalcular: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#a8e6cf',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  botaoCalcularTexto: {
    color: '#0a0a0a',
    fontWeight: '600',
    marginLeft: 8,
  },
  resultadoCalculo: {
    backgroundColor: 'rgba(168, 230, 207, 0.1)',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(168, 230, 207, 0.3)',
  },
  resultadoTitulo: {
    color: '#a8e6cf',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  resultadoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  resultadoLabel: {
    color: '#f5f5f5',
    fontSize: 14,
    fontWeight: '500',
  },
  resultadoValor: {
    color: '#a8e6cf',
    fontSize: 14,
    fontWeight: '600',
  },
  totalContainer: {
    backgroundColor: 'rgba(168, 230, 207, 0.1)',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#a8e6cf',
  },
  totalLabel: {
    color: '#f5f5f5',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  totalValue: {
    color: '#a8e6cf',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 30,
  },
})
