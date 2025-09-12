// Resumoorcamento.js
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

import {
  apiPostComContexto,
  apiGetComContexto,
  apiPutComContexto,
} from '../utils/api'
import { getStoredData } from '../services/storageService'

export default function ResumoOrcamento({ total, orcamento }) {
  const [slug, setSlug] = useState('')
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

  // Sincroniza controles com dados vindos do backend ao abrir/editar
  useEffect(() => {
    if (orcamento) {
      setDescontoHabilitado(!!orcamento.desconto_geral_aplicado)
      setTipoDesconto(orcamento.desconto_geral_tipo || 'percentual')
      setPercentualDesconto(
        orcamento.desconto_geral_percentual
          ? String((Number(orcamento.desconto_geral_percentual) || 0) * 100)
          : ''
      )
      setValorDesconto(
        orcamento.desconto_geral_valor
          ? String(orcamento.desconto_geral_valor)
          : ''
      )
    }
  }, [
    orcamento?.desconto_geral_aplicado,
    orcamento?.desconto_geral_tipo,
    orcamento?.desconto_geral_percentual,
    orcamento?.desconto_geral_valor,
  ])

  const itens = useMemo(
    () => orcamento?.itens_input || [],
    [orcamento?.itens_input]
  )

  const calcularTotalComDescontoGeral = () => {
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

    return somaComDescontoItem + (somaSemDescontoItem - descGeral)
  }

  const totalComDescontoGeral = calcularTotalComDescontoGeral()

  // Quebra detalhada para exibição
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
  const percGeral =
    Math.max(0, Math.min(100, parseFloat(percentualDesconto) || 0)) / 100
  const descontoGeralValor = descontoHabilitado
    ? tipoDesconto === 'percentual'
      ? somaSemDescontoItem * percGeral
      : Math.max(0, parseFloat(valorDesconto) || 0)
    : 0

  const enviarZap = async () => {
    try {
      if (!orcamento.pedi_forn) {
        Alert.alert('Erro', 'Cliente tem celular definido ?.')
        return
      }
      const entidade = await apiGetComContexto(
        `entidades/entidades/${orcamento.pedi_forn}/`
      )
      console.log('📦 Dados da entidade:', entidade)
      const numeroOrcamento = orcamento.pedi_nume
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

      const corpo = (orcamento.itens || [])
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

      const texto = `Novo orcamento:  ${numeroOrcamento}!\nCliente: ${nomeCliente}\n\nItens:\n${corpo}\n\nTotal: R$ ${totalFormatado.toFixed(
        2
      )}`

      const url = `https://wa.me/${numeroZap}?text=${encodeURIComponent(texto)}`
      Linking.openURL(url)
    } catch (err) {
      console.error('❌ Erro ao enviar Zap:', err)
      Alert.alert('Erro', 'Falha ao consultar os dados da entidade.')
    }
  }

  const salvar = async () => {
    if (!orcamento.pedi_empr || !orcamento.pedi_fili) {
      Alert.alert('Erro', 'Empresa e filial precisam estar definidas antes de salvar.')
      return
    }

    try {
      let data

      const itens_input = (orcamento.itens_input || []).map((item) => {
        const q = Number(item.iped_quan) || 0
        const u = Number(item.iped_unit) || 0
        const bruto = q * u
        const tota = Number(item.iped_tota)
        const iped_desc =
          !isNaN(bruto) && !isNaN(tota) && bruto >= tota
            ? Number((bruto - tota).toFixed(2))
            : Number(Number(item.desconto_valor || 0).toFixed(2))
        return {
          ...item,
          iped_desc,
        }
      })

      const somaDescontosItens = itens_input.reduce(
        (sum, it) => sum + (Number(it.iped_desc) || 0),
        0
      )
      const baseSemDesconto = itens_input
        .filter((it) => !it.desconto_item_disponivel)
        .reduce((acc, it) => {
          const t = Number(it.iped_tota)
          if (!isNaN(t)) return acc + t
          const q2 = Number(it.iped_quan) || 0
          const u2 = Number(it.iped_unit) || 0
          return acc + q2 * u2
        }, 0)
      const perc =
        Math.max(0, Math.min(100, parseFloat(percentualDesconto) || 0)) / 100
      const descontoGeralValor = descontoHabilitado
        ? tipoDesconto === 'percentual'
          ? baseSemDesconto * perc
          : Math.max(0, parseFloat(valorDesconto) || 0)
        : 0
      const pedi_desc = Number(
        (somaDescontosItens + descontoGeralValor).toFixed(2)
      )

      const pedi_topr = itens_input.reduce((acc, it) => {
        const q = Number(it.iped_quan) || 0
        const u = Number(it.iped_unit) || 0
        return acc + q * u
      }, 0)

      const payload = {
        ...orcamento,
        itens_input,
        pedi_topr: Number(pedi_topr.toFixed(2)),
        pedi_tota: Number((pedi_topr - pedi_desc).toFixed(2)),
        pedi_desc,
        desconto_geral_aplicado: !!descontoHabilitado,
        desconto_geral_tipo: tipoDesconto,
        desconto_geral_percentual:
          descontoHabilitado && tipoDesconto === 'percentual' ? perc : 0,
        desconto_geral_valor: descontoHabilitado ? descontoGeralValor : 0,
        valor_desconto: descontoHabilitado ? descontoGeralValor : 0,
        valor_subtotal: Number(pedi_topr.toFixed(2)),
        valor_total: Number((pedi_topr - pedi_desc).toFixed(2)),
      }

      console.log('Payload enviado:', payload) // Adicionado para depuração

      if (orcamento.pedi_nume) {
        data = await apiPutComContexto(
          `orcamentos/orcamentos/${orcamento.pedi_nume}/`,
          payload
        )
      } else {
        data = await apiPostComContexto(`orcamentos/orcamentos/`, payload)
      }
      const pedi_nume = data.pedi_nume || 'desconhecido'

      Toast.show({
        type: 'success',
        text1: `Orçamento #${pedi_nume} salvo com sucesso!`,
        position: 'bottom',
        visibilityTime: 3000,
      })

      // Navegar para a lista de orçamentos
      navigation.navigate('Orcamentos')
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error)
      Alert.alert('Erro', 'Falha ao salvar o Orçamento.')
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
        <MaterialIcons name="receipt" size={24} color="#10a2a7" />
        <Text style={styles.total}>
          Total: {formatarMoeda(totalComDescontoGeral)}
        </Text>
        <MaterialIcons 
          name={resumoExpandido ? "expand-less" : "expand-more"} 
          size={24} 
          color="#10a2a7" 
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
              -{formatarMoeda(descontoGeralValor)}
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
            <MaterialIcons name="local-offer" size={20} color="#10a2a7" />
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
                { backgroundColor: descontoHabilitado ? '#10a2a7' : '#666' }
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
                <Text style={styles.tipoButtonText}>Percentual (%)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tipoButton,
                  tipoDesconto === 'valor' && styles.tipoButtonAtivo,
                ]}
                onPress={() => setTipoDesconto('valor')}
              >
                <Text style={styles.tipoButtonText}>Valor (R$)</Text>
              </TouchableOpacity>
            </View>

            {tipoDesconto === 'percentual' ? (
              <TextInput
                style={styles.input}
                placeholder="% Desconto Geral"
                placeholderTextColor="#666"
                keyboardType="numeric"
                value={percentualDesconto}
                onChangeText={setPercentualDesconto}
              />
            ) : (
              <TextInput
                style={styles.input}
                placeholder="Valor do Desconto Geral"
                placeholderTextColor="#666"
                keyboardType="numeric"
                value={valorDesconto}
                onChangeText={setValorDesconto}
              />
            )}
          </View>
        )}
      </View>

      <View style={styles.botoesContainer}>
        <TouchableOpacity
          style={[
            styles.botaoSalvar,
            (!orcamento.pedi_empr || !orcamento.pedi_fili) && { opacity: 0.5 },
          ]}
          onPress={salvar}
          disabled={!orcamento.pedi_empr || !orcamento.pedi_fili}
        >
          <MaterialIcons name="save" size={20} color="#fff" />
          <Text style={styles.textoBotao}>Salvar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botaoWhatsapp} onPress={enviarZap}>
          <MaterialCommunityIcons name="whatsapp" size={20} color="#fff" />
          <Text style={styles.textoBotao}>Enviar</Text>
        </TouchableOpacity>
      </View>
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
    borderColor: '#10a2a7',
    elevation: 2,
    shadowColor: '#10a2a7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  total: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10a2a7',
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
    backgroundColor: '#10a2a7',
    borderColor: '#10a2a7',
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
    color: '#10a2a7',
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
    color: '#10a2a7',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resumoValorDestaque: {
    color: '#10a2a7',
    fontWeight: 'bold',
    fontSize: 16,
  },
  botoesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  botaoSalvar: {
    flex: 1,
    backgroundColor: '#10a2a7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 6,
  },
  botaoWhatsapp: {
    flex: 1,
    backgroundColor: '#25D366',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 6,
  },
  textoBotao: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
})
