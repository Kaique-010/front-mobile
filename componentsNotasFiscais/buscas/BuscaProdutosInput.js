import React, { useState, useEffect } from 'react'
import { FlatList, View, ActivityIndicator } from 'react-native'
import { TextInput, Card, Snackbar } from 'react-native-paper'
import {
  buscarPecas,
  buscarProdutoDetalhe,
} from '../repositorios/pecasRepository'

// Hook de debounce otimizado
function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

export default function BuscaProdutoInput({
  onSelect,
  initialValue = '',
  destinatarioId = null,
}) {
  const [searchTerm, setSearchTerm] = useState(initialValue)
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [produtos, setProdutos] = useState([])
  const [snackbarVisible, setSnackbarVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selecionando, setSelecionando] = useState(false)

  useEffect(() => {
    if (initialValue) setSearchTerm(initialValue)
  }, [initialValue])

  useEffect(() => {
    if (
      debouncedSearchTerm.trim().length < 2 ||
      debouncedSearchTerm === initialValue
    ) {
      setProdutos([])
      return
    }

    const buscar = async () => {
      setLoading(true)

      try {
        const resultados = await buscarPecas({
          termo: debouncedSearchTerm,
        })

        const validos = resultados.filter((p) => p?.value)
        setProdutos(validos)
      } catch (err) {
        console.error('Erro ao buscar produtos:', err.message)
      } finally {
        setLoading(false)
      }
    }

    buscar()
  }, [debouncedSearchTerm])

  const handleSelecionarProduto = async (produto) => {
    const codigo = produto?.value
    if (!codigo) {
      console.warn('Produto inválido selecionado:', produto)
      return
    }

    setSelecionando(true)
    try {
      console.log('🔎 [NF-PRODUTO] Selecionado:', {
        codigo: String(codigo),
        destinatarioId:
          destinatarioId != null ? String(destinatarioId) : destinatarioId,
      })
      const detalhe = await buscarProdutoDetalhe({
        codigo,
        destinatario: destinatarioId,
      })
      console.log('📦 [NF-PRODUTO] Detalhe recebido:', {
        keys:
          detalhe && typeof detalhe === 'object' ? Object.keys(detalhe) : [],
        resumo: {
          prod_nome: detalhe?.prod_nome,
          prod_ncm: detalhe?.prod_ncm,
          prod_preco_vista: detalhe?.prod_preco_vista,
          prod_preco_normal: detalhe?.prod_preco_normal,
          cfop_sugerido: detalhe?.cfop_sugerido,
          cst_icms_sugerido: detalhe?.cst_icms_sugerido,
          cst_pis_sugerido: detalhe?.cst_pis_sugerido,
          cst_cofins_sugerido: detalhe?.cst_cofins_sugerido,
        },
      })
      const payload = {
        value: codigo,
        label: produto?.label,
        prod_codi: codigo,
        prod_desc: produto?.prod_desc,
        ...(detalhe || {}),
      }
      console.log('Payload:', payload)
      onSelect(payload)
      setSearchTerm(payload?.prod_desc || payload?.label || String(codigo))
      setProdutos([])
      setSnackbarVisible(true)
    } catch (err) {
      console.error('Erro ao carregar detalhe do produto:', err?.message || err)
    } finally {
      setSelecionando(false)
    }
  }

  return (
    <View>
      <TextInput
        style={{
          backgroundColor: '#232935',
          color: 'white',
          borderRadius: 10,
          marginBottom: 10,
        }}
        label="Buscar produto"
        value={searchTerm}
        onChangeText={setSearchTerm}
        right={<TextInput.Icon icon="magnify" />}
        mode="outlined"
        theme={{
          colors: {
            primary: '#cedaf0',
            text: 'white',
            placeholder: '#bbb',
            background: '#232935',
          },
        }}
        contentStyle={{
          color: 'white',
        }}
      />

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#01ff16"
          style={{ marginVertical: 20 }}
        />
      ) : (
        <FlatList
          data={produtos}
          keyExtractor={(item) => `produto-${item.value}`}
          nestedScrollEnabled={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          renderItem={({ item }) => {
            const subtitle = `Código: ${item.value}}`

            return (
              <Card
                onPress={() => handleSelecionarProduto(item)}
                style={{
                  marginVertical: 4,
                  backgroundColor: '#1c1c1c',
                  borderRadius: 8,
                  elevation: 3,
                }}>
                <Card.Title
                  title={item.prod_desc || item.label}
                  subtitle={subtitle}
                  titleStyle={{ color: 'white', fontWeight: 'bold' }}
                  subtitleStyle={{ color: '#A1A1A1' }}
                />
              </Card>
            )
          }}
        />
      )}

      {selecionando ? (
        <ActivityIndicator
          size="small"
          color="#10a2a7"
          style={{ marginVertical: 10 }}
        />
      ) : null}

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={1500}
        style={{ backgroundColor: '#388E3C' }}>
        Produto adicionado com sucesso!
      </Snackbar>
    </View>
  )
}
