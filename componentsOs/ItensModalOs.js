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
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Ionicons } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'

import BuscaProdutoInputOs from '../components/BuscaProdutosOs'

export default function ItensModalOs({
  visivel,
  onFechar,
  onAdicionar,
  itemEditando = null,
  itensExistentes = [],
}) {
  // ------------------------------------------
  // FORM
  // ------------------------------------------
  const [form, setForm] = useState({
    produtoId: '',
    produtoNome: '',
    quantidade: '',
    preco: '', // usado APENAS quando usuário NÃO tem setor
    precoReal: '', // preço real sempre vindo da API / produto
  })

  const [usuarioTemSetor, setUsuarioTemSetor] = useState(false)
  const scrollRef = useRef()

  // ------------------------------------------
  // VERIFICAR SETOR
  // ------------------------------------------
  useEffect(() => {
    const load = async () => {
      let setor = await AsyncStorage.getItem('setor')
      setUsuarioTemSetor(!!setor && setor !== '0' && setor !== 'null')
    }
    load()
  }, [])

  // ------------------------------------------
  // MODO EDIÇÃO
  // ------------------------------------------
  useEffect(() => {
    if (itemEditando) {
      setForm({
        produtoId: String(itemEditando.peca_codi),
        produtoNome: itemEditando.produto_nome,
        quantidade: String(itemEditando.peca_quan),

        preco: String(itemEditando.peca_unit),
        precoReal: String(
          itemEditando.peca_unit_real ?? itemEditando.peca_unit
        ),
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

  // ------------------------------------------
  // RECEBE PRODUTO SELECIONADO DO INPUT
  // ------------------------------------------
  const handleSelecionarProduto = (produto) => {
    const precoApi =
      produto.preco_final ??
      produto.prod_preco_vista ??
      produto.prod_preco_normal ??
      0

    setForm({
      produtoId: String(produto.prod_codi),
      produtoNome: produto.prod_nome,
      quantidade: '1',

      preco: String(precoApi), // editável SE não tiver setor
      precoReal: String(precoApi), // sempre registrado
    })

    Toast.show({
      type: 'success',
      text1: 'Produto selecionado',
      text2: produto.prod_nome,
    })
  }

  // ------------------------------------------
  // VALIDAÇÃO E ENVIO
  // ------------------------------------------
  const adicionar = () => {
    const quantidadeNum = Number(form.quantidade)
    const precoNum = Number(form.preco)
    const precoRealNum = Number(form.precoReal)

    if (!form.produtoId || quantidadeNum <= 0) {
      return Toast.show({
        type: 'error',
        text1: 'Preencha os campos obrigatórios',
      })
    }

    // Validação de Duplicidade
    if (!itemEditando) {
      const jaExiste = itensExistentes.some(
        (item) => String(item.peca_codi) === String(form.produtoId)
      )
      if (jaExiste) {
        return Toast.show({
          type: 'error',
          text1: 'Produto já adicionado',
          text2: 'Este produto já consta na lista.',
        })
      }
    }

    // Com setor: enviar o preço real da API; sem setor: o digitado
    const precoFinal = usuarioTemSetor ? precoRealNum : precoNum

    const total = quantidadeNum * precoFinal

    const novoItem = {
      peca_id: itemEditando?.peca_id,
      peca_codi: Number(form.produtoId),
      peca_quan: quantidadeNum,
      peca_unit: precoFinal,
      // Sempre registrar o preço real
      peca_unit_real: precoRealNum,
      peca_tota: total,
      produto_nome: form.produtoNome,
    }

    onAdicionar(novoItem, itemEditando)

    // reset se for novo
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

  // ------------------------------------------
  // RENDERIZAÇÃO
  // ------------------------------------------
  return (
    <Modal visible={visivel} animationType="slide">
      <KeyboardAwareScrollView
        style={styles.container}
        ref={scrollRef}
        enableOnAndroid
        extraScrollHeight={80}
        keyboardShouldPersistTaps="handled">
        <>
          <Text style={styles.titulo}>Itens da O.S</Text>

          {/* PRODUTO */}
          <Text style={styles.label}>Produto:</Text>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <BuscaProdutoInputOs onSelect={handleSelecionarProduto} />
            </View>
            <TouchableOpacity
              style={styles.botaoScan}
              onPress={() => console.log('Implementar scanner')}>
              <Ionicons name="barcode-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {!!form.produtoNome && (
            <Text style={styles.prodNome}>{form.produtoNome}</Text>
          )}

          {/* QUANTIDADE */}
          <Text style={styles.label}>Quantidade:</Text>
          <TextInput
            keyboardType="numeric"
            value={form.quantidade}
            onChangeText={(v) => onChange('quantidade', v)}
            style={styles.input}
          />

          {/* PREÇO — só aparece se NÃO tiver setor */}
          {!usuarioTemSetor && (
            <>
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
                  (Number(form.quantidade) || 0) * (Number(form.preco) || 0)
                ).toFixed(2)}
              </Text>
            </>
          )}

          <TouchableOpacity style={styles.btnAdd} onPress={adicionar}>
            <Text style={styles.btnTxt}>
              {itemEditando ? 'Salvar Alterações' : 'Adicionar'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnCancel} onPress={onFechar}>
            <Text style={styles.btnTxt}>Cancelar</Text>
          </TouchableOpacity>
        </>
      </KeyboardAwareScrollView>
      <Toast />
    </Modal>
  )
}

// --------------------------------------------------
// ESTILOS
// --------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1a2f3d',
  },
  titulo: {
    color: 'white',
    textAlign: 'center',
    margin: 15,
    fontSize: 22,
    fontWeight: 'bold',
  },
  label: {
    color: 'white',
    marginTop: 25,
    marginBottom: 5,
    textAlign: 'left',
  },
  input: {
    backgroundColor: '#232935',
    color: 'white',
    padding: 10,
    borderRadius: 8,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  botaoScan: {
    padding: 10,
    backgroundColor: '#10a2a7',
    borderRadius: 8,
  },
  prodNome: {
    color: '#ccc',
    textAlign: 'center',
    marginTop: 5,
    fontSize: 14,
  },
  total: {
    color: 'white',
    marginTop: 40,
    marginBottom: 50,
    textAlign: 'right',
    fontSize: 16,
    fontWeight: '600',
  },
  btnAdd: {
    padding: 12,
    backgroundColor: '#10a2a7',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 40,
  },
  btnCancel: {
    padding: 12,
    marginTop: 15,
    backgroundColor: '#a80909',
    borderRadius: 8,
    alignItems: 'center',
  },
  btnTxt: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
})
