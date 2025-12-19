import React, { useState, useEffect, useRef } from 'react'
import {
  Modal,
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Vibration,
} from 'react-native'
import { LogBox } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import LeitorCodigoBarras from '../components/Leitor'
import { Ionicons } from '@expo/vector-icons'
import BuscaProdutoInput from '../components/BuscaProdutosInput'
import { apiGetComContexto } from '../utils/api'
import Toast from 'react-native-toast-message'

export default function ItensModalOs({
  visivel,
  onFechar,
  onAdicionar,
  itemEditando,
  itensExistentes = [],
}) {
  const [form, setForm] = useState({
    produtoId: '',
    produtoNome: '',
    quantidade: '',
    preco: '',
  })
  const [isScanningModal, setIsScanningModal] = useState(false)
  const [highlight, setHighlight] = useState(false)
  const scrollRef = useRef()

  useEffect(() => {
    if (itemEditando) {
      setForm({
        produtoId: itemEditando.peca_prod?.toString() || '',
        quantidade: itemEditando.peca_quan?.toString() || '',
        preco: itemEditando.peca_unit?.toString() || '',
        produtoNome: itemEditando.produto_nome || '',
        idExistente: !!itemEditando.id,
      })
    } else {
      setForm({
        produtoId: '',
        produtoNome: '',
        quantidade: '',
        preco: '',
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
        `produtos/produtos/${produto.prod_codi}/`
      )

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
    } catch (err) {}

    setIsScanningModal(false)
  }

  const adicionar = () => {
    const quantidadeNum = parseFloat(form.quantidade)
    const precoNum = parseFloat(form.preco)

    if (!form.produtoId || quantidadeNum <= 0 || precoNum <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Preencha todos os campos corretamente',
      })
      return
    }

    // Validação de Duplicidade
    if (!itemEditando) {
      const jaExiste = itensExistentes.some(
        (item) => String(item.peca_prod) === String(form.produtoId)
      )
      if (jaExiste) {
        return Toast.show({
          type: 'error',
          text1: 'Produto já adicionado',
          text2: 'Este produto já consta na lista.',
        })
      }
    }

    const total = quantidadeNum * precoNum

    const novoItem = {
      id: itemEditando?.id || Date.now().toString(),
      peca_prod: parseInt(form.produtoId),
      peca_quan: quantidadeNum,
      peca_unit: precoNum,
      peca_tota: total,
      produto_nome: form.produtoNome,
    }
    onAdicionar(novoItem, itemEditando)
    console.log('Item enviado para a aba:', novoItem)

    if (!itemEditando) {
      setForm({ produtoId: '', produtoNome: '', quantidade: '', preco: '' })
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
            <Text style={styles.cabecalho}>Itens da O.S</Text>

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
                activeOpacity={0.6} // 👈
              >
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

            <Text style={styles.label}>Preço Unitário:</Text>
            <TextInput
              keyboardType="numeric"
              value={form.preco}
              onChangeText={(v) => onChange('preco', v)}
              style={styles.input}
            />

            <Text style={styles.total}>
              Total: R${' '}
              {(
                (parseFloat(form.quantidade) || 0) *
                (parseFloat(form.preco) || 0)
              ).toFixed(2)}
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
    gap: 8, // espaçamento entre input e botão (React Native >= 0.71)
  },

  produtoInput: {
    flex: 1,
  },

  iconeLeitorInline: {
    padding: 10,
    backgroundColor: '#10a2a7',
    borderRadius: 8,
  },

  produtoInput: {
    flex: 1,
  },
  produtoNome: {
    color: '#ccc',
    textAlign: 'center',
    marginTop: 5,
    fontSize: 14,
  },
})
