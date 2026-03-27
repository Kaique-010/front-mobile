import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  FlatList,
  Image,
  Modal,
  Dimensions,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { fetchClienteOrdensServico } from '../services/clienteService'
import { formatCurrency, formatDate } from '../utils/formatters'
import AbaFotosAntes from './partials/abaFotosAntes'
import AbaFotosDurante from './partials/abaFotosDurante'
import AbaFotosDepois from './partials/abaFotosDepois'

const ORDEM_TIPOS = {
  1: 'Motor C.A',
  2: 'Motor C.C',
  3: 'Motor E.X',
  4: 'Motor Sincrono',
  5: 'Motor Monofásico',
  6: 'Transformador',
  7: 'Servo Motor',
  8: 'Drives',
  9: 'Campo M.C.A',
  10: 'Campo Transformador',
  11: 'Campo Geral',
  12: 'Motor Bomba',
  13: 'Bomba',
  14: 'Redutor',
  15: 'Gerador',
  16: 'Eixo',
  17: 'Carcaça',
}

const formatTipoOrdem = (tipo) => {
  const key = String(tipo || '').trim()
  if (!key) return '—'
  const desc = ORDEM_TIPOS[key]
  return desc ? `${key} - ${desc}` : key
}

const detectarMimePorNome = (nome) => {
  const ext = String(nome || '')
    .split('.')
    .pop()
    ?.toLowerCase()
  if (ext === 'png') return 'image/png'
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg'
  if (ext === 'webp') return 'image/webp'
  if (ext === 'gif') return 'image/gif'
  if (ext === 'pdf') return 'application/pdf'
  return 'application/octet-stream'
}

const montarArquivoDataUri = (arquivo) => {
  const base =
    arquivo?.arquivo_base64 ||
    arquivo?.arquivoBase64 ||
    arquivo?.base64 ||
    arquivo?.preview
  if (!base || typeof base !== 'string') return null
  const b = base.trim()
  if (!b) return null
  if (b.startsWith('data:')) return b
  const mime = detectarMimePorNome(arquivo?.nome)
  return `data:${mime};base64,${b}`
}

const AbaArquivosRelatorio = ({ arquivos, onRefresh }) => {
  const [selectedUri, setSelectedUri] = useState(null)
  const [windowSize, setWindowSize] = useState(Dimensions.get('window'))

  useEffect(() => {
    const sub = Dimensions.addEventListener('change', ({ window }) =>
      setWindowSize(window),
    )
    return () => {
      if (sub?.remove) sub.remove()
    }
  }, [])

  const columns = Platform.OS === 'web' ? 3 : 1
  const itemWidth =
    columns === 1
      ? Math.max(0, windowSize.width - 40)
      : (windowSize.width - 40) / columns - 8
  const itemHeight = columns === 1 ? 260 : itemWidth

  const imagens = Array.isArray(arquivos)
    ? arquivos
        .map((a) => ({
          id: a?.id ?? a?.arqu_codi_arqu ?? a?.os_arqu,
          nome: a?.nome,
          uri: montarArquivoDataUri(a),
        }))
        .filter(
          (x) => typeof x.uri === 'string' && x.uri.startsWith('data:image/'),
        )
    : []

  if (!Array.isArray(arquivos) || arquivos.length === 0) {
    return (
      <View style={styles.section}>
        <View style={styles.arquivosHeaderRow}>
          <Text style={styles.sectionTitle}>Arquivos</Text>
          <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
            <Text style={styles.refreshBtnText}>Atualizar</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.emptyCard}>
          <Ionicons name="folder-open-outline" size={48} color="#2D2D44" />
          <Text style={styles.emptyText}>Nenhum arquivo encontrado</Text>
        </View>
      </View>
    )
  }

  if (imagens.length === 0) {
    return (
      <View style={styles.section}>
        <View style={styles.arquivosHeaderRow}>
          <Text style={styles.sectionTitle}>Arquivos</Text>
          <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
            <Text style={styles.refreshBtnText}>Atualizar</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.emptyCard}>
          <Ionicons name="images-outline" size={48} color="#2D2D44" />
          <Text style={styles.emptyText}>
            Arquivos encontrados, mas sem imagens para exibir
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.section}>
      <View style={styles.arquivosHeaderRow}>
        <Text style={styles.sectionTitle}>Arquivos</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
          <Text style={styles.refreshBtnText}>Atualizar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        key={`arquivos-cols-${columns}`}
        data={imagens}
        keyExtractor={(item, index) => String(item?.id ?? index)}
        numColumns={columns}
        contentContainerStyle={styles.arquivosListContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.arquivoThumbBox,
              { width: columns === 1 ? '100%' : itemWidth },
            ]}
            onPress={() => setSelectedUri(item.uri)}>
            {columns === 1 ? (
              <>
                <Text style={styles.arquivoNome} numberOfLines={1}>
                  {item?.nome || 'Arquivo'}
                </Text>
                <View style={[styles.arquivoImgBox, { height: itemHeight }]}>
                  <Image
                    source={{ uri: item.uri }}
                    style={styles.arquivoThumb}
                    resizeMode="contain"
                  />
                </View>
              </>
            ) : (
              <View style={[styles.arquivoImgBox, { height: itemWidth }]}>
                <Image
                  source={{ uri: item.uri }}
                  style={styles.arquivoThumb}
                  resizeMode="cover"
                />
              </View>
            )}
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={!!selectedUri}
        transparent={true}
        onRequestClose={() => setSelectedUri(null)}
        animationType="fade">
        <View style={styles.modalImgContainer}>
          <TouchableOpacity
            style={styles.modalCloseBtn}
            onPress={() => setSelectedUri(null)}>
            <Ionicons name="close" size={30} color="#FFFFFF" />
          </TouchableOpacity>
          {selectedUri && (
            <View
              style={[
                styles.modalImgBox,
                { width: windowSize.width, height: windowSize.height * 0.85 },
              ]}>
              <Image
                source={{ uri: selectedUri }}
                style={styles.modalImg}
                resizeMode="contain"
              />
            </View>
          )}
        </View>
      </Modal>
    </View>
  )
}

