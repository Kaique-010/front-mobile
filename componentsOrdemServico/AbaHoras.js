import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ScrollView,
  Platform,
} from 'react-native'
import Toast from 'react-native-toast-message'
import DateTimePicker from '@react-native-community/datetimepicker'
import useContextoApp from '../hooks/useContextoApp'
import {
  apiGetComContexto,
  apiPostComContexto,
  apiPatchComContexto,
} from '../utils/api'
import SignatureField from '../componentsOrdemServico/SignatureField'
import DatePickerCrossPlatform from '../components/DatePickerCrossPlatform'
import { enqueueOperation } from './services/syncService'
import NetInfo from '@react-native-community/netinfo'

function sanitizeSignature(base64) {
  if (!base64) return ''
  return base64.replace(/^data:image\/[a-zA-Z]+;base64,/, '')
}

function addPrefix(base64) {
  if (!base64) return null
  return `data:image/png;base64,${base64}`
}

const TimePickerInput = ({ value, onChange, style, placeholder = '00:00' }) => {
  const [show, setShow] = useState(false)

  const handleChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShow(false)
    }

    if (selectedDate) {
      const hours = String(selectedDate.getHours()).padStart(2, '0')
      const minutes = String(selectedDate.getMinutes()).padStart(2, '0')
      onChange(`${hours}:${minutes}`)
    }
  }

  const getDateFromValue = () => {
    const d = new Date()
    if (value) {
      const [h, m] = value.split(':').map(Number)
      if (!isNaN(h) && !isNaN(m)) {
        d.setHours(h)
        d.setMinutes(m)
        d.setSeconds(0)
      }
    }
    return d
  }

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity onPress={() => setShow(!show)} style={style}>
        <Text style={{ color: value ? '#fff' : '#666' }}>
          {value || placeholder}
        </Text>
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={getDateFromValue()}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={handleChange}
        />
      )}
    </View>
  )
}

