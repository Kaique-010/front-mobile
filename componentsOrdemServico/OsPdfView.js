import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import * as Print from 'expo-print'
import { apiGetComContexto } from '../utils/api'

export default function OsPdfView({ route, navigation }) {
  const { os_os, os_empr, os_fili } = route.params || {}
  const [os, setOs] = useState(null)
  const [horas, setHoras] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const osDet = await apiGetComContexto(`Os/ordens/${os_os}/`)
        setOs(osDet)
        const horasList = await apiGetComContexto('Os/os-hora/', {
          os_hora_os: String(os_os),
          os_hora_empr: Number(os_empr),
          os_hora_fili: Number(os_fili),
        })
        const arr = Array.isArray(horasList?.results)
          ? horasList.results
          : Array.isArray(horasList)
          ? horasList
          : []
        setHoras(arr)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [os_os, os_empr, os_fili])

  const makeHtml = () => {
    const cliente = os?.cliente_nome || ''
    const local = os?.os_loca_apli || ''
    const placa = os?.os_plac || ''
    const totalPecas = os?.total_pecas || 0
    const totalServ = os?.total_servicos || 0
    const total = (Number(totalPecas) + Number(totalServ)).toFixed(2)
    const signClie = os?.os_assi_clie
      ? `data:image/png;base64,${os.os_assi_clie}`
      : null
    const signOper = os?.os_assi_oper
      ? `data:image/png;base64,${os.os_assi_oper}`
      : null

    const rows = horas
      .map(
        (h) => `
      <tr>
        <td>${h.os_hora_data || ''}</td>
        <td>${h.os_hora_manh_ini || ''}</td>
        <td>${h.os_hora_manh_fim || ''}</td>
        <td>${h.os_hora_tard_ini || ''}</td>
        <td>${h.os_hora_tard_fim || ''}</td>
        <td>${h.os_hora_km_sai ?? ''}</td>
        <td>${h.os_hora_km_che ?? ''}</td>
      </tr>
    `
      )
      .join('')

    return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; font-size: 12px; color: #000; }
          .title { font-size: 16px; font-weight: bold; margin-bottom: 8px; }
          .section { margin-bottom: 10px; }
          .row { display: flex; justify-content: space-between; margin: 4px 0; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #999; padding: 4px; text-align: center; }
          .signs { display: flex; justify-content: space-between; margin-top: 12px; }
          .sign { width: 48%; height: 100px; border: 1px solid #999; display:flex; align-items:center; justify-content:center; }
          .totals { margin-top: 8px; }
        </style>
      </head>
      <body>
        <div class="title">Ordem de Serviço Nº ${os_os}</div>
        <div class="section">
          <div class="row"><div>Cliente: <strong>${cliente}</strong></div><div>Placa: <strong>${placa}</strong></div></div>
          <div class="row"><div>Local de Trabalho: <strong>${local}</strong></div><div>Data Abertura: <strong>${
      os?.os_data_aber || ''
    }</strong></div></div>
        </div>
        <div class="section">
          <div style="font-weight:bold;margin-bottom:6px">Horas (Manhã/Tarde e KM)</div>
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Manhã Início</th>
                <th>Manhã Fim</th>
                <th>Tarde Início</th>
                <th>Tarde Fim</th>
                <th>KM Saída</th>
                <th>KM Chegada</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>
        <div class="section totals">
          <div class="row"><div>Total Peças: <strong>R$ ${Number(
            totalPecas
          ).toFixed(2)}</strong></div><div>Total Serviços: <strong>R$ ${Number(
      totalServ
    ).toFixed(2)}</strong></div></div>
          <div class="row"><div style="font-weight:bold">TOTAL: R$ ${total}</div><div>Status: <strong>${
      os?.os_stat_os ?? ''
    }</strong></div></div>
        </div>
        <div class="section signs">
          <div class="sign">${
            signClie
              ? `<img src="${signClie}" style="max-width:100%; max-height:100%"/>`
              : 'Assinatura Cliente'
          }</div>
          <div class="sign">${
            signOper
              ? `<img src="${signOper}" style="max-width:100%; max-height:100%"/>`
              : 'Assinatura Operador'
          }</div>
        </div>
      </body>
    </html>`
  }

  const imprimir = async () => {
    const html = makeHtml()
    await Print.printAsync({ html })
  }
  const gerarPdf = async () => {
    const html = makeHtml()
    const file = await Print.printToFileAsync({ html })
    alert(`PDF gerado: ${file.uri}`)
  }

  if (loading)
    return (
      <View style={styles.center}>
        <Text style={{ color: '#fff' }}>Preparando documento...</Text>
      </View>
    )

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>Gerar PDF da O.S. #{os_os}</Text>
      <TouchableOpacity style={styles.button} onPress={imprimir}>
        <Text style={styles.buttonText}>Imprimir</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={gerarPdf}>
        <Text style={styles.buttonText}>Gerar PDF</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Voltar</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a2f3d' },
  title: {
    color: '#10a2a7',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#10a2a7',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 6,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  center: {
    flex: 1,
    backgroundColor: '#1a2f3d',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
