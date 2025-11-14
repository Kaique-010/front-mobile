import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Vibration,
} from 'react-native'
import { LogBox } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import LeitorCodigoBarras from '../components/Leitor'
import BuscaProdutoInputOs from '../components/BuscaProdutosOs'
import { Ionicons } from '@expo/vector-icons'
import { apiGetComContexto } from '../utils/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Toast from 'react-native-toast-message'

export default function ItensModalOs({
  visivel,
  onFechar,
  onAdicionar,
  itemEditando = null,
}) {
  const [form, setForm] = useState({
    produtoId: '',
    produtoNome: '',
    quantidade: '',
    preco: '',
    precoReal: '',
  })
  const [isScanningModal, setIsScanningModal] = useState(false)
  const [usuarioTemSetor, setUsuarioTemSetor] = useState(false)
  const scrollRef = useRef()

  // ✅ VERIFICAÇÃO COMPLETA DE SETOR COM DEBUG
  useEffect(() => {
    const verificarSetor = async () => {
      try {
        console.log('🔍 [MODAL] Verificando setor do usuário...')

        // Buscar todas as chaves possíveis
        const setor = await AsyncStorage.getItem('setor')
        const userInfo = await AsyncStorage.getItem('userInfo')
        const userData = await AsyncStorage.getItem('userData')

        console.log('📦 [MODAL] Setor direto:', setor)
        console.log('📦 [MODAL] UserInfo:', userInfo)
        console.log('📦 [MODAL] UserData:', userData)

        // Tentar parsear userInfo
        let setorFinal = null
        if (setor && setor !== '0' && setor !== 'null') {
          setorFinal = setor
        } else if (userInfo) {
          try {
            const parsed = JSON.parse(userInfo)
            setorFinal = parsed?.setor || parsed?.usua_seto
          } catch (e) {}
        } else if (userData) {
          try {
            const parsed = JSON.parse(userData)
            setorFinal = parsed?.setor || parsed?.usua_seto
          } catch (e) {}
        }

        const temSetor =
          setorFinal && setorFinal !== '0' && setorFinal !== 'null'

        console.log('✅ [MODAL] Setor final:', setorFinal)
        console.log('✅ [MODAL] Usuário TEM setor?', temSetor)

        setUsuarioTemSetor(temSetor)
      } catch (error) {
        console.error('❌ [MODAL] Erro ao verificar setor:', error)
        setUsuarioTemSetor(false)
      }
    }
    verificarSetor()
  }, [])

  useEffect(() => {
    if (itemEditando) {
      setForm({
        produtoId: itemEditando.peca_codi?.toString() || '',
        quantidade: itemEditando.peca_quan?.toString() || '',
        preco: itemEditando.peca_unit?.toString() || '',
        precoReal:
          itemEditando.peca_unit_real?.toString() ||
          itemEditando.peca_unit?.toString() ||
          '',
        produtoNome: itemEditando.produto_nome || '',
      })
    } else {
      setForm({
        produtoId: '',
        produtoNome: '',
        quantidade: '',
        preco: '',
        precoReal: '',
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
        })
        return
      }

      const produtoDetalhado = await apiGetComContexto(
        `produtos/produtos/${produto.prod_empr}-${produto.prod_codi}/`
      )

      Vibration.vibrate(100)

      const precoVista = produtoDetalhado.prod_preco_vista || 0

      setForm((f) => ({
        ...f,
        produtoId: produtoDetalhado.prod_codi.toString(),
        produtoNome: produtoDetalhado.prod_nome,
        preco: precoVista.toString(),
        precoReal: precoVista.toString(),
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

  const adicionar = () => {
    const quantidadeNum = parseFloat(form.quantidade)
    const precoNum = parseFloat(form.preco)
    const precoRealNum = parseFloat(form.precoReal)

    console.log('➕ [MODAL] Adicionando produto...')
    console.log('   Usuário tem setor?', usuarioTemSetor)
    console.log('   Preço do form:', precoNum)
    console.log('   Preço real:', precoRealNum)

    // Validações
    if (!form.produtoId || quantidadeNum <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Preencha todos os campos corretamente',
      })
      return
    }

    // ✅ CORRIGIDO: Se usuário tem setor, usa precoReal, senão usa o que está no form
    const precoParaCalculo = usuarioTemSetor ? precoRealNum : precoNum

    console.log('💰 [MODAL] Preço para cálculo:', precoParaCalculo)

    if (precoParaCalculo <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Preço inválido',
        text2: 'O preço deve ser maior que zero',
      })
      return
    }

    const total = quantidadeNum * precoParaCalculo

    const novoItem = {
      peca_id: itemEditando?.peca_id,
      peca_codi: parseInt(form.produtoId),
      peca_quan: quantidadeNum,
      peca_unit: precoParaCalculo,
      peca_unit_real: precoRealNum,
      peca_tota: total,
      produto_nome: form.produtoNome,
    }

    console.log('✅ [MODAL] Item criado:', novoItem)
    onAdicionar(novoItem, itemEditando)

    if (!itemEditando) {
      setForm({
        produtoId: '',
        produtoNome: '',
        quantidade: '',
        preco: '',
        precoReal: '',
      })
    }

    onFechar()
  }

  LogBox.ignoreLogs([
    'VirtualizedLists should never be nested inside plain ScrollViews',
  ])

  // ✅ LOG DE DEBUG NA RENDERIZAÇÃO
  console.log('🎨 [MODAL] Renderizando... Usuário tem setor?', usuarioTemSetor)

  return (
    <Modal visible={visivel} animationType="slide">
      <KeyboardAwareScrollView
        style={styles.container}
        ref={scrollRef}
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
            <Text style={styles.cabecalho}>Itens da O.S</Text>

            <Text style={styles.label}>Produto:</Text>
            <View style={styles.buscaComIcone}>
              <View style={styles.produtoInput}>
                <BuscaProdutoInputOs
                  onSelect={(produto) => {
                    const precoVista = produto.prod_preco_vista || 0
                    setForm((f) => ({
                      ...f,
                      produtoId: produto.prod_codi.toString(),
                      produtoNome: produto.prod_nome,
                      preco: precoVista.toString(),
                      precoReal: precoVista.toString(),
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
              keyboardType="numeric"
              value={form.quantidade}
              onChangeText={(v) => onChange('quantidade', v)}
              style={styles.input}
            />

            {/* ✅ CORRIGIDO: Ocultar preço quando usuário tem setor */}
            {!usuarioTemSetor && (
              <>
                <Text style={styles.label}>Preço Unitário:</Text>
                <TextInput
                  keyboardType="numeric"
                  value={form.preco}
                  onChangeText={(v) => onChange('preco', v)}
                  style={styles.input}
                />
              </>
            )}

            {/* ✅ CORRIGIDO: Mostrar total apenas quando não tem setor */}
            {!usuarioTemSetor && (
              <Text style={styles.total}>
                Total: R${' '}
                {(
                  (parseFloat(form.quantidade) || 0) *
                  (parseFloat(form.preco) || 0)
                ).toFixed(2)}
              </Text>
            )}

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
    marginTop: 40,
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
})
