// ItensModal.js
import React, { useState, useEffect } from 'react'
import {
  Modal,
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native'
import BuscaProdutoInput from '../components/BuscaProdutosInput'

export default function ItensModal({
  visivel,
  onFechar,
  onAdicionar,
  itemEditando,
}) {
  const [form, setForm] = useState({
    produtoId: '',
    quantidade: '',
    preco: '',
  })

  useEffect(() => {
    if (itemEditando) {
      setForm({
        produtoId: itemEditando.iped_prod?.toString() || '',
        quantidade: itemEditando.iped_quan?.toString() || '',
        preco: itemEditando.iped_unit?.toString() || '',
        idExistente: !!itemEditando.id,
      })
    } else {
      setForm({
        produtoId: '',
        quantidade: '',
        preco: '',
      })
    }
  }, [itemEditando, visivel])

  const onChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }))
  }

  const adicionar = () => {
    const quantidadeNum = parseFloat(form.quantidade)
    const precoNum = parseFloat(form.preco)

    if (!form.produtoId || quantidadeNum <= 0 || precoNum <= 0) {
      Alert.alert('Erro', 'Produto, quantidade e preço devem ser válidos.')
      return
    }

    const total = quantidadeNum * precoNum

    const novoItem = {
      iped_prod: parseInt(form.produtoId),
      iped_quan: quantidadeNum,
      iped_unit: precoNum,
      iped_tota: total,
    }

    onAdicionar(novoItem, itemEditando)

    if (!itemEditando) {
      setForm({ produtoId: '', quantidade: '', preco: '' })
    }

    onFechar()
  }

  return (
    <Modal visible={visivel} animationType="slide">
      <View style={styles.container}>
        <Text style={styles.cabecalho}>ITENS DO PEDIDO</Text>

        <Text style={styles.label}>Produto</Text>
        <BuscaProdutoInput
          value={form.produtoId}
          onSelect={(item) => {
            setForm((f) => ({ ...f, produtoId: item.prod_codi.toString() }))
          }}
        />

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
            (parseFloat(form.quantidade) || 0) * (parseFloat(form.preco) || 0)
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
      </View>
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
})
