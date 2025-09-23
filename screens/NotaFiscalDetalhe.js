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
import { notasFiscaisService, notasFiscaisUtils } from '../services/notasFiscaisService'
import styles from '../styles/notaFiscalDetalheStyles'

export default function NotaFiscalDetalhe({ route, navigation }) {
  const { notaFiscal } = route.params
  const [detalhes, setDetalhes] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingXml, setLoadingXml] = useState(false)

  useEffect(() => {
    carregarDetalhes()
  }, [])

  const carregarDetalhes = async () => {
    try {
      // Extrair apenas o número da nota (remover prefixos como "002-")
      let numeroNota = notaFiscal.numero
      
      if (!numeroNota && notaFiscal.numero_completo) {
        // Extrair número do formato "002-10" -> "10"
        const match = notaFiscal.numero_completo.match(/\d+-(\d+)/)
        numeroNota = match ? parseInt(match[1]) : notaFiscal.numero_completo
      }
      console.log('🔍 Carregando detalhes com:', {
        empresa: notaFiscal.empresa,
        filial: notaFiscal.filial,
        numero: numeroNota
      })
      
      const response = await notasFiscaisService.buscarNotaFiscalPorId(
        notaFiscal.empresa,
        notaFiscal.filial,
        numeroNota
      )
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
        numero: notaFiscal.numero,
        numero_completo: notaFiscal.numero_completo,
        notaFiscal: notaFiscal
      })
      
      setLoadingXml(true)
      
      // Extrair apenas o número da nota (remover prefixos como "002-")
      let numeroNota = notaFiscal.numero
      
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
        numeroNota
      )
      
      navigation.navigate('NotaFiscalXml', { 
        xmlData,
        notaFiscal: detalhes || notaFiscal
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
Número: ${detalhes?.numero || notaFiscal.numero}
Empresa/Filial: ${detalhes?.empresa || notaFiscal.empresa}/${detalhes?.filial || notaFiscal.filial}
Data Emissão: ${notasFiscaisUtils.formatarData(detalhes?.data_emissao || notaFiscal.data_emissao)}
Valor Total: ${notasFiscaisUtils.formatarMoeda(detalhes?.valor_total || notaFiscal.valor_total)}
Status: ${notasFiscaisUtils.obterDescricaoStatus(detalhes?.status_nfe || notaFiscal.status_nfe)}
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

  return (
    <ScrollView style={styles.container}>
      {/* Header com Status */}
      <View style={styles.headerContainer}>
        <View style={styles.headerInfo}>
          <Text style={styles.numeroNota}>NF-e: {dados.numero}</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: notasFiscaisUtils.obterCorStatus(dados.status_nfe) }
          ]}>
            <Text style={styles.statusText}>
              {notasFiscaisUtils.obterDescricaoStatus(dados.status_nfe)}
            </Text>
          </View>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={compartilharNota}
          >
            <Text style={styles.actionButtonText}>Compartilhar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.xmlButton]}
            onPress={visualizarXml}
            disabled={loadingXml}
          >
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
      {dados.destinatario && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Destinatário</Text>
          
          <View style={styles.destinatarioContainer}>
            <Text style={styles.destinatarioNome}>{dados.destinatario}</Text>
            
            {dados.destinatario_documento && (
              <Text style={styles.destinatarioDoc}>
                {dados.destinatario_documento}
              </Text>
            )}
            
            {dados.destinatario_endereco && (
              <Text style={styles.destinatarioEndereco}>
                {dados.destinatario_endereco}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Valores */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Valores</Text>
        
        <View style={styles.valoresContainer}>
          <View style={styles.valorItem}>
            <Text style={styles.valorLabel}>Valor dos Produtos</Text>
            <Text style={styles.valorValue}>
              {notasFiscaisUtils.formatarMoeda(dados.valor_produtos)}
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
              {notasFiscaisUtils.formatarMoeda(dados.valor_total)}
            </Text>
          </View>
        </View>
      </View>

      {/* Impostos */}
      {(dados.valor_icms || dados.valor_ipi || dados.valor_pis || dados.valor_cofins) && (
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
          onPress={() => navigation.navigate('NotaFiscalForm', { notaFiscal: dados })}
        >
          <Text style={styles.editButtonText}>Editar Nota Fiscal</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}