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
  const [searchTitulo, setSearchtitulo] = useState('')
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
      const data = await apiGetComContexto(`contas_a_pagar/titulos-pagar/`, {
        titu_forn: searchFornecedor || undefined,
        titu_titu: searchTitulo || undefined,
      })
      setContas(data.results || data)
    } catch (error) {
      console.log('❌ Erro ao buscar contas:', error.message)
      Alert.alert('Erro', 'Falha ao carregar contas a pagar')
    } finally {
      setIsSearching(false)
      setLoading(false)
    }
  }

  const excluirConta = (id) => {
    Alert.alert('Confirmação', 'Excluir esta conta a pagar?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiDeleteComContexto(
              `contas_a_pagar/titulos-pagar/${id}/`,
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

  const statusMap = {
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
      <Text style={styles.numero}>Fornecedor: {item.titu_forn}</Text>
      <Text style={styles.datalist}>Vencimento: {item.titu_venc}</Text>
      <Text style={styles.cliente}>Valor: R$ {item.titu_valo}</Text>
      <Text style={styles.empresa}>
        Forma de Pagamento:{' '}
        {statusMap[item.titu_form_reci] || item.titu_form_reci}
      </Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.botao}
          onPress={() =>
            navigation.navigate('ContaPagarForm', { conta: item })
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
        onPress={() => navigation.navigate('ContaPagarForm')}>
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
          placeholder="Filtrar por Titulo"
          placeholderTextColor="#777"
          style={styles.input}
          value={searchTitulo}
          onChangeText={setSearchtitulo}
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
          `${item.titu_empr}_${item.titu_fili}_${item.titu_forn}_${item.titu_titu}_${item.titu_seri}_${item.titu_parc}`
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
