import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import OrcamentoHeader from '../componentsOrcamentos/OrcamentoHeader'
import ItensList from '../componentsOrcamentos/ItensLista'
import ItensModal from '../componentsOrcamentos/ItensModal'
import ResumoOrcamento from '../componentsOrcamentos/ResumoOrcamento'
import { apiGetComContexto } from '../utils/api'

const ORCAMENTO_CACHE_ID = 'orcamento-edicao-cache'

export default function TelaOrcamento({ route, navigation }) {
  const orcamentoParam = route.params?.orcamento || null

  const [orcamento, setOrcamento] = useState({
    pedi_empr: null,
    pedi_fili: null,
    pedi_forn: null,
    pedi_vend: null,
    pedi_data: new Date().toISOString().split('T')[0],
    pedi_obse: null,
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
    const carregarOrcamento = async () => {
      setCarregando(true)
      try {
        const { empresaId, filialId } = await carregarContexto()

        if (orcamentoParam && orcamentoParam.pedi_nume) {
          const data = await apiGetComContexto(
            `orcamentos/orcamentos/${orcamentoParam.pedi_nume}/`
          )
          const itens = data.itens || []

          setOrcamento({
            ...data,
            itens_input: itens,
            pedi_tota: calcularTotal(itens),
          })

          await AsyncStorage.setItem(
            ORCAMENTO_CACHE_ID,
            JSON.stringify({
              ...data,
              itens_input: itens,
              pedi_tota: calcularTotal(itens),
            })
          )
        } else {
          await AsyncStorage.removeItem(ORCAMENTO_CACHE_ID)
          setOrcamento({
            pedi_empr: empresaId,
            pedi_fili: filialId,
            pedi_forn: null,
            pedi_vend: null,
            pedi_data: new Date().toISOString().split('T')[0],
            pedi_obse: 'orcamento Enviado por Mobile',
            itens_input: [],
            itens_removidos: [],
            pedi_tota: 0,
          })
        }
      } catch (error) {
        console.error('Erro ao carregar Orçamento:', error)
      } finally {
        setCarregando(false)
      }
    }

    carregarOrcamento()
  }, [orcamentoParam])

  const handleAdicionarOuEditarItem = (novoItem) => {
    let novosItens = [...orcamento.itens_input]
    const index = novosItens.findIndex(
      (i) => i.iped_prod === novoItem.iped_prod
    )

    if (index !== -1) {
      novosItens[index] = novoItem
    } else {
      novosItens.push(novoItem)
    }

    const novoTotal = calcularTotal(novosItens)

    setOrcamento((prev) => ({
      ...prev,
      itens_input: novosItens,
      pedi_tota: novoTotal,
    }))

    setItemEditando(null)
    setModalVisivel(false)
  }

  const handleRemoverItem = (item) => {
    const novosItens = orcamento.itens_input.filter(
      (i) => i.iped_prod !== item.iped_prod
    )

    const novosRemovidos = item.idExistente
      ? [...orcamento.itens_removidos, item.iped_prod]
      : orcamento.itens_removidos

    const novoTotal = calcularTotal(novosItens)

    setOrcamento((prev) => ({
      ...prev,
      itens_input: novosItens,
      itens_removidos: novosRemovidos,
      pedi_tota: novoTotal,
    }))
  }

  return (
    <View style={styles.container}>
      <OrcamentoHeader orcamento={orcamento} setOrcamento={setOrcamento} />

      <TouchableOpacity
        style={styles.botaoadditens}
        onPress={() => setModalVisivel(true)}>
        <Text style={styles.textobotao}>Adicionar Item</Text>
      </TouchableOpacity>

      <ItensList
        itens={orcamento.itens_input}
        onEdit={(item) => {
          setItemEditando(item)
          setModalVisivel(true)
        }}
        onRemove={handleRemoverItem}
      />

      <ResumoOrcamento total={orcamento.pedi_tota} orcamento={orcamento} />

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
