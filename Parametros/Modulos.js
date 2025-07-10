import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  Switch,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native'
import { apiGetComContexto, apiPatchComContexto } from '../utils/api' // já usa tua estrutura
import AsyncStorage from '@react-native-async-storage/async-storage'

const PermissoesModulos = () => {
  const [modulos, setModulos] = useState([])
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    buscarModulos()
  }, [])

  const buscarModulos = async () => {
    try {
      const data = await apiGetComContexto(
        'parametros-admin/atualizapermissoes/'
      ) // <- endpoint pra trazer todos
      setModulos(data)
    } catch (error) {
      console.error('Erro ao buscar módulos:', error)
    } finally {
      setLoading(false)
    }
  }

  const alternarModulo = (nome) => {
    setModulos((prev) =>
      prev.map((mod) =>
        mod.nome === nome ? { ...mod, ativo: !mod.ativo } : mod
      )
    )
  }

  const salvarPermissoes = async () => {
    setSalvando(true)
    try {
      // Alterar de 'username' para 'usuario_id'
      const usuario = await AsyncStorage.getItem('usuario_id')

      const payload = {
        usuario,
        modulos: modulos.map(({ nome, ativo }) => ({ nome, ativo })),
      }

      await apiPatchComContexto('parametros-admin/atualizapermissoes/', payload)
      alert('Permissões salvas com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar permissões:', error)
      alert('Erro ao salvar permissões.')
    } finally {
      setSalvando(false)
    }
  }

  const renderItem = ({ item }) => (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        borderBottomWidth: 1,
        borderColor: '#ccc',
      }}>
      <Text>{item.nome}</Text>
      <Switch
        value={item.ativo}
        onValueChange={() => alternarModulo(item.nome)}
      />
    </View>
  )

  if (loading) return <ActivityIndicator size="large" />

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <FlatList
        data={modulos}
        keyExtractor={(item) => item.nome}
        renderItem={renderItem}
      />

      <TouchableOpacity
        onPress={salvarPermissoes}
        style={{
          backgroundColor: '#2196F3',
          padding: 15,
          borderRadius: 8,
          marginTop: 20,
        }}
        disabled={salvando}>
        <Text
          style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>
          {salvando ? 'Salvando...' : 'Salvar Permissões'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

export default PermissoesModulos
