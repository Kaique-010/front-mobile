import React, { useState, useEffect } from 'react'
import { FlatList, View, ActivityIndicator } from 'react-native'
import { TextInput, Card, Snackbar } from 'react-native-paper'
import { buscarPecas } from '../repositorios/pecasRepository'
import { getStoredData } from '../services/storageService'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Hook de debounce otimizado
function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

export default function BuscaProdutoInput({ onSelect, initialValue = '' }) {
  const [searchTerm, setSearchTerm] = useState(initialValue)
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [produtos, setProdutos] = useState([])
  const [snackbarVisible, setSnackbarVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [usuarioTemSetor, setUsuarioTemSetor] = useState(false)
  const [empresaId, setEmpresaId] = useState(null)

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const setor = await AsyncStorage.getItem('setor')
        const temSetor = setor && setor !== '0' && setor !== 'null'
        setUsuarioTemSetor(temSetor)
        console.log('👤 [BuscaProduto] Usuário tem setor:', temSetor)

        const data = await getStoredData()
        if (data && data.empresaId) {
          setEmpresaId(data.empresaId)
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        setUsuarioTemSetor(false)
      }
    }
    carregarDados()
  }, [])

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
        console.log(
          `🔍 [BUSCA-OTIMIZADA] Buscando produtos para: "${debouncedSearchTerm}"`
        )

        const resultados = await buscarPecas({
          termo: debouncedSearchTerm,
          empresaId,
        })

        const validos = resultados.filter((p) => p?.prod_codi)

        console.log(
          `✅ [BUSCA-OTIMIZADA] Encontrados ${validos.length} produtos válidos`
        )
        setProdutos(validos)
      } catch (err) {
        console.error('❌ Erro ao buscar produtos:', err.message)
      } finally {
        setLoading(false)
      }
    }

    buscar()
  }, [debouncedSearchTerm, empresaId])

  const handleSelecionarProduto = (produto) => {
    if (!produto?.prod_codi) {
      console.warn('❌ Produto inválido selecionado:', produto)
      return
    }

    onSelect(produto)
    setSearchTerm(produto.prod_nome)
    setProdutos([])
    setSnackbarVisible(true)
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
          keyExtractor={(item) =>
            `produto-${item.prod_codi}-${item.prod_nome}-${item.prod_empr}`
          }
          nestedScrollEnabled={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          renderItem={({ item }) => {
            const mostrarPreco =
              !usuarioTemSetor &&
              (item.prod_preco_vista > 0 || item.prod_preco_normal > 0)

            const subtitle = mostrarPreco
              ? `Código: ${item.prod_codi} | UM: ${item.prod_unme} | Saldo: ${
                  item.saldo_estoque
                } | Preço: R$ ${(
                  item.prod_preco_vista ||
                  item.prod_preco_normal ||
                  0
                ).toFixed(2)}`
              : `Código: ${item.prod_codi} | UM: ${item.prod_unme} | Saldo: ${item.saldo_estoque}`

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
                  title={item.prod_nome}
                  subtitle={subtitle}
                  titleStyle={{ color: 'white', fontWeight: 'bold' }}
                  subtitleStyle={{ color: '#A1A1A1' }}
                />
              </Card>
            )
          }}
        />
      )}

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
