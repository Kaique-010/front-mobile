import React, { useState, useEffect } from 'react'
import {
  View,
  ScrollView,
  Button,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
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
    status: 0,
    pedi_obse: 'Pedido Enviado por Mobile',
    itens: [],
    pedi_tota: 0,
  })

  const [modalVisivel, setModalVisivel] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [itemEditando, setItemEditando] = useState(null)

  useEffect(() => {
    const carregarEmpresaFilial = async () => {
      try {
        const { empresaId, filialId } = await getStoredData()

        setPedido((prev) => {
          const novoPedido = {
            ...prev,
            pedi_empr: empresaId,
            pedi_fili: filialId,
          }
          console.log(
            'Empresa e Filial carregadas:',
            novoPedido.pedi_empr,
            novoPedido.pedi_fili
          )
          return novoPedido
        })
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
  const handleRemoverItem = (item) => {
    const novosItens = pedido.itens.filter(
      (i) => i.iped_prod !== item.iped_prod
    )
    const novoTotal = novosItens.reduce((acc, i) => acc + i.iped_tota, 0)
    setPedido((prev) => ({
      ...prev,
      itens: novosItens,
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
        itens={pedido.itens}
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
    backgroundColor: '#1a2f3d',
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
    color: 'BLACK',
    fontWeight: 'bold',
    fontSize: 16,
  },
})
