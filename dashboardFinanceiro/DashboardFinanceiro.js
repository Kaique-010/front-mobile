import React, { useEffect, useState, useMemo } from 'react'

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Pressable,
  TextInput,
} from 'react-native'
import { AnimatePresence, MotiView } from 'moti'
import DateTimePicker from '@react-native-community/datetimepicker'
import { apiGetComContexto } from '../utils/api'
import styles from '../styles/FinanceiroStyles'
import { useNavigation } from '@react-navigation/native'

export default function DashboardFinanceiro() {
  const [dataIni, setDataIni] = useState(new Date('2025-01-01'))
  const [dataFim, setDataFim] = useState(new Date('2025-06-30'))
  const [saldoInicial, setSaldoInicial] = useState('0.00')
  const [dados, setDados] = useState(null)
  const navigation = useNavigation()

  const [showIni, setShowIni] = useState(false)
  const [showFim, setShowFim] = useState(false)

  const [mesesExpandido, setMesesExpandido] = useState({})

  const formatDate = (date) => date.toISOString().split('T')[0]

  const buscarDados = async () => {
    try {
      const res = await apiGetComContexto(`dashboards/financeiro/`, {
        data_ini: formatDate(dataIni),
        data_fim: formatDate(dataFim),
        saldo_inicial: saldoInicial,
      })
      setDados(res)
    } catch (error) {
      console.error('Erro ao buscar dashboard:', error)
      // Adicionar tratamento visual do erro
      Alert.alert(
        'Erro',
        'Falha ao carregar dados financeiros. Tente novamente.',
        [{ text: 'OK' }]
      )
      // Definir estado de erro para mostrar na UI
      setDados({ error: true })
    }
  }

  useEffect(() => {
    buscarDados()
  }, [])

  const toggleMes = (mes) => {
    setMesesExpandido((prev) => ({
      ...prev,
      [mes]: !prev[mes],
    }))
  }

  const reduzirNome = (nome, limite = 25) =>
    nome.length > limite ? nome.slice(0, limite - 3) + '...' : nome

  const icone = (tipo) => (tipo === 'recebido' ? '📥' : '📤')
  const corTexto = (tipo) => (tipo === 'recebido' ? 'green' : 'red')

  const agruparPorMes = (lista) => {
    return lista.reduce((acc, item) => {
      if (!acc[item.mes]) acc[item.mes] = []
      acc[item.mes].push(item)
      return acc
    }, {})
  }
  const recebimentos = useMemo(
    () => agruparPorMes(dados?.recebimentos || []),
    [dados]
  )
  const pagamentos = useMemo(
    () => agruparPorMes(dados?.pagamentos || []),
    [dados]
  )

  const meses = useMemo(() => {
    return [
      ...new Set([...Object.keys(recebimentos), ...Object.keys(pagamentos)]),
    ].sort()
  }, [recebimentos, pagamentos])

  const totaisPorMes = useMemo(() => {
    const totais = {}
    meses.forEach((mes) => {
      const totalRec = (recebimentos[mes] || []).reduce(
        (acc, i) => acc + Number(i.valor),
        0
      )
      const totalPag = (pagamentos[mes] || []).reduce(
        (acc, i) => acc + Number(i.valor),
        0
      )
      totais[mes] = {
        recebido: totalRec,
        pago: totalPag,
        saldo: totalRec - totalPag,
      }
    })
    return totais
  }, [meses, recebimentos, pagamentos])

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(valor) || 0)
  }

  if (!dados) return <Text style={styles.loading}>Carregando...</Text>

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Filtros */}
      <View style={styles.filtros}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>📅 Data Inicial</Text>
          <Pressable onPress={() => setShowIni(true)} style={styles.input}>
            <Text>{formatDate(dataIni)}</Text>
          </Pressable>
          {showIni && (
            <DateTimePicker
              value={dataIni}
              mode="date"
              display="default"
              onChange={(e, date) => {
                setShowIni(false)
                if (date) setDataIni(date)
              }}
            />
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>📅 Data Final</Text>
          <Pressable onPress={() => setShowFim(true)} style={styles.input}>
            <Text>{formatDate(dataFim)}</Text>
          </Pressable>
          {showFim && (
            <DateTimePicker
              value={dataFim}
              mode="date"
              display="default"
              onChange={(e, date) => {
                setShowFim(false)
                if (date) setDataFim(date)
              }}
            />
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>💰 Saldo Inicial</Text>
          <TextInput
            style={styles.input}
            value={saldoInicial}
            onChangeText={setSaldoInicial}
            placeholder="0.00"
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity onPress={buscarDados} style={styles.botao}>
          <Text style={styles.botaoTexto}>Atualizar</Text>
        </TouchableOpacity>
      </View>

      {/* Totais */}
      <View style={styles.cardTotais}>
        <Text style={styles.titulo}>📊 Resumo Financeiro</Text>

        <View style={styles.linhaTotais}>
          <Text>💰 Saldo Inicial:</Text>
          <Text style={{ fontWeight: 'bold' }}>
            {formatarMoeda(saldoInicial)}
          </Text>
        </View>

        <View style={styles.linhaTotais}>
          <Text>📥 Recebido:</Text>
          <Text style={styles.recebido}>
            {formatarMoeda(dados.totais.total_recebido)}
          </Text>
        </View>

        <View style={styles.linhaTotais}>
          <Text>📤 Pago:</Text>
          <Text style={styles.pago}>
            {formatarMoeda(dados.totais.total_pago)}
          </Text>
        </View>

        <View style={styles.linhaTotais}>
          <Text>📈 Saldo Final:</Text>
          <Text style={styles.saldoFinal}>
            {formatarMoeda(dados.totais.saldo_final)}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.botao, { marginTop: 8 }]}
        onPress={() =>
          navigation.navigate('DashboardFinanceiroGrafico', { totaisPorMes })
        }>
        <Text style={styles.botaoTexto}>📈 Ver Gráfico</Text>
      </TouchableOpacity>

      {/* Listas expansíveis por mês */}
      {meses.map((mes) => (
        <View key={mes} style={styles.mesContainer}>
          <TouchableOpacity
            onPress={() => toggleMes(mes)}
            style={styles.mesTitleContainer}>
            <Text style={styles.mesTitle}>{mes}</Text>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
              {mesesExpandido[mes] ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>

          <AnimatePresence>
            {mesesExpandido[mes] && (
              <MotiView
                from={{ opacity: 0, translateY: -10 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, translateY: -10 }}
                style={{ paddingTop: 4 }}>
                {(recebimentos[mes] || []).map((item, idx) => (
                  <View key={`rec-${idx}`} style={styles.itemLinha}>
                    <Text style={styles.entidade}>
                      📥 {reduzirNome(item.entidade)}
                    </Text>
                    <Text style={{ color: 'green', fontWeight: 'bold' }}>
                      + R$ {Number(item.valor).toFixed(2)}
                    </Text>
                  </View>
                ))}

                {(pagamentos[mes] || []).map((item, idx) => (
                  <View key={`pag-${idx}`} style={styles.itemLinha}>
                    <Text style={styles.entidade}>
                      📤 {reduzirNome(item.entidade)}
                    </Text>
                    <Text style={{ color: 'red', fontWeight: 'bold' }}>
                      - R$ {Number(item.valor).toFixed(2)}
                    </Text>
                  </View>
                ))}
              </MotiView>
            )}
          </AnimatePresence>
        </View>
      ))}
    </ScrollView>
  )
}
