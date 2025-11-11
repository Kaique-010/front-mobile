import React, { useState, useEffect } from 'react'
import { FlatList, View, ActivityIndicator } from 'react-native'
import { TextInput, Card, Snackbar } from 'react-native-paper'
import { apiGetComContexto } from '../utils/api'

function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

export default function BuscaMarcasInput({ onSelect, initialValue = '' }) {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [marcas, setMarcas] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [selectedMarca, setSelectedMarca] = useState(null)
  const [snackbarVisible, setSnackbarVisible] = useState(false)
  const [errorSnackbarVisible, setErrorSnackbarVisible] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(false)

  // Inicializa searchTerm apenas se initialValue for string
  useEffect(() => {
    try {
      if (initialValue && typeof initialValue === 'string') {
        setSearchTerm(initialValue)
      }
    } catch (error) {
      console.error('❌ Erro ao processar initialValue:', error)
    }
  }, [initialValue])

  // Pré-preenche o nome quando initialValue é um código numérico
  useEffect(() => {
    const isNumeric = (val) =>
      typeof val === 'number' || (typeof val === 'string' && /^\d+$/.test(val?.trim()))

    if (!initialValue || !isNumeric(initialValue)) return

    let isCancelled = false

    const fetchNome = async () => {
      try {
        console.log('ℹ️ [MARCA] Buscando nome para código:', initialValue)
        setLoading(true)
        
        // Busca por código exato para evitar nomes incorretos
        const data = await apiGetComContexto(
          'produtos/marcas/',
          { codigo: Number(initialValue), limit: 1 },
          'marca_'
        )
        
        if (isCancelled) return

        const candidatos = (data?.results || []).filter(
          (p) => p?.codigo && !isNaN(Number(p.codigo))
        )
        
        const match = candidatos.find(
          (p) => Number(p.codigo) === Number(initialValue)
        )

        if (match?.nome && !isCancelled) {
          console.log('✅ [MARCA] Nome encontrado:', match.nome)
          setSearchTerm(match.nome)
          setSelectedMarca(match)
          setShowResults(false)
        }
      } catch (err) {
        console.error('❌ Erro ao buscar marca por código:', err?.message || err)
        if (!isCancelled) {
          setErrorMessage('Não foi possível obter a marca.')
          setErrorSnackbarVisible(true)
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    fetchNome()

    return () => {
      isCancelled = true
    }
  }, [initialValue])

  // Busca marcas enquanto o usuário digita (somente 3+ caracteres, como BuscaClienteInput)
  useEffect(() => {
    if (debouncedSearchTerm.trim().length < 3) {
      setMarcas([])
      setShowResults(false)
      return
    }

    let isCancelled = false

    const buscar = async () => {
      setLoading(true)

      try {
        console.log(`🔍 [BUSCA] Marcas: "${debouncedSearchTerm}"`)

        const data = await apiGetComContexto(
          'produtos/marcas/',
          { search: debouncedSearchTerm, limit: 10 },
          'marca_'
        )

        if (isCancelled) return

        const validos = (data?.results || []).filter(
          (p) => p?.codigo && !isNaN(Number(p.codigo))
        )

        console.log(`✅ [BUSCA] ${validos.length} marcas encontradas`)
        setMarcas(validos)
        setShowResults(validos.length > 0)

      } catch (err) {
        console.error('❌ Erro ao buscar marcas:', err?.message || err)
        if (!isCancelled) {
          setErrorMessage(err?.message || 'Falha ao buscar marcas.')
          setErrorSnackbarVisible(true)
          setMarcas([])
          setShowResults(false)
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    buscar()

    return () => {
      isCancelled = true
    }
  }, [debouncedSearchTerm])

  const handleSelecionarMarca = (marca) => {
    try {
      console.log('🎯 [SELECAO] Marca:', marca)
      
      if (!marca?.codigo || isNaN(Number(marca.codigo))) {
        console.warn('❌ Marca inválida:', marca)
        return
      }

      console.log('✅ [SELECAO] Enviando objeto completo')

      if (onSelect && typeof onSelect === 'function') {
        // Envia o objeto completo para padronizar com BuscaProdutosInput
        onSelect(marca)
      }

      setSearchTerm(marca.nome)
      setMarcas([])
      setSelectedMarca(marca)
      setShowResults(false)
      setSnackbarVisible(true)
    } catch (error) {
      console.error('❌ Erro ao selecionar marca:', error)
    }
  }

  const limparSelecao = () => {
    setSearchTerm('')
    setMarcas([])
    setSelectedMarca(null)
    setShowResults(false)
    if (onSelect && typeof onSelect === 'function') {
      onSelect(null)
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
        label="Buscar marca"
        value={searchTerm}
        onChangeText={(text) => {
          setSearchTerm(text)
          setSelectedMarca(null)
          setShowResults(false)
        }}
        onFocus={() => {
          if (marcas.length > 0) {
            setShowResults(true)
          } else if (searchTerm && searchTerm.length >= 3 && !selectedMarca) {
            // O efeito de debounce já disparará a busca
          }
        }}
        right={
          <TextInput.Icon
            icon={selectedMarca ? 'close' : 'magnify'}
            onPress={selectedMarca ? limparSelecao : undefined}
          />
        }
        mode="outlined"
        theme={{
          colors: {
            primary: '#cedaf0',
            text: 'white',
            placeholder: '#bbb',
            background: '#232935',
          },
        }}
        contentStyle={{ color: 'white' }}
      />

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#01ff16"
          style={{ marginVertical: 20 }}
        />
      ) : (
        marcas.length > 0 && showResults && (
          <FlatList
            data={marcas}
            keyExtractor={(item, index) =>
              `marca-${item?.codigo ?? index}-${item?.nome}`
            }
            nestedScrollEnabled={true}
            maxToRenderPerBatch={10}
            windowSize={5}
            initialNumToRender={10}
            renderItem={({ item }) => (
              <Card
                onPress={() => handleSelecionarMarca(item)}
                style={{
                  marginVertical: 4,
                  backgroundColor: '#1c1c1c',
                  borderRadius: 8,
                  elevation: 3,
                }}>
                <Card.Title
                  title={item?.nome ?? 'Marca desconhecida'}
                  subtitle={`Código: ${item?.codigo ?? '-'}`}
                  titleStyle={{ color: 'white', fontWeight: 'bold' }}
                  subtitleStyle={{ color: '#A1A1A1' }}
                />
              </Card>
            )}
          />
        )
      )}

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={1500}
        style={{ backgroundColor: '#388E3C' }}>
        Marca selecionada com sucesso!
      </Snackbar>

      <Snackbar
        visible={errorSnackbarVisible}
        onDismiss={() => setErrorSnackbarVisible(false)}
        duration={3000}
        style={{ backgroundColor: '#B00020' }}>
        {errorMessage || 'Erro inesperado ao buscar marcas.'}
      </Snackbar>
    </View>
  )
}