import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native'
import Toast from 'react-native-toast-message'
import { apiGetComContexto, apiGetComContextoSemFili } from '../utils/api'
import { processarSalvarOrcamento } from '../componetsPisos/salvarOrcamento'
import { useContextoApp } from '../hooks/useContextoApp'
import { useNavigation } from '@react-navigation/native'
import ProdutoModal from '../componentsProdutosDetalhados/ProdutoModal'
import BuscaClienteInput from '../components/BuscaClienteInput'
import { MaterialIcons, Ionicons } from '@expo/vector-icons'
import BarraBusca from './componentsConsultaProdutos/barraBusca'
import BarraTotal from './componentsConsultaProdutos/BarraTotal'
import LeitorConsulta from './componentsConsultaProdutos/LeitorConsulta'
import ProdutoCard from '../componentsProdutosDetalhados/ProdutoCard'
import CadastroRapidoOutrosModal from './componentsConsultaProdutos/tipoOutros'

import TotalizadorProdutos from './componentsConsultaProdutos/Funcoes/totalizadorProdutos'
import database from '../componentsOrdemServico/schemas/database'
import AsyncStorage from '@react-native-async-storage/async-storage'

const PRODUTOS_CACHE_KEY = 'produtos_detalhados_cache'
const PRODUTOS_CACHE_DURATION = 12 * 60 * 60 * 1000 // 12 horas

