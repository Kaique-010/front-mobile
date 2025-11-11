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

export default function BuscaSetorInput({ onSelect, initialValue = '' }) {
  const [searchTerm, setSearchTerm] = useState(
    typeof initialValue === 'string' ? initialValue : ''
  )
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [setores, setSetores] = useState([])
  const [snackbarVisible, setSnackbarVisible] = useState(false)
  const [errorSnackbarVisible, setErrorSnackbarVisible] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(false)

  // Atualiza searchTerm quando initialValue muda (apenas strings)
  useEffect(() => {
    if (typeof initialValue === 'string' && initialValue) {
      setSearchTerm(initialValue)
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
        console.log('ℹ️ [SETOR] Buscando nome para código:', initialValue)
        setLoading(true)
        
        const data = await apiGetComContexto(
          'ordemdeservico/fase-setor/',
          { search: String(initialValue), limit: 5 },
          'seto_'
        )
        
        if (isCancelled) return

        const candidatos = (data?.results || []).filter(
          (p) => p?.osfs_codi && !isNaN(Number(p.osfs_codi))
        )
        
        const match = candidatos.find(
          (p) => Number(p.osfs_codi) === Number(initialValue)
        ) || candidatos[0]

        if (match?.osfs_nome && !isCancelled) {
          console.log('✅ [SETOR] Nome encontrado:', match.osfs_nome)
          setSearchTerm(match.osfs_nome)
        }
      } catch (err) {
        console.error('❌ Erro ao buscar setor por código:', err?.message || err)
        if (!isCancelled) {
          setErrorMessage('Não foi possível obter o setor.')
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

  // Busca setores enquanto o usuário digita
  useEffect(() => {
    if (debouncedSearchTerm.trim().length < 2) {
      setSetores([])
      return
    }

    let isCancelled = false

    const buscar = async () => {
      setLoading(true)

      try {
        console.log(`🔍 [BUSCA] Setores: "${debouncedSearchTerm}"`)

        const data = await apiGetComContexto(
          'ordemdeservico/fase-setor/',
          { search: debouncedSearchTerm, limit: 10 },
          'seto_'
        )

        if (isCancelled) return

        const validos = (data?.results || []).filter(
          (p) => p?.osfs_codi && !isNaN(Number(p.osfs_codi))
        )

        console.log(`✅ [BUSCA] ${validos.length} setores encontrados`)
        setSetores(validos)

      } catch (err) {
        console.error('❌ Erro ao buscar setores:', err?.message || err)
        if (!isCancelled) {
          setErrorMessage(err?.message || 'Falha ao buscar setores.')
          setErrorSnackbarVisible(true)
          setSetores([])
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

  const handleSelecionarSetor = (setor) => {
    try {
      console.log('🎯 [SELECAO] Setor:', setor)
      
      if (!setor?.osfs_codi || isNaN(Number(setor.osfs_codi))) {
        console.warn('❌ Setor inválido:', setor)
        return
      }

      console.log('✅ [SELECAO] Enviando setor completo')

      if (onSelect && typeof onSelect === 'function') {
        // Envia o objeto completo para manter compatibilidade
        onSelect(setor)
      }

      setSearchTerm(setor.osfs_nome)
      setSetores([])
      setSnackbarVisible(true)
    } catch (error) {
      console.error('❌ Erro ao selecionar setor:', error)
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
        label="Buscar setor"
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
        setores.length > 0 && (
          <FlatList
            data={setores}
            keyExtractor={(item, index) =>
              `setor-${item?.osfs_codi ?? index}-${item?.osfs_nome}`
            }
            nestedScrollEnabled={true}
            maxToRenderPerBatch={10}
            windowSize={5}
            initialNumToRender={10}
            renderItem={({ item }) => (
              <Card
                onPress={() => handleSelecionarSetor(item)}
                style={{
                  marginVertical: 4,
                  backgroundColor: '#1c1c1c',
                  borderRadius: 8,
                  elevation: 3,
                }}>
                <Card.Title
                  title={item?.osfs_nome ?? 'Setor desconhecido'}
                  subtitle={`Código: ${item?.osfs_codi ?? '-'}`}
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
        Setor selecionado com sucesso!
      </Snackbar>

      <Snackbar
        visible={errorSnackbarVisible}
        onDismiss={() => setErrorSnackbarVisible(false)}
        duration={3000}
        style={{ backgroundColor: '#B00020' }}>
        {errorMessage || 'Erro inesperado ao buscar setores.'}
      </Snackbar>
    </View>
  )
}