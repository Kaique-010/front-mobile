import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native'
import {
  notasFiscaisService,
  notasFiscaisUtils,
} from '../componentsNotasFiscais/notasFiscaisService'
import styles from '../styles/notaFiscalDetalheStyles'

export default function NotaFiscalDetalhe({ route, navigation }) {
  const { notaFiscal } = route.params
  const [detalhes, setDetalhes] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingXml, setLoadingXml] = useState(false)

  const formatarPessoa = (pessoa) => {
    if (pessoa == null) return ''
    if (typeof pessoa === 'string') return pessoa
    if (typeof pessoa === 'number') return String(pessoa)
    if (typeof pessoa !== 'object') return String(pessoa)

    return (
      pessoa.enti_nome ||
      pessoa.nome ||
      pessoa.razao_social ||
      pessoa.fantasia ||
      pessoa.enti_cnpj ||
      pessoa.cnpj ||
      pessoa.enti_cpf ||
      pessoa.cpf ||
      pessoa.enti_email ||
      pessoa.email ||
      ''
    )
  }

  const obterDocumentoPessoa = (pessoa) => {
    if (!pessoa || typeof pessoa !== 'object') return ''
    return (
      pessoa.enti_cnpj ||
      pessoa.cnpj ||
      pessoa.enti_cpf ||
      pessoa.cpf ||
      pessoa.documento ||
      ''
    )
  }

  const obterStatus = (obj) => obj?.status_nfe ?? obj?.status
  const obterNumero = (obj) =>
    obj?.numero_nota_fiscal ?? obj?.numero ?? obj?.numero_completo

  useEffect(() => {
    carregarDetalhes()
  }, [])

  const carregarDetalhes = async () => {
    try {
      setLoading(true)
      const idDireto = notaFiscal?.id
      if (idDireto != null) {
        const response =
          await notasFiscaisService.buscarNotaFiscalPorPk(idDireto)
        setDetalhes(response)
        return
      }

      // Extrair apenas o número da nota (remover prefixos como "002-")
      let numeroNota = notaFiscal.numero_nota_fiscal ?? notaFiscal.numero

      if (!numeroNota && notaFiscal.numero_completo) {
        // Extrair número do formato "002-10" -> "10"
        const match = notaFiscal.numero_completo.match(/\d+-(\d+)/)
        numeroNota = match ? match[1] : notaFiscal.numero_completo
      }
      console.log('🔍 Carregando detalhes com:', {
        empresa: notaFiscal.empresa,
        filial: notaFiscal.filial,
        numero: numeroNota,
      })

      const response = await notasFiscaisService.buscarNotaFiscalPorId(
        notaFiscal.empresa,
        notaFiscal.filial,
        numeroNota,
      )

      if (response?.id != null && !Array.isArray(response?.itens)) {
        const detalhado = await notasFiscaisService.buscarNotaFiscalPorPk(
          response.id,
        )
        setDetalhes(detalhado)
        return
      }
      setDetalhes(response)
    } catch (error) {
      console.error('❌ Erro ao carregar detalhes:', error.message)
      Alert.alert('Erro', 'Falha ao carregar detalhes da nota fiscal')
    } finally {
      setLoading(false)
    }
  }

  const visualizarXml = async () => {
    try {
      console.log('🔍 Dados da nota para XML:', {
        empresa: notaFiscal.empresa,
        filial: notaFiscal.filial,
        numero: notaFiscal.numero_nota_fiscal ?? notaFiscal.numero,
        numero_completo: notaFiscal.numero_completo,
        notaFiscal: notaFiscal,
      })

      setLoadingXml(true)

      // Extrair apenas o número da nota (remover prefixos como "002-")
      let numeroNota = notaFiscal.numero_nota_fiscal ?? notaFiscal.numero

      if (!numeroNota && notaFiscal.numero_completo) {
        // Extrair número do formato "002-10" -> "10"
        const match = notaFiscal.numero_completo.match(/\d+-(\d+)/)
        numeroNota = match ? parseInt(match[1]) : notaFiscal.numero_completo
      }

      if (!numeroNota) {
        throw new Error('Número da nota fiscal não encontrado')
      }

      const xmlData = await notasFiscaisService.buscarXmlNotaFiscal(
        notaFiscal.empresa,
        notaFiscal.filial,
        numeroNota,
      )

      navigation.navigate('NotaFiscalXml', {
        xmlData,
        notaFiscal: detalhes || notaFiscal,
      })
    } catch (error) {
      console.error('❌ Erro ao buscar XML:', error.message)
      Alert.alert('Erro', 'Erro ao carregar XML da nota fiscal')
    } finally {
      setLoadingXml(false)
    }
  }

  const compartilharNota = async () => {
    try {
      const message = `
Nota Fiscal Eletrônica
Número: ${obterNumero(detalhes) || obterNumero(notaFiscal) || '-'}
Empresa/Filial: ${detalhes?.empresa || notaFiscal.empresa}/${detalhes?.filial || notaFiscal.filial}
Data Emissão: ${notasFiscaisUtils.formatarData(detalhes?.data_emissao || notaFiscal.data_emissao)}
Valor Total: ${notasFiscaisUtils.formatarMoeda(detalhes?.valor_total || notaFiscal.valor_total)}
Status: ${notasFiscaisUtils.obterDescricaoStatus(obterStatus(detalhes) || obterStatus(notaFiscal))}
      `.trim()

      await Share.share({
        message,
        title: 'Nota Fiscal Eletrônica',
      })
    } catch (error) {
      console.error('❌ Erro ao compartilhar:', error.message)
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#345686" />
        <Text style={styles.loadingText}>Carregando detalhes...</Text>
      </View>
    )
  }

  const dados = detalhes || notaFiscal
  const itens = Array.isArray(dados?.itens)
    ? dados.itens
    : Array.isArray(dados?.items)
      ? dados.items
      : []

  const normalizarNumero = (v) => {
    if (v == null) return 0
    const s = String(v).trim()
    if (!s) return 0
    const n = Number(s.replace(',', '.'))
    return Number.isFinite(n) ? n : 0
  }

  const sum = (arr) => arr.reduce((acc, v) => acc + v, 0)

  const totaisItens = (() => {
    const linhas = itens || []
    const produtos = sum(
      linhas.map((it) => {
        const qtd = normalizarNumero(it?.quantidade)
        const unit = normalizarNumero(it?.unitario)
        return qtd * unit
      }),
    )
    const desconto = sum(linhas.map((it) => normalizarNumero(it?.desconto)))
    const tributos = sum(
      linhas.map((it) => {
        const impostos = it?.impostos
        if (impostos == null) return 0
        return (
          normalizarNumero(impostos.icms_valor) +
          normalizarNumero(impostos.ipi_valor) +
          normalizarNumero(impostos.pis_valor) +
          normalizarNumero(impostos.cofins_valor) +
          normalizarNumero(impostos.fcp_valor) +
          normalizarNumero(impostos.ibs_valor) +
          normalizarNumero(impostos.cbs_valor)
        )
      }),
    )
    const total = produtos - desconto + tributos
    return { produtos, desconto, tributos, total }
  })()

  const valorProdutosExibir =
    normalizarNumero(dados?.valor_produtos) > 0
      ? dados.valor_produtos
      : totaisItens.produtos

  const valorTotalExibir =
    normalizarNumero(dados?.valor_total) > 0
      ? dados.valor_total
      : totaisItens.total

  const textoProduto = (it) => {
    const id = it?.produto != null ? String(it.produto) : ''
    const nome =
      it?.produto_nome != null
        ? String(it.produto_nome)
        : it?.prod_nome != null
          ? String(it.prod_nome)
          : it?.descricao != null
            ? String(it.descricao)
            : ''
    const parts = [id, nome].filter((p) => String(p).trim().length > 0)
    return parts.join(' - ')
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header com Status */}
      <View style={styles.headerContainer}>
        <View style={styles.headerInfo}>
          <Text style={styles.numeroNota}>
            NF-e: {obterNumero(dados) || '-'}
          </Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: notasFiscaisUtils.obterCorStatus(
                  obterStatus(dados),
                ),
              },
            ]}>
            <Text style={styles.statusText}>
              {notasFiscaisUtils.obterDescricaoStatus(obterStatus(dados))}
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={compartilharNota}>
            <Text style={styles.actionButtonText}>Compartilhar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.xmlButton]}
            onPress={visualizarXml}
            disabled={loadingXml}>
            <Text style={styles.actionButtonText}>
              {loadingXml ? 'Carregando...' : 'Ver XML'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Informações Gerais */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações Gerais</Text>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.label}>Empresa</Text>
            <Text style={styles.value}>{dados.empresa}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.label}>Filial</Text>
            <Text style={styles.value}>{dados.filial}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.label}>Série</Text>
            <Text style={styles.value}>{dados.serie || '-'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.label}>Modelo</Text>
            <Text style={styles.value}>{dados.modelo || '55'}</Text>
          </View>
        </View>
      </View>

      {/* Datas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Datas</Text>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.label}>Data Emissão</Text>
            <Text style={styles.value}>
              {notasFiscaisUtils.formatarData(dados.data_emissao)}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.label}>Data Saída</Text>
            <Text style={styles.value}>
              {notasFiscaisUtils.formatarData(dados.data_saida)}
            </Text>
          </View>

          {dados.data_autorizacao && (
            <View style={styles.infoItem}>
              <Text style={styles.label}>Data Autorização</Text>
              <Text style={styles.value}>
                {notasFiscaisUtils.formatarDataHora(dados.data_autorizacao)}
              </Text>
            </View>
          )}

          {dados.data_cancelamento && (
            <View style={styles.infoItem}>
              <Text style={styles.label}>Data Cancelamento</Text>
              <Text style={styles.value}>
                {notasFiscaisUtils.formatarDataHora(dados.data_cancelamento)}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Destinatário */}
      {formatarPessoa(dados.destinatario) ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Destinatário</Text>

          <View style={styles.destinatarioContainer}>
            <Text style={styles.destinatarioNome}>
              {formatarPessoa(dados.destinatario)}
            </Text>

            {(dados.destinatario_documento ||
              obterDocumentoPessoa(dados.destinatario)) && (
              <Text style={styles.destinatarioDoc}>
                {dados.destinatario_documento ||
                  obterDocumentoPessoa(dados.destinatario)}
              </Text>
            )}

            {dados.destinatario_endereco && (
              <Text style={styles.destinatarioEndereco}>
                {dados.destinatario_endereco}
              </Text>
            )}
          </View>
        </View>
      ) : null}

      {/* Valores */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Valores</Text>

        <View style={styles.valoresContainer}>
          <View style={styles.valorItem}>
            <Text style={styles.valorLabel}>Valor dos Produtos</Text>
            <Text style={styles.valorValue}>
              {notasFiscaisUtils.formatarMoeda(valorProdutosExibir)}
            </Text>
          </View>

          {dados.valor_desconto > 0 && (
            <View style={styles.valorItem}>
              <Text style={styles.valorLabel}>Desconto</Text>
              <Text style={[styles.valorValue, styles.valorDesconto]}>
                -{notasFiscaisUtils.formatarMoeda(dados.valor_desconto)}
              </Text>
            </View>
          )}

          {dados.valor_frete > 0 && (
            <View style={styles.valorItem}>
              <Text style={styles.valorLabel}>Frete</Text>
              <Text style={styles.valorValue}>
                {notasFiscaisUtils.formatarMoeda(dados.valor_frete)}
              </Text>
            </View>
          )}

          {dados.valor_seguro > 0 && (
            <View style={styles.valorItem}>
              <Text style={styles.valorLabel}>Seguro</Text>
              <Text style={styles.valorValue}>
                {notasFiscaisUtils.formatarMoeda(dados.valor_seguro)}
              </Text>
            </View>
          )}

          {dados.valor_outras_despesas > 0 && (
            <View style={styles.valorItem}>
              <Text style={styles.valorLabel}>Outras Despesas</Text>
              <Text style={styles.valorValue}>
                {notasFiscaisUtils.formatarMoeda(dados.valor_outras_despesas)}
              </Text>
            </View>
          )}

          <View style={[styles.valorItem, styles.valorTotal]}>
            <Text style={styles.valorTotalLabel}>Valor Total</Text>
            <Text style={styles.valorTotalValue}>
              {notasFiscaisUtils.formatarMoeda(valorTotalExibir)}
            </Text>
          </View>
        </View>
      </View>

      {itens.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Itens</Text>
          <View style={styles.itensContainer}>
            {itens.map((it, idx) => {
              const qtd = normalizarNumero(it?.quantidade)
              const unit = normalizarNumero(it?.unitario)
              const desc = normalizarNumero(it?.desconto)
              const total = Math.max(0, qtd * unit - desc)
              const titulo = textoProduto(it) || `Item ${idx + 1}`

              return (
                <View key={`${idx}-${titulo}`} style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle} numberOfLines={2}>
                      {titulo}
                    </Text>
                    <Text style={styles.itemTotal}>
                      {notasFiscaisUtils.formatarMoeda(total)}
                    </Text>
                  </View>

                  <Text style={styles.itemSub}>
                    Qtd: {String(it?.quantidade ?? '')} | Unit:{' '}
                    {String(it?.unitario ?? '')} | Desc:{' '}
                    {String(it?.desconto ?? '')}
                  </Text>

                  <View style={styles.itemMetaRow}>
                    {it?.cfop ? (
                      <View style={styles.metaChip}>
                        <Text style={styles.metaChipText}>
                          CFOP: {String(it.cfop)}
                        </Text>
                      </View>
                    ) : null}
                    {it?.ncm ? (
                      <View style={styles.metaChip}>
                        <Text style={styles.metaChipText}>
                          NCM: {String(it.ncm)}
                        </Text>
                      </View>
                    ) : null}
                    {it?.cst_icms ? (
                      <View style={styles.metaChip}>
                        <Text style={styles.metaChipText}>
                          CST ICMS: {String(it.cst_icms)}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              )
            })}
          </View>
        </View>
      ) : null}

      {/* Impostos */}
      {(dados.valor_icms ||
        dados.valor_ipi ||
        dados.valor_pis ||
        dados.valor_cofins) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Impostos</Text>

          <View style={styles.impostosContainer}>
            {dados.valor_icms > 0 && (
              <View style={styles.impostoItem}>
                <Text style={styles.impostoLabel}>ICMS</Text>
                <Text style={styles.impostoValue}>
                  {notasFiscaisUtils.formatarMoeda(dados.valor_icms)}
                </Text>
              </View>
            )}

            {dados.valor_ipi > 0 && (
              <View style={styles.impostoItem}>
                <Text style={styles.impostoLabel}>IPI</Text>
                <Text style={styles.impostoValue}>
                  {notasFiscaisUtils.formatarMoeda(dados.valor_ipi)}
                </Text>
              </View>
            )}

            {dados.valor_pis > 0 && (
              <View style={styles.impostoItem}>
                <Text style={styles.impostoLabel}>PIS</Text>
                <Text style={styles.impostoValue}>
                  {notasFiscaisUtils.formatarMoeda(dados.valor_pis)}
                </Text>
              </View>
            )}

            {dados.valor_cofins > 0 && (
              <View style={styles.impostoItem}>
                <Text style={styles.impostoLabel}>COFINS</Text>
                <Text style={styles.impostoValue}>
                  {notasFiscaisUtils.formatarMoeda(dados.valor_cofins)}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Observações */}
      {dados.observacoes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Observações</Text>
          <Text style={styles.observacoes}>{dados.observacoes}</Text>
        </View>
      )}

      {/* Chave de Acesso */}
      {dados.chave_acesso && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chave de Acesso</Text>
          <Text style={styles.chaveAcesso} selectable>
            {dados.chave_acesso}
          </Text>
        </View>
      )}

      {/* Botões de Ação */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            navigation.navigate('NotaFiscalForm', { notaFiscal: dados })
          }>
          <Text style={styles.editButtonText}>Editar Nota Fiscal</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}
