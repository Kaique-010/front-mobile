import React, { useState, useEffect, useMemo } from 'react'
import {
  View,
  Text,
  Linking,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native'
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import Toast from 'react-native-toast-message'

import { apiPostComContexto, apiGetComContexto, apiPutComContexto } from '../utils/api'
import { getStoredData } from '../services/storageService'
import RecebimentoModal from './RecebimentoModal'

export default function ResumoPedido({ total, pedido }) {
  const [slug, setSlug] = useState('')
  const [modalRecebimentoVisivel, setModalRecebimentoVisivel] = useState(false)
  const navigation = useNavigation()
  const [descontoHabilitado, setDescontoHabilitado] = useState(false)
  const [tipoDesconto, setTipoDesconto] = useState('percentual')
  const [percentualDesconto, setPercentualDesconto] = useState('')
  const [valorDesconto, setValorDesconto] = useState('')
  
  // Estados para controle de expansão
  const [resumoExpandido, setResumoExpandido] = useState(false)
  const [descontoExpandido, setDescontoExpandido] = useState(false)

  useEffect(() => {
    const carregarSlug = async () => {
      try {
        const { slug } = await getStoredData()
        if (slug) setSlug(slug)
      } catch (err) {
        console.error('Erro ao carregar slug:', err.message)
      }
    }
    carregarSlug()
  }, [])

  const itens = useMemo(() => pedido?.itens_input || [], [pedido?.itens_input])

  // Sincroniza controles com dados vindos do backend ao abrir/editar
  useEffect(() => {
    if (pedido) {
      console.log('🎯 [ResumoPedido] Dados do pedido recebidos:', {
        pedi_desc: pedido.pedi_desc,
        desconto_geral_aplicado: pedido.desconto_geral_aplicado,
        desconto_geral_tipo: pedido.desconto_geral_tipo,
        desconto_geral_percentual: pedido.desconto_geral_percentual,
        desconto_geral_valor: pedido.desconto_geral_valor,
      })

      // Verificar se há desconto aplicado
      const temDesconto = !!pedido.desconto_geral_aplicado || (pedido.pedi_desc && Number(pedido.pedi_desc) > 0);
      setDescontoHabilitado(temDesconto);
      
      // Definir tipo de desconto
      setTipoDesconto(pedido.desconto_geral_tipo || 'percentual');

      // Converter percentual de decimal para porcentagem
      if (temDesconto && (pedido.desconto_geral_tipo === 'percentual' || !pedido.desconto_geral_tipo)) {
        // Se temos percentual definido, usamos ele
        if (pedido.desconto_geral_percentual) {
          setPercentualDesconto(
            String((Number(pedido.desconto_geral_percentual) * 100).toFixed(2))
          );
        } 
        // Caso contrário, calculamos com base no desconto e subtotal
        else if (pedido.pedi_desc && pedido.pedi_topr) {
          const percentual = (Number(pedido.pedi_desc) / Number(pedido.pedi_topr)) * 100;
          setPercentualDesconto(String(percentual.toFixed(2)));
        } else {
          setPercentualDesconto('');
        }
      } else {
        setPercentualDesconto('');
      }

      // Converter valor para string
      if (temDesconto && (pedido.desconto_geral_tipo === 'valor' || !pedido.desconto_geral_tipo)) {
        // Prioridade: desconto_geral_valor > pedi_desc
        const valorDesc = pedido.desconto_geral_valor || pedido.pedi_desc || 0;
        setValorDesconto(String(valorDesc));
      } else {
        setValorDesconto('');
      }
    }
  }, [
    pedido?.pedi_desc,
    pedido?.pedi_topr,
    pedido?.desconto_geral_aplicado,
    pedido?.desconto_geral_tipo,
    pedido?.desconto_geral_percentual,
    pedido?.desconto_geral_valor,
  ])

  const calcularTotais = () => {
    const somaComDescontoItem = itens.reduce((acc, item) => {
      if (item?.desconto_item_disponivel) {
        const t = Number(item?.iped_tota) || 0
        return acc + t
      }
      return acc
    }, 0)

    const somaSemDescontoItem = itens.reduce((acc, item) => {
      if (!item?.desconto_item_disponivel) {
        const t = Number(item?.iped_tota)
        if (!isNaN(t)) return acc + t
        const q = Number(item?.iped_quan) || 0
        const u = Number(item?.iped_unit) || 0
        return acc + q * u
      }
      return acc
    }, 0)

    let descGeral = 0
    if (descontoHabilitado) {
      if (tipoDesconto === 'percentual') {
        const perc = Math.max(
          0,
          Math.min(100, parseFloat(percentualDesconto) || 0)
        )
        descGeral = (somaSemDescontoItem * perc) / 100
      } else {
        descGeral = Math.max(0, parseFloat(valorDesconto) || 0)
        descGeral = Math.min(descGeral, somaSemDescontoItem)
      }
    }

    const totalFinal = somaComDescontoItem + (somaSemDescontoItem - descGeral)
    return { somaComDescontoItem, somaSemDescontoItem, descGeral, totalFinal }
  }

  const { somaComDescontoItem, somaSemDescontoItem, descGeral, totalFinal } =
    calcularTotais()
  const totalComDescontoGeral = totalFinal

  const enviarZap = async () => {
    try {
      if (!pedido.pedi_forn) {
        Alert.alert('Erro', 'Cliente tem celular definido?.')
        return
      }
      const entidade = await apiGetComContexto(
        `entidades/entidades/${pedido.pedi_forn}/`
      )
      const numeroPedido = pedido.pedi_nume
      const numeroRaw = entidade.enti_celu || entidade.enti_fone || ''
      const numeroLimpo = numeroRaw.replace(/\D/g, '')
      if (numeroLimpo.length < 10) {
        Alert.alert(
          'Sem WhatsApp',
          'Essa entidade não possui número válido de WhatsApp.'
        )
        return
      }

      const numeroZap = `55${numeroLimpo}`
      const nomeCliente = entidade.enti_nome || 'Cliente'

      const corpo = (pedido.itens_input || [])
        .map((item, idx) => {
          const nome = item.produto_nome || 'Sem nome'
          const codigo = item.iped_prod || 'N/A'
          const qtd = Number(item.iped_quan || 0).toFixed(2)
          const valor = Number(item.iped_unit || 0).toFixed(2)
          return `${
            idx + 1
          }. ${nome} (Cód: ${codigo}) - Qtde: ${qtd} - R$ ${valor}`
        })
        .join('\n')

      const texto = `Novo pedido:  ${numeroPedido}!\nCliente: ${nomeCliente}\n\nItens:\n${corpo}\n\nTotal: R$ ${Number(
        totalComDescontoGeral
      ).toFixed(2)}`

      const url = `https://wa.me/${numeroZap}?text=${encodeURIComponent(texto)}`
      Linking.openURL(url)
    } catch (err) {
      console.error('❌ Erro ao enviar Zap:', err)
      Alert.alert('Erro', 'Falha ao consultar os dados da entidade.')
    }
  }

  const salvar = async () => {
    if (!pedido.pedi_empr || !pedido.pedi_fili) {
      Alert.alert(
        'Erro',
        'Empresa e filial precisam estar definidas antes de salvar.'
      )
      return
    }

    try {
      // Preparar payload limpo
      const pedi_topr = (pedido.itens_input || []).reduce((acc, it) => {
        const q = Number(it.iped_quan) || 0
        const u = Number(it.iped_unit) || 0
        return acc + q * u
      }, 0)

      const payload = {
        pedi_empr: Number(pedido.pedi_empr),
        pedi_fili: Number(pedido.pedi_fili),
        pedi_forn: Number(pedido.pedi_forn),
        pedi_vend: Number(pedido.pedi_vend),
        pedi_data: pedido.pedi_data,
        pedi_fina: Number(pedido.pedi_fina || 0),
        status: Number(pedido.status || 0),
        pedi_obse: pedido.pedi_obse || '',
        pedi_topr: Number(pedi_topr.toFixed(2)),
        pedi_tota: Number(
          (pedi_topr - (descontoHabilitado ? Number(descGeral) : 0)).toFixed(2)
        ),
        desconto_geral_aplicado: !!descontoHabilitado,
        desconto_geral_tipo: tipoDesconto,
        desconto_geral_percentual:
          descontoHabilitado && tipoDesconto === 'percentual'
            ? Math.max(0, Math.min(100, parseFloat(percentualDesconto) || 0)) /
              100
            : 0,
        desconto_geral_valor: descontoHabilitado ? Number(descGeral) : 0,
        pedi_desc: descontoHabilitado ? Number(descGeral) : 0,
        itens_input: (pedido.itens_input || []).map((item) => ({
          iped_prod: Number(item.iped_prod),
          iped_quan: Number(item.iped_quan),
          iped_unit: Number(item.iped_unit),
          iped_tota: Number(item.iped_tota),
          produto_nome: item.produto_nome,
          desconto_item_disponivel: !!item.desconto_item_disponivel,
          percentual_desconto: Number(item.percentual_desconto || 0),
          desconto_valor: Number(item.desconto_valor || 0),
        })),
      }

      console.log('📤 Enviando payload para salvar pedido:', JSON.stringify(payload, null, 2))

      let data
      if (pedido.pedi_nume) {
        // Editar pedido existente
        data = await apiPutComContexto(`pedidos/pedidos/${pedido.pedi_nume}/`, payload)
      } else {
        // Criar novo pedido
        data = await apiPostComContexto(`pedidos/pedidos/`, payload)
      }

      const pedi_nume = data.pedi_nume || 'desconhecido'

      Toast.show({
        type: 'success',
        text1: `Pedido #${pedi_nume} salvo com sucesso!`,
        position: 'bottom',
        visibilityTime: 3000,
      })

      // Navegar para a lista de pedidos
      navigation.navigate('Pedidos')
    } catch (error) {
      console.error('❌ Erro ao salvar pedido:', error)
      console.error('❌ Detalhes do erro:', error.response?.data || error.message)
      
      let mensagemErro = 'Falha ao salvar o pedido.'
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          mensagemErro = error.response.data
        } else if (error.response.data.detail) {
          mensagemErro = error.response.data.detail
        } else if (error.response.data.message) {
          mensagemErro = error.response.data.message
        }
      } else if (error.message) {
        mensagemErro = error.message
      }
      
      Alert.alert('Erro', mensagemErro)
    }
  }

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor || 0)
  }

  return (
    <View style={styles.container}>
      {/* Total Principal - Sempre visível */}
      <TouchableOpacity 
        style={styles.totalContainer}
        onPress={() => setResumoExpandido(!resumoExpandido)}
        activeOpacity={0.7}
      >
        <MaterialIcons name="shopping-cart" size={24} color="#2ecc71" />
        <Text style={styles.total}>
          Total: {formatarMoeda(totalComDescontoGeral)}
        </Text>
        <MaterialIcons 
          name={resumoExpandido ? "expand-less" : "expand-more"} 
          size={24} 
          color="#2ecc71" 
        />
      </TouchableOpacity>

      {/* Resumo Detalhado - Expansível */}
      {resumoExpandido && (
        <View style={styles.resumoBox}>
          <Text style={styles.resumoTitle}>Resumo Detalhado</Text>
          <View style={styles.resumoLinha}>
            <Text style={styles.resumoRotulo}>Itens com desconto:</Text>
            <Text style={styles.resumoValor}>{formatarMoeda(somaComDescontoItem)}</Text>
          </View>
          <View style={styles.resumoLinha}>
            <Text style={styles.resumoRotulo}>Itens sem desconto:</Text>
            <Text style={styles.resumoValor}>{formatarMoeda(somaSemDescontoItem)}</Text>
          </View>
          <View style={styles.resumoLinha}>
            <Text style={styles.resumoRotulo}>Desconto geral aplicado:</Text>
            <Text style={styles.resumoValorDesconto}>
              -{formatarMoeda(descGeral)}
            </Text>
          </View>
          <View style={[styles.resumoLinha, styles.totalFinalRow]}>
            <Text style={styles.resumoRotuloDestaque}>Total final:</Text>
            <Text style={styles.resumoValorDestaque}>
              {formatarMoeda(totalComDescontoGeral)}
            </Text>
          </View>
        </View>
      )}

      {/* Seção de Desconto - Expansível */}
      <View style={styles.descontoSection}>
        <TouchableOpacity 
          style={styles.descontoHeader}
          onPress={() => setDescontoExpandido(!descontoExpandido)}
          activeOpacity={0.7}
        >
          <View style={styles.descontoHeaderLeft}>
            <MaterialIcons name="local-offer" size={20} color="#2ecc71" />
            <Text style={styles.descontoLabel}>Desconto Geral</Text>
          </View>
          <View style={styles.descontoHeaderRight}>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation()
                setDescontoHabilitado((v) => !v)
              }}
              style={[
                styles.toggleBotao,
                { backgroundColor: descontoHabilitado ? '#2ecc71' : '#666' }
              ]}
            >
              <Text style={styles.toggleText}>
                {descontoHabilitado ? 'ON' : 'OFF'}
              </Text>
            </TouchableOpacity>
            <MaterialIcons 
              name={descontoExpandido ? "expand-less" : "expand-more"} 
              size={24} 
              color="#faebd7" 
            />
          </View>
        </TouchableOpacity>

        {descontoExpandido && descontoHabilitado && (
          <View style={styles.descontoContainer}>
            <View style={styles.tipoDescontoContainer}>
              <TouchableOpacity
                style={[
                  styles.tipoButton,
                  tipoDesconto === 'percentual' && styles.tipoButtonAtivo,
                ]}
                onPress={() => setTipoDesconto('percentual')}
              >
                <Text
                  style={[
                    styles.tipoButtonText,
                    tipoDesconto === 'percentual' && styles.tipoButtonTextAtivo,
                  ]}
                >
                  %
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tipoButton,
                  tipoDesconto === 'valor' && styles.tipoButtonAtivo,
                ]}
                onPress={() => setTipoDesconto('valor')}
              >
                <Text
                  style={[
                    styles.tipoButtonText,
                    tipoDesconto === 'valor' && styles.tipoButtonTextAtivo,
                  ]}
                >
                  R$
                </Text>
              </TouchableOpacity>
            </View>

            {tipoDesconto === 'percentual' ? (
              <TextInput
                style={styles.inputDesconto}
                placeholder="Ex: 10"
                placeholderTextColor="#666"
                value={percentualDesconto}
                onChangeText={setPercentualDesconto}
                keyboardType="numeric"
              />
            ) : (
              <TextInput
                style={styles.inputDesconto}
                placeholder="Ex: 50.00"
                placeholderTextColor="#666"
                value={valorDesconto}
                onChangeText={setValorDesconto}
                keyboardType="numeric"
              />
            )}

            <Text style={styles.descontoInfo}>
              Desconto aplicado: {formatarMoeda(descGeral)}
            </Text>
          </View>
        )}
      </View>

      {/* Botões de Ação */}
      <View style={styles.botoesContainer}>
        <TouchableOpacity style={styles.botaoSalvar} onPress={salvar}>
          <MaterialIcons name="save" size={20} color="#fff" />
          <Text style={styles.textoBotao}>Salvar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botaoZap} onPress={enviarZap}>
          <MaterialCommunityIcons name="whatsapp" size={20} color="#fff" />
          <Text style={styles.textoBotao}>Enviar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botaoReceber}
          onPress={() => setModalRecebimentoVisivel(true)}
        >
          <MaterialIcons name="payment" size={20} color="#fff" />
          <Text style={styles.textoBotao}>Receber</Text>
        </TouchableOpacity>
      </View>

      <RecebimentoModal
        visivel={modalRecebimentoVisivel}
        onFechar={() => setModalRecebimentoVisivel(false)}
        pedido={pedido}
        total={totalComDescontoGeral}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a252f',
    borderRadius: 12,
    padding: 16,
    margin: 8,
    borderWidth: 1,
    borderColor: '#2a3441',
  },
  totalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#0f1a24',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2ecc71',
    elevation: 2,
    shadowColor: '#2ecc71',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  total: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2ecc71',
    marginLeft: 8,
    flex: 1,
    textAlign: 'center',
  },
  descontoSection: {
    marginBottom: 20,
  },
  descontoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#0f1a24',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a3441',
  },
  descontoHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  descontoHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  descontoLabel: {
    color: '#faebd7',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  toggleBotao: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  toggleText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 11,
  },
  descontoContainer: {
    backgroundColor: '#0f1a24',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#2a3441',
  },
  tipoDescontoContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tipoButton: {
    flex: 1,
    backgroundColor: '#232935',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3a4651',
  },
  tipoButtonAtivo: {
    backgroundColor: '#2ecc71',
    borderColor: '#2ecc71',
  },
  tipoButtonText: {
    color: '#faebd7',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#232935',
    color: '#faebd7',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#3a4651',
    fontSize: 16,
  },
  resumoBox: {
    backgroundColor: '#0f1a24',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a3441',
  },
  resumoTitle: {
    color: '#2ecc71',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  resumoLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  resumoRotulo: {
    color: '#a0a0a0',
    fontSize: 14,
  },
  resumoValor: {
    color: '#faebd7',
    fontWeight: '600',
    fontSize: 14,
  },
  resumoValorDesconto: {
    color: '#ff6b6b',
    fontWeight: '600',
    fontSize: 14,
  },
  totalFinalRow: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 8,
    marginTop: 4,
  },
  resumoRotuloDestaque: {
    color: '#2ecc71',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resumoValorDestaque: {
    color: '#2ecc71',
    fontWeight: 'bold',
    fontSize: 16,
  },
  botoesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  botaoSalvar: {
    flex: 1,
    backgroundColor: '#2ecc71',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    elevation: 3,
    shadowColor: '#2ecc71',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  botaoWhatsapp: {
    flex: 1,
    backgroundColor: '#25D366',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    elevation: 3,
    shadowColor: '#25d366',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  botaoReceber: {
    flex: 1,
    backgroundColor: '#f39c12',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    elevation: 3,
    shadowColor: '#f39c12',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  textoBotao: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
})
