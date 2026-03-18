import React, { useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'
import styles from './Styles/CfopStyles'
import {
  apiGetComContexto,
  apiPostComContexto,
  apiPutComContexto,
} from '../utils/api'
import useContextoApp from '../hooks/useContextoApp'

const normalizarBool = (v) => {
  if (v === true || v === 1) return true
  if (v === false || v === 0) return false
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase()
    if (s === 'true' || s === '1' || s === 's' || s === 'sim') return true
    if (s === 'false' || s === '0' || s === 'n' || s === 'nao' || s === 'não')
      return false
  }
  return !!v
}

const asData = (resp) => resp?.data ?? resp

const FALLBACK_INCIDENCIAS = [
  {
    campo: 'cfop_exig_ipi',
    label: 'Exige IPI',
    help_text: 'Calcula e destaca IPI na nota',
  },
  {
    campo: 'cfop_exig_icms',
    label: 'Exige ICMS',
    help_text: 'Calcula e destaca ICMS na nota',
  },
  {
    campo: 'cfop_exig_pis_cofins',
    label: 'Exige PIS/COFINS',
    help_text: 'Calcula e destaca PIS/COFINS na nota',
  },
  {
    campo: 'cfop_exig_cbs',
    label: 'Exige CBS',
    help_text: 'Calcula CBS (Reforma Tributária)',
  },
  {
    campo: 'cfop_exig_ibs',
    label: 'Exige IBS',
    help_text: 'Calcula IBS (Reforma Tributária)',
  },
  {
    campo: 'cfop_gera_st',
    label: 'Gera ST',
    help_text: 'Calcula Substituição Tributária',
  },
  {
    campo: 'cfop_gera_difal',
    label: 'Gera DIFAL',
    help_text: 'Calcula Diferencial de Alíquota',
  },
  {
    campo: 'cfop_icms_base_inclui_ipi',
    label: 'Base ICMS inclui IPI',
    help_text: 'Adiciona valor do IPI na base do ICMS',
  },
  {
    campo: 'cfop_st_base_inclui_ipi',
    label: 'Base ST inclui IPI',
    help_text: 'Adiciona valor do IPI na base do ST',
  },
  {
    campo: 'cfop_ipi_tota_nf',
    label: 'IPI compõe Total NF',
    help_text: 'Soma o valor do IPI ao total da nota',
  },
  {
    campo: 'cfop_st_tota_nf',
    label: 'ST compõe Total NF',
    help_text: 'Soma o valor do ST ao total da nota',
  },
]

