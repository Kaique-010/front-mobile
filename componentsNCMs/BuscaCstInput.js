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
      v?.codigo ??
      v?.value ??
      JSON.stringify(v)
    )
  }
  return String(v)
}

export default function BuscaCstInput({
  tributo,
  value = '',
  onChange,
  placeholder = 'Buscar CST...',
}) {
  const [termo, setTermo] = useState(value || '')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState(null)
  const [dados, setDados] = useState(null)
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    if (value != null && value !== termo) setTermo(String(value))
  }, [value])

  useEffect(() => {
    let alive = true
    const carregar = async () => {
      setLoading(true)
      setErro(null)
      try {
        const resp = await request({
          method: 'get',
          endpoint: 'produtos/ncmfiscalpadrao/buscacsts',
        })
        const data = resp?.data ?? resp
        if (!alive) return
        setDados(data)
      } catch (e) {
        if (!alive) return
        setErro('Falha ao carregar CSTs')
        setDados(null)
      } finally {
        if (!alive) return
        setLoading(false)
      }
    }

    carregar()
    return () => {
      alive = false
    }
  }, [])

  const listaBase = useMemo(() => {
    const tributos = dados?.tributos
    const lista = tributo ? tributos?.[tributo] : null
    return Array.isArray(lista) ? lista : []
  }, [dados, tributo])

  const listaFiltrada = useMemo(() => {
    const q = String(termo || '').trim().toLowerCase()
    if (!q) return listaBase
    return listaBase.filter((c) => {
      const codigo = toText(c?.codigo).toLowerCase()
      const desc = toText(c?.descricao).toLowerCase()
      return codigo.includes(q) || desc.includes(q)
    })
  }, [listaBase, termo])

  const selecionar = (item) => {
    Keyboard.dismiss()
    setShowResults(false)
    const codigo = toText(item?.codigo)
    setTermo(codigo)
    if (onChange) onChange(codigo, item)
  }

  const limpar = () => {
    setTermo('')
    setShowResults(false)
    if (onChange) onChange('', null)
  }

  const renderItem = ({ item }) => {
    const codigo = toText(item?.codigo)
    const desc = toText(item?.descricao)
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
          autoCapitalize="characters"
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

      {erro ? (
        <View style={{ paddingVertical: 6 }}>
          <Text style={{ color: '#dc3545' }}>{erro}</Text>
        </View>
      ) : null}

      {showResults && listaFiltrada.length > 0 ? (
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
            data={listaFiltrada}
            keyExtractor={(item, index) =>
              String(item?.codigo ?? `cst-${index}`)
            }
            keyboardShouldPersistTaps="handled"
            renderItem={renderItem}
          />
        </View>
      ) : null}
    </View>
  )
}
