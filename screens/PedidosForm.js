import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import PedidoHeader from '../componentsPedidos/PedidoHeader'
import ItensList from '../componentsPedidos/ItensLista'
import ItensModal from '../componentsPedidos/ItensModal'
import ResumoPedido from '../componentsPedidos/ResumoPedido'
import { apiGetComContexto } from '../utils/api'

const PEDIDO_CACHE_ID = 'pedido-edicao-cache'

export default function TelaPedidoVenda({ route, navigation }) {
  const pedidoParam = route.params?.pedido || null

  const [pedido, setPedido] = useState({
    pedi_empr: null,
    pedi_fili: null,
    pedi_forn: null,
    pedi_vend: null,
    pedi_data: new Date().toISOString().split('T')[0],
    pedi_fina: '0',
    status: 0,
    pedi_obse: 'Pedido Enviado por Mobile',
    itens_input: [],
    itens_removidos: [],
    pedi_tota: 0,
  })

  const carregarContexto = async () => {
    try {
      const [empresaId, filialId] = await Promise.all([
        AsyncStorage.getItem('empresaId'),
        AsyncStorage.getItem('filialId'),
      ])
      return { empresaId, filialId }
    } catch (error) {
      console.error('Erro ao carregar contexto:', error)
      return { empresaId: null, filialId: null }
    }
  }

  const [modalVisivel, setModalVisivel] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [itemEditando, setItemEditando] = useState(null)

  const calcularTotal = (itens) =>
    itens ? itens.reduce((acc, i) => acc + (Number(i.iped_tota) || 0), 0) : 0

  useEffect(() => {
    const carregarPedido = async () => {
      setCarregando(true)
      try {
        const { empresaId, filialId } = await carregarContexto()

        if (pedidoParam && pedidoParam.pedi_nume) {
          const data = await apiGetComContexto(
            `pedidos/pedidos/${pedidoParam.pedi_nume}/`
          )
          const itens = data.itens || []

          setPedido({
            ...data,
            itens_input: itens,
            pedi_tota: calcularTotal(itens),
          })

          await AsyncStorage.setItem(
            PEDIDO_CACHE_ID,
            JSON.stringify({
              ...data,
              itens_input: itens,
              pedi_tota: calcularTotal(itens),
            })
          )
        } else {
          await AsyncStorage.removeItem(PEDIDO_CACHE_ID)
          setPedido({
            pedi_empr: empresaId,
            pedi_fili: filialId,
            pedi_forn: null,
            pedi_vend: null,
            pedi_data: new Date().toISOString().split('T')[0],
            pedi_fina: '0',
            status: 0,
            pedi_obse: 'Pedido Enviado por Mobile',
            itens_input: [],
            itens_removidos: [],
            pedi_tota: 0,
          })
        }
      } catch (error) {
        console.error('Erro ao carregar pedido:', error)
      } finally {
        setCarregando(false)
      }
    }

    carregarPedido()
  }, [pedidoParam])

  const handleAdicionarOuEditarItem = (novoItem, itemAnterior = null) => {
    let novosItens = [...pedido.itens_input]

    const index = itemAnterior
      ? novosItens.findIndex((i) => i.iped_prod === itemAnterior.iped_prod)
      : novosItens.findIndex((i) => i.iped_prod === novoItem.iped_prod)

    if (index !== -1) {
      novosItens[index] = novoItem
    } else {
      novosItens.push(novoItem)
    }

    const novoTotal = calcularTotal(novosItens)

    setPedido((prev) => ({
      ...prev,
      itens_input: novosItens,
      pedi_tota: novoTotal,
    }))

    setItemEditando(null)
    setModalVisivel(false)
  }

  const handleRemoverItem = (item) => {
    const novosItens = pedido.itens_input.filter(
      (i) => i.iped_prod !== item.iped_prod
    )

    const novosRemovidos = item.idExistente
      ? [...pedido.itens_removidos, item.iped_prod]
      : pedido.itens_removidos

    const novoTotal = calcularTotal(novosItens)

    setPedido((prev) => ({
      ...prev,
      itens_input: novosItens,
      itens_removidos: novosRemovidos,
      pedi_tota: novoTotal,
    }))
  }

  return (
    <View style={styles.container}>
      <PedidoHeader pedido={pedido} setPedido={setPedido} />

      <TouchableOpacity
        style={styles.botaoadditens}
        onPress={() => setModalVisivel(true)}>
        <Text style={styles.textobotao}>Adicionar Item</Text>
      </TouchableOpacity>

      <ItensList
        itens={pedido.itens_input}
        onEdit={(item) => {
          setItemEditando(item)
          setModalVisivel(true)
        }}
        onRemove={handleRemoverItem}
      />

      <ResumoPedido total={pedido.pedi_tota} pedido={pedido} />

      <ItensModal
        visivel={modalVisivel}
        onFechar={() => {
          setModalVisivel(false)
          setItemEditando(null)
        }}
        onAdicionar={handleAdicionarOuEditarItem}
        onRemove={handleRemoverItem}
        itemEditando={itemEditando}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    flex: 1,
    backgroundColor: '#0e1c25',
  },
  carregandoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botaoadditens: {
    padding: 12,
    marginTop: 15,
    backgroundColor: '#10a2a7',
    borderRadius: 8,
    alignItems: 'center',
  },
  textobotao: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
  },
})
