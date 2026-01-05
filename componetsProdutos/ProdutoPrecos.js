import React, { useState, useEffect } from 'react'
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Toast from 'react-native-toast-message'
import { apiPutComContexto, apiPostComContexto } from '../utils/api'

export default function ProdutoPrecos({
  produto: propProduto,
  slug: propSlug,
  atualizarProduto: propAtualizarProduto,
}) {
  const navigation = useNavigation()
  const route = useRoute()
  const params = route.params || {}

  const produto = propProduto || params.produto || {}
  const slug = propSlug || params.slug || ''
  const atualizarProduto = propAtualizarProduto || params.atualizarProduto

  // Garante que os valores iniciais sejam strings para evitar erro no replace
  const [precoCompra, setPrecoCompra] = useState('')
  const [percentualAVista, setPercentualAVista] = useState('5')
  const [percentualAPrazo, setPercentualAPrazo] = useState('10')
  const [precoCusto, setPrecoCusto] = useState('')
  const [aVista, setAVista] = useState('')
  const [aPrazo, setAPrazo] = useState('')
  const [empresaId, setEmpresaId] = useState('')
  const [loading, setLoading] = useState(false)

  // Flags para controlar se os preços foram editados manualmente
  const [precoVistaEditado, setPrecoVistaEditado] = useState(false)
  const [precoPrazoEditado, setPrecoPrazoEditado] = useState(false)

  useEffect(() => {
    if (!produto || !produto.prod_codi) return

    const carregarOuIniciarCampos = async () => {
      const cacheKey = `precos-produto-${produto.prod_codi}`
      let tabela

      try {
        // tenta do AsyncStorage
        const json = await AsyncStorage.getItem(cacheKey)
        if (json) {
          try {
            tabela = JSON.parse(json)
          } catch (e) {
            console.error('Erro ao fazer parse do cache:', e)
            tabela = null
          }
        }

        if (!tabela) {
          // tenta da prop
          tabela = produto.precos?.[0] || null
        }

        if (!tabela) return

        // Setar valores básicos com garantia de string
        setPrecoCompra(String(tabela.tabe_prco ?? ''))
        setPrecoCusto(String(tabela.tabe_cuge ?? ''))
        setAVista(String(tabela.tabe_avis ?? ''))
        setAPrazo(String(tabela.tabe_apra ?? ''))

        // Se temos percentuais salvos, usar eles
        if (tabela.percentual_avis !== undefined) {
          setPercentualAVista(String(tabela.percentual_avis ?? ''))
        } else if (tabela.tabe_prco && tabela.tabe_avis) {
          // Senão, calcular a partir dos preços
          const prco = parseFloat(tabela.tabe_prco)
          const avis = parseFloat(tabela.tabe_avis)
          if (prco > 0) {
            const percAVista = ((avis / prco - 1) * 100).toFixed(2)
            setPercentualAVista(String(percAVista))
          }
        }

        if (tabela.percentual_apra !== undefined) {
          setPercentualAPrazo(String(tabela.percentual_apra ?? ''))
        } else if (tabela.tabe_prco && tabela.tabe_apra) {
          const prco = parseFloat(tabela.tabe_prco)
          const apra = parseFloat(tabela.tabe_apra)
          if (prco > 0) {
            const percAPrazo = ((apra / prco - 1) * 100).toFixed(2)
            setPercentualAPrazo(String(percAPrazo))
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'Não foi possível carregar os dados dos preços',
        })
      }
    }

    carregarOuIniciarCampos()
  }, [produto])

  useEffect(() => {
    const pCompraStr = precoCompra || '0'
    const pVistaStr = percentualAVista || '0'
    const pPrazoStr = percentualAPrazo || '0'

    const preco = parseFloat(pCompraStr.replace(',', '.')) || 0
    const pVista = parseFloat(pVistaStr.replace(',', '.')) || 0
    const pPrazo = parseFloat(pPrazoStr.replace(',', '.')) || 0

    setPrecoCusto(preco.toFixed(2))

    // Só recalcula os preços se não foram editados manualmente
    if (preco > 0) {
      if (!precoVistaEditado) {
        setAVista((preco * (1 + pVista / 100)).toFixed(2).replace('.', ','))
      }
      if (!precoPrazoEditado) {
        setAPrazo((preco * (1 + pPrazo / 100)).toFixed(2).replace('.', ','))
      }
    }
  }, [
    precoCompra,
    percentualAVista,
    percentualAPrazo,
    precoVistaEditado,
    precoPrazoEditado,
  ])

  // Função para recalcular percentuais quando preços à vista/prazo são editados
  const recalcularPercentuais = () => {
    const pCompraStr = precoCompra || '0'
    const aVistaStr = aVista || '0'
    const aPrazoStr = aPrazo || '0'

    const preco = parseFloat(pCompraStr.replace(',', '.')) || 0
    const vista = parseFloat(aVistaStr.replace(',', '.')) || 0
    const prazo = parseFloat(aPrazoStr.replace(',', '.')) || 0

    if (preco > 0) {
      if (vista > 0) {
        const novoPercVista = ((vista / preco - 1) * 100)
          .toFixed(2)
          .replace('.', ',')
        setPercentualAVista(novoPercVista)
      }

      if (prazo > 0) {
        const novoPercPrazo = ((prazo / preco - 1) * 100)
          .toFixed(2)
          .replace('.', ',')
        setPercentualAPrazo(novoPercPrazo)
      }
    }
  }

  const validarCampos = () => {
    if (!precoCompra || parseFloat(precoCompra) <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'O preço de compra deve ser maior que zero',
      })
      return false
    }

    if (!percentualAVista || parseFloat(percentualAVista) < 0) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'O percentual à vista deve ser maior ou igual a zero',
      })
      return false
    }

    if (!percentualAPrazo || parseFloat(percentualAPrazo) < 0) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'O percentual a prazo deve ser maior ou igual a zero',
      })
      return false
    }

    return true
  }

  useEffect(() => {
    const carregarContexto = async () => {
      try {
        const empresaIdStorage = await AsyncStorage.getItem('empresaId')
        setEmpresaId(empresaIdStorage || '1')
      } catch (error) {
        console.error('Erro ao carregar empresaId:', error)
      }
    }
    carregarContexto()
  }, [])

  const salvar = async () => {
    if (!validarCampos()) return

    if (!produto?.prod_codi) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Código do produto não identificado',
      })
      return
    }

    setLoading(true)

    try {
      // Buscar sempre do AsyncStorage com fallback seguro
      const empresaIdStorage = await AsyncStorage.getItem('empresaId')
      const filialIdStorage = await AsyncStorage.getItem('filialId')

      const empresaId =
        empresaIdStorage && !isNaN(parseInt(empresaIdStorage))
          ? parseInt(empresaIdStorage)
          : 1

      const filialId =
        filialIdStorage && !isNaN(parseInt(filialIdStorage))
          ? parseInt(filialIdStorage)
          : 1

      const payload = {
        tabe_empr: empresaId,
        tabe_fili: filialId,
        tabe_prod: String(produto.prod_codi),
        tabe_prco: parseFloat(precoCompra.replace(',', '.')) || 0,
        tabe_cuge: parseFloat(precoCusto.replace(',', '.')) || 0,
        percentual_avis: parseFloat(percentualAVista.replace(',', '.')) || 0,
        percentual_apra: parseFloat(percentualAPrazo.replace(',', '.')) || 0,
      }

      const chave = `${payload.tabe_empr}-${payload.tabe_fili}-${payload.tabe_prod}`
      console.log('🔍 [PRODUTO-PRECOS] Salvando preços:', { chave, payload })

      let response
      // tenta PUT (atualizar)
      try {
        response = await apiPutComContexto(
          `produtos/tabelapreco/${chave}/`,
          payload
        )
      } catch (error) {
        if (error?.response?.status === 404) {
          // se não existe, cria com POST
          console.log(
            'ℹ️ [PRODUTO-PRECOS] Tabela não encontrada, criando nova...'
          )
          response = await apiPostComContexto(`produtos/tabelapreco/`, payload)
        } else {
          throw error
        }
      }

      // Atualizar o cache com os dados retornados da API
      const dadosAtualizados = response?.data || response || payload

      // Verificar se dadosAtualizados não é undefined antes de armazenar
      if (dadosAtualizados) {
        await AsyncStorage.setItem(
          `precos-produto-${produto.prod_codi}`,
          JSON.stringify(dadosAtualizados)
        )
      }

      Toast.show({
        type: 'success',
        text1: 'Sucesso!',
        text2: 'Preços atualizados com sucesso',
      })

      // Atualizar o produto com os preços calculados pelo backend
      if (typeof atualizarProduto === 'function') {
        atualizarProduto({ ...produto, precos: [dadosAtualizados] })
      } else {
        console.warn('atualizarProduto não é uma função')
      }
      setTimeout(() => navigation.goBack(), 1000)
    } catch (error) {
      console.error('❌ [PRODUTO-PRECOS] Erro ao salvar preços:', error)
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2:
          error?.response?.data?.detail || 'Não foi possível salvar os preços',
      })
    } finally {
      setLoading(false)
    }
  }

  const formatarNumero = (valor) => {
    // Remove caracteres não numéricos exceto vírgula
    const numero = valor.replace(/[^\d,]/g, '')
    // Garante apenas uma vírgula
    const partes = numero.split(',')
    if (partes.length > 2) {
      return partes[0] + ',' + partes[1]
    }
    return numero
  }

  return (
    <ScrollView style={styles.container}>
      <Campo
        label="Preço de Compra"
        value={precoCompra}
        onChange={(valor) => {
          setPrecoCompra(formatarNumero(valor))
          // Reset flags quando preço de compra é editado
          setPrecoVistaEditado(false)
          setPrecoPrazoEditado(false)
        }}
        placeholder="0,00"
      />
      <Campo
        label="Percentual à Vista (%)"
        value={percentualAVista}
        onChange={(valor) => {
          setPercentualAVista(formatarNumero(valor))
          setPrecoVistaEditado(false) // Reset flag quando percentual é editado
        }}
        placeholder="0,00"
      />
      <Campo
        label="Percentual a Prazo (%)"
        value={percentualAPrazo}
        onChange={(valor) => {
          setPercentualAPrazo(formatarNumero(valor))
          setPrecoPrazoEditado(false) // Reset flag quando percentual é editado
        }}
        placeholder="0,00"
      />
      <Campo
        label="Preço à Vista"
        value={aVista}
        onChange={(valor) => {
          setAVista(formatarNumero(valor))
          setPrecoVistaEditado(true) // Marca que foi editado manualmente
          // Recalcula percentual após um pequeno delay para evitar cálculos excessivos
          setTimeout(recalcularPercentuais, 300)
        }}
        editable={true}
        placeholder="0,00"
      />
      <Campo
        label="Preço a Prazo"
        value={aPrazo}
        onChange={(valor) => {
          setAPrazo(formatarNumero(valor))
          setPrecoPrazoEditado(true) // Marca que foi editado manualmente
          // Recalcula percentual após um pequeno delay para evitar cálculos excessivos
          setTimeout(recalcularPercentuais, 300)
        }}
        editable={true}
        placeholder="0,00"
      />

      <TouchableOpacity
        onPress={salvar}
        style={[styles.button, loading && { opacity: 0.6 }]}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Salvar</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  )
}

function Campo({
  label,
  value,
  onChange,
  editable = true,
  dark = false,
  placeholder,
}) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        editable={editable}
        keyboardType="decimal-pad"
        placeholder={placeholder}
        placeholderTextColor={dark ? '#666' : '#999'}
        style={[
          styles.input,
          !editable && {
            backgroundColor: dark ? '#333' : '#eee',
            color: dark ? '#fff' : '#000',
          },
        ]}
      />
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 35,
    backgroundColor: '#0B141A',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
    padding: 10,
    fontSize: 16,
    color: 'white',
  },
  label: {
    marginBottom: 4,
    fontWeight: 'bold',
    fontSize: 14,
    color: '#fff',
  },
  button: {
    backgroundColor: '#0058A2',
    padding: 12,
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
})
