import { Alert } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { apiPostComContexto, apiPutComContexto } from '../utils/api'

const ORCAMENTO_PISOS_CACHE_ID = 'orcamento-pisos-edicao-cache'

export const calcularTotal = (itens) => {
  return itens.reduce((total, item) => {
    const quantidade = parseFloat(item.item_quan || 0)
    const preco = parseFloat(item.item_unit || 0)
    return total + (quantidade * preco || 0)
  }, 0)
}

export const processarSalvarOrcamento = async ({
  orcamento,
  orcamentoParam,
  setSalvando,
  navigation,
}) => {
  console.log('🔍 [SALVAR-ORCAMENTO] Iniciando salvamento do orçamento')
  console.log('🔍 [SALVAR-ORCAMENTO] Estado atual do orçamento:', orcamento)

  if (!orcamento.orca_clie) {
    console.log(
      '❌ [SALVAR-ORCAMENTO] Cliente não selecionado - orca_clie:',
      orcamento.orca_clie,
    )
    Alert.alert('Atenção', 'Selecione um cliente para o orcamento')
    return
  }
  console.log(
    '✅ [SALVAR-ORCAMENTO] Cliente validado - orca_clie:',
    orcamento.orca_clie,
  )

  if (!orcamento.itens_input || orcamento.itens_input.length === 0) {
    console.log(
      '❌ [SALVAR-ORCAMENTO] Nenhum item no orçamento - itens_input:',
      orcamento.itens_input,
    )
    Alert.alert('Atenção', 'Adicione pelo menos um item ao orcamento')
    return
  }
  console.log(
    '✅ [SALVAR-ORCAMENTO] Itens validados - quantidade:',
    orcamento.itens_input.length,
  )

  setSalvando(true)
  try {
    // Calcular total dos itens
    const totalItens = calcularTotal(orcamento.itens_input)
    console.log('🔍 [SALVAR-ORCAMENTO] Total dos itens calculado:', totalItens)

    // Aplicar desconto geral e frete
    const descontoGeral = Number(orcamento.orca_desc) || 0
    const frete = Number(orcamento.orca_fret) || 0
    const totalFinal = totalItens - descontoGeral + frete
    console.log('🔍 [SALVAR-ORCAMENTO] Desconto geral:', descontoGeral)
    console.log('🔍 [SALVAR-ORCAMENTO] Frete:', frete)
    console.log('🔍 [SALVAR-ORCAMENTO] Total final:', totalFinal)

    const dadosOrcamento = {
      ...orcamento,
      orca_tota: totalFinal,
      // Converter boolean para string
      orca_ajus_port: orcamento.orca_ajus_port ? 'true' : 'false',
      orca_degr_esca: orcamento.orca_degr_esca ? 'true' : 'false',
    }
    console.log(
      '🔍 [SALVAR-ORCAMENTO] Dados do orçamento preparados para envio:',
      dadosOrcamento,
    )

    let response
    if (orcamentoParam && orcamentoParam.orca_nume) {
      console.log(
        '🔍 [SALVAR-ORCAMENTO] Atualizando orçamento existente:',
        orcamentoParam.orca_nume,
      )
      response = await apiPutComContexto(
        `pisos/orcamentos-pisos/${orcamentoParam.orca_nume}/`,
        dadosOrcamento,
      )
      console.log('✅ [SALVAR-ORCAMENTO] Response da atualização:', response)
    } else {
      console.log('🔍 [SALVAR-ORCAMENTO] Criando novo orçamento')
      response = await apiPostComContexto(
        'pisos/orcamentos-pisos/',
        dadosOrcamento,
      )
      console.log('✅ [SALVAR-ORCAMENTO] Response da criação:', response)
    }

    await AsyncStorage.removeItem(ORCAMENTO_PISOS_CACHE_ID)

    return response
  } catch (error) {
    console.error('Erro ao salvar orçamento:', error)
    Alert.alert(
      'Erro',
      error.response?.data?.detail || 'Não foi possível salvar o orçamento',
    )
    throw error
  } finally {
    setSalvando(false)
  }
}
