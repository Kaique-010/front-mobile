import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Picker } from '@react-native-picker/picker'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { apiGetComContexto } from '../utils/api'
import { formatCurrency } from '../utils/formatters'
import styles from '../stylesDash/BalanceteEstoqueStyles'

const DashBalanceteEstoque = ({ navigation }) => {
  const [loading, setLoading] = useState(false)
  const [dados, setDados] = useState({
    total_estoque: 0,
    total_a_vista: 0,
    total_prazo: 0,
  })
  const [filtros, setFiltros] = useState({
    marca: '',
    grupo: '',
    empresa: '',
    filial: '',
  })
  const [opcoesFiltragem, setOpcoesFiltragem] = useState({
    marcas: [],
    grupos: [],
    empresas: [],
    filiais: [],
  })
  const [showFiltros, setShowFiltros] = useState(false)

  useEffect(() => {
    carregarDados()
    carregarOpcoesFiltragem()
  }, [])

  useEffect(() => {
    if (Object.values(filtros).some((filtro) => filtro !== '')) {
      carregarDados()
    }
  }, [filtros])

  const carregarDados = async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams()
      Object.entries(filtros).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const response = await apiGetComContexto(
        `produtos/estoqueresumo/?${params.toString()}`
      )

      if (response) {
        setDados(response)
        await AsyncStorage.setItem(
          'balancete_estoque_data',
          JSON.stringify({
            dados: response,
            filtros,
            timestamp: new Date().getTime(),
          })
        )
      }
    } catch (error) {
      console.error('Erro ao carregar dados do estoque:', error)
      Alert.alert('Erro', 'Não foi possível carregar os dados do estoque')

      try {
        const dadosSalvos = await AsyncStorage.getItem('balancete_estoque_data')
        if (dadosSalvos) {
          const { dados: dadosCache } = JSON.parse(dadosSalvos)
          setDados(dadosCache)
        }
      } catch (cacheError) {
        console.error('Erro ao carregar cache:', cacheError)
      }
    } finally {
      setLoading(false)
    }
  }

  const carregarOpcoesFiltragem = async () => {
    try {
      // Buscar todos os produtos detalhados e extrair valores únicos
      const response = await apiGetComContexto('produtos/produtosdetalhados/')

      if (response && response.results) {
        const produtos = response.results

        // Extrair valores únicos para marcas
        const marcasUnicas = [
          ...new Set(produtos.map((p) => p.marca_nome).filter(Boolean)),
        ].map((nome) => ({ nome }))

        // Extrair valores únicos para grupos
        const gruposUnicos = [
          ...new Set(produtos.map((p) => p.grupo_id).filter(Boolean)),
        ].map((id) => ({
          id,
          nome: produtos.find((p) => p.grupo_id === id)?.grupo_nome || id,
        }))

        // Extrair valores únicos para empresas
        const empresasUnicas = [
          ...new Set(produtos.map((p) => p.empresa).filter(Boolean)),
        ].map((id) => ({ id, nome: id }))

        // Extrair valores únicos para filiais
        const filiaisUnicas = [
          ...new Set(produtos.map((p) => p.filial).filter(Boolean)),
        ].map((id) => ({ id, nome: id }))

        setOpcoesFiltragem({
          marcas: marcasUnicas,
          grupos: gruposUnicos,
          empresas: empresasUnicas,
          filiais: filiaisUnicas,
        })
      }
    } catch (error) {
      console.error('Erro ao carregar opções de filtragem:', error)
      // Fallback para arrays vazios se houver erro
      setOpcoesFiltragem({
        marcas: [],
        grupos: [],
        empresas: [],
        filiais: [],
      })
    }
  }

  const limparFiltros = () => {
    setFiltros({
      marca: '',
      grupo: '',
      empresa: '',
      filial: '',
    })
  }

  const calcularMargemLucro = () => {
    if (dados.total_estoque === 0) return 0
    return (
      ((dados.total_a_vista - dados.total_estoque) / dados.total_estoque) * 100
    )
  }

  const renderCardResumo = (titulo, valor, icone, cor) => (
    <View style={[styles.cardResumo, { borderLeftColor: cor }]}>
      <View style={styles.cardHeader}>
        <Icon name={icone} size={24} color={cor} />
        <Text style={styles.cardTitulo}>{titulo}</Text>
      </View>
      <Text style={[styles.cardValor, { color: cor }]}>
        {formatCurrency(valor)}
      </Text>
    </View>
  )

  const renderFiltros = () => {
    if (!showFiltros) return null

    return (
      <View style={styles.containerFiltros}>
        <Text style={styles.tituloFiltros}>Filtros</Text>

        <View style={styles.filtroItem}>
          <Text style={styles.labelFiltro}>Marca:</Text>
          <Picker
            selectedValue={filtros.marca}
            style={styles.picker}
            onValueChange={(value) =>
              setFiltros((prev) => ({ ...prev, marca: value }))
            }>
            <Picker.Item label="Todas as marcas" value="" />
            <Picker.Item label="Sem marca" value="__sem_marca__" />
            {opcoesFiltragem.marcas.map((marca) => (
              <Picker.Item
                key={marca.id || marca.nome}
                label={marca.nome}
                value={marca.nome}
              />
            ))}
          </Picker>
        </View>

        <View style={styles.filtroItem}>
          <Text style={styles.labelFiltro}>Grupo:</Text>
          <Picker
            selectedValue={filtros.grupo}
            style={styles.picker}
            onValueChange={(value) =>
              setFiltros((prev) => ({ ...prev, grupo: value }))
            }>
            <Picker.Item label="Todos os grupos" value="" />
            {opcoesFiltragem.grupos.map((grupo) => (
              <Picker.Item
                key={grupo.id}
                label={grupo.nome}
                value={grupo.id.toString()}
              />
            ))}
          </Picker>
        </View>

        <View style={styles.filtroItem}>
          <Text style={styles.labelFiltro}>Empresa:</Text>
          <Picker
            selectedValue={filtros.empresa}
            style={styles.picker}
            onValueChange={(value) =>
              setFiltros((prev) => ({ ...prev, empresa: value }))
            }>
            <Picker.Item label="Todas as empresas" value="" />
            {opcoesFiltragem.empresas.map((empresa) => (
              <Picker.Item
                key={empresa.id}
                label={empresa.nome}
                value={empresa.id.toString()}
              />
            ))}
          </Picker>
        </View>

        <View style={styles.filtroItem}>
          <Text style={styles.labelFiltro}>Filial:</Text>
          <Picker
            selectedValue={filtros.filial}
            style={styles.picker}
            onValueChange={(value) =>
              setFiltros((prev) => ({ ...prev, filial: value }))
            }>
            <Picker.Item label="Todas as filiais" value="" />
            {opcoesFiltragem.filiais.map((filial) => (
              <Picker.Item
                key={filial.id}
                label={filial.nome}
                value={filial.id.toString()}
              />
            ))}
          </Picker>
        </View>

        <TouchableOpacity
          style={styles.botaoLimparFiltros}
          onPress={limparFiltros}>
          <Icon name="clear" size={20} color="#fff" />
          <Text style={styles.textoBotaoLimpar}>Limpar Filtros</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Balancete de Estoque</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.botaoFiltro}
            onPress={() => setShowFiltros(!showFiltros)}>
            <Icon name="filter-list" size={24} color="#007bff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.botaoAtualizar}
            onPress={carregarDados}>
            <Icon name="refresh" size={24} color="#007bff" />
          </TouchableOpacity>
        </View>
      </View>

      {renderFiltros()}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text style={styles.loadingText}>Carregando dados...</Text>
          </View>
        ) : (
          <View style={styles.conteudo}>
            <View style={styles.resumoContainer}>
              {renderCardResumo(
                'Valor Total do Estoque',
                dados.total_estoque,
                'inventory',
                '#28a745'
              )}

              {renderCardResumo(
                'Valor de Venda à Vista',
                dados.total_a_vista,
                'attach-money',
                '#007bff'
              )}

              {renderCardResumo(
                'Valor de Venda a Prazo',
                dados.total_prazo,
                'schedule',
                '#ffc107'
              )}
            </View>

            <View style={styles.indicadoresContainer}>
              <View style={styles.cardIndicador}>
                <Text style={styles.tituloIndicador}>
                  Margem de Lucro (À Vista)
                </Text>
                <Text
                  style={[
                    styles.valorIndicador,
                    {
                      color: calcularMargemLucro() >= 0 ? '#28a745' : '#dc3545',
                    },
                  ]}>
                  {calcularMargemLucro().toFixed(2)}%
                </Text>
              </View>

              <View style={styles.cardIndicador}>
                <Text style={styles.tituloIndicador}>
                  Diferença À Vista vs Prazo
                </Text>
                <Text
                  style={[
                    styles.valorIndicador,
                    {
                      color:
                        dados.total_prazo > dados.total_a_vista
                          ? '#28a745'
                          : '#ffc107',
                    },
                  ]}>
                  {formatCurrency(dados.total_prazo - dados.total_a_vista)}
                </Text>
              </View>
            </View>

            <View style={styles.observacoesContainer}>
              <Text style={styles.tituloObservacoes}>
                Informações Sobre o Balancete
              </Text>
              <Text style={styles.textoObservacao}>
                • O valor do estoque representa o custo dos produtos em estoque
              </Text>
              <Text style={styles.textoObservacao}>
                • Valores à vista e a prazo mostram o potencial de faturamento
              </Text>
              <Text style={styles.textoObservacao}>
                • A margem de lucro é calculada sobre o preço à vista
              </Text>
              <Text style={styles.textoObservacao}>
                • Use os filtros para análises específicas por marca, grupo ou
                filial
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

export default DashBalanceteEstoque
