import React, { useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Keyboard,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { request } from '../utils/api'
import styles from './Styles/NcmStyles'

const toText = (v) => {
  if (v == null) return ''
  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean')
    return String(v)
  if (typeof v === 'object') {
    return (
      v?.descricao ??
      v?.desc ??
      v?.label ??
      v?.nome ??
      v?.ncm ??
      v?.codigo ??
      v?.value ??
      JSON.stringify(v)
    )
  }
  return String(v)
}

export default function BuscaNcmInput({
  value = '',
  onSelect,
  placeholder = 'Buscar NCM...',
}) {
  const [termo, setTermo] = useState(value || '')
  const [resultados, setResultados] = useState([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    if (value != null && value !== termo) setTermo(String(value))
  }, [value])

  useEffect(() => {
    const q = String(termo || '').trim()
    if (q.length < 2) {
      setResultados([])
      setShowResults(false)
      return
    }

    setLoading(true)
    const t = setTimeout(async () => {
      try {
        const resp = await request({
          method: 'get',
          endpoint: 'produtos/ncmfiscalpadrao/buscancm',
          params: { q, search: q, limit: 10 },
        })
        const data = resp?.data ?? resp
        const lista = Array.isArray(data?.results) ? data.results : data
        setResultados(Array.isArray(lista) ? lista : [])
        setShowResults(true)
      } catch (e) {
        setResultados([])
        setShowResults(false)
      } finally {
        setLoading(false)
      }
    }, 350)

    return () => clearTimeout(t)
  }, [termo])

  const itens = useMemo(() => {
    return Array.isArray(resultados) ? resultados : []
  }, [resultados])

  const selecionar = (item) => {
    Keyboard.dismiss()
    setShowResults(false)
    setResultados([])
    if (onSelect) onSelect(item)
    const codigo = toText(item?.ncm_id)
    setTermo(codigo)
  }

  const limpar = () => {
    setTermo('')
    setResultados([])
    setShowResults(false)
    if (onSelect) onSelect(null)
  }

  const renderItem = ({ item }) => {
    const codigo = toText(item?.ncm_id)
    const desc = toText(item?.ncm)
    return (
      <TouchableOpacity
        onPress={() => selecionar(item)}
        style={{
          paddingVertical: 10,
          paddingHorizontal: 12,
          borderTopWidth: 1,
          borderTopColor: 'rgba(222, 226, 230, 0.25)',
        }}>
        <Text style={{ color: 'white', fontWeight: '600' }}>
          {codigo || '-'}
        </Text>
        {desc ? (
          <Text style={{ color: '#f5f5f5', marginTop: 2 }}>{desc}</Text>
        ) : null}
      </TouchableOpacity>
    )
  }

  return (
    <View>
      <View style={{ position: 'relative' }}>
        <TextInput
          style={styles.input}
          value={termo}
          onChangeText={(t) => {
            setTermo(t)
            setShowResults(true)
          }}
          placeholder={placeholder}
          placeholderTextColor="#666"
          keyboardType="numeric"
        />

        {termo ? (
          <TouchableOpacity
            onPress={limpar}
            style={{
              position: 'absolute',
              right: 10,
              top: 12,
              padding: 4,
            }}>
            <MaterialIcons name="close" size={18} color="#bdc3c7" />
          </TouchableOpacity>
        ) : null}
      </View>

      {loading ? (
        <View style={{ paddingVertical: 10 }}>
          <ActivityIndicator size="small" color="#01ff16" />
        </View>
      ) : null}

      {showResults && itens.length > 0 ? (
        <View
          style={{
            backgroundColor: '#0c1c2c',
            borderWidth: 1,
            borderColor: '#dee2e6',
            borderRadius: 8,
            overflow: 'hidden',
            marginTop: 8,
            maxHeight: 260,
          }}>
          <FlatList
            data={itens}
            keyExtractor={(item, index) => {
              const key =
                item?.id ?? item?.ncm_pk ?? item?.ncm_fiscal_id ?? item?.ncm_id
              return String(key ?? `ncm-${index}`)
            }}
            keyboardShouldPersistTaps="handled"
            renderItem={renderItem}
          />
        </View>
      ) : null}
    </View>
  )
}
