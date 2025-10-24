// useItensListaCasamento.js
import { useState, useEffect } from 'react'
import { apiGet, apiPost } from '../utils/api'
import { Alert } from 'react-native'
import useContextoApp from './useContextoApp'
import { getStoredData } from '../services/storageService'

export default function useItensListaCasamento({
  empresaId,
  filialId,
  listaId,
}) {
  const [itensSalvos, setItensSalvos] = useState([])
  const [selecionados, setSelecionados] = useState([])
  const [remocoesPendentes, setRemocoesPendentes] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const { usuarioId } = useContextoApp()

  const [slug, setSlug] = useState('')

  useEffect(() => {
    const carregarSlug = async () => {
      try {
        const { slug } = await getStoredData()
        if (slug) setSlug(slug)
        else console.warn('Slug não encontrado')
      } catch (err) {
        console.error('Erro ao carregar slug:', err.message)
      }
    }
    carregarSlug()
  }, [])

  useEffect(() => {
    if (slug) {
      carregarItens()
    }
  }, [slug])

  const carregarItens = async () => {
    setCarregando(true)
    try {
      const data = await apiGet(
        `/api/${slug}/listacasamento/itens-lista-casamento/`,
        {
          item_list: listaId,
          item_empr: empresaId,
          item_fili: filialId,
        }
      )
      setItensSalvos(data.results || [])
    } catch (e) {
      console.error('Erro ao carregar:', e)
    } finally {
      setCarregando(false)
    }
  }

  const adicionarProduto = (produto) => {
    if (!selecionados.find((p) => p.prod_codi === produto.prod_codi)) {
      const produtoComQuantidade = {
        ...produto,
        item_quan: 1, // Quantidade padrão
      }
      setSelecionados((prev) => [...prev, produtoComQuantidade])
    }
  }

  const removerProduto = (prod_codi) => {
    setSelecionados((prev) => prev.filter((p) => p.prod_codi !== prod_codi))
  }

  const marcarParaRemocao = (item) => {
    const chave = (x) =>
      `${x.item_empr}-${x.item_fili}-${x.item_list}-${x.item_item}`
    const chaveItem = chave(item)

    if (!remocoesPendentes.some((r) => chave(r) === chaveItem)) {
      setRemocoesPendentes((prev) => [...prev, item])
      setItensSalvos((prev) => prev.filter((i) => chave(i) !== chaveItem))
    }
  }

  const alterarQuantidade = (prod_codi, novaQuantidade) => {
    setSelecionados((prev) =>
      prev.map((item) =>
        item.prod_codi === prod_codi
          ? { ...item, item_quan: novaQuantidade }
          : item
      )
    )
  }

  const alterarQuantidadeItem = (item, novaQuantidade) => {
    // Para itens já salvos, atualizar diretamente
    setItensSalvos((prev) =>
      prev.map((i) =>
        i.item_empr === item.item_empr &&
        i.item_fili === item.item_fili &&
        i.item_list === item.item_list &&
        i.item_item === item.item_item
          ? { ...i, item_quan: novaQuantidade }
          : i
      )
    )

    // Para itens selecionados, também atualizar
    setSelecionados((prev) =>
      prev.map((i) =>
        i.prod_codi === item.prod_codi ? { ...i, item_quan: novaQuantidade } : i
      )
    )
  }

  const salvarItens = async () => {
    setSalvando(true)
    try {
      const payload = {
        remover: remocoesPendentes,
        adicionar: selecionados.map((item) => ({
          item_empr: empresaId,
          item_fili: filialId,
          item_list: listaId,
          item_clie: 0,
          item_usua: usuarioId,
          item_pedi: 0,
          item_prod: item.prod_codi, // Alterado de item_item para item_prod
          item_quan: Number.isFinite(Number(item.item_quan))
            ? Number(item.item_quan)
            : 0,
          item_prec: item.prod_preco_vista || 0, // Preço à vista
          item_total:
            Number(item.item_quan || 1) * Number(item.prod_preco_vista || 0), // Total calculado
        })),
      }

      await apiPost(
        `/api/${slug}/listacasamento/itens-lista-casamento/update-lista/`,
        payload
      )
      console.log('Payload para salvar itens :', payload)

      Alert.alert('Sucesso', 'Alterações salvas com sucesso!')
      setSelecionados([])
      setRemocoesPendentes([])
      await carregarItens()
    } catch (err) {
      console.error('Erro ao salvar:', err)
      Alert.alert(
        'Erro',
        err.response?.data?.detail || 'Erro ao salvar alterações'
      )
    } finally {
      setSalvando(false)
    }
  }

  return {
    itensSalvos,
    listaId,
    selecionados,
    adicionarProduto,
    removerProduto,
    marcarParaRemocao,
    salvarItens,
    alterarQuantidade,
    alterarQuantidadeItem,
    carregando,
    salvando,
    remocoesPendentes,
  }
}
