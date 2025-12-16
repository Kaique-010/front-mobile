import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import LeitorCodigoBarras from '../components/Leitor'
import {
  apiGet,
  apiPost,
  apiPostComContexto,
  apiGetComContexto,
} from '../utils/api'
import { useContextoApp } from '../hooks/useContextoApp'

const ColetorEstoqueScreen = ({ navigation }) => {
  const { contexto } = useContextoApp()
  const [isScanning, setIsScanning] = useState(false)
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(false)
  const [salvando, setSalvando] = useState(false)

  // Função para lidar com a leitura do código de barras
  const onProdutoLido = async (codigoBarras) => {
    try {
      setLoading(true)
      console.log(`🔍 Buscando produto para código: ${codigoBarras}`)

      const response = await apiGetComContexto(
        `coletaestoque/buscar-produto/?codigo=${codigoBarras}`
      )

      if (!response) {
        Alert.alert('Erro', 'Produto não encontrado')
        return
      }

      // Verifica se o produto já está na lista
      const produtoExistente = produtos.find(
        (p) => p.prod_codi === response.prod_codi
      )

      if (produtoExistente) {
        // Atualiza a quantidade do produto existente
        const novosProdutos = produtos.map((p) => {
          if (p.prod_codi === response.prod_codi) {
            return {
              ...p,
              quantidade: p.quantidade + 1,
              total_leituras: p.total_leituras + 1,
            }
          }
          return p
        })
        setProdutos(novosProdutos)
        Alert.alert(
          'Produto encontrado',
          `${response.prod_nome} - Quantidade atualizada para ${
            produtoExistente.quantidade + 1
          }`
        )
      } else {
        // Adiciona o novo produto à lista
        const novoProduto = {
          ...response,
          quantidade: 1,
          total_leituras: 1,
          timestamp: new Date().toISOString(),
        }
        setProdutos([...produtos, novoProduto])
        Alert.alert('Produto adicionado', response.prod_nome)
      }

      // Salva no armazenamento local
      await salvarProdutosLocalmente([...produtos])
    } catch (error) {
      console.error('Erro ao processar código de barras:', error)
      Alert.alert('Erro', 'Não foi possível processar o código de barras')
    } finally {
      setLoading(false)
    }
  }

  // Função para salvar produtos no armazenamento local
  const salvarProdutosLocalmente = async (listaProdutos) => {
    try {
      await AsyncStorage.setItem(
        'coletor_estoque_produtos',
        JSON.stringify(listaProdutos)
      )
    } catch (error) {
      console.error('Erro ao salvar produtos localmente:', error)
    }
  }

  // Função para carregar produtos do armazenamento local
  const carregarProdutosLocalmente = async () => {
    try {
      const produtosSalvos = await AsyncStorage.getItem(
        'coletor_estoque_produtos'
      )
      if (produtosSalvos) {
        setProdutos(JSON.parse(produtosSalvos))
      }
    } catch (error) {
      console.error('Erro ao carregar produtos localmente:', error)
    }
  }

  // Função para atualizar a quantidade de um produto
  const atualizarQuantidade = (prodCodi, novaQuantidade) => {
    const novosProdutos = produtos.map((p) => {
      if (p.prod_codi === prodCodi) {
        return {
          ...p,
          quantidade: parseFloat(novaQuantidade) || 0,
        }
      }
      return p
    })
    setProdutos(novosProdutos)
    salvarProdutosLocalmente(novosProdutos)
  }

  // Função para remover um produto da lista
  const removerProduto = (prodCodi) => {
    Alert.alert(
      'Remover Produto',
      'Tem certeza que deseja remover este produto da lista?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            const novosProdutos = produtos.filter(
              (p) => p.prod_codi !== prodCodi
            )
            setProdutos(novosProdutos)
            salvarProdutosLocalmente(novosProdutos)
          },
        },
      ]
    )
  }

  // Função para enviar os dados para o servidor
  const enviarDados = async () => {
    if (produtos.length === 0) {
      Alert.alert('Aviso', 'Não há produtos para enviar')
      return
    }

    try {
      setSalvando(true)

      // Prepara os dados para envio
      const leituras = produtos.map((produto) => {
        // O apiPostComContexto já adiciona o usuario_id automaticamente
        console.log('Contexto:', contexto)

        return {
          codigo_barras: produto.prod_coba,
          quantidade: produto.quantidade,
        }
      })

      // Envia cada leitura individualmente
      for (const leitura of leituras) {
        await apiPostComContexto('coletaestoque/registrar-leitura/', leitura)
      }

      Alert.alert('Sucesso', 'Leituras enviadas com sucesso!', [
        { text: 'OK', onPress: () => limparLista() },
      ])
    } catch (error) {
      console.error('Erro ao enviar dados:', error)
      Alert.alert('Erro', 'Não foi possível enviar os dados para o servidor')
    } finally {
      setSalvando(false)
    }
  }

  // Função para atualizar o estoque com base nas leituras
  const atualizarEstoque = async () => {
    if (produtos.length === 0) {
      Alert.alert('Aviso', 'Não há produtos para atualizar o estoque')
      return
    }

    try {
      setSalvando(true)

      // Chama a API para atualizar o estoque
      // O apiPostComContexto já adiciona o usuario_id automaticamente
      const response = await apiPostComContexto(
        'coletaestoque/atualizar-estoque/',
        {}
      )

      Alert.alert(
        'Sucesso',
        `Estoque atualizado com sucesso! ${response.message}`,
        [{ text: 'OK', onPress: () => limparLista() }]
      )
    } catch (error) {
      console.error('Erro ao atualizar estoque:', error)
      Alert.alert('Erro', 'Não foi possível atualizar o estoque')
    } finally {
      setSalvando(false)
    }
  }

  // Função para limpar a lista de produtos
  const limparLista = () => {
    Alert.alert(
      'Limpar Lista',
      'Tem certeza que deseja limpar toda a lista de produtos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: () => {
            setProdutos([])
            salvarProdutosLocalmente([])
          },
        },
      ]
    )
  }

  // Carrega produtos salvos ao iniciar
  useEffect(() => {
    carregarProdutosLocalmente()
  }, [])

  // Renderiza um item da lista de produtos
  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemNome}>{item.prod_nome}</Text>
        <Text style={styles.itemCodigo}>Código: {item.prod_codi}</Text>
        <Text style={styles.itemCodigo}>
          Código de Barras: {item.prod_coba}
        </Text>
        <Text style={styles.itemSaldo}>Saldo Atual: {item.saldo_atual}</Text>
      </View>

      <View style={styles.itemQuantidade}>
        <Text style={styles.quantidadeLabel}>Quantidade:</Text>
        <TextInput
          style={styles.quantidadeInput}
          value={item.quantidade.toString()}
          onChangeText={(text) => atualizarQuantidade(item.prod_codi, text)}
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity
        style={styles.removerButton}
        onPress={() => removerProduto(item.prod_codi)}>
        <Ionicons name="trash-outline" size={24} color="#d11a2a" />
      </TouchableOpacity>
    </View>
  )

  // Renderiza o conteúdo principal
  if (isScanning) {
    return (
      <LeitorCodigoBarras
        onProdutoLido={(codigo) => {
          onProdutoLido(codigo)
          setIsScanning(false)
        }}
      />
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Coletor de Estoque</Text>
        <Text style={styles.subtitulo}>Total de itens: {produtos.length}</Text>
      </View>

      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => setIsScanning(true)}
        disabled={loading}>
        <Ionicons name="barcode-outline" size={24} color="#fff" />
        <Text style={styles.scanButtonText}>Escanear Código de Barras</Text>
      </TouchableOpacity>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10a2a7" />
          <Text style={styles.loadingText}>Processando...</Text>
        </View>
      ) : (
        <FlatList
          data={produtos}
          renderItem={renderItem}
          keyExtractor={(item) => item.prod_codi}
          style={styles.lista}
          contentContainerStyle={styles.listaContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Nenhum produto escaneado</Text>
              <Text style={styles.emptySubtext}>
                Escaneie códigos de barras para adicionar produtos
              </Text>
            </View>
          }
        />
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.footerButton, styles.enviarButton]}
          onPress={enviarDados}
          disabled={salvando || produtos.length === 0}>
          <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
          <Text style={styles.footerButtonText}>Enviar Leituras</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.footerButton, styles.atualizarButton]}
          onPress={atualizarEstoque}
          disabled={salvando || produtos.length === 0}>
          <Ionicons name="refresh-outline" size={20} color="#fff" />
          <Text style={styles.footerButtonText}>Atualizar Estoque</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.footerButton, styles.limparButton]}
          onPress={limparLista}
          disabled={salvando || produtos.length === 0}>
          <Ionicons name="trash-outline" size={20} color="#fff" />
          <Text style={styles.footerButtonText}>Limpar</Text>
        </TouchableOpacity>
      </View>

      {salvando && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#10a2a7" />
          <Text style={styles.overlayText}>Processando...</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#10a2a7',
    padding: 16,
    alignItems: 'center',
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitulo: {
    fontSize: 14,
    color: '#fff',
    marginTop: 4,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10a2a7',
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: 'bold',
  },
  lista: {
    flex: 1,
  },
  listaContent: {
    padding: 16,
    paddingBottom: 100,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  itemInfo: {
    flex: 1,
  },
  itemNome: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemCodigo: {
    fontSize: 14,
    color: '#666',
  },
  itemSaldo: {
    fontSize: 14,
    color: '#10a2a7',
    marginTop: 4,
  },
  itemQuantidade: {
    marginLeft: 8,
    alignItems: 'center',
  },
  quantidadeLabel: {
    fontSize: 12,
    color: '#666',
  },
  quantidadeInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    width: 60,
    textAlign: 'center',
    fontSize: 16,
  },
  removerButton: {
    marginLeft: 8,
    justifyContent: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    padding: 12,
  },
  footerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  enviarButton: {
    backgroundColor: '#10a2a7',
  },
  atualizarButton: {
    backgroundColor: '#4CAF50',
  },
  limparButton: {
    backgroundColor: '#d11a2a',
  },
  footerButtonText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 16,
  },
})

export default ColetorEstoqueScreen
