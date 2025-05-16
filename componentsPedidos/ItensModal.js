import React, { useState } from 'react'
import {
  Modal,
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import BuscaProdutoInput from '../components/BuscaProdutosInput'

export default function ItensModal({ visivel, onFechar, onAdicionar }) {
  const [produtoId, setProdutoId] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [preco, setPreco] = useState('')

  const adicionar = () => {
    const item = {
      iped_prod: parseInt(produtoId),
      iped_quan: parseFloat(quantidade),
      iped_unit: parseFloat(preco),
      iped_tota: parseFloat(quantidade) * parseFloat(preco),
    }
    onAdicionar(item)
    setProdutoId('')
    setQuantidade('')
    setPreco('')
  }

  return (
    <Modal visible={visivel} animationType="slide">
      <View style={styles.container}>
        <Text style={styles.cabecalho}>ITENS DO PEDIDO</Text>

        <Text style={styles.label}>Produto</Text>
        <BuscaProdutoInput
          onSelect={(item) => {
            console.log('Produto selecionado:', item)
            setProdutoId(item.prod_codi.toString())
          }}
        />

        <Text style={styles.label}>Quantidade:</Text>
        <TextInput
          keyboardType="numeric"
          value={quantidade}
          onChangeText={setQuantidade}
          style={styles.input}
        />

        <Text style={styles.label}>Preço Unitário:</Text>
        <TextInput
          keyboardType="numeric"
          value={preco}
          onChangeText={setPreco}
          style={styles.input}
        />

        <Text style={styles.total}>
          Total: R${' '}
          {(parseFloat(quantidade || 0) * parseFloat(preco || 0)).toFixed(2)}
        </Text>

        <TouchableOpacity style={styles.botaoAdicionar} onPress={adicionar}>
          <Text style={styles.textoBotao}>Adicionar</Text>
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
