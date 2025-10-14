import React, { useState, useEffect, useRef } from 'react'
import {
  Modal,
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Vibration,
  Switch,
} from 'react-native'
import { LogBox } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import LeitorCodigoBarras from '../components/Leitor'
import { Ionicons } from '@expo/vector-icons'
import BuscaProdutoInput from '../components/BuscaProdutosInput'
import { apiGetComContexto } from '../utils/api'
import Toast from 'react-native-toast-message'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Cache para itens de pedidos
const ITENS_PEDIDOS_CACHE_KEY = 'itens_pedidos_cache'
const ITENS_PEDIDOS_CACHE_DURATION = 3 * 60 * 1000 // 3 minutos

export default function ItensModal({
  visivel,
  onFechar,
  onAdicionar,
  itemEditando,
}) {
  const [form, setForm] = useState({
    produtoId: '',
    produtoNome: '',
    quantidade: '',
    preco: '',
    descontoHabilitado: false,
    tipoDesconto: 'percentual', // 'percentual' | 'valor'
    percentualDesconto: '', // em % (ex: 10 para 10%)
    valorDesconto: '', // valor absoluto
  })
  const [isScanningModal, setIsScanningModal] = useState(false)
  const [highlight, setHighlight] = useState(false)
  const scrollRef = useRef()

  useEffect(() => {
    if (itemEditando) {
      setForm({
        produtoId: itemEditando.iped_prod?.toString() || '',
        quantidade: itemEditando.iped_quan?.toString() || '',
        preco: itemEditando.iped_unit?.toString() || '',
        produtoNome: itemEditando.produto_nome || '',
        idExistente: !!itemEditando.id,
        descontoHabilitado: !!itemEditando.desconto_item_disponivel,
        tipoDesconto: itemEditando.desconto_valor ? 'valor' : 'percentual',
        percentualDesconto: itemEditando.percentual_desconto
          ? String((Number(itemEditando.percentual_desconto) || 0) * 100)
          : '',
        valorDesconto: itemEditando.desconto_valor
          ? String(itemEditando.desconto_valor)
          : '',
      })
    } else {
      setForm({
        produtoId: '',
        produtoNome: '',
        quantidade: '',
        preco: '',
        descontoHabilitado: false,
        tipoDesconto: 'percentual',
        percentualDesconto: '',
        valorDesconto: '',
      })
    }
  }, [itemEditando, visivel])

  const onChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }))
  }

  const onProdutoLido = async (codigoBarras) => {
    try {
      const response = await apiGetComContexto(`produtos/produtos/busca/`, {
        q: codigoBarras,
      })

      const produtos = response?.results || response || []
      const produto = produtos[0]

      if (!produto || !produto.prod_coba) {
        Toast.show({
          type: 'error',
          text1: 'Produto não encontrado',
          text2: 'Verifique o código e tente novamente',
        })
        setIsScanningModal(false)
        return
      }

      const produtoDetalhado = await apiGetComContexto(
        `produtos/produtos/${produto.prod_codi}/`
      )

      if (!produtoDetalhado) {
        Toast.show({
          type: 'error',
          text1: 'Erro ao carregar produto',
          text2: 'Tente novamente',
        })
        setIsScanningModal(false)
        return
      }

      Vibration.vibrate(100)
      setHighlight(true)
      setTimeout(() => setHighlight(false), 1000)

      setForm((f) => ({
        ...f,
        produtoId: produtoDetalhado.prod_codi.toString(),
        produtoNome: produtoDetalhado.prod_nome,
        preco: produtoDetalhado.prod_preco_vista?.toString() || '',
        quantidade: '1',
      }))

      Toast.show({
        type: 'success',
        text1: 'Produto encontrado',
        text2: produtoDetalhado.prod_nome,
      })

      scrollRef.current?.scrollTo({ y: 0, animated: true })
    } catch (err) {
      console.error('Erro ao buscar produto:', err)
    }

    setIsScanningModal(false)
  }

  // Aceita números no formato brasileiro: 
  // - "1,25" => 1.25
  // - "1.234,56" => 1234.56
  // - também tolera espaços e outros caracteres não numéricos
  const parseNumberBR = (v) => {
    if (typeof v === 'number') return v
    if (v === null || v === undefined) return 0
    const s = String(v).trim()
    if (!s) return 0
    if (s.includes(',') && s.includes('.')) {
      return parseFloat(s.replace(/\./g, '').replace(',', '.')) || 0
    }
    if (s.includes(',')) {
      return parseFloat(s.replace(',', '.')) || 0
    }
    return parseFloat(s.replace(/[^\d.-]/g, '')) || 0
  }

  const adicionar = () => {
    const quantidadeNum = parseNumberBR(form.quantidade)
    const precoNum = parseNumberBR(form.preco)

    if (!form.produtoId || quantidadeNum <= 0 || precoNum <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Preencha todos os campos corretamente',
      })
      return
    }

    const totalBruto = quantidadeNum * precoNum
    let descontoValor = 0
    if (form.descontoHabilitado) {
      if (form.tipoDesconto === 'percentual') {
        const perc = Math.max(
          0,
          Math.min(100, parseNumberBR(form.percentualDesconto) || 0)
        )
        descontoValor = (totalBruto * perc) / 100
      } else {
        descontoValor = Math.max(0, parseNumberBR(form.valorDesconto) || 0)
        descontoValor = Math.min(descontoValor, totalBruto)
      }
    }
    const totalLiquido = totalBruto - descontoValor

    const novoItem = {
      iped_prod: parseInt(form.produtoId),
      iped_quan: quantidadeNum,
      iped_unit: precoNum,
      iped_tota: totalLiquido,
      produto_nome: form.produtoNome,
      desconto_item_disponivel: !!form.descontoHabilitado,
      percentual_desconto: form.descontoHabilitado
        ? form.tipoDesconto === 'percentual'
          ? Math.max(
              0,
              Math.min(100, parseNumberBR(form.percentualDesconto) || 0)
            ) / 100
          : totalBruto > 0
          ? descontoValor / totalBruto
          : 0
        : 0,
      desconto_valor: form.descontoHabilitado ? descontoValor : 0,
    }

    onAdicionar(novoItem, itemEditando)

    if (!itemEditando) {
      setForm({
        produtoId: '',
        produtoNome: '',
        quantidade: '',
        preco: '',
        descontoHabilitado: false,
        tipoDesconto: 'percentual',
        percentualDesconto: '',
        valorDesconto: '',
      })
    }

    onFechar()
  }

  LogBox.ignoreLogs([
    'VirtualizedLists should never be nested inside plain ScrollViews',
  ])

  return (
    <Modal visible={visivel} animationType="slide">
      <KeyboardAwareScrollView
        style={styles.container}
        ref={(ref) => {
          scrollRef.current = ref
        }}
        enableOnAndroid
        extraScrollHeight={100}
        keyboardShouldPersistTaps="handled">
        {isScanningModal ? (
          <LeitorCodigoBarras
            onProdutoLido={onProdutoLido}
            onCancelar={() => setIsScanningModal(false)}
          />
        ) : (
          <>
            <Text style={styles.cabecalho}>ITENS DO PEDIDO</Text>

            <Text style={styles.label}>Produto:</Text>
            <View style={styles.buscaComIcone}>
              <View style={styles.produtoInput}>
                <BuscaProdutoInput
                  valorAtual={form.produtoNome}
                  onSelect={(produto) => {
                    setForm((f) => ({
                      ...f,
                      produtoId: produto.prod_codi.toString(),
                      produtoNome: produto.prod_nome,
                      preco: produto.prod_preco_vista?.toString() || '',
                      quantidade: '1',
                    }))
                    Toast.show({
                      type: 'success',
                      text1: 'Produto selecionado',
                      text2: produto.prod_nome,
                    })
                  }}
                />
              </View>

              <TouchableOpacity
                style={styles.iconeLeitorInline}
                onPress={() => setIsScanningModal(true)}
                activeOpacity={0.6}>
                <Ionicons name="barcode-outline" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {form.produtoNome ? (
              <Text style={styles.produtoNome}>{form.produtoNome}</Text>
            ) : null}

            <Text style={styles.label}>Quantidade:</Text>
            <TextInput
              keyboardType="decimal-pad"
              value={form.quantidade}
              onChangeText={(v) => onChange('quantidade', v)}
              style={styles.input}
            />

            <Text style={styles.label}>Preço Unitário:</Text>
            <TextInput
              keyboardType="decimal-pad"
              value={form.preco}
              onChangeText={(v) => onChange('preco', v)}
              style={styles.input}
            />

            <View style={styles.descontoHeader}>
              <Text style={styles.label}>Aplicar Desconto:</Text>
              <Switch
                value={!!form.descontoHabilitado}
                onValueChange={(v) => onChange('descontoHabilitado', v)}
              />
            </View>

            {form.descontoHabilitado && (
              <View style={styles.descontoContainer}>
                <View style={styles.tipoDescontoContainer}>
                  <TouchableOpacity
                    style={[
                      styles.tipoButton,
                      form.tipoDesconto === 'percentual' &&
                        styles.tipoButtonAtivo,
                    ]}
                    onPress={() => onChange('tipoDesconto', 'percentual')}>
                    <Text style={styles.tipoButtonTexto}>Percentual (%)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.tipoButton,
                      form.tipoDesconto === 'valor' && styles.tipoButtonAtivo,
                    ]}
                    onPress={() => onChange('tipoDesconto', 'valor')}>
                    <Text style={styles.tipoButtonTexto}>Valor (R$)</Text>
                  </TouchableOpacity>
                </View>

                {form.tipoDesconto === 'percentual' ? (
                  <TextInput
                    placeholder="% Desconto"
                    placeholderTextColor="#9aa"
                    keyboardType="decimal-pad"
                    value={form.percentualDesconto}
                    onChangeText={(v) => onChange('percentualDesconto', v)}
                    style={styles.input}
                  />
                ) : (
                  <TextInput
                    placeholder="Valor do Desconto"
                    placeholderTextColor="#9aa"
                    keyboardType="decimal-pad"
                    value={form.valorDesconto}
                    onChangeText={(v) => onChange('valorDesconto', v)}
                    style={styles.input}
                  />
                )}
              </View>
            )}

            <Text style={styles.total}>
              {(() => {
                const q = parseNumberBR(form.quantidade) || 0
                const pu = parseNumberBR(form.preco) || 0
                const bruto = q * pu
                let desc = 0
                if (form.descontoHabilitado) {
                  if (form.tipoDesconto === 'percentual') {
                    const perc = Math.max(
                      0,
                      Math.min(100, parseNumberBR(form.percentualDesconto) || 0)
                    )
                    desc = (bruto * perc) / 100
                  } else {
                    desc = Math.max(0, parseNumberBR(form.valorDesconto) || 0)
                    desc = Math.min(desc, bruto)
                  }
                }
                const liquido = bruto - desc
                const liquidoStr = liquido.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
                const descStr = desc.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
                return `Total: R$ ${liquidoStr}${
                  desc > 0 ? ` (desc.: R$ ${descStr})` : ''
                }`
              })()}
            </Text>

            <TouchableOpacity style={styles.botaoAdicionar} onPress={adicionar}>
              <Text style={styles.textoBotao}>
                {itemEditando ? 'Salvar Alterações' : 'Adicionar'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.botaoCancelar} onPress={onFechar}>
              <Text style={styles.textoBotao}>Cancelar</Text>
            </TouchableOpacity>
          </>
        )}
      </KeyboardAwareScrollView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1a2f3d',
  },
  cabecalho: {
    color: 'white',
    textAlign: 'center',
    margin: 15,
    fontSize: 22,
    textDecorationLine: 'underline',
  },
  label: {
    color: 'white',
    textAlign: 'center',
    marginTop: 25,
  },
  input: {
    backgroundColor: '#232935',
    color: 'white',
    textAlign: 'center',
    marginTop: 10,
    borderRadius: 8,
    padding: 10,
  },
  highlight: {
    borderColor: '#10a2a7',
    borderWidth: 2,
  },
  total: {
    color: 'white',
    marginTop: 40,
    marginBottom: 60,
    textAlign: 'right',
    fontSize: 16,
  },
  botaoAdicionar: {
    padding: 12,
    backgroundColor: '#10a2a7',
    borderRadius: 8,
    alignItems: 'center',
  },
  botaoCancelar: {
    padding: 12,
    marginTop: 15,
    backgroundColor: '#a80909',
    borderRadius: 8,
    alignItems: 'center',
  },
  textoBotao: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buscaComIcone: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  produtoInput: {
    flex: 1,
  },
  iconeLeitorInline: {
    padding: 10,
    backgroundColor: '#10a2a7',
    borderRadius: 8,
  },
  produtoNome: {
    color: '#ccc',
    textAlign: 'center',
    marginTop: 5,
    fontSize: 14,
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
    marginTop: 20,
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
  tipoButtonTexto: {
    color: '#faebd7',
    fontWeight: '600',
  },
})