export default function CfopForm({ route, navigation }) {
  const cfopIdParam = route?.params?.cfopId ?? route?.params?.cfop_id ?? null
  const isEdit =
    route?.params?.isEdit != null ? !!route.params.isEdit : cfopIdParam != null

  const { empresaId } = useContextoApp()
  const [loading, setLoading] = useState(isEdit)
  const [salvando, setSalvando] = useState(false)

  const [camposPadrao, setCamposPadrao] = useState([])
  const [incidencias, setIncidencias] = useState([])

  const titulo = useMemo(() => (isEdit ? 'Editar CFOP' : 'Novo CFOP'), [isEdit])

  useEffect(() => {
    navigation?.setOptions?.({ title: titulo })
  }, [navigation, titulo])

  const setCampoPadrao = (campo, valor) => {
    setCamposPadrao((prev) =>
      (prev || []).map((c) => (c.campo === campo ? { ...c, valor } : c)),
    )
  }

  const hidratarDeResposta = (data) => {
    const cps = Array.isArray(data?.campos_padrao) ? data.campos_padrao : []
    setCamposPadrao(
      cps.map((c) => ({
        campo: c?.campo,
        valor: c?.valor,
        label: c?.label ?? c?.campo,
        help_text: c?.help_text ?? '',
        readonly: c?.campo === 'cfop_empr',
      })),
    )

    const incs = Array.isArray(data?.incidencias) ? data.incidencias : []
    setIncidencias(
      incs.map((i) => ({
        campo: i?.campo,
        valor: normalizarBool(i?.valor),
        label: i?.label ?? i?.campo,
        help_text: i?.help_text ?? '',
      })),
    )
  }

  const inicializarCamposPadraoCriacao = () => {
    setCamposPadrao([
      {
        campo: 'cfop_empr',
        valor: empresaId != null ? Number(empresaId) : '',
        label: 'Empresa',
        help_text: 'ID da empresa vinculada',
        readonly: true,
      },
      {
        campo: 'cfop_codi',
        valor: '',
        label: 'Código CFOP',
        help_text: 'Código fiscal de operação (ex: 5102). Deve ter 4 dígitos.',
        readonly: false,
      },
      {
        campo: 'cfop_desc',
        valor: '',
        label: 'Descrição',
        help_text: 'Descrição da operação',
        readonly: false,
      },
    ])
  }

  const carregarTemplateIncidencias = async () => {
    try {
      // FIX: usa apiGetComContexto em vez de request()
      const data = await apiGetComContexto('cfop/cfop')
      const lista = Array.isArray(data?.results) ? data.results : data
      const primeiro = Array.isArray(lista) ? lista[0] : null
      const incs = Array.isArray(primeiro?.incidencias)
        ? primeiro.incidencias
        : []
      const base = incs.length > 0 ? incs : FALLBACK_INCIDENCIAS
      setIncidencias(
        base.map((i) => ({
          campo: i?.campo,
          valor: false,
          label: i?.label ?? i?.campo,
          help_text: i?.help_text ?? '',
        })),
      )
    } catch (e) {
      setIncidencias(
        FALLBACK_INCIDENCIAS.map((i) => ({
          campo: i.campo,
          valor: false,
          label: i.label,
          help_text: i.help_text,
        })),
      )
    }
  }

  const carregarEdicao = async () => {
    if (!isEdit || cfopIdParam == null) return
    setLoading(true)
    try {
      // FIX: usa apiGetComContexto em vez de request()
      const data = await apiGetComContexto(`cfop/cfop/${cfopIdParam}/`)
      hidratarDeResposta(data)
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.erro ||
        e?.message ||
        'Falha ao carregar CFOP'
      Alert.alert('Erro', msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isEdit) {
      carregarEdicao()
    }
  }, [isEdit, cfopIdParam])

  useEffect(() => {
    if (isEdit) return

    if (!camposPadrao || camposPadrao.length === 0) {
      inicializarCamposPadraoCriacao()
    } else if (empresaId != null) {
      const empr = camposPadrao.find((c) => c?.campo === 'cfop_empr')
      if (empr && (empr.valor === '' || empr.valor == null)) {
        setCampoPadrao('cfop_empr', Number(empresaId))
      }
    }

    if (!incidencias || incidencias.length === 0) {
      carregarTemplateIncidencias()
    }
  }, [isEdit, empresaId, camposPadrao?.length, incidencias?.length])

  const setIncidencia = (campo, valor) => {
    setIncidencias((prev) =>
      prev.map((i) => (i.campo === campo ? { ...i, valor: !!valor } : i)),
    )
  }

  const salvar = async () => {
    const getCampo = (campo) => {
      const found = (camposPadrao || []).find((c) => c?.campo === campo)
      return found?.valor
    }

    const cfop_codi = String(getCampo('cfop_codi') ?? '').trim()
    const cfop_desc = String(getCampo('cfop_desc') ?? '').trim()

    if (!/^\d{4}$/.test(cfop_codi)) {
      Alert.alert('Atenção', 'Informe o código CFOP com 4 dígitos')
      return
    }
    if (!cfop_desc) {
      Alert.alert('Atenção', 'Informe a descrição')
      return
    }

    const payload = {
      campos_padrao: (camposPadrao || [])
        .filter((c) => c?.campo)
        .map((c) => ({ campo: c.campo, valor: c.valor })),
      incidencias: (incidencias || [])
        .filter((i) => i?.campo)
        .map((i) => ({ campo: i.campo, valor: !!i.valor })),
    }

    setSalvando(true)
    try {
      // FIX: usa apiPutComContexto ou apiPostComContexto em vez de request()
      if (isEdit) {
        await apiPutComContexto(`cfop/cfop/${cfopIdParam}/`, payload)
      } else {
        await apiPostComContexto('cfop/cfop/', payload)
      }
      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: isEdit ? 'CFOP atualizado' : 'CFOP criado',
      })
      navigation.goBack()
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.erro ||
        e?.message ||
        'Falha ao salvar CFOP'
      Alert.alert('Erro', msg)
    } finally {
      setSalvando(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.form}>
        {(camposPadrao || []).map((c) => (
          <View key={String(c?.campo)} style={styles.inputGroup}>
            <Text style={styles.label}>{c?.label || c?.campo}</Text>
            <TextInput
              style={c?.readonly ? styles.readonlyInput : styles.input}
              value={c?.valor != null ? String(c.valor) : ''}
              onChangeText={(v) => setCampoPadrao(c.campo, v)}
              editable={!c?.readonly}
              keyboardType={c?.campo === 'cfop_codi' ? 'numeric' : 'default'}
              placeholder={c?.campo === 'cfop_codi' ? '5102' : ''}
              placeholderTextColor="#666"
              maxLength={c?.campo === 'cfop_codi' ? 4 : undefined}
            />
            {c?.help_text ? (
              <Text style={styles.incidenciaHelp}>{c.help_text}</Text>
            ) : null}
          </View>
        ))}

        {incidencias.length > 0 ? (
          <View style={styles.incidenciasCard}>
            <Text style={styles.incidenciasTitle}>Incidências</Text>
            {incidencias.map((i) => (
              <View key={String(i.campo)} style={styles.incidenciaRow}>
                <View style={styles.incidenciaText}>
                  <Text style={styles.incidenciaLabel}>
                    {i.label || i.campo}
                  </Text>
                  {i.help_text ? (
                    <Text style={styles.incidenciaHelp}>{i.help_text}</Text>
                  ) : null}
                </View>
                <Switch
                  value={!!i.valor}
                  onValueChange={(v) => setIncidencia(i.campo, v)}
                />
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={salvando}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={salvar}
            disabled={salvando}>
            <MaterialIcons
              name={salvando ? 'hourglass-empty' : 'save'}
              size={18}
              color="#fff"
            />
            <Text style={styles.saveButtonText}>
              {salvando ? 'Salvando...' : 'Salvar'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}