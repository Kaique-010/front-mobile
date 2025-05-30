import React, { useState, useEffect } from 'react'
import Icon from 'react-native-vector-icons/Feather'
import { View, Text, TextInput, Button } from 'react-native'
import styles from '../styles/caixaStyle'
import Toast from 'react-native-toast-message'
import AsyncStorage from '@react-native-async-storage/async-storage'
import BuscaCaixa from '../components/BuscaCaixaInput'
import { apiPostComContexto, apiGetComContexto } from '../utils/api'

export default function CaixaGeralScreen({ route, navigation }) {
  const [caixa, setCaixa] = useState({
    caix_empr: null,
    caix_fili: null,
    caix_caix: '',
    caix_data: new Date().toISOString().slice(0, 10),
    caix_aber: 'A',
    caix_oper: null,
    caix_valo: 0,
    caix_orig: '',
  })

  const [caixaAberto, setCaixaAberto] = useState(false)
  const [contexto, setContexto] = useState(null)

  const carregarContexto = async () => {
    try {
      const [usuarioRaw, empresaId, filialId] = await Promise.all([
        AsyncStorage.getItem('usuario'),
        AsyncStorage.getItem('empresaId'),
        AsyncStorage.getItem('filialId'),
      ])

      const usuarioObj = usuarioRaw ? JSON.parse(usuarioRaw) : null
      const usuarioId = usuarioObj?.usuario_id ?? null

      const novoContexto = {
        caix_oper: Number(usuarioId),
        caix_empr: Number(empresaId),
        caix_fili: Number(filialId),
      }

      setContexto(novoContexto)
      return novoContexto
    } catch (error) {
      console.error('Erro ao carregar contexto:', error)
    }
  }

  const checarCaixaAberto = async () => {
    const ctx = await carregarContexto()
    if (!ctx) return

    try {
      const response = await apiGetComContexto(
        `caixadiario/caixageral/?caix_empr=${ctx.caix_empr}&caix_fili=${ctx.caix_fili}&caix_oper=${ctx.caix_oper}&caix_aber=A`
      )
      console.log('Resposta da API caixa aberto:', response)

      if (response && response.results && response.results.length > 0) {
        const caixaAbertoData = response.results[0]
        setCaixaAberto(true)
        setCaixa((prev) => ({ ...prev, ...caixaAbertoData }))
        navigation.navigate('MoviCaixa', { caixa: caixaAbertoData })
      }
    } catch (err) {
      console.error('Erro ao verificar caixa aberto:', err)
    }
  }

  useEffect(() => {
    checarCaixaAberto()
  }, [])

  const abrirCaixa = async () => {
    try {
      const payload = { ...caixa, ...contexto }
      await apiPostComContexto('caixadiario/caixageral/', payload)
      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Caixa aberto!',
      })
      setCaixaAberto(true)
      setCaixa(payload)
      navigation.navigate('MoviCaixa', { caixa: payload })
    } catch (e) {
      console.error('Erro ao abrir caixa:', e)
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: e.message || 'Falha na comunicação',
      })
    }
  }

  const irParaMovimentacao = () => {
    navigation.navigate('MoviCaixa', { caixa })
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>
        <Icon
          name="dollar-sign"
          style={{ fontSize: 50, color: '#00cc66', marginVertical: 25 }}
        />
        Caixa Diário
      </Text>

      <Text style={styles.label}>Caixa:</Text>
      <BuscaCaixa
        onSelect={(item) => {
          if (!item?.id) return
          setCaixa((prev) => ({ ...prev, caix_caix: Number(item.id) }))
        }}
        value={String(caixa.caix_caix)}
        style={styles.inputcaixa}
      />

      <Text style={styles.label}>Origem:</Text>
      <BuscaCaixa
        onSelect={(item) => {
          if (!item?.id) return
          setCaixa((prev) => ({ ...prev, caix_orig: Number(item.id) }))
        }}
        value={String(caixa.caix_orig)}
        style={styles.inputcaixa}
      />

      <Text style={styles.label}>Data de Abertura:</Text>
      <Text style={styles.input}>{caixa.caix_data}</Text>

      <Text style={styles.label}>Valor Inicial:</Text>
      <TextInput
        keyboardType="numeric"
        onChangeText={(val) =>
          setCaixa((prev) => ({ ...prev, caix_valo: Number(val) }))
        }
        value={String(caixa.caix_valo)}
        style={styles.inputvalo}
        editable={!caixaAberto}
      />

      <Button title="Abrir Caixa" onPress={abrirCaixa} disabled={caixaAberto} />

      {caixaAberto && (
        <Button title="Ir para Movimentação" onPress={irParaMovimentacao} />
      )}
    </View>
  )
}
