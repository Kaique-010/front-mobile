import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
} from 'react-native'
import { apiGetComContexto } from '../utils/api'
import { useNavigation } from '@react-navigation/native'
import ProdutoModal from '../componentsProdutosDetalhados/ProdutoModal'

import BarraBusca from './componentsConsultaProdutos/barraBusca'
import LeitorConsulta from './componentsConsultaProdutos/LeitorConsulta'
import ProdutoCard from '../componentsProdutosDetalhados/ProdutoCard'
import { Ionicons } from '@expo/vector-icons'

const ConsultaProdutos = () => {
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [marcaSelecionada, setMarcaSelecionada] = useState('')
  const [saldoFiltro, setSaldoFiltro] = useState('todos')
  const [marcas, setMarcas] = useState([])
  const [produtoModalVisible, setProdutoModalVisible] = useState(false)
  const [produtoModalProduto, setProdutoModalProduto] = useState(null)
  const navigation = useNavigation()

  // States para o Leitor
  const [leitorVisible, setLeitorVisible] = useState(false)
  const [statusLeitura, setStatusLeitura] = useState('idle') // 'idle', 'loading', 'success', 'error', 'not_found'

  const fetchProdutos = async (
    termo = '',
    marca = '',
    saldo = 'todos',
    origem = 'manual',
  ) => {
    try {
      if (origem === 'scanner') {
        setStatusLeitura('loading')
      }
      setLoading(true)

      const params = {}
      if (termo) {
        params.q = termo
        params.search = termo // Envia ambos para garantir compatibilidade
      }
      if (marca && marca !== '__sem_marca__') params.marca = marca
      if (marca === '__sem_marca__') params.sem_marca = true
      if (saldo !== 'todos') params.saldo = saldo

      console.log('Buscando produtos:', params)
      const data = await apiGetComContexto('produtos/produtos/busca/', params)
      console.log('Resultado busca:', JSON.stringify(data).substring(0, 200))

      const results = Array.isArray(data) ? data : data.results || []

      if (origem === 'scanner') {
        // Tenta encontrar correspondência exata primeiro
        let exato = results.find(
          (p) =>
            String(p.prod_codi) === String(termo) ||
            String(p.prod_coba) === String(termo) ||
            String(p.prod_gtin) === String(termo),
        )

        // Se não achou exato, mas veio apenas 1 resultado da API, assume que é ele (busca inteligente do backend)
        // Isso resolve casos onde o código bipado é uma URL ou padrão que o backend já tratou
        if (!exato && results.length === 1) {
          exato = results[0]
        }

        // Se a busca retornou algo e o termo parece ser uma URL (contém http/https),
        // tenta pegar o primeiro resultado válido se houver, assumindo que o backend resolveu o QR Code
        if (
          !exato &&
          results.length > 0 &&
          (termo.includes('http') || termo.includes('www'))
        ) {
          exato = results[0]
        }

        if (exato) {
          // Adiciona ao topo da lista existente ou atualiza quantidade
          setProdutos((prev) => {
            const index = prev.findIndex(
              (p) =>
                p.prod_codi === exato.prod_codi &&
                p.prod_empr === exato.prod_empr &&
                p.prod_fili === exato.prod_fili,
            )

            if (index >= 0) {
              // Se já existe, incrementa quantidade e move para o topo
              const newPrev = [...prev]
              const existingItem = newPrev[index]
              const updatedItem = {
                ...existingItem,
                quantity: (existingItem.quantity || 1) + 1,
              }
              // Remove da posição atual
              newPrev.splice(index, 1)
              // Adiciona no topo
              return [updatedItem, ...newPrev]
            }

            // Se não existe, adiciona com quantidade 1
            return [{ ...exato, quantity: 1 }, ...prev]
          })
          setStatusLeitura('success')
          setTimeout(() => {
            setLeitorVisible(false)
            setStatusLeitura('idle')
          }, 1500)
        } else {
          // Se não achar exato, mas tiver resultados, mostra aviso ou nada?
          // O usuário pediu "apenas o que foi bipado".
          // Se não achar exato, considera não encontrado.
          setStatusLeitura('not_found')
        }
      } else {
        // Busca manual: substitui a lista
        setProdutos(results)
      }
    } catch (err) {
      console.error('Erro ao buscar produtos:', err)
      if (origem === 'scanner') {
        setStatusLeitura('error')
      } else {
        Alert.alert('Erro', 'Não foi possível carregar os produtos.')
      }
      setProdutos([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProdutos()
  }, [])

  const handleSearchSubmit = () => {
    fetchProdutos(searchTerm, marcaSelecionada, saldoFiltro, 'manual')
  }

  const handleBarcodeRead = (code) => {
    setSearchTerm(code)
    fetchProdutos(code, marcaSelecionada, saldoFiltro, 'scanner')
  }

  const handleProdutoPress = (produto) => {
    console.log('Produto pressionado:', produto)
    setProdutoModalProduto(produto)
    setProdutoModalVisible(true)
  }

  const updateQuantity = (item, newQuantity) => {
    if (newQuantity < 1) return

    setProdutos((prev) =>
      prev.map((p) =>
        p.prod_codi === item.prod_codi &&
        p.prod_empr === item.prod_empr &&
        p.prod_fili === item.prod_fili
          ? { ...p, quantity: newQuantity }
          : p,
      ),
    )
  }

  return (
    <View style={styles.container}>
      <ProdutoModal
        visible={produtoModalVisible}
        produto={produtoModalProduto}
        onClose={() => setProdutoModalVisible(false)}
      />

      <LeitorConsulta
        visible={leitorVisible}
        onClose={() => {
          setLeitorVisible(false)
          setStatusLeitura('idle')
        }}
        onCodigoLido={handleBarcodeRead}
        statusLeitura={statusLeitura}
      />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => setLeitorVisible(true)}>
          <Ionicons name="barcode-outline" size={24} color="#fff" />
          <Text style={styles.scanButtonText}>Escanear Código</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <BarraBusca
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearchSubmit={handleSearchSubmit}
          isSearching={loading}
          marcaSelecionada={marcaSelecionada}
          onMarcaChange={(val) => {
            setMarcaSelecionada(val)
            fetchProdutos(searchTerm, val, saldoFiltro)
          }}
          saldoFiltro={saldoFiltro}
          onSaldoChange={(val) => {
            setSaldoFiltro(val)
            fetchProdutos(searchTerm, marcaSelecionada, val)
          }}
          marcas={marcas}
        />
      </View>

      <FlatList
        data={produtos}
        keyExtractor={(item, index) =>
          `${item.prod_empr || ''}-${item.prod_fili || ''}-${item.prod_codi || item.id || index}`
        }
        renderItem={({ item }) => (
          <ProdutoCard
            item={{
              ...item,
              nome: item.prod_nome,
              marca_nome: item.prod_marc_nome || 'Geral',
              preco_vista: item.prod_preco_vista,
              saldo: item.saldo_estoque,
              imagem_base64: item.imagem_base64 || item.prod_foto,
              // Mapeamento para o Modal
              codigo: item.prod_codi,
              unidade: item.prod_unme,
              empresa: item.prod_empr,
              filial: item.prod_fili,
            }}
            onPress={handleProdutoPress}
            quantity={item.quantity}
            onQuantityChange={
              item.quantity ? (qty) => updateQuantity(item, qty) : undefined
            }
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading && (
            <Text style={styles.emptyText}>Nenhum produto encontrado</Text>
          )
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f4ee',
  },
  header: {
    paddingTop: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10a2a7',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
    fontSize: 16,
  },
})

export default ConsultaProdutos
