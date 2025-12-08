import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native'
import Toast from 'react-native-toast-message'
import useContextoApp from '../hooks/useContextoApp'
import { apiGetComContexto, apiPostComContexto } from '../utils/api'

export default function AbaHoras({ os_os, embedded = false }) {
  const { empresaId, filialId, usuarioId } = useContextoApp()
  const [data, setData] = useState(new Date().toISOString().split('T')[0])
  const [manhaIni, setManhaIni] = useState('')
  const [manhaFim, setManhaFim] = useState('')
  const [tardeIni, setTardeIni] = useState('')
  const [tardeFim, setTardeFim] = useState('')
  const [kmSai, setKmSai] = useState('')
  const [kmChe, setKmChe] = useState('')
  const [equipamento, setEquipamento] = useState('')
  const [observacao, setObservacao] = useState('')
  const [registros, setRegistros] = useState([])
  const [totalHoras, setTotalHoras] = useState(0)

  const fmt = (n) => String(n).padStart(2, '0')
  const agora = () => {
    const d = new Date()
    return `${fmt(d.getHours())}:${fmt(d.getMinutes())}`
  }

  const carregarRegistros = async () => {
    if (!os_os || !empresaId || !filialId) return
    try {
      const lista = await apiGetComContexto('Os/os-hora/', {
        os_hora_os: String(os_os),
        os_hora_empr: Number(empresaId),
        os_hora_fili: Number(filialId),
      })
      const arr = Array.isArray(lista?.results)
        ? lista.results
        : Array.isArray(lista)
        ? lista
        : []
      setRegistros(arr)
      const tot = await apiGetComContexto('Os/os-hora/total-horas/', {
        os_hora_os: String(os_os),
        os_hora_empr: Number(empresaId),
        os_hora_fili: Number(filialId),
      })
      setTotalHoras(tot?.total_horas || 0)
    } catch (e) {
      setRegistros([])
    }
  }

  useEffect(() => {
    carregarRegistros()
  }, [os_os, empresaId, filialId])

  const iniciarManha = () => {
    if (manhaIni) return
    const t = agora()
    setManhaIni(t)
    Toast.show({ type: 'success', text1: 'Manhã iniciada', text2: t })
  }
  const encerrarManha = () => {
    if (!manhaIni) {
      Toast.show({ type: 'error', text1: 'Inicie a manhã antes' })
      return
    }
    const t = agora()
    setManhaFim(t)
    Toast.show({ type: 'success', text1: 'Manhã encerrada', text2: t })
  }
  const iniciarTarde = () => {
    if (tardeIni) return
    const t = agora()
    setTardeIni(t)
    Toast.show({ type: 'success', text1: 'Tarde iniciada', text2: t })
  }
  const encerrarTarde = () => {
    if (!tardeIni) {
      Toast.show({ type: 'error', text1: 'Inicie a tarde antes' })
      return
    }
    const t = agora()
    setTardeFim(t)
    Toast.show({ type: 'success', text1: 'Tarde encerrada', text2: t })
  }

  const salvarDia = async () => {
    if (!os_os) {
      Toast.show({ type: 'error', text1: 'OS inválida' })
      return
    }
    try {
      const payload = {
        os_hora_empr: Number(empresaId),
        os_hora_fili: Number(filialId),
        os_hora_os: String(os_os),
        os_hora_data: data,
        os_hora_manh_ini: manhaIni || null,
        os_hora_manh_fim: manhaFim || null,
        os_hora_tard_ini: tardeIni || null,
        os_hora_tard_fim: tardeFim || null,
        os_hora_km_sai: kmSai ? Number(kmSai) : null,
        os_hora_km_che: kmChe ? Number(kmChe) : null,
        os_hora_oper: usuarioId ? Number(usuarioId) : null,
        os_hora_equi: equipamento || null,
        os_hora_obse: observacao || null,
      }
      await apiPostComContexto('Os/os-hora/', payload)
      Toast.show({ type: 'success', text1: 'Horas salvas' })
      setManhaIni('')
      setManhaFim('')
      setTardeIni('')
      setTardeFim('')
      carregarRegistros()
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Erro ao salvar horas' })
    }
  }

  const calcularPreviewTotal = () => {
    const toHours = (ini, fim) => {
      if (!ini || !fim) return 0
      const [hi, mi] = ini.split(':').map(Number)
      const [hf, mf] = fim.split(':').map(Number)
      return Math.max(0, hf * 60 + mf - (hi * 60 + mi)) / 60
    }
    return (toHours(manhaIni, manhaFim) + toHours(tardeIni, tardeFim)).toFixed(
      2
    )
  }

  const renderRegistro = ({ item }) => (
    <View style={styles.itemRow}>
      <Text style={styles.itemText}>{item.os_hora_data}</Text>
      <Text style={styles.itemText}>
        {item.os_hora_manh_ini || '--'} - {item.os_hora_manh_fim || '--'}
      </Text>
      <Text style={styles.itemText}>
        {item.os_hora_tard_ini || '--'} - {item.os_hora_tard_fim || '--'}
      </Text>
    </View>
  )

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Horas da O.S</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Data</Text>
        <TextInput value={data} onChangeText={setData} style={styles.input} />
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Manhã</Text>
        <View style={styles.rowButtons}>
          <TouchableOpacity style={styles.btn} onPress={iniciarManha}>
            <Text style={styles.btnText}>Iniciar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={encerrarManha}>
            <Text style={styles.btnText}>Encerrar</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Início</Text>
          <TextInput
            value={manhaIni}
            onChangeText={setManhaIni}
            style={styles.input}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Fim</Text>
          <TextInput
            value={manhaFim}
            onChangeText={setManhaFim}
            style={styles.input}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tarde</Text>
        <View style={styles.rowButtons}>
          <TouchableOpacity style={styles.btn} onPress={iniciarTarde}>
            <Text style={styles.btnText}>Iniciar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={encerrarTarde}>
            <Text style={styles.btnText}>Encerrar</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Início</Text>
          <TextInput
            value={tardeIni}
            onChangeText={setTardeIni}
            style={styles.input}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Fim</Text>
          <TextInput
            value={tardeFim}
            onChangeText={setTardeFim}
            style={styles.input}
          />
        </View>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>KM Saída</Text>
        <TextInput
          value={kmSai}
          onChangeText={setKmSai}
          keyboardType="numeric"
          style={styles.input}
        />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>KM Chegada</Text>
        <TextInput
          value={kmChe}
          onChangeText={setKmChe}
          keyboardType="numeric"
          style={styles.input}
        />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Equipamento</Text>
        <TextInput
          value={equipamento}
          onChangeText={setEquipamento}
          style={styles.input}
        />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Observação</Text>
        <TextInput
          value={observacao}
          onChangeText={setObservacao}
          style={styles.input}
        />
      </View>

      <Text style={styles.total}>
        Total prévia: {calcularPreviewTotal()} h | Total registrado:{' '}
        {Number(totalHoras).toFixed(2)} h
      </Text>

      <TouchableOpacity style={styles.save} onPress={salvarDia}>
        <Text style={styles.saveText}>Salvar Dia</Text>
      </TouchableOpacity>

      <Text style={styles.listTitle}>Registros</Text>
      {embedded ? (
        <View>
          {registros.map((item, idx) => (
            <View key={String(item.os_hora_item || idx)} style={styles.itemRow}>
              <Text style={styles.itemText}>{item.os_hora_data}</Text>
              <Text style={styles.itemText}>
                {item.os_hora_manh_ini || '--'} - {item.os_hora_manh_fim || '--'}
              </Text>
              <Text style={styles.itemText}>
                {item.os_hora_tard_ini || '--'} - {item.os_hora_tard_fim || '--'}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={registros}
          keyExtractor={(it, idx) => String(it.os_hora_item || idx)}
          renderItem={renderRegistro}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a2f3d', padding: 16 },
  title: {
    color: '#10a2a7',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#232935',
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
  },
  sectionTitle: { color: '#10a2a7', fontWeight: 'bold', marginBottom: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  label: { color: '#fff', width: 100 },
  input: {
    flex: 1,
    backgroundColor: '#232935',
    color: '#fff',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#2c3e50',
  },
  rowButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  btn: { backgroundColor: '#10a2a7', padding: 10, borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: 'bold' },
  total: { color: '#fff', textAlign: 'right', marginVertical: 10 },
  save: {
    backgroundColor: '#17a054',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  saveText: { color: '#fff', fontWeight: 'bold' },
  listTitle: { color: '#10a2a7', marginTop: 12, marginBottom: 6 },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#232935',
    padding: 8,
    borderRadius: 6,
    marginBottom: 6,
  },
  itemText: { color: '#fff', fontSize: 12 },
})