const CollapsibleSection = ({ title, isOpen, onToggle, children }) => {
  return (
    <View style={styles.section}>
      <TouchableOpacity onPress={onToggle} style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#FFFFFF"
        />
      </TouchableOpacity>
      {isOpen && children}
    </View>
  )
}

const ClienteOrdensServicoDetalhes = ({ route, navigation }) => {
  const { ordemId, ordemInicial } = route.params
  const [ordem, setOrdem] = useState(ordemInicial || null)
  const [loading, setLoading] = useState(!ordemInicial)
  const [activeTab, setActiveTab] = useState('geral')
  const [openSections, setOpenSections] = useState({
    gerais: true,
    equipamento: true,
    descricao: true,
    pecas: true,
    servicos: true,
    resumo: true,
  })

  useEffect(() => {
    carregarOrdem()
  }, [ordemId])

  useEffect(() => {
    if (ordem) {
      console.log(
        'ClienteOrdensServicoDetalhes ordem:',
        ordem.orde_nume,
        ordem.ver_preco,
        ordem,
      )
    }
  }, [ordem])

  const carregarOrdem = async (opts = {}) => {
    try {
      if (!ordem) setLoading(true)

      let ordemEncontrada = null

      // Tentar buscar pelo número da ordem (mais confiável)
      const numeroOrdem = ordem?.orde_nume || ordemInicial?.orde_nume

      if (numeroOrdem) {
        const response = await fetchClienteOrdensServico({
          orde_nume: numeroOrdem,
          ...(opts.refresh ? { refresh: 1 } : {}),
        })
        const lista =
          response.results || (Array.isArray(response) ? response : [])
        ordemEncontrada = lista.find((o) => o.orde_nume === numeroOrdem)
      }

      // Se não encontrou pelo número, tenta pelo ID
      if (!ordemEncontrada && ordemId) {
        // Tenta buscar específico pelo ID
        const response = await fetchClienteOrdensServico({ id: ordemId })
        let lista =
          response.results || (Array.isArray(response) ? response : [])
        ordemEncontrada = lista.find((o) => o.id === ordemId)

        // Se ainda não encontrou, busca na lista geral (fallback)
        if (!ordemEncontrada) {
          const responseAll = await fetchClienteOrdensServico()
          lista =
            responseAll.results ||
            (Array.isArray(responseAll) ? responseAll : [])
          ordemEncontrada = lista.find((o) => o.id === ordemId)
        }
      }

      if (ordemEncontrada) {
        setOrdem(ordemEncontrada)
      } else if (!ordem) {
        Alert.alert('Erro', 'Ordem de serviço não encontrada')
        navigation.goBack()
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes da ordem:', error)
      Alert.alert(
        'Erro',
        'Não foi possível carregar os detalhes da ordem de serviço',
      )
      navigation.goBack()
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    // Handle string or number status
    const statusStr = String(status)
    const statusNum = Number(status)

    if (
      statusNum === 0 ||
      statusStr === '0' ||
      statusStr === 'A' ||
      statusStr === 'aberta'
    )
      return '#93e0d6ff'
    if (statusNum === 1 || statusStr === '1') return '#ada15cff'
    if (statusNum === 2 || statusStr === '2') return '#78bbc9ff'
    if (statusNum === 3 || statusStr === '3') return '#6cac8eff'
    if (
      statusNum === 4 ||
      statusStr === '4' ||
      statusStr === 'C' ||
      statusStr === 'Finalizada'
    )
      return '#94d89dff'
    if (
      statusNum === 5 ||
      statusStr === '5' ||
      statusStr === 'X' ||
      statusStr === 'cancelada'
    )
      return '#d65661ff'
    if (statusNum === 20 || statusStr === '20') return '#FFD700'
    if (statusNum === 21 || statusStr === '21') return '#af4e56ff'
    if (statusNum === 22 || statusStr === '22') return '#72ac91ff'
    return '#8B8BA7'
  }

  const formatStatus = (status) => {
    switch (status) {
      case 'aberta':
      case 'A':
      case 0:
        return 'Aberta'
      case 1:
        return 'Orçamento Gerado'
      case 2:
        return 'Aguardando liberação'
      case 3:
        return 'Liberada'
      case 4:
        return 'Finalizada'
      case 5:
        return 'Reprovada'
      case 20:
        return 'Parcial'
      case 21:
        return 'Em atraso'
      case 22:
        return 'Em Estoque'
      case 'em_andamento':
      case 'E':
        return 'Em Andamento'
      case 'concluida':
      case 'C':
        return 'Concluída'
      case 'cancelada':
      case 'X':
        return 'Cancelada'
      default:
        // Verifica se status é string antes de tentar usar métodos de string
        if (typeof status === 'string') {
          return (
            status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')
          )
        }
        return 'Desconhecido'
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#00D4FF" />
          <Text style={styles.loadingText}>
            Carregando detalhes da ordem...
          </Text>
        </View>
      </View>
    )
  }

  if (!ordem) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#d65661ff" />
        <Text style={styles.errorText}>Ordem de serviço não encontrada</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          OS #{ordem.orde_nume || ordem.id}
        </Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(ordem.orde_stat_orde) },
          ]}>
          <Text style={styles.statusText}>
            {formatStatus(ordem.orde_stat_orde)}
          </Text>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'geral' && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab('geral')}>
            <Text
              style={[
                styles.tabText,
                activeTab === 'geral' && styles.activeTabText,
              ]}>
              Geral
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'antes' && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab('antes')}>
            <Text
              style={[
                styles.tabText,
                activeTab === 'antes' && styles.activeTabText,
              ]}>
              Fotos Antes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'durante' && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab('durante')}>
            <Text
              style={[
                styles.tabText,
                activeTab === 'durante' && styles.activeTabText,
              ]}>
              Fotos Durante
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'depois' && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab('depois')}>
            <Text
              style={[
                styles.tabText,
                activeTab === 'depois' && styles.activeTabText,
              ]}>
              Fotos Depois
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'arquivos' && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab('arquivos')}>
            <Text
              style={[
                styles.tabText,
                activeTab === 'arquivos' && styles.activeTabText,
              ]}>
              Arquivos
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {activeTab === 'geral' && (
        <>
          <CollapsibleSection
            title="Informações Gerais"
            isOpen={openSections.gerais}
            onToggle={() =>
              setOpenSections((s) => ({ ...s, gerais: !s.gerais }))
            }>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>DATA DE ABERTURA</Text>
                <Text style={styles.infoValue}>
                  {formatDate(ordem.orde_data_aber)}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>PREVISÃO</Text>
                <Text style={styles.infoValue}>
                  {formatDate(ordem.orde_data_prev)}
                </Text>
              </View>
              {ordem.ver_preco === true && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>VALOR TOTAL</Text>
                  <Text style={styles.infoValue}>
                    {formatCurrency(ordem.orde_tota)}
                  </Text>
                </View>
              )}
            </View>
          </CollapsibleSection>

          <CollapsibleSection
            title="Dados do Equipamento"
            isOpen={openSections.equipamento}
            onToggle={() =>
              setOpenSections((s) => ({ ...s, equipamento: !s.equipamento }))
            }>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>MOTOR</Text>
                <Text style={styles.infoValue}>
                  {[
                    ordem.orde_mode,
                    ordem.orde_seri,
                    ordem.orde_patr,
                    ordem.orde_plac,
                  ]
                    .filter(Boolean)
                    .join(' | ') || 'Não informado'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>TIPO</Text>
                <Text style={styles.infoValue}>
                  {formatTipoOrdem(ordem.orde_tipo)}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>VOLTAGEM</Text>
                <Text style={styles.infoValue}>
                  {ordem.orde_volt != null ? String(ordem.orde_volt) : '—'} -{' '}
                  {ordem.voltagem_nome || '—'} (volts)
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>POTÊNCIA</Text>
                <Text style={styles.infoValue}>{ordem.orde_pote || '—'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>GRAU IP</Text>
                <Text style={styles.infoValue}>
                  {ordem.orde_grau_ip || '—'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>FREQUÊNCIA</Text>
                <Text style={styles.infoValue}>{ordem.orde_hz || '—'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>ROTAÇÃO</Text>
                <Text style={styles.infoValue}>{ordem.orde_rpm || '—'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>ISOLAÇÃO</Text>
                <Text style={styles.infoValue}>{ordem.orde_isol || '—'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Nº DE SÉRIE</Text>
                <Text style={styles.infoValue}>{ordem.orde_seri || '—'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>MODELO</Text>
                <Text style={styles.infoValue}>{ordem.orde_mode || '—'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>MARCA</Text>
                <Text style={styles.infoValue}>
                  {ordem.orde_marc || '—'} - {ordem.marca_nome || '—'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>FORMA CONSTRUTIVA</Text>
                <Text style={styles.infoValue}>{ordem.orde_foco || '—'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>SAÍDA DE CABOS DA LIGAÇÃO</Text>
                <Text style={styles.infoValue}>
                  {ordem.orde_esta_cabo || '—'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>STATUS DA CAIXA</Text>
                <Text style={styles.infoValue}>
                  {ordem.orde_esta_liga || '—'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>OBSERVAÇÕES</Text>
                <Text style={styles.infoValue}>{ordem.orde_obse || '—'}</Text>
              </View>
            </View>
          </CollapsibleSection>

          <CollapsibleSection
            title="Descrição do Serviço"
            isOpen={openSections.descricao}
            onToggle={() =>
              setOpenSections((s) => ({ ...s, descricao: !s.descricao }))
            }>
            <View style={styles.descricaoCard}>
              <Text style={styles.descricaoText}>
                {ordem.orde_defe_desc || 'Nenhuma descrição informada'}
              </Text>
            </View>
          </CollapsibleSection>

          <CollapsibleSection
            title="Peças"
            isOpen={openSections.pecas}
            onToggle={() =>
              setOpenSections((s) => ({ ...s, pecas: !s.pecas }))
            }>
            {ordem.pecas && ordem.pecas.length > 0 ? (
              ordem.pecas.map((peca, index) => (
                <View key={index} style={styles.itemCard}>
                  <Text style={styles.itemNome}>
                    {peca.produto_nome || `Peça #${peca.peca_codi}`}
                  </Text>
                  <View style={styles.itemDetails}>
                    <View style={styles.itemRow}>
                      <Text style={styles.itemLabel}>QUANTIDADE</Text>
                      <Text style={styles.itemValue}>{peca.peca_quan}</Text>
                    </View>
                    {ordem.ver_preco !== false && (
                      <>
                        <View style={styles.itemRow}>
                          <Text style={styles.itemLabel}>VALOR UNITÁRIO</Text>
                          <Text style={styles.itemValue}>
                            {formatCurrency(peca.peca_unit)}
                          </Text>
                        </View>
                        <View style={styles.itemRow}>
                          <Text style={styles.itemLabel}>SUBTOTAL</Text>
                          <Text style={styles.itemValue}>
                            {formatCurrency(
                              peca.peca_tota || peca.peca_quan * peca.peca_unit,
                            )}
                          </Text>
                        </View>
                      </>
                    )}
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>Nenhuma peça encontrada</Text>
              </View>
            )}
          </CollapsibleSection>

          <CollapsibleSection
            title="Serviços"
            isOpen={openSections.servicos}
            onToggle={() =>
              setOpenSections((s) => ({ ...s, servicos: !s.servicos }))
            }>
            {ordem.servicos && ordem.servicos.length > 0 ? (
              ordem.servicos.map((servico, index) => (
                <View key={index} style={styles.itemCard}>
                  <Text style={styles.itemNome}>{servico.servico_nome}</Text>
                  <View style={styles.itemDetails}>
                    <View style={styles.itemRow}>
                      <Text style={styles.itemLabel}>QUANTIDADE</Text>
                      <Text style={styles.itemValue}>{servico.serv_quan}</Text>
                    </View>
                    {ordem.ver_preco !== false && (
                      <>
                        <View style={styles.itemRow}>
                          <Text style={styles.itemLabel}>VALOR UNITÁRIO</Text>
                          <Text style={styles.itemValue}>
                            {formatCurrency(servico.serv_unit)}
                          </Text>
                        </View>
                        <View style={styles.itemRow}>
                          <Text style={styles.itemLabel}>SUBTOTAL</Text>
                          <Text style={styles.itemValue}>
                            {formatCurrency(
                              servico.serv_tota ||
                                servico.serv_quan * servico.serv_unit,
                            )}
                          </Text>
                        </View>
                      </>
                    )}
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>Nenhum serviço encontrado</Text>
              </View>
            )}
          </CollapsibleSection>

          {ordem.ver_preco !== false && (
            <CollapsibleSection
              title="Resumo de Valores"
              isOpen={openSections.resumo}
              onToggle={() =>
                setOpenSections((s) => ({ ...s, resumo: !s.resumo }))
              }>
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>SUBTOTAL</Text>
                  <Text style={styles.infoValue}>
                    {formatCurrency(ordem.orde_tota || ordem.orde_tota)}
                  </Text>
                </View>
                {ordem.orde_desc > 0 && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>DESCONTO</Text>
                    <Text style={styles.infoValue}>
                      - {formatCurrency(ordem.orde_desc)}
                    </Text>
                  </View>
                )}
                <View style={[styles.infoRow, styles.totalRow]}>
                  <Text style={[styles.infoLabel, styles.totalLabel]}>
                    TOTAL
                  </Text>
                  <Text style={[styles.infoValue, styles.totalValue]}>
                    {formatCurrency(ordem.orde_tota)}
                  </Text>
                </View>
              </View>
            </CollapsibleSection>
          )}
        </>
      )}

      {activeTab === 'antes' && <AbaFotosAntes ordemId={ordem.orde_nume} />}
      {activeTab === 'durante' && <AbaFotosDurante ordemId={ordem.orde_nume} />}
      {activeTab === 'depois' && <AbaFotosDepois ordemId={ordem.orde_nume} />}
      {activeTab === 'arquivos' && (
        <AbaArquivosRelatorio
          arquivos={ordem?.arquivos}
          onRefresh={() => carregarOrdem({ refresh: true })}
        />
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F0F23',
  },
  loadingContent: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '500',
    color: '#8B8BA7',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F0F23',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8B8BA7',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  backButton: {
    backgroundColor: '#00D4FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#16213E',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  descricaoCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    borderWidth: 0.8,
    borderColor: '#2D2D44',
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  descricaoText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    fontWeight: '400',
  },
  infoCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    borderWidth: 0.8,
    borderColor: '#2D2D44',
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D44',
  },
  infoLabel: {
    fontSize: 10,
    color: '#8B8BA7',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  totalRow: {
    marginTop: 8,
    borderBottomWidth: 0,
    paddingTop: 16,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#00D4FF',
  },
  itemCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    borderWidth: 0.8,
    borderColor: '#2D2D44',
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  itemDetails: {
    marginTop: 4,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemLabel: {
    fontSize: 10,
    color: '#8B8BA7',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  itemValue: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  emptyCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    borderWidth: 0.8,
    borderColor: '#2D2D44',
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#8B8BA7',
    fontStyle: 'italic',
    fontSize: 14,
    fontWeight: '500',
  },
  actions: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  actionButton: {
    backgroundColor: '#00D4FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
  bottomSpacing: {
    height: 32,
  },
  tabContainer: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#2D2D44',
  },
  activeTabButton: {
    backgroundColor: '#00D4FF',
    borderColor: '#00D4FF',
  },
  tabText: {
    color: '#8B8BA7',
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  arquivosHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  refreshBtn: {
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#2D2D44',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  refreshBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  arquivosListContent: {
    paddingVertical: 6,
  },
  arquivoThumbBox: {
    margin: 4,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#2D2D44',
  },
  arquivoNome: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 8,
  },
  arquivoImgBox: {
    width: '100%',
    backgroundColor: '#101028',
  },
  arquivoThumb: {
    width: '100%',
    height: '100%',
  },
  modalImgContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  modalImgBox: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  modalImg: {
    width: '100%',
    height: '100%',
  },
})

export default ClienteOrdensServicoDetalhes
