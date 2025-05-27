import React, { useEffect, useState } from 'react'
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

export default function ContasPagarList({ navigation }) {
  const [contas, setContas] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchFornecedor, setSearchFornecedor] = useState('')
  const [searchStatus, setSearchStatus] = useState('')
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
      const data = await apiGetComContexto(
        `contas_a_receber/titulos-receber/`,
        {
          fornecedor: searchFornecedor || undefined,
          status: searchStatus || undefined,
        }
      )
      setContas(data.results || data)
    } catch (error) {
      console.log('❌ Erro ao buscar contas:', error.message)
      Alert.alert('Erro', 'Falha ao carregar contas a receber')
    } finally {
      setIsSearching(false)
      setLoading(false)
    }
  }

  const excluirConta = (id) => {
    Alert.alert('Confirmação', 'Excluir esta conta a receber?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiDeleteComContexto(
              `contas_a_receber/titulos-receber/${id}/`,
              {},
              'DELETE'
            )
            setContas((prev) => prev.filter((item) => item.id !== id))
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
    '50': 'cheque pré-datado',
    '51': 'Cartão de crédito',
    '52': 'Cartão de débito',
    '53': 'Boleto bancário',
    '54': 'Dinheiro',
    '55': 'Deposito em conta',
    '56': 'Venda à vista',
    '60': 'PIX',
  }

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.status}>Titulo: {item.titu_titu}</Text>
      <Text style={styles.numero}>Fornecedor: {item.titu_clie}</Text>
      <Text style={styles.datalist}>Vencimento: {item.titu_venc}</Text>
      <Text style={styles.cliente}>Valor: R$ {item.titu_valo}</Text>
      <Text style={styles.empresa}>
        Forma de Pagamento:{' '}
        {formMap[item.titu_form_reci] || item.titu_form_reci}
      </Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.botao}
          onPress={() =>
            navigation.navigate('ContaReceberForm', { conta: item })
          }>
          <Text style={styles.botaoTexto}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.botao}
          onPress={() => excluirConta(item.id)}>
          <Text style={styles.botaoTexto}>🗑️</Text>
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
        onPress={() => navigation.navigate('ContareceberrForm')}>
        <Text style={styles.incluirButtonText}>+ Nova Conta</Text>
      </TouchableOpacity>

      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Filtrar por fornecedor"
          placeholderTextColor="#777"
          style={styles.input}
          value={searchFornecedor}
          onChangeText={setSearchFornecedor}
        />
        <TextInput
          placeholder="Filtrar por status"
          placeholderTextColor="#777"
          style={styles.input}
          value={searchStatus}
          onChangeText={setSearchStatus}
          onSubmitEditing={buscarContas}
        />
        <TouchableOpacity style={styles.searchButton} onPress={buscarContas}>
          <Text style={styles.searchButtonText}>
            {isSearching ? '🔍...' : 'Buscar'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={contas}
        renderItem={renderItem}
        keyExtractor={(item) =>
          `${item.titu_empr}_${item.titu_fili}_${item.titu_forn}_${item.titu_titu}_${item.titu_seri}__${item.titu_parc_}_${item.titu_venc}_${item.titu_fomr_reci}_${item.titu_clie}`
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
