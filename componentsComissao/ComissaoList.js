import React, { useState, useEffect, useMemo } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
  Alert,
  Platform,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'
import { apiGetComContexto, apiDeleteComContexto } from '../utils/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import styles from './ComissaoStyles'
import Toast from 'react-native-toast-message'

export default function ComissaoList({ navigation }) {
  const [dados, setDados] = useState([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState(null)
  const [empresaId, setEmpresaId] = useState('')
  const [filialId, setFilialId] = useState('')

  // Filtros
  const [buscaFuncionario, setBuscaFuncionario] = useState('')
  const [categoria, setCategoria] = useState('')
  const [dataInicio, setDataInicio] = useState(new Date())
  const [dataFim, setDataFim] = useState(new Date())
  const [showDatePickerInicio, setShowDatePickerInicio] = useState(false)
  const [showDatePickerFim, setShowDatePickerFim] = useState(false)

  const categorias = [
    { value: '1', label: 'Melhoria' },
    { value: '2', label: 'Implantação' },
    { value: '3', label: 'Dashboards' },
    { value: '4', label: 'Mobile' },
    { value: '5', label: 'Vendas' },
  ]

  useEffect(() => {
    obterContexto()
  }, [])

  useEffect(() => {
    if (empresaId && filialId) {
      buscarComissoes()
    }
  }, [empresaId, filialId, dataInicio, dataFim])

  const obterContexto = async () => {
    try {
      const empresa = await AsyncStorage.getItem('empresaId')
      const filial = await AsyncStorage.getItem('filialId')
      setEmpresaId(empresa || '')
      setFilialId(filial || '')
    } catch (error) {
      console.log('Erro ao obter contexto:', error)
    }
  }

  const buscarComissoes = async () => {
    setLoading(true)
    setErro(null)
    try {
      const params = {
        comi_empr: empresaId,
        comi_fili: filialId,
        data_inicial: dataInicio.toISOString().split('T')[0],
        data_final: dataFim.toISOString().split('T')[0],
      }

      if (buscaFuncionario) {
        params.comi_func_nome__icontains = buscaFuncionario
      }
      if (categoria) {
        params.comi_cate = categoria
      }

      const response = await apiGetComContexto(
        'comissoes/comissoes-sps/',
        params
      )
      setDados(response.results || response || [])
    } catch (error) {
      setErro('Erro ao buscar comissões')
    } finally {
      setLoading(false)
    }
  }

  const excluirComissao = async (id) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Deseja realmente excluir esta comissão?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiDeleteComContexto(`comissoes/comissoes-sps/${id}/`)
              buscarComissoes()
              Alert.alert('Sucesso', 'Comissão excluída com sucesso!')
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Erro ao excluir comissão',
                text2:
                  error.response?.data?.erro ||
                  'Erro desconhecido ao excluir comissão.',
              })
            }
          },
        },
      ]
    )
  }

  const dadosFiltrados = useMemo(() => {
    return dados.filter((item) => {
      const matchFuncionario =
        !buscaFuncionario ||
        item.comi_func_nome
          ?.toLowerCase()
          .includes(buscaFuncionario.toLowerCase())
      const matchCategoria = !categoria || item.comi_cate === categoria

      return matchFuncionario && matchCategoria
    })
  }, [dados, buscaFuncionario, categoria])

  const getCategoriaLabel = (codigo) => {
    const cat = categorias.find((c) => c.value === codigo)
    return cat ? cat.label : codigo
  }

  const renderItem = ({ item }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemFuncionario}>
            Funcionário: {item.comi_func_nome || item.comi_func}
          </Text>
          <Text style={styles.itemCategoria}>
            {getCategoriaLabel(item.comi_cate)}
          </Text>
        </View>
        <View style={styles.itemActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() =>
              navigation.navigate('ComissaoForm', {
                comissaoId: item.comi_id,
                isEdit: true,
              })
            }>
            <MaterialIcons name="edit" size={20} color="#007bff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => excluirComissao(item.comi_id)}>
            <MaterialIcons name="delete" size={20} color="#dc3545" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.itemDetalhes}>
        <View style={styles.itemRow}>
          <Text style={styles.itemLabel}>Valor Total:</Text>
          <Text style={styles.itemValue}>
            {parseFloat(item.comi_valo_tota).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </Text>
        </View>

        <View style={styles.itemRow}>
          <Text style={styles.itemLabel}>Comissão Total:</Text>
          <Text style={[styles.itemValue, styles.comissaoValue]}>
            {parseFloat(item.comi_comi_tota).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </Text>
        </View>

        <View style={styles.itemRow}>
          <Text style={styles.itemLabel}>Percentual:</Text>
          <Text style={styles.itemValue}>{item.comi_perc}%</Text>
        </View>

        <View style={styles.itemRow}>
          <Text style={styles.itemLabel}>Parcelas:</Text>
          <Text style={styles.itemValue}>
            {item.comi_parc}x de{' '}
            {parseFloat(item.comi_comi_parc).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </Text>
        </View>

        <View style={styles.itemRow}>
          <Text style={styles.itemLabel}>Forma Pagamento:</Text>
          <Text style={styles.itemValue}>{item.comi_form_paga}</Text>
        </View>

        <View style={styles.itemRow}>
          <Text style={styles.itemLabel}>Data Entrega:</Text>
          <Text style={styles.itemValue}>
            {new Date(item.comi_data_entr).toLocaleDateString('pt-BR')}
          </Text>
        </View>
        <View style={styles.itemRow}>
          <Text style={styles.itemLabel}>Cliente:</Text>
          <Text style={styles.itemValue}>
            {item.comi_clie_nome || item.comi_clie || 'Cliente não informado'}
          </Text>
        </View>
      </View>
    </View>
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Carregando comissões...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>💰 Comissões</Text>
          <Text style={styles.headerSubtitle}>Gerenciar Comissões</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            navigation.navigate('ComissaoForm', { isEdit: false })
          }>
          <MaterialIcons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Nova</Text>
        </TouchableOpacity>
      </View>

      {/* Filtros */}
      <View style={styles.filtrosContainer}>
        <View style={styles.filtrosData}>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowDatePickerInicio(true)}>
            <Text style={styles.datePickerText}>
              {dataInicio.toLocaleDateString('pt-BR')}
            </Text>
            <MaterialIcons name="date-range" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowDatePickerFim(true)}>
            <Text style={styles.datePickerText}>
              {dataFim.toLocaleDateString('pt-BR')}
            </Text>
            <MaterialIcons name="date-range" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Buscar funcionário..."
          value={buscaFuncionario}
          onChangeText={setBuscaFuncionario}
        />
      </View>

      {showDatePickerInicio && (
        <DateTimePicker
          value={dataInicio}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePickerInicio(Platform.OS === 'ios')
            if (selectedDate) setDataInicio(selectedDate)
          }}
        />
      )}

      {showDatePickerFim && (
        <DateTimePicker
          value={dataFim}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePickerFim(Platform.OS === 'ios')
            if (selectedDate) setDataFim(selectedDate)
          }}
        />
      )}

      <FlatList
        data={dadosFiltrados}
        keyExtractor={(item) => item.comi_id.toString()}
        renderItem={renderItem}
        style={styles.listacomissao}
        contentContainerStyle={styles.listaContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="money-off" size={64} color="#bdc3c7" />
            <Text style={styles.emptyText}>Nenhuma comissão encontrada</Text>
          </View>
        }
      />
    </View>
  )
}
