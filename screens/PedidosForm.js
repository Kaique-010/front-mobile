import React, { useState, useEffect } from 'react'
import { View, ScrollView, Button, Text, StyleSheet } from 'react-native'
import PedidoHeader from '../componentsPedidos/PedidoHeader'
import ItensList from '../componentsPedidos/ItensLista'
import ItensModal from '../componentsPedidos/ItensModal'
import ResumoPedido from '../componentsPedidos/ResumoPedido'
import { getStoredData } from '../services/storageService'

export default function TelaPedidoVenda() {
  const [pedido, setPedido] = useState({
    pedi_empr: null,
    pedi_fili: null,
    pedi_forn: null,
    pedi_vend: null,
    pedi_data: new Date().toISOString().split('T')[0],
    pedi_fina: '0',
    pedi_obse: '',
    itens: [],
    pedi_tota: 0,
  })

  const [modalVisivel, setModalVisivel] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [itemEditando, setItemEditando] = useState(null)

  useEffect(() => {
    const carregarEmpresaFilial = async () => {
      try {
        const { empresa, filial } = await getStoredData()

        setPedido((prev) => ({
          ...prev,
          pedi_empr: empresa,
          pedi_fili: filial,
        }))
      } catch (err) {
        console.error('Erro ao carregar empresa/filial:', err.message)
      } finally {
        setCarregando(false)
      }
    }

    carregarEmpresaFilial()
  }, [])

  const handleAdicionarOuEditarItem = (novoItem) => {
    let novosItens
    if (itemEditando) {
      // edição
      novosItens = pedido.itens.map((item) =>
        item === itemEditando ? novoItem : item
      )
    } else {
      // adição
      novosItens = [...pedido.itens, novoItem]
    }

    const novoTotal = novosItens.reduce((acc, i) => acc + i.iped_tota, 0)
    setPedido((prev) => ({
      ...prev,
      itens: novosItens,
      pedi_tota: novoTotal,
    }))
    setItemEditando(null)
    setModalVisivel(false)
  }
  if (carregando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Carregando dados...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <PedidoHeader pedido={pedido} setPedido={setPedido} />

      <Button title="Adicionar Item" onPress={() => setModalVisivel(true)} />

      <ItensList
        itens={pedido.itens} 
        
        onEdit={(item) => {
          setItemEditando(item)
          setModalVisivel(true)
        }}
      />

      <ItensModal
        visivel={modalVisivel}
        onFechar={() => {
          setModalVisivel(false)
          setItemEditando(null)
        }}
        onAdicionar={handleAdicionarOuEditarItem}
        itemEditando={itemEditando}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    backgroundColor: '#21393f',
  },
  carregandoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
