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

export default function BuscaVoltagemInput({ onSelect, initialValue = '' }) {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [voltagens, setVoltagens] = useState([])
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
        console.log('ℹ️ [VOLTAGEM] Buscando nome para código:', initialValue)
        setLoading(true)
        
        // Busca por código exato para evitar nomes/valores incorretos
        const data = await apiGetComContexto(
          'ordemdeservico/voltagens/',
          { osvo_codi: Number(initialValue), limit: 1 },
          'voltagem_'
        )
        
        if (isCancelled) return

        const candidatos = (data?.results || []).filter(
          (p) => p?.osvo_codi && !isNaN(Number(p.osvo_codi))
        )
        
        const match = candidatos.find(
          (p) => Number(p.osvo_codi) === Number(initialValue)
        )

        if (match?.osvo_nome && !isCancelled) {
          console.log('✅ [VOLTAGEM] Nome encontrado:', match.osvo_nome)
          setSearchTerm(match.osvo_nome)
        }
      } catch (err) {
        console.error('❌ Erro ao buscar voltagem por código:', err?.message || err)
        if (!isCancelled) {
          setErrorMessage('Não foi possível obter a voltagem.')
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

  // Busca voltagens enquanto o usuário digita
  useEffect(() => {
    if (debouncedSearchTerm.trim().length < 2) {
      setVoltagens([])
      return
    }

    let isCancelled = false

    const buscar = async () => {
      setLoading(true)

      try {
        console.log(`🔍 [BUSCA] Voltagens: "${debouncedSearchTerm}"`)

        const data = await apiGetComContexto(
          'ordemdeservico/voltagens/',
          { search: debouncedSearchTerm, limit: 10 },
          'voltagem_'
        )

        if (isCancelled) return

        const validos = (data?.results || []).filter(
          (p) => p?.osvo_codi && !isNaN(Number(p.osvo_codi))
        )

        console.log(`✅ [BUSCA] ${validos.length} voltagens encontradas`)
        setVoltagens(validos)

      } catch (err) {
        console.error('❌ Erro ao buscar voltagens:', err?.message || err)
        if (!isCancelled) {
          setErrorMessage(err?.message || 'Falha ao buscar voltagens.')
          setErrorSnackbarVisible(true)
          setVoltagens([])
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

  const handleSelecionarVoltagem = (voltagem) => {
    try {
      console.log('🎯 [SELECAO] Voltagem:', voltagem)
      
      if (!voltagem?.osvo_codi || isNaN(Number(voltagem.osvo_codi))) {
        console.warn('❌ Voltagem inválida:', voltagem)
        return
      }

      console.log('✅ [SELECAO] Enviando objeto completo')

      if (onSelect && typeof onSelect === 'function') {
        // Envia o objeto completo para padronizar com BuscaProdutosInput
        onSelect(voltagem)
      }

      setSearchTerm(voltagem.osvo_nome)
      setVoltagens([])
      setSnackbarVisible(true)
    } catch (error) {
      console.error('❌ Erro ao selecionar voltagem:', error)
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
        label="Buscar voltagem"
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
        contentStyle={{ color: 'white' }}
      />

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#01ff16"
          style={{ marginVertical: 20 }}
        />
      ) : (
        voltagens.length > 0 && (
          <FlatList
            data={voltagens}
            keyExtractor={(item, index) =>
              `voltagem-${item?.osvo_codi ?? index}-${item?.osvo_nome}`
            }
            nestedScrollEnabled={true}
            maxToRenderPerBatch={10}
            windowSize={5}
            initialNumToRender={10}
            renderItem={({ item }) => (
              <Card
                onPress={() => handleSelecionarVoltagem(item)}
                style={{
                  marginVertical: 4,
                  backgroundColor: '#1c1c1c',
                  borderRadius: 8,
                  elevation: 3,
                }}>
                <Card.Title
                  title={item?.osvo_nome ?? 'Voltagem desconhecida'}
                  subtitle={`Código: ${item?.osvo_codi ?? '-'}`}
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
        Voltagem selecionada com sucesso!
      </Snackbar>

      <Snackbar
        visible={errorSnackbarVisible}
        onDismiss={() => setErrorSnackbarVisible(false)}
        duration={3000}
        style={{ backgroundColor: '#B00020' }}>
        {errorMessage || 'Erro inesperado ao buscar voltagens.'}
      </Snackbar>
    </View>
  )
}