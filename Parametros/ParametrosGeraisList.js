import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { Picker } from '@react-native-picker/picker'
import Toast from 'react-native-toast-message'
import { useFocusEffect } from '@react-navigation/native'
import {
  getParametrosGerais,
  deleteParametroGeral,
  importarParametrosPadrao,
} from '../services/parametrosService'
import { getStoredData } from '../services/storageService'
import { parametrosStyles } from './styles/parametrosStyles'
import debounce from 'lodash.debounce'

export default function ParametrosGeraisList({ navigation }) {
  const [parametros, setParametros] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchValue, setSearchValue] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState('')
  const [empresaId, setEmpresaId] = useState('')
  const [filialId, setFilialId] = useState('')

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const { empresaId, filialId } = await getStoredData()
        setEmpresaId(empresaId)
        setFilialId(filialId)
      } catch (err) {
        console.error('Erro ao carregar dados:', err.message)
      }
    }
    carregarDados()
  }, [])

  const debouncedSetSearchValue = useCallback(
    debounce((val) => {
      setSearchValue(val)
    }, 600),
    []
  )

  const buscarParametros = async () => {
    setLoading(true)
    try {
      const params = {
        search: searchValue,
        para_tipo: tipoFiltro,
        para_empr: empresaId,
        para_fili: filialId,
      }

      const data = await getParametrosGerais(params)
      setParametros(data.results || [])
    } catch (error) {
      console.error('Erro ao buscar parâmetros:', error)
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível carregar os parâmetros',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (empresaId && filialId) {
      buscarParametros()
    }
  }, [searchValue, tipoFiltro, empresaId, filialId])

  useFocusEffect(
    React.useCallback(() => {
      const msg =
        navigation?.getState()?.routes?.[navigation.getState().index]?.params
          ?.mensagemSucesso
      if (msg) {
        Toast.show({ type: 'success', text1: 'Sucesso!', text2: msg })
        navigation.setParams({ mensagemSucesso: null })
      }
    }, [navigation])
  )

  const confirmarExclusao = (item) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja excluir o parâmetro "${item.para_nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => excluirParametro(item),
        },
      ]
    )
  }

  const excluirParametro = async (item) => {
    try {
      await deleteParametroGeral(item.para_codi)
      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Parâmetro excluído com sucesso',
      })
      buscarParametros()
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível excluir o parâmetro',
      })
    }
  }

  const importarPadrao = async () => {
    try {
      const data = await importarParametrosPadrao({
        para_empr: empresaId,
        para_fili: filialId,
      })
      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: data.message,
      })
      buscarParametros()
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível importar parâmetros padrão',
      })
    }
  }

  const renderParametro = ({ item }) => (
    <View style={parametrosStyles.card}>
      <View style={parametrosStyles.cardHeader}>
        <Text style={parametrosStyles.parametroNome}>{item.para_nome}</Text>
        <View style={parametrosStyles.tipoBadge}>
          <Text style={parametrosStyles.tipoTexto}>{item.para_tipo}</Text>
        </View>
      </View>

      <Text style={parametrosStyles.parametroDescricao}>{item.para_desc}</Text>

      <View style={parametrosStyles.valorContainer}>
        <Text style={parametrosStyles.valorLabel}>Valor:</Text>
        <Text style={parametrosStyles.valorTexto}>
          {item.valor_typed !== undefined
            ? String(item.valor_typed)
            : item.para_valo}
        </Text>
      </View>

      <View style={parametrosStyles.metadados}>
        <Text style={parametrosStyles.metadadosTexto}>Empresa: {item.para_empr}</Text>
        <Text style={parametrosStyles.metadadosTexto}>Filial: {item.para_fili}</Text>
        <Text style={parametrosStyles.metadadosTexto}>
          Ativo: {item.para_ativ ? 'Sim' : 'Não'}
        </Text>
      </View>

      <View style={parametrosStyles.actions}>
        <TouchableOpacity
          style={parametrosStyles.botaoEditar}
          onPress={() =>
            navigation.navigate('ParametrosGeraisForm', { parametro: item })
          }>
          <Text style={parametrosStyles.botaoTexto}>✏️ Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={parametrosStyles.botaoExcluir}
          onPress={() => confirmarExclusao(item)}>
          <Text style={parametrosStyles.botaoTexto}>🗑️ Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <View style={parametrosStyles.container}>
      <View style={parametrosStyles.toolbar}>
        <TouchableOpacity
          style={parametrosStyles.incluirButton}
          onPress={() => navigation.navigate('ParametrosGeraisForm')}>
          <Text style={parametrosStyles.incluirButtonText}>+ Novo Parâmetro</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={parametrosStyles.importarButton}
          onPress={importarPadrao}>
          <Text style={parametrosStyles.importarButtonText}>📥 Importar Padrão</Text>
        </TouchableOpacity>
      </View>

      <View style={parametrosStyles.filtrosContainer}>
        <View style={parametrosStyles.searchContainer}>
          <TextInput
            placeholder="Buscar parâmetros..."
            placeholderTextColor="#777"
            style={parametrosStyles.searchInput}
            value={searchTerm}
            onChangeText={(text) => {
              setSearchTerm(text)
              debouncedSetSearchValue(text)
            }}
          />
        </View>

        <View style={parametrosStyles.pickerContainer}>
          <Picker
            selectedValue={tipoFiltro}
            style={parametrosStyles.picker}
            onValueChange={setTipoFiltro}>
            <Picker.Item label="Todos os tipos" value="" />
            <Picker.Item label="Texto" value="string" />
            <Picker.Item label="Booleano" value="boolean" />
            <Picker.Item label="Inteiro" value="integer" />
            <Picker.Item label="Decimal" value="decimal" />
            <Picker.Item label="JSON" value="json" />
          </Picker>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#007bff"
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={parametros}
          renderItem={renderParametro}
          keyExtractor={(item) => `${item.para_codi}`}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Text style={parametrosStyles.footerText}>
        {parametros.length} parâmetro{parametros.length !== 1 ? 's' : ''}{' '}
        encontrado{parametros.length !== 1 ? 's' : ''}
      </Text>
    </View>
  )
}
