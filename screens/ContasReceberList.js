import React, { useEffect, useState, useCallback } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { getStoredData } from '../services/storageService'
import { apiDeleteComContexto, apiGetComContexto } from '../utils/api'
import styles from '../styles/listaContasStyles'

const formatarData = (data) => {
  if (!data) return '-'
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

const formatarMoeda = (valor) => {
  if (!valor) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

export default function ContasPagarList({ navigation }) {
  const [contas, setContas] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchCliente, setSearchCliente] = useState('')
  const [searchTitulo, setSearchtitulo] = useState('')
  const [searchStatus, setSearchStatus] = useState('')

  const statusMap = {
    A: 'Aberto',
    T: 'Pago Total',
    P: 'Pago Parcialmente',
  }
  const [isSearching, setIsSearching] = useState(false)
  const [slug, setSlug] = useState('')

  useEffect(() => {
    const carregarSlug = async () => {
      try {
        const { slug } = await getStoredData()
        if (slug) setSlug(slug)
        else console.warn('Slug não encontrado')
      } catch (err) {
        console.error('Erro ao carregar slug:', err.message)
      }
    }
    carregarSlug()
  }, [])

  useEffect(() => {
    if (slug) buscarContas()
  }, [slug])

  const buscarContas = async () => {
    setIsSearching(true)
    try {
      const filtros = {}
      if (searchCliente) filtros.cliente_nome = searchCliente
      if (searchTitulo) filtros.titu_titu = searchTitulo
      if (searchStatus) filtros.titu_aber = searchStatus

      const data = await apiGetComContexto(
        `contas_a_receber/titulos-receber/`,
        filtros
      )
      setContas(data.results || data)
    } catch (error) {
      console.log('❌ Erro ao buscar contas:', error.message)
      Alert.alert('Erro', 'Falha ao carregar contas a pagar')
    } finally {
      setIsSearching(false)
      setLoading(false)
    }
  }

  const excluirConta = (item) => {
    Alert.alert('Confirmação', 'Excluir esta conta a receber?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiDeleteComContexto(
              `contas_a_receber/titulos-receber/${item.titu_empr}/${item.titu_fili}/${item.titu_clie}/${item.titu_titu}/${item.titu_seri}/${item.titu_parc}/`,
              {},
              'DELETE'
            )
            setContas((prev) =>
              prev.filter(
                (conta) =>
                  conta.titu_empr !== item.titu_empr ||
                  conta.titu_fili !== item.titu_fili ||
                  conta.titu_clie !== item.titu_clie ||
                  conta.titu_titu !== item.titu_titu ||
                  conta.titu_seri !== item.titu_seri ||
                  conta.titu_parc !== item.titu_parc
              )
            )
          } catch (error) {
            console.log('❌ Erro ao excluir conta:', error.message)
            Alert.alert('Erro', 'Erro ao excluir a conta')
          }
        },
      },
    ])
  }
  const formMap = {
    '00': 'Duplicata',
    '01': 'Cheque',
    '02': 'Promissória',
    '03': 'Recibo',
    50: 'cheque pré-datado',
    51: 'Cartão de crédito',
    52: 'Cartão de débito',
    53: 'Boleto bancário',
    54: 'Dinheiro',
    55: 'Deposito em conta',
    56: 'Venda à vista',
    60: 'PIX',
  }

  useFocusEffect(
    useCallback(() => {
      if (slug) buscarContas()
    }, [slug, searchCliente, searchTitulo, searchStatus])
  )

  const buscarHistoricoBaixas = async (item) => {
    try {
      const endpoint = `contas_a_receber/titulos-receber/${item.titu_empr}/${item.titu_fili}/${item.titu_clie}/${item.titu_titu}/${item.titu_seri}/${item.titu_parc}/${item.titu_emis}/${item.titu_venc}/historico_baixas/`

      const historico = await apiGetComContexto(endpoint)

      if (historico && historico.length > 0) {
        // Se título está parcialmente pago, mostrar opções
        if (item.titu_aber === 'P') {
          const opcoes = [
            {
              text: '💵 Receber Restante',
              onPress: () =>
                navigation.navigate('BaixaTituloForm', {
                  titulo: item,
                  tipo: 'receber',
                }),
            },
          ]

          // Adicionar opções de excluir baixas
          historico.forEach((baixa) => {
            opcoes.push({
              text: `🗑️ Excluir Baixa ${baixa.bare_sequ} - ${formatarMoeda(
                baixa.bare_pago
              )} (${new Date(baixa.bare_dpag).toLocaleDateString('pt-BR')})`,
              onPress: () => excluirBaixa(item, baixa.bare_sequ),
            })
          })

          opcoes.push({
            text: 'Cancelar',
            style: 'cancel',
          })

          Alert.alert('Gerenciar Título Parcial', 'Escolha uma opção:', opcoes)
        } else {
          // Se há apenas uma baixa, excluir diretamente
          if (historico.length === 1) {
            excluirBaixa(item, historico[0].bare_sequ)
          } else {
            // Se há múltiplas baixas, mostrar opções
            const opcoes = historico.map((baixa, index) => ({
              text: `Baixa ${baixa.bare_sequ} - ${formatarMoeda(
                baixa.bare_pago
              )} (${new Date(baixa.bare_dpag).toLocaleDateString('pt-BR')})`,
              onPress: () => excluirBaixa(item, baixa.bare_sequ),
            }))

            opcoes.push({
              text: 'Cancelar',
              style: 'cancel',
            })

            Alert.alert(
              'Selecionar Baixa',
              'Escolha qual baixa deseja excluir:',
              opcoes
            )
          }
        }
      } else {
        Alert.alert('Aviso', 'Nenhuma baixa encontrada para este título')
      }
    } catch (error) {
      console.error('❌ Erro ao buscar histórico:', error)
      Alert.alert('Erro', 'Erro ao buscar histórico de baixas')
    }
  }

  const excluirBaixa = async (item, baixaId) => {
    try {
      Alert.alert(
        'Confirmar Exclusão',
        `Tem certeza que deseja excluir a baixa ${baixaId}?\n\nEsta ação não pode ser desfeita e o título será reaberto.`,
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Excluir',
            style: 'destructive',
            onPress: async () => {
              try {
                const endpoint = `contas_a_receber/titulos-receber/${item.titu_empr}/${item.titu_fili}/${item.titu_clie}/${item.titu_titu}/${item.titu_seri}/${item.titu_parc}/${item.titu_emis}/${item.titu_venc}/excluir_baixa/?baixa_id=${baixaId}`

                // Enviar dados no body
                const dadosExclusao = {
                  confirmar_exclusao: true,
                  motivo_exclusao: 'Exclusão solicitada pelo usuário',
                }

                const response = await apiDeleteComContexto(
                  endpoint,
                  dadosExclusao
                )

                Alert.alert(
                  'Sucesso',
                  'Baixa excluída com sucesso! O título foi reaberto.',
                  [{ text: 'OK', onPress: () => buscarContas() }]
                )
              } catch (error) {
                console.error('❌ Erro ao excluir baixa:', error)
                console.error('❌ Response data:', error.response?.data)
                Alert.alert(
                  'Erro',
                  error.response?.data?.error ||
                    error.response?.data?.confirmar_exclusao?.[0] ||
                    'Erro ao excluir baixa'
                )
              }
            },
          },
        ]
      )
    } catch (error) {
      console.error('❌ Erro:', error)
      Alert.alert('Erro', 'Erro inesperado')
    }
  }

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Titulo: {item.titu_titu}</Text>
        <Text style={[styles.badge, { backgroundColor: '#28a745' }]}>
          {formMap[item.titu_form_reci] || item.titu_form_reci}
        </Text>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Cliente:</Text>
          <Text style={styles.infoValue}>{item.titu_clie}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Nome Cliente:</Text>
          <Text style={styles.infoValue}>{item.cliente_nome || '-'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Vencimento:</Text>
          <Text style={styles.infoValue}>{formatarData(item.titu_venc)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Valor:</Text>
          <Text style={[styles.infoValue, styles.valorDestaque]}>
            {formatarMoeda(item.titu_valo)}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Status:</Text>
          <Text style={[styles.infoValue, styles.valorDestaqueStatus]}>
            {statusMap[item.titu_aber] || item.titu_aber}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        {/* Botão Receber - só aparece se status for 'A' (Aberto) */}
        {item.titu_aber === 'A' && (
          <TouchableOpacity
            style={[styles.botao, styles.botaoEditar]}
            onPress={() =>
              navigation.navigate('BaixaTituloForm', {
                titulo: item,
                tipo: 'receber',
              })
            }>
            <Text style={styles.botaoTexto}>💵 Receber</Text>
          </TouchableOpacity>
        )}

        {/* Botão Excluir Baixa - só aparece se status for 'T' ou 'P' */}
        {(item.titu_aber === 'T' || item.titu_aber === 'P') && (
          <TouchableOpacity
            style={[styles.botao, { backgroundColor: '#ff6b35' }]}
            onPress={() => buscarHistoricoBaixas(item)}>
            <Text style={styles.botaoTexto}>🔄 Reabrir/Liquidar</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.botao, styles.botaoEditar]}
          onPress={() =>
            navigation.navigate('ContaReceberForm', { contaExistente: item })
          }>
          <Text style={styles.botaoTexto}>✏️ Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.botao, styles.botaoExcluir]}
          onPress={() => excluirConta(item)}>
          <Text style={styles.botaoTexto}>🗑️ Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="#007bff"
        style={{ marginTop: 50 }}
      />
    )
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.incluirButton}
        onPress={() => navigation.navigate('ContaReceberForm')}>
        <Text style={styles.incluirButtonText}>+ Nova Conta</Text>
      </TouchableOpacity>

      <View style={styles.searchContainer}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 10,
          }}>
          <TextInput
            placeholder="nome do cliente"
            placeholderTextColor="#777"
            style={[styles.input, { flex: 1, marginRight: 5 }]}
            value={searchCliente}
            onChangeText={setSearchCliente}
          />
          <TextInput
            placeholder="por status"
            placeholderTextColor="#777"
            style={[styles.input, { flex: 1, marginRight: 5 }]}
            value={searchStatus}
            onChangeText={setSearchStatus}
          />
          <TextInput
            placeholder="por título"
            placeholderTextColor="#777"
            style={[styles.input, { flex: 1 }]}
            value={searchTitulo}
            onChangeText={setSearchtitulo}
          />
        </View>
        <TouchableOpacity
          style={[styles.searchButton, { width: '100%' }]}
          onPress={buscarContas}>
          <Text style={styles.searchButtonText}>
            {isSearching ? '🔍...' : 'Buscar'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={contas}
        renderItem={renderItem}
        keyExtractor={(item) =>
          `${item.titu_empr}_${item.titu_fili}_${item.titu_forn}_${item.titu_titu}_${item.titu_seri}_${item.titu_parc}_${item.titu_venc}_${item.titu_fomr_reci}_${item.titu_clie}`
        }
        ListEmptyComponent={() => (
          <Text style={{ textAlign: 'center', marginTop: 20 }}>
            Nenhuma conta encontrada
          </Text>
        )}
      />

      <Text style={styles.footerText}>
        {contas.length} conta{contas.length !== 1 ? 's' : ''} encontrada
        {contas.length !== 1 ? 's' : ''}
      </Text>
    </View>
  )
}