const ConsultaProdutos = () => {
  const { empresaId, filialId } = useContextoApp()
  const [salvando, setSalvando] = useState(false)
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [marcaSelecionada, setMarcaSelecionada] = useState('')
  const [saldoFiltro, setSaldoFiltro] = useState('todos')
  const [marcas, setMarcas] = useState([])
  const [produtoModalVisible, setProdutoModalVisible] = useState(false)
  const [produtoModalProduto, setProdutoModalProduto] = useState(null)
  const navigation = useNavigation()

  // State para seleção de cliente
  const [modalClienteVisible, setModalClienteVisible] = useState(false)
  const [clienteSelecionado, setClienteSelecionado] = useState(null)
  const [cadastroRapidoVisible, setCadastroRapidoVisible] = useState(false)

  // States para o Leitor
  const [leitorVisible, setLeitorVisible] = useState(false)
  const [statusLeitura, setStatusLeitura] = useState('idle')

  const fetchProdutos = async (
    termo = '',
    marca = '',
    saldo = 'todos',
    origem = 'manual',
    forceRefresh = false,
  ) => {
    console.log('fetchProdutos args:', {
      termo,
      marca,
      saldo,
      origem,
      forceRefresh,
    })
    try {
      if (origem === 'scanner') {
        setStatusLeitura('loading')
      }
      setLoading(true)

      // Lógica Offline/Cache igual ao useProdutos para busca inicial
      if (
        !forceRefresh &&
        origem === 'manual' &&
        !termo &&
        !marca &&
        saldo === 'todos'
      ) {
        try {
          const mega = database.collections.get('mega_produtos')
          const rows = await mega.query().fetch()
          if (rows.length > 0) {
            console.log(
              `[OFFLINE] Usando MegaProdutos: ${rows.length} itens encontrados`,
            )
            const mapped = rows.map((r) => ({
              codigo: r.prodCodi,
              nome: r.prodNome,
              marca_nome: r.marcaNome,
              saldo: r.saldo,
              preco_vista: r.precoVista,
              imagem_base64: r.imagemBase64,
              prod_codi: r.prodCodi,
              prod_nome: r.prodNome,
              prod_marc_nome: r.marcaNome,
              prod_preco_vista: r.precoVista,
            }))
            setProdutos(mapped)
            const marcasUnicas = [
              ...new Set(mapped.map((p) => p.marca_nome).filter(Boolean)),
            ]
            setMarcas(['Sem marca', ...marcasUnicas.sort()])
            setLoading(false)
            return
          }
        } catch (e) {
          console.log('Erro ao consultar MegaProdutos:', e)
        }

        try {
          const cacheData = await AsyncStorage.getItem(PRODUTOS_CACHE_KEY)
          if (cacheData) {
            const { results, marcas, timestamp } = JSON.parse(cacheData)
            const now = Date.now()
            if (now - timestamp < PRODUTOS_CACHE_DURATION) {
              console.log('[CACHE] Usando cache AsyncStorage')
              setProdutos(results || [])
              setMarcas(marcas || [])
              setLoading(false)
              return
            }
          }
        } catch (e) {
          console.log('Erro ao consultar cache AsyncStorage:', e)
        }
      }

      const params = {}
      if (origem === 'scanner') {
        // Limpa filtros que podem restringir o resultado indevidamente
        params.marca_nome = undefined
        params.com_saldo = undefined
        params.sem_saldo = undefined

        if (termo && termo.includes('/p/')) {
          // Normaliza a URL do QR Code para garantir que o backend reconheça o padrão
          const parts = termo.split('/p/')
          if (parts.length > 1) {
            let hash = parts[1].split('/')[0].split('?')[0].trim()
            const cleanUrl = `https://mobile-sps.site/p/${hash}`
            console.log(`URL de Scanner normalizada: ${cleanUrl}`)
            params.q = cleanUrl
          } else {
            params.q = termo
          }
        } else {
          params.q = termo
        }
      } else {
        // Busca manual: aplica filtros
        if (termo) params.search = termo
        if (marca && marca !== '__sem_marca__') params.marca_nome = marca
        if (marca === '__sem_marca__') params.marca_nome = '__sem_marca__'
        console.log('Parametros:', params)

        if (saldo === 'com') {
          params.com_saldo = true
        } else if (saldo === 'sem') {
          params.sem_saldo = true
        }
      }

      console.log('Buscando produtos:', JSON.stringify(params))

      // Define endpoint baseado na origem
      // Scanner usa busca simples, Manual usa detalhados para filtros
      const endpoint =
        origem === 'scanner'
          ? 'produtos/produtos/busca/'
          : 'produtos/produtosdetalhados/'

      const data = await apiGetComContextoSemFili(endpoint, params)

      if (origem === 'scanner' && data.length === 0) {
        console.log('Tentando busca alternativa com apiGetComContexto...')
        // Fallback: se não achar sem filial, tenta com filial
        const dataFili = await apiGetComContexto(
          'produtos/produtos/busca/',
          params,
        )
        if (dataFili && dataFili.length > 0) {
          console.log('Encontrado com contexto de filial!')
          console.log(
            'Resultado busca alternativa:',
            JSON.stringify(dataFili).substring(0, 200),
          )
          setProdutos(dataFili)
          return
        }
      }

      console.log('Resultado busca:', JSON.stringify(data).substring(0, 200))

      const results = Array.isArray(data) ? data : data.results || []

      // Salvar no cache se for busca inicial manual sem filtros
      if (
        origem === 'manual' &&
        !termo &&
        !marca &&
        saldo === 'todos' &&
        results.length > 0
      ) {
        try {
          // Salva no AsyncStorage
          const marcasUnicas = [
            ...new Set(
              results
                .map((p) => p.prod_marc_nome || p.marca_nome)
                .filter(Boolean),
            ),
          ]
          const marcasTratadas = ['Sem marca', ...marcasUnicas.sort()]

          const cacheData = {
            results: results,
            marcas: marcasTratadas,
            timestamp: Date.now(),
          }
          await AsyncStorage.setItem(
            PRODUTOS_CACHE_KEY,
            JSON.stringify(cacheData),
          )
          console.log('💾 [CACHE] Produtos salvos no cache')

          // Salva no MegaProdutos (WatermelonDB) para uso offline robusto
          // Nota: Simplificado para não bloquear a UI, ideal seria em background
          // Se necessário, copie a lógica de escrita do useProdutos aqui
        } catch (error) {
          console.log('⚠️ Erro ao salvar cache:', error)
        }
      }

      // Extrair marcas únicas para o filtro se for uma busca manual sem marca selecionada
      if (origem === 'manual' && !marca) {
        const marcasDoResult = results
          .map((p) => p.prod_marc_nome || p.marca_nome)
          .filter(Boolean)

        setMarcas((prevMarcas) => {
          // Mantém marcas existentes e adiciona novas encontradas
          // Isso evita que a lista de marcas seja reduzida apenas às da página atual (ex: 20 itens)
          const existing = new Set(prevMarcas.filter((m) => m !== 'Sem marca'))
          marcasDoResult.forEach((m) => existing.add(m))
          const combined = ['Sem marca', ...Array.from(existing).sort()]
          console.log(
            `Atualizando marcas. Antes: ${prevMarcas.length}, Depois: ${combined.length}`,
          )
          return combined
        })
      }

      if (origem === 'scanner') {
        // Tenta encontrar correspondência exata primeiro
        // O backend retorna uma lista com o produto encontrado quando o match acontece
        // Como o backend já filtrou pelo código do hash, podemos pegar o primeiro resultado
        let exato = null

        if (results.length > 0) {
          // Se retornou resultados, verifica se algum bate com o termo ou se é resultado único do hash match
          exato = results.find(
            (p) =>
              String(p.prod_codi) === String(termo) ||
              String(p.prod_coba) === String(termo) ||
              String(p.prod_gtin) === String(termo),
          )

          // Se não achou exato pelo código mas tem resultado (provavelmente veio do match do hash no backend)
          if (!exato && results.length > 0) {
            exato = results[0]
          }
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
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'Não foi possível carregar os produtos.',
        })
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
    console.log('handleSearchSubmit disparado. Termo:', searchTerm)
    fetchProdutos(searchTerm, marcaSelecionada, saldoFiltro, 'manual', true)
  }

  // Debounce para busca por texto (igual ao useProdutos)
  useEffect(() => {
    const delay = setTimeout(() => {
      if (searchTerm !== '') {
        console.log('Debounce search disparado:', searchTerm)
        fetchProdutos(searchTerm, marcaSelecionada, saldoFiltro, 'manual', true)
      }
    }, 600)
    return () => clearTimeout(delay)
  }, [searchTerm])

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
    if (newQuantity < 0) return

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

  const handleSalvarPress = () => {
    const itensComQuantidade = produtos.filter((p) => p.quantity > 0)

    if (itensComQuantidade.length === 0) {
      Toast.show({
        type: 'info',
        text1: 'Atenção',
        text2: 'Selecione pelo menos um produto com quantidade maior que zero.',
      })
      return
    }

    setModalClienteVisible(true)
  }

  const finalizarSalvamento = async () => {
    if (!clienteSelecionado) {
      Toast.show({
        type: 'info',
        text1: 'Atenção',
        text2: 'Selecione um cliente para continuar.',
      })
      return
    }

    const itensComQuantidade = produtos.filter((p) => p.quantity > 0)

    const orcamentoParaSalvar = {
      orca_empr: empresaId,
      orca_fili: filialId,
      orca_clie: clienteSelecionado.enti_clie,
      orca_vend: null,
      orca_data: new Date().toISOString().split('T')[0],
      orca_data_prev_entr: new Date(
        new Date().getTime() + 30 * 24 * 60 * 60 * 1000,
      )
        .toISOString()
        .split('T')[0],
      orca_stat: 0,
      orca_obse: 'Orçamento gerado via Consulta de Produtos',
      itens_input: itensComQuantidade.map((p) => ({
        item_prod: p.prod_codi,
        item_quan: p.quantity,
        item_unit: p.prod_preco_vista,
      })),
      itens_removidos: [],
      orca_tota: 0,
      orca_mode_piso: '',
      orca_mode_alum: '',
      orca_mode_roda: '',
      orca_mode_port: '',
      orca_mode_outr: '',
      orca_sent_piso: '',
      orca_ajus_port: 'false',
      orca_degr_esca: 'false',
      orca_obra_habi: false,
      orca_movi_mobi: false,
      orca_remo_roda: false,
      orca_remo_carp: false,
      orca_croq_info: '',
      orca_ende: '',
      orca_nume_ende: '',
      orca_comp: '',
      orca_bair: '',
      orca_cida: '',
      orca_esta: '',
      orca_desc: 0,
      orca_fret: 0,
    }

    setModalClienteVisible(false) // Fecha modal antes de iniciar processo que pode ter alertas

    try {
      const response = await processarSalvarOrcamento({
        orcamento: orcamentoParaSalvar,
        orcamentoParam: null,
        setSalvando,
        navigation,
      })

      setClienteSelecionado(null)

      if (response && response.orca_nume) {
        Toast.show({
          type: 'success',
          text1: 'Sucesso',
          text2: `Orçamento nº ${response.orca_nume} salvo com sucesso!`,
        })
        navigation.navigate('OrcamentosPisos')
      }
    } catch (error) {}
  }

  const total = TotalizadorProdutos(produtos)
  const quantidadeItens = produtos.reduce(
    (acc, p) => acc + (p.quantity || 0),
    0,
  )

  console.log(
    `Renderizando ConsultaProdutos. Marcas: ${marcas.length}, Produtos: ${produtos.length}`,
  )

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
              nome: item.nome || item.prod_nome,
              marca_nome: item.marca_nome || item.prod_marc_nome || 'Geral',
              preco_vista: item.preco_vista ?? item.prod_preco_vista,
              saldo: item.saldo ?? item.saldo_estoque,
              imagem_base64: item.imagem_base64 || item.prod_foto,
              // Mapeamento para o Modal
              codigo: item.codigo || item.prod_codi,
              unidade: item.unidade || item.prod_unme,
              empresa: item.empresa || item.prod_empr,
              filial: item.filial || item.prod_fili,
            }}
            onPress={handleProdutoPress}
            quantity={item.quantity || 0}
            onQuantityChange={(qty) => updateQuantity(item, qty)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading && (
            <Text style={styles.emptyText}>Nenhum produto encontrado</Text>
          )
        }
      />

      <BarraTotal total={total} quantidadeItens={quantidadeItens} />
      <TouchableOpacity
        style={[styles.botaoSalvar, salvando && styles.botaoDesabilitado]}
        onPress={handleSalvarPress}
        disabled={salvando}
        activeOpacity={0.8}>
        {salvando ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <MaterialIcons name="save" size={20} color="#fff" />
        )}
        <Text style={styles.botaoSalvarTexto}>
          {salvando ? 'Salvando...' : 'Salvar'}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalClienteVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalClienteVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecione o Cliente</Text>

            <View style={{ zIndex: 1000 }}>
              <BuscaClienteInput
                onSelect={setClienteSelecionado}
                placeholder="Buscar cliente..."
                value={
                  clienteSelecionado
                    ? `${clienteSelecionado.enti_clie} - ${clienteSelecionado.enti_nome}`
                    : ''
                }
              />
            </View>

            <TouchableOpacity
              onPress={() => {
                setModalClienteVisible(false)
                setTimeout(() => {
                  setCadastroRapidoVisible(true)
                }, 500)
              }}
              style={{
                padding: 10,
                alignItems: 'center',
                marginTop: 10,
              }}>
              <Text style={{ color: '#10a2a7', fontWeight: 'bold' }}>
                Não encontrou? Cadastrar Rápido
              </Text>
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.botaoCancelarModal]}
                onPress={() => {
                  setModalClienteVisible(false)
                  setClienteSelecionado(null)
                }}>
                <Text style={styles.botaoCancelarTextoModal}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.botaoConfirmarModal,
                  !clienteSelecionado && styles.botaoDesabilitado,
                ]}
                onPress={finalizarSalvamento}
                disabled={!clienteSelecionado}>
                <Text style={styles.botaoConfirmarTextoModal}>
                  Confirmar e Salvar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <CadastroRapidoOutrosModal
        visible={cadastroRapidoVisible}
        onClose={() => {
          setCadastroRapidoVisible(false)
          setTimeout(() => {
            setModalClienteVisible(true)
          }, 500)
        }}
        onSuccess={(novoCliente) => {
          setClienteSelecionado(novoCliente)
        }}
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoCancelarModal: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  botaoConfirmarModal: {
    backgroundColor: '#10a2a7',
  },
  botaoCancelarTextoModal: {
    color: '#666',
    fontWeight: '600',
  },
  botaoConfirmarTextoModal: {
    color: '#fff',
    fontWeight: '600',
  },
  botaoDesabilitado: {
    backgroundColor: '#ccc',
    borderWidth: 0,
  },
  botaoSalvar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#10a2a7',
  },
})

export default ConsultaProdutos
