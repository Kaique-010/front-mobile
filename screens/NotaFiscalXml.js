import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
  Clipboard,
  Linking,
} from 'react-native'
import styles from '../styles/notaFiscalXmlStyles'
import { notasFiscaisService } from '../componentsNotasFiscais/notasFiscaisService'

export default function NotaFiscalXml({ route, navigation }) {
  const { xmlData, notaFiscal } = route.params

  // Extrair o XML do objeto retornado pela API
  let xmlContent = ''
  if (typeof xmlData === 'object' && xmlData.xml_nfe) {
    xmlContent = xmlData.xml_nfe
  } else if (typeof xmlData === 'string') {
    xmlContent = xmlData
  } else {
    xmlContent = 'XML não disponível'
  }

  const [xmlFormatted, setXmlFormatted] = useState(xmlContent)
  const [loadingDanfe, setLoadingDanfe] = useState(false)

  const copiarXml = async () => {
    try {
      await Clipboard.setString(xmlFormatted)
      Alert.alert('Sucesso', 'XML copiado para a área de transferência')
    } catch (error) {
      Alert.alert('Erro', 'Falha ao copiar XML')
    }
  }

  const compartilharXml = async () => {
    try {
      await Share.share({
        message: xmlFormatted,
        title: `XML NF-e ${notaFiscal.numero}`,
      })
    } catch (error) {
      console.error('❌ Erro ao compartilhar XML:', error.message)
    }
  }

  const visualizarDanfe = async () => {
    try {
      setLoadingDanfe(true)

      // Extrair número da nota
      let numeroNota = notaFiscal.numero
      if (!numeroNota && notaFiscal.numero_completo) {
        const match = notaFiscal.numero_completo.match(/\d+-(\d+)/)
        numeroNota = match ? parseInt(match[1]) : notaFiscal.numero_completo
      }

      const pdfUrl = await notasFiscaisService.buscarDanfeNotaFiscal(
        notaFiscal.empresa,
        notaFiscal.filial,
        numeroNota,
      )

      // Abrir PDF no navegador
      await Linking.openURL(pdfUrl)
    } catch (error) {
      console.error('❌ Erro ao buscar DANFE:', error.message)
      Alert.alert('Erro', 'Erro ao carregar DANFE da nota fiscal')
    } finally {
      setLoadingDanfe(false)
    }
  }

  const formatarXml = (xml) => {
    if (!xml) return 'XML não disponível'

    // Formatação básica do XML para melhor legibilidade
    try {
      return xml
        .replace(/></g, '>\n<')
        .replace(/^\s*\n/gm, '')
        .split('\n')
        .map((line, index) => {
          const depth = line.match(/^\s*/)[0].length / 2 || 0
          const indent = '  '.repeat(depth)
          return `${indent}${line.trim()}`
        })
        .join('\n')
    } catch (error) {
      return xml
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>XML da NF-e</Text>
          <Text style={styles.subtitle}>
            Número: {notaFiscal.numero} | Empresa: {notaFiscal.empresa}
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton} onPress={copiarXml}>
            <Text style={styles.actionButtonText}>Copiar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.shareButton]}
            onPress={compartilharXml}>
            <Text style={styles.actionButtonText}>Compartilhar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.danfeButton]}
            onPress={visualizarDanfe}
            disabled={loadingDanfe}>
            <Text style={styles.actionButtonText}>
              {loadingDanfe ? 'Carregando...' : 'Ver DANFE'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Conteúdo XML */}
      <ScrollView
        style={styles.xmlContainer}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}>
        <View style={styles.xmlContent}>
          <Text style={styles.xmlText} selectable>
            {formatarXml(xmlFormatted)}
          </Text>
        </View>
      </ScrollView>

      {/* Informações Adicionais */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          💡 Toque e segure no texto para selecionar e copiar partes específicas
        </Text>
      </View>
    </View>
  )
}
