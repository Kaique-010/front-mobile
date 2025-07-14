import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  Switch,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'
import {
  getParametrosPorModulo,
  updateParametrosPorModulo,
} from '../services/parametrosService'
import { getStoredData } from '../services/storageService'
import { parametrosStyles } from './styles/parametrosStyles'
import { apiPatchComContexto } from '../utils/api'

const ParametrosPorModulo = () => {
  const [modulos, setModulos] = useState([])
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [empresaId, setEmpresaId] = useState('')
  const [filialId, setFilialId] = useState('')
  const [expandedModules, setExpandedModules] = useState({})

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      const { empresaId, filialId } = await getStoredData()
      setEmpresaId(empresaId)
      setFilialId(filialId)

      if (empresaId && filialId) {
        await buscarParametros(empresaId, filialId)
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err.message)
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Erro ao carregar dados iniciais',
      })
    }
  }

  const buscarParametros = async (empId = empresaId, filId = filialId) => {
    try {
      setLoading(true)
      const data = await getParametrosPorModulo({
        empr: empId,
        fili: filId,
      })
      setModulos(data)
    } catch (error) {
      console.error('Erro ao buscar parâmetros:', error)
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Erro ao carregar parâmetros',
      })
    } finally {
      setLoading(false)
    }
  }

  const alternarParametro = (moduloId, parametroId) => {
    setModulos((prev) =>
      prev.map((modulo) =>
        modulo.id === moduloId
          ? {
              ...modulo,
              parametros: modulo.parametros.map((param) =>
                param.id === parametroId
                  ? { ...param, ativo: !param.ativo }
                  : param
              ),
            }
          : modulo
      )
    )
  }

  const toggleModuleExpansion = (moduloId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduloId]: !prev[moduloId],
    }))
  }

  const salvarParametros = async () => {
    setSalvando(true)
    try {
      // Preparar dados para envio
      const parametrosParaAtualizar = []

      modulos.forEach((modulo) => {
        modulo.parametros.forEach((param) => {
          parametrosParaAtualizar.push({
            id: param.id,
            ativo: param.ativo,
          })
        })
      })

      const payload = {
        empr: empresaId,
        fili: filialId,
        usuario: 1, // Pegar do usuário logado
        parametros: parametrosParaAtualizar,
      }

      await updateParametrosPorModulo(payload)

      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Parâmetros salvos com sucesso!',
      })
    } catch (error) {
      console.error('Erro ao salvar parâmetros:', error)
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Erro ao salvar parâmetros',
      })
    } finally {
      setSalvando(false)
    }
  }

  const renderParametro = ({ item: parametro }) => (
    <View style={parametrosStyles.parametroItem}>
      <View style={parametrosStyles.parametroInfo}>
        <Text style={parametrosStyles.parametroNome}>{parametro.nome}</Text>
        <Text style={parametrosStyles.parametroDescricao}>
          {parametro.descricao}
        </Text>
        <Text style={parametrosStyles.parametroValor}>
          Valor: {parametro.valor ? 'Sim' : 'Não'}
        </Text>
      </View>
      <Switch
        value={parametro.ativo}
        onValueChange={() =>
          alternarParametro(parametro.moduloId, parametro.id)
        }
        trackColor={{ false: '#777', true: '#34d399' }}
        thumbColor={parametro.ativo ? '#22c55e' : '#ccc'}
      />
    </View>
  )

  const renderModulo = ({ item: modulo }) => {
    const isExpanded = expandedModules[modulo.id]
    const parametrosComModuloId = modulo.parametros.map((param) => ({
      ...param,
      moduloId: modulo.id,
    }))

    // Mapeamento de ícones FontAwesome para Feather
    const getFeatherIcon = (fontAwesomeIcon) => {
      const iconMap = {
        'fas fa-boxes': 'package',
        'fas fa-shopping-cart': 'shopping-cart',
        'fas fa-file-invoice-dollar': 'file-text',
        'fas fa-box': 'box',
        'fas fa-dollar-sign': 'dollar-sign',
        'fas fa-cog': 'settings',
        'fas fa-users': 'users',
        'fas fa-chart-bar': 'bar-chart-2',
        'fas fa-file': 'file',
        'fas fa-calculator': 'calculator',
      }
      return iconMap[fontAwesomeIcon] || 'box'
    }

    return (
      <View style={parametrosStyles.moduloContainer}>
        <TouchableOpacity
          style={parametrosStyles.moduloHeader}
          onPress={() => toggleModuleExpansion(modulo.id)}>
          <View style={parametrosStyles.moduloHeaderContent}>
            <Feather
              name={getFeatherIcon(modulo.icone)}
              size={20}
              color="#fff"
            />
            <Text style={parametrosStyles.moduloNome}>{modulo.nome}</Text>
            <Text style={parametrosStyles.moduloCount}>
              ({modulo.parametros.length} parâmetros)
            </Text>
          </View>
          <Feather
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#fff"
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={parametrosStyles.parametrosContainer}>
            <FlatList
              data={parametrosComModuloId}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderParametro}
              scrollEnabled={false}
            />
          </View>
        )}
      </View>
    )
  }

  if (loading) {
    return (
      <View style={parametrosStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#0ea5e9" />
        <Text style={parametrosStyles.loadingText}>
          Carregando parâmetros...
        </Text>
      </View>
    )
  }

  return (
    <View style={parametrosStyles.container}>
      <ScrollView style={parametrosStyles.scrollContainer}>
        <FlatList
          data={modulos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderModulo}
          contentContainerStyle={{ paddingBottom: 100 }}
          scrollEnabled={false}
        />
      </ScrollView>

      <TouchableOpacity
        onPress={salvarParametros}
        style={[
          parametrosStyles.salvarButton,
          { backgroundColor: salvando ? '#555' : '#0ea5e9' },
        ]}
        disabled={salvando}>
        <Text style={parametrosStyles.salvarButtonText}>
          {salvando ? 'Salvando...' : 'Salvar Parâmetros'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

export default ParametrosPorModulo
