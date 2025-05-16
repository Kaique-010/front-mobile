import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  Linking,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Toast from 'react-native-toast-message'

import { apiPostComContexto } from '../utils/api'
import { getStoredData } from '../services/storageService'

export default function ResumoPedido({ total, pedido }) {
  const [slug, setSlug] = useState('')
  const navigation = useNavigation()

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

  const enviarZap = () => {
    const nomeCliente =
      typeof pedido.pedi_forn === 'string'
        ? pedido.pedi_forn
        : pedido.pedi_forn?.nome ?? 'N/A'

    const texto = `Novo pedido!\nCliente: ${nomeCliente}\nTotal: R$ ${total.toFixed(
      2
    )}`
    const url = `https://wa.me/554299752472?text=${encodeURIComponent(texto)}`
    Linking.openURL(url)
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
      const data = await apiPostComContexto(
        `/api/${slug}/pedidos/pedidos/`,
        pedido
      )

      console.log('[DEBUG] Pedido salvo:', data)

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
      <Text style={styles.total}>Total: R$ {total.toFixed(2)}</Text>

      <View style={styles.botoesContainer}>
        <TouchableOpacity
          style={[
            styles.botao1,
            (!pedido.pedi_empr || !pedido.pedi_fili) && { opacity: 0.5 },
          ]}
          onPress={salvar}
          disabled={!pedido.pedi_empr || !pedido.pedi_fili}>
          <Text style={styles.textobotao}>Salvar Pedido</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botao2} onPress={enviarZap}>
          <Text style={styles.textobotao}>Enviar Pedido</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#233f4d',
  },
  total: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 20,
  },
  botoesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  botao1: {
    flex: 1,
    padding: 12,
    backgroundColor: '#1047a7',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
    marginBottom: 34,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  botao2: {
    flex: 1,
    padding: 12,
    backgroundColor: '#10a72c',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
    marginBottom: 34,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  textobotao: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
})