export default function AbaHoras({
  os_os,
  embedded = false,
  ordemServico,
  setOrdemServico,
  setScrollLock,
}) {
  const { empresaId, filialId, usuarioId } = useContextoApp()
  const Container = embedded ? View : ScrollView
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
  const [online, setOnline] = useState(true)

  const fmt = (n) => String(n).padStart(2, '0')
  const agora = () => {
    const d = new Date()
    return `${fmt(d.getHours())}:${fmt(d.getMinutes())}:${fmt(d.getSeconds())}`
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

      // Se houver registros para o dia atual, preencher os campos
      const registroHoje = arr.find(
        (r) => String(r.os_hora_data) === String(data)
      )
      if (registroHoje) {
        setManhaIni(registroHoje.os_hora_manh_ini || '')
        setManhaFim(registroHoje.os_hora_manh_fim || '')
        setTardeIni(registroHoje.os_hora_tard_ini || '')
        setTardeFim(registroHoje.os_hora_tard_fim || '')
        setKmSai(
          registroHoje.os_hora_km_sai ? String(registroHoje.os_hora_km_sai) : ''
        )
        setKmChe(
          registroHoje.os_hora_km_che ? String(registroHoje.os_hora_km_che) : ''
        )
        setEquipamento(registroHoje.os_hora_equi || '')
        setObservacao(registroHoje.os_hora_obse || '')
      } else {
        // Limpar campos se não houver registro para o dia
        setManhaIni('')
        setManhaFim('')
        setTardeIni('')
        setTardeFim('')
        setKmSai('')
        setKmChe('')
        setEquipamento('')
        setObservacao('')
      }

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

  useEffect(() => {
    const sub = NetInfo.addEventListener((state) =>
      setOnline(!!state.isConnected)
    )
    return () => sub && sub()
  }, [])

  const salvarDia = async () => {
    if (!os_os) {
      Toast.show({ type: 'error', text1: 'OS inválida' })
      return
    }

    if (ordemServico) {
      try {
        const payloadAssi = {
          os_os: String(os_os),
          os_empr: Number(empresaId),
          os_fili: Number(filialId),
          os_assi_clie: addPrefix(sanitizeSignature(ordemServico.os_assi_clie)),
          os_assi_oper: addPrefix(sanitizeSignature(ordemServico.os_assi_oper)),
        }
        await apiPatchComContexto('Os/ordens/patch/', payloadAssi)
      } catch (e) {
        console.error('Erro ao salvar assinaturas', e)
      }
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
      const existente = encontrarRegistroAtual()
      if (existente?.os_hora_item) {
        // Remove campos nulos/vazios para o PATCH
        const cleanPayload = { ...payload }
        Object.keys(cleanPayload).forEach((key) => {
          if (
            cleanPayload[key] === null ||
            cleanPayload[key] === undefined ||
            cleanPayload[key] === ''
          ) {
            delete cleanPayload[key]
          }
        })

        await apiPatchComContexto(
          `Os/os-hora/${existente.os_hora_item}/`,
          {
            ...cleanPayload,
            os_hora_item: undefined,
            os_hora_empr: undefined,
            os_hora_fili: undefined,
            os_hora_os: undefined,
          },
          '',
          {
            os_hora_os: String(os_os),
            os_hora_empr: Number(empresaId),
            os_hora_fili: Number(filialId),
          }
        )
      } else {
        await apiPostComContexto('Os/os-hora/', payload)
      }
      Toast.show({ type: 'success', text1: 'Horas salvas' })
      setManhaIni('')
      setManhaFim('')
      setTardeIni('')
      setTardeFim('')
      carregarRegistros()
    } catch (e) {
      try {
        const existente = encontrarRegistroAtual()
        const endpoint = existente?.os_hora_item
          ? `Os/os-hora/${existente.os_hora_item}/?os_hora_os=${String(
              os_os
            )}&os_hora_empr=${Number(empresaId)}&os_hora_fili=${Number(
              filialId
            )}`
          : 'Os/os-hora/'
        const method = existente?.os_hora_item ? 'patch' : 'post'
        await enqueueOperation(endpoint, method, payload)
        Toast.show({
          type: 'info',
          text1: 'Sem conexão',
          text2: 'Horas enfileiradas para sincronizar quando online',
        })
      } catch {}
      Toast.show({ type: 'error', text1: 'Erro ao salvar horas' })
    }
  }

  const encontrarRegistroAtual = () => {
    return (
      registros.find((r) => {
        return (
          String(r.os_hora_os) === String(os_os) &&
          String(r.os_hora_empr) === String(empresaId) &&
          String(r.os_hora_fili) === String(filialId) &&
          String(r.os_hora_data) === String(data)
        )
      }) || null
    )
  }

  const salvarParcial = async (campos) => {
    // Função mantida para compatibilidade, mas agora o salvamento é manual via botão "Salvar Dia"
    // Pode ser removida se não houver uso futuro.
    try {
      const base = {
        os_hora_empr: Number(empresaId),
        os_hora_fili: Number(filialId),
        os_hora_os: String(os_os),
        os_hora_data: data,
        os_hora_oper: usuarioId ? Number(usuarioId) : null,
      }
      const existente = encontrarRegistroAtual()
      if (existente?.os_hora_item) {
        await apiPatchComContexto(
          `Os/os-hora/${existente.os_hora_item}/`,
          {
            ...base,
            ...campos,
          },
          '',
          {
            os_hora_os: String(os_os),
            os_hora_empr: Number(empresaId),
            os_hora_fili: Number(filialId),
          }
        )
      } else {
        await apiPostComContexto('Os/os-hora/', { ...base, ...campos })
      }
      carregarRegistros()
    } catch (e) {}
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
    <Container style={styles.container}>
      <Text style={styles.title}>Horas da O.S</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Data</Text>
        <View style={{ flex: 1 }}>
          <DatePickerCrossPlatform
            value={data}
            onChange={(date) => {
              const year = date.getFullYear()
              const month = String(date.getMonth() + 1).padStart(2, '0')
              const day = String(date.getDate()).padStart(2, '0')
              setData(`${year}-${month}-${day}`)
            }}
            style={styles.input}
            textStyle={{ color: '#fff' }}
          />
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Manhã</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Início</Text>
          <TimePickerInput
            value={manhaIni}
            onChange={setManhaIni}
            style={styles.input}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Fim</Text>
          <TimePickerInput
            value={manhaFim}
            onChange={setManhaFim}
            style={styles.input}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tarde</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Início</Text>
          <TimePickerInput
            value={tardeIni}
            onChange={setTardeIni}
            style={styles.input}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Fim</Text>
          <TimePickerInput
            value={tardeFim}
            onChange={setTardeFim}
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
        {!online && (
          <View style={styles.badgeOffline}>
            <Text style={styles.badgeText}>Offline</Text>
          </View>
        )}
      </TouchableOpacity>

      <Text style={styles.listTitle}>Registros</Text>
      {embedded ? (
        <View>
          {registros.map((item, idx) => (
            <View key={String(item.os_hora_item || idx)} style={styles.itemRow}>
              <Text style={styles.itemText}>{item.os_hora_data}</Text>
              <Text style={styles.itemText}>
                {item.os_hora_manh_ini || '--'} -{' '}
                {item.os_hora_manh_fim || '--'}
              </Text>
              <Text style={styles.itemText}>
                {item.os_hora_tard_ini || '--'} -{' '}
                {item.os_hora_tard_fim || '--'}
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
      {ordemServico && setOrdemServico && (
        <>
          <SignatureField
            label="Assinatura do Cliente"
            value={ordemServico.os_assi_clie}
            onChange={(base64) =>
              setOrdemServico((prev) => ({ ...prev, os_assi_clie: base64 }))
            }
            onSigningChange={setScrollLock}
          />
        </>
      )}
    </Container>
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
  badgeOffline: {
    marginTop: 6,
    backgroundColor: '#c0392b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: { color: '#fff', fontSize: 12 },
  listTitle: { color: '#10a2a7', marginTop: 12, marginBottom: 20 },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#232935',
    padding: 25,
    borderRadius: 6,
    marginBottom: 25,
  },
  itemText: { color: '#fff', fontSize: 12 },
})
