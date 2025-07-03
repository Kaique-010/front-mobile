import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  Linking,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import Toast from 'react-native-toast-message'

import {
  apiPostComContexto,
  apiGetComContexto,
  apiPutComContexto,
} from '../utils/api'
import { getStoredData } from '../services/storageService'
import RecebimentoModal from './RecebimentoModal'

export default function ResumoPedido({ total, pedido }) {
  const [slug, setSlug] = useState('')
  const [modalRecebimentoVisivel, setModalRecebimentoVisivel] = useState(false)
  const navigation = useNavigation()

  useEffect(() => {
    const carregarSlug = async () => {
      try {
        const { slug } = await getStoredData()
        if (slug) setSlug(slug)
      } catch (err) {
        console.error('Erro ao carregar slug:', err.message)
      }
    }
    carregarSlug()
  }, [])

  const totalFormatado = Number(total) || 0

  const enviarZap = async () => {
    try {
      if (!pedido.pedi_forn) {
        Alert.alert('Erro', 'Cliente tem celular definido?.')
        return
      }
      const entidade = await apiGetComContexto(
        `entidades/entidades/${pedido.pedi_forn}/`
      )
      const numeroPedido = pedido.pedi_nume
      const numeroRaw = entidade.enti_celu || entidade.enti_fone || ''
      const numeroLimpo = numeroRaw.replace(/\D/g, '')
      if (numeroLimpo.length < 10) {
        Alert.alert(
          'Sem WhatsApp',
          'Essa entidade não possui número válido de WhatsApp.'
        )
        return
      }

      const numeroZap = `55${numeroLimpo}`
      const nomeCliente = entidade.enti_nome || 'Cliente'

      const corpo = (pedido.itens || [])
        .map((item, idx) => {
          const nome = item.produto_nome || 'Sem nome'
          const codigo = item.iped_prod || 'N/A'
          const qtd = Number(item.iped_quan || 0).toFixed(2)
          const valor = Number(item.iped_unit || 0).toFixed(2)
          return `${
            idx + 1
          }. ${nome} (Cód: ${codigo}) - Qtde: ${qtd} - R$ ${valor}`
        })
        .join('\n')

      const texto = `Novo pedido:  ${numeroPedido}!\nCliente: ${nomeCliente}\n\nItens:\n${corpo}\n\nTotal: R$ ${totalFormatado.toFixed(
        2
      )}`

      const url = `https://wa.me/${numeroZap}?text=${encodeURIComponent(texto)}`
      Linking.openURL(url)
    } catch (err) {
      console.error('❌ Erro ao enviar Zap:', err)
      Alert.alert('Erro', 'Falha ao consultar os dados da entidade.')
    }
  }

  const salvar = async () => {
    if (!pedido.pedi_empr || !pedido.pedi_fili) {
      Alert.alert(
        'Erro',
        'Empresa e filial precisam estar definidas antes de salvar.'
      )
      return
    }

    try {
      let data
      if (pedido.pedi_nume) {
        data = await apiPutComContexto(
          `pedidos/pedidos/${pedido.pedi_nume}/`,
          pedido
        )
      } else {
        data = await apiPostComContexto(`pedidos/pedidos/`, pedido)
      }

      const pedi_nume = data.pedi_nume || 'desconhecido'

      Toast.show({
        type: 'success',
        text1: `Pedido #${pedi_nume} salvo com sucesso!`,
        position: 'bottom',
        visibilityTime: 3000,
      })

      navigation.navigate('MainApp', { screen: 'Pedidos' })
    } catch (error) {
      console.error('Erro ao salvar pedido:', error)
      Alert.alert('Erro', 'Falha ao salvar o pedido.')
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.total}>Total: R$ {totalFormatado.toFixed(2)}</Text>

      <View style={styles.botoesContainer}>
        <TouchableOpacity
          style={[
            styles.botao,
            styles.botaoSalvar,
            (!pedido.pedi_empr || !pedido.pedi_fili) && { opacity: 0.5 },
          ]}
          onPress={salvar}
          disabled={!pedido.pedi_empr || !pedido.pedi_fili}>
          <Text style={styles.textobotao}>Salvar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.botao, styles.botaoZap]}
          onPress={enviarZap}>
          <Text style={styles.textobotao}>
            <MaterialCommunityIcons name="whatsapp" size={16} color="#fff" />{' '}
            Enviar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.botao,
            styles.botaoReceber,
            !pedido.pedi_nume && { opacity: 0.5 },
          ]}
          onPress={() => setModalRecebimentoVisivel(true)}
          disabled={!pedido.pedi_nume}>
          <Text style={styles.textobotao}>💳 Receber</Text>
        </TouchableOpacity>
      </View>

      <RecebimentoModal
        visivel={modalRecebimentoVisivel}
        onFechar={() => setModalRecebimentoVisivel(false)}
        pedido={pedido}
        totalPedido={totalFormatado}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#161c23',
  },
  total: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#58D58D',
    textAlign: 'right',
    marginBottom: 15,
  },
  botoesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 10,
  },
  botao: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  botaoSalvar: {
    backgroundColor: '#109ea3',
  },
  botaoZap: {
    backgroundColor: '#25D366',
  },
  botaoReceber: {
    backgroundColor: '#6A4C93',
  },
  textobotao: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
})
