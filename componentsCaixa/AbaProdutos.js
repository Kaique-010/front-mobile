import React, { useState } from 'react'
import {
  View,
  Text,
  Button,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import Toast from 'react-native-toast-message'
import { apiPostComContexto } from '../utils/api'
import ItensModal from '../componentsPedidos/ItensModal'

import useContextApp from '../hooks/useContextoApp'

export default function AbaProdutos({ produtos, setProdutos, mov, onAvancar }) {
  const [modalVisivel, setModalVisivel] = useState(false)
  const [loading, setLoading] = useState(false)
  const { empresaId, filialId } = useContextApp()

  const handleAvancar = async () => {
    if (produtos.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Adicione pelo menos um produto',
      })
      return
    }

    try {
      setLoading(true)
      const total = calcularTotal()

      // Enviar produtos individualmente
      for (const produto of produtos) {
        await apiPostComContexto('caixadiario/movicaixa/adicionar_item/', {
          numero_venda: mov.movi_nume_vend,
          produto: produto.iped_prod,
          quantidade: produto.iped_quan,
          valor_unitario: produto.iped_unit,
          empresa: empresaId,
          filial: filialId,
        })
      }

      // Atualiza o total no estado mov antes de avançar
      const movAtualizado = {
        ...mov,
        total: total,
      }

      onAvancar(movAtualizado)
    } catch (error) {
      let mensagemErro = 'Erro ao salvar produtos'
      if (error.response?.data?.detail?.includes('Licença')) {
        mensagemErro = 'Erro de licença. Por favor, verifique suas credenciais.'
      } else if (error.response?.data?.detail) {
        mensagemErro = error.response.data.detail
      }

      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: mensagemErro,
      })
    } finally {
      setLoading(false)
    }
  }

  const adicionarProduto = (novoItem) => {
    if (!mov.movi_nume_vend) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2:
          'Venda não foi iniciada. Por favor, volte e configure cliente e vendedor.',
      })
      return
    }

    const existe = produtos.some((p) => p.iped_prod === novoItem.iped_prod)
    if (existe) {
      Toast.show({
        type: 'error',
        text1: 'Produto já adicionado',
        text2: `${novoItem.prod_nome || 'Produto'} já está na lista`,
      })
      return
    }
    setProdutos([
      ...produtos,
      {
        ...novoItem,
        produto_nome: novoItem.prod_nome || novoItem.produto_nome,
      },
    ])
  }

  const handleAdicionarProduto = (produto) => {
    const novoProduto = {
      ...produto,
      iped_quan: 1,
      iped_unit: produto.prod_preco,
      iped_tota: produto.prod_preco,
      produto_nome: produto.prod_nome,
      iped_prod: produto.prod_codi,
    }
    setProdutos([...produtos, novoProduto])
  }

  const handleRemoverProduto = (index) => {
    const novosProdutos = [...produtos]
    novosProdutos.splice(index, 1)
    setProdutos(novosProdutos)
  }

  const handleAtualizarProduto = (index, novoItem) => {
    const novosProdutos = [...produtos]
    novosProdutos[index] = novoItem
    setProdutos(novosProdutos)
  }

  const calcularTotal = () => {
    return produtos.reduce((total, produto) => total + produto.iped_tota, 0)
  }

  const [valorPago, setValorPago] = useState('')
  const [formaPagamento, setFormaPagamento] = useState('51')
  const [parcelas, setParcelas] = useState('')

  const troco = () => {
    const total = calcularTotal()
    const troco = parseFloat(valorPago) - total
    return troco.toFixed(2)
  }

  const handleTroco = () => {
    Toast.show({
      type: 'info',
      text1: 'Troco',
      text2: `R$ ${troco()}`,
    })
  }
  const handleValorPagoChange = (text) => {
    const numericText = text.replace(/[^0-9.]/g, '')
    setValorPago(numericText)
  }

  const handleFinalizarVenda = async () => {
    try {
      setLoading(true)
      await apiPostComContexto('caixa/movicaixa/finalizar_venda/', {
        movi_nume_vend: venda.movi_nume_vend,
        movi_empr: venda.movi_empr,
        movi_fili: venda.movi_fili,
        valor_total: venda.total,
        valor_pago: parseFloat(valorPago),
        forma_pagamento: formaPagamento,
      })

      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Venda finalizada com sucesso',
      })

      onFinalizarVenda()
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
      })
    }
  }
  const handleSalvar = async () => {
    try {
      setLoading(true)
      await apiPostComContexto('caixa/movicaixa/salvar_venda/', {
        movi_nume_vend: venda.movi_nume_vend,
        movi_empr: venda.movi_empr,
        movi_fili: venda.movi_fili,
      })
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: error.response?.data?.detail || 'Erro ao salvar venda',
      })
    } finally {
      setLoading(false)
    }
  }

  const atualizados = produtos.map((produto) => {
    if (produto.movi_prod) {
      return {
        iped_quan: produto.iped_quan,
        iped_unit: produto.iped_unit,
        iped_tota: produto.iped_tota,
        movi_prod: produto.movi_prod,
      }
    }
  })

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.scene}>
        <TouchableOpacity
          style={styles.botaoAdicionar}
          onPress={() => setModalVisivel(true)}>
          <Text style={styles.botaoTexto}>Adicionar Itens</Text>
        </TouchableOpacity>
        <Text style={styles.label}>Produtos da venda:</Text>

        {produtos.length === 0 && (
          <Text style={styles.empty}>Nenhum produto adicionado.</Text>
        )}

        <FlatList
          data={produtos}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.produto}>
              <Text style={styles.text}>
                Produto: {item.produto_nome || 'Sem nome'}
              </Text>
              <Text style={styles.text}>Quantidade: {item.iped_quan}</Text>
              <Text style={styles.text}>Preço: R$ {item.iped_unit}</Text>
              <Text style={styles.text}>Total: R$ {item.iped_tota}</Text>
            </View>
          )}
        />

        <ItensModal
          visivel={modalVisivel}
          onFechar={() => setModalVisivel(false)}
          onAdicionar={adicionarProduto}
          itemEditando={null}
        />
      </View>
      <View style={styles.rodape}>
        <Text style={styles.total}>Total: R$ {calcularTotal().toFixed(2)}</Text>
        <TouchableOpacity
          style={[styles.botaoAvancar, loading && styles.botaoDesabilitado]}
          onPress={handleAvancar}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botaoTexto}>Avançar</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  scene: { flex: 1, padding: 20 },
  label: {
    color: 'white',
    marginBottom: 15,
    marginTop: 25,
    textAlign: 'center',
  },
  empty: { color: 'gray', fontStyle: 'italic', textAlign: 'center' },
  produto: { marginBottom: 20, textAlign: 'center' },
  text: { color: 'white', textAlign: 'center' },
  total: {
    color: 'white',
    fontSize: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  botaoAvancar: {
    backgroundColor: '#10a2a7',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 45,
    width: '100%',
    height: 40,
  },
  botaoTexto: { color: 'white', fontSize: 16 },
  botaoDesabilitado: { opacity: 0.5 },
  botaoAdicionar: {
    backgroundColor: '#10a2a7',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
    height: 40,
  },
})
