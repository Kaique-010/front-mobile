import React, { useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'
import styles from './Styles/NcmStyles'
import BuscaNcmInput from './BuscaNcmInput'
import BuscaCstInput from './BuscaCstInput'
import {
  apiGetComContexto,
  apiPostComContexto,
  apiPutComContexto,
} from '../utils/api'

const DEFAULT_FORM = {
  ncm: '',
  ncm_id: '',
  cfop: '',
  uf_origem: '',
  uf_destino: '',
  tipo_entidade: '',
  cst_icms: '',
  aliq_icms: '',
  cst_ipi: '',
  aliq_ipi: '',
  cst_pis: '',
  aliq_pis: '',
  cst_cofins: '',
  aliq_cofins: '',
  cst_cbs: '',
  aliq_cbs: '',
  cst_ibs: '',
  aliq_ibs: '',
}

const toText = (v) => {
  if (v == null) return ''
  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean')
    return String(v)
  if (typeof v === 'object') {
    return (
      v?.descricao ??
      v?.desc ??
      v?.label ??
      v?.nome ??
      v?.ncm ??
      v?.codigo ??
      v?.value ??
      JSON.stringify(v)
    )
  }
  return String(v)
}

export default function NcmForm({ route, navigation }) {
  const ncmIdParam = route?.params?.ncmId ?? route?.params?.id ?? null
  const isEdit =
    route?.params?.isEdit != null ? !!route.params.isEdit : ncmIdParam != null

  const [loading, setLoading] = useState(isEdit)
  const [salvando, setSalvando] = useState(false)
  const [form, setForm] = useState(DEFAULT_FORM)

  const titulo = useMemo(() => (isEdit ? 'Editar NCM' : 'Novo NCM'), [isEdit])

  useEffect(() => {
    navigation?.setOptions?.({ title: titulo })
  }, [navigation, titulo])

  const setCampo = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  const hidratarDeResposta = (data) => {
    setForm({
      ncm: toText(data?.ncm),
      ncm_id: toText(data?.ncm_id),
      cfop: toText(data?.cfop),
      uf_origem: toText(data?.uf_origem),
      uf_destino: toText(data?.uf_destino),
      tipo_entidade: toText(data?.tipo_entidade),
      cst_icms: toText(data?.cst_icms),
      aliq_icms: toText(data?.aliq_icms),
      cst_ipi: toText(data?.cst_ipi),
      aliq_ipi: toText(data?.aliq_ipi),
      cst_pis: toText(data?.cst_pis),
      aliq_pis: toText(data?.aliq_pis),
      cst_cofins: toText(data?.cst_cofins),
      aliq_cofins: toText(data?.aliq_cofins),
      cst_cbs: toText(data?.cst_cbs),
      aliq_cbs: toText(data?.aliq_cbs),
      cst_ibs: toText(data?.cst_ibs),
      aliq_ibs: toText(data?.aliq_ibs),
    })
  }

  const carregarEdicao = async () => {
    if (!isEdit || ncmIdParam == null || String(ncmIdParam).trim() === '')
      return
    setLoading(true)
    try {
      // FIX: usa apiGetComContexto em vez de request()
      const data = await apiGetComContexto(
        `produtos/ncmfiscalpadrao/${ncmIdParam}/`,
      )
      hidratarDeResposta(data)
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.erro ||
        e?.message ||
        'Falha ao carregar NCM'
      Alert.alert('Erro', msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isEdit) carregarEdicao()
  }, [isEdit, ncmIdParam])

  const salvar = async () => {
    const ncm_id = String(form.ncm_id || '').trim()

    if (!ncm_id) {
      Alert.alert('Atenção', 'Informe o NCM')
      return
    }

    const payload = {
      ncm: String(form.ncm || '').trim(),
      ncm_id,
      cfop: String(form.cfop || '').trim(),
      uf_origem: String(form.uf_origem || '').trim().toUpperCase(),
      uf_destino: String(form.uf_destino || '').trim().toUpperCase(),
      tipo_entidade: String(form.tipo_entidade || '').trim(),
      cst_icms: String(form.cst_icms || '').trim(),
      aliq_icms: String(form.aliq_icms || '').trim(),
      cst_ipi: String(form.cst_ipi || '').trim(),
      aliq_ipi: String(form.aliq_ipi || '').trim(),
      cst_pis: String(form.cst_pis || '').trim(),
      aliq_pis: String(form.aliq_pis || '').trim(),
      cst_cofins: String(form.cst_cofins || '').trim(),
      aliq_cofins: String(form.aliq_cofins || '').trim(),
      cst_cbs: String(form.cst_cbs || '').trim(),
      aliq_cbs: String(form.aliq_cbs || '').trim(),
      cst_ibs: String(form.cst_ibs || '').trim(),
      aliq_ibs: String(form.aliq_ibs || '').trim(),
    }

    setSalvando(true)
    try {
      // FIX: usa apiPutComContexto ou apiPostComContexto em vez de request()
      if (isEdit) {
        await apiPutComContexto(
          `produtos/ncmfiscalpadrao/${ncmIdParam}/`,
          payload,
        )
      } else {
        await apiPostComContexto('produtos/ncmfiscalpadrao/', payload)
      }
      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: isEdit ? 'NCM atualizado' : 'NCM criado',
      })
      navigation.goBack()
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.erro ||
        e?.message ||
        'Falha ao salvar NCM'
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
        <View style={styles.inputGroup}>
          <Text style={styles.label}>NCM</Text>
          <BuscaNcmInput
            value={form.ncm_id}
            placeholder="Ex: 01012100"
            onSelect={(item) => {
              const codigo = toText(item?.ncm_id)
              const desc = toText(item?.ncm)
              setForm((prev) => ({
                ...prev,
                ncm_id: codigo,
                ncm: desc || prev.ncm,
              }))
            }}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={styles.input}
            value={form.ncm}
            onChangeText={(v) => setCampo('ncm', v)}
            placeholder="Descrição do NCM"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.rowContainer}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>CFOP</Text>
            <TextInput
              style={styles.input}
              value={form.cfop}
              onChangeText={(v) => setCampo('cfop', v)}
              keyboardType="numeric"
              placeholder="Ex: 5102"
              placeholderTextColor="#666"
              maxLength={4}
            />
          </View>

          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Tipo Entidade</Text>
            <TextInput
              style={styles.input}
              value={form.tipo_entidade}
              onChangeText={(v) => setCampo('tipo_entidade', v)}
              placeholder="Ex: CL"
              placeholderTextColor="#666"
              maxLength={8}
              autoCapitalize="characters"
            />
          </View>
        </View>

        <View style={styles.rowContainer}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>UF Origem</Text>
            <TextInput
              style={styles.input}
              value={form.uf_origem}
              onChangeText={(v) => setCampo('uf_origem', v)}
              placeholder="SP"
              placeholderTextColor="#666"
              maxLength={2}
              autoCapitalize="characters"
            />
          </View>

          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>UF Destino</Text>
            <TextInput
              style={styles.input}
              value={form.uf_destino}
              onChangeText={(v) => setCampo('uf_destino', v)}
              placeholder="RJ"
              placeholderTextColor="#666"
              maxLength={2}
              autoCapitalize="characters"
            />
          </View>
        </View>

        <View style={styles.rowContainer}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>CST ICMS</Text>
            <BuscaCstInput
              tributo="icms"
              value={form.cst_icms}
              placeholder="Ex: 00"
              onChange={(codigo) => setCampo('cst_icms', codigo)}
            />
          </View>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Alíquota ICMS</Text>
            <TextInput
              style={styles.input}
              value={form.aliq_icms}
              onChangeText={(v) => setCampo('aliq_icms', v)}
              keyboardType="numeric"
              placeholder="Ex: 18"
              placeholderTextColor="#666"
              maxLength={10}
            />
          </View>
        </View>

        <View style={styles.rowContainer}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>CST IPI</Text>
            <BuscaCstInput
              tributo="ipi"
              value={form.cst_ipi}
              placeholder="Ex: 50"
              onChange={(codigo) => setCampo('cst_ipi', codigo)}
            />
          </View>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Alíquota IPI</Text>
            <TextInput
              style={styles.input}
              value={form.aliq_ipi}
              onChangeText={(v) => setCampo('aliq_ipi', v)}
              keyboardType="numeric"
              placeholder="Ex: 5"
              placeholderTextColor="#666"
              maxLength={10}
            />
          </View>
        </View>

        <View style={styles.rowContainer}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>CST PIS</Text>
            <BuscaCstInput
              tributo="pis"
              value={form.cst_pis}
              placeholder="Ex: 01"
              onChange={(codigo) => setCampo('cst_pis', codigo)}
            />
          </View>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Alíquota PIS</Text>
            <TextInput
              style={styles.input}
              value={form.aliq_pis}
              onChangeText={(v) => setCampo('aliq_pis', v)}
              keyboardType="numeric"
              placeholder="Ex: 1.65"
              placeholderTextColor="#666"
              maxLength={10}
            />
          </View>
        </View>

        <View style={styles.rowContainer}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>CST COFINS</Text>
            <BuscaCstInput
              tributo="cofins"
              value={form.cst_cofins}
              placeholder="Ex: 01"
              onChange={(codigo) => setCampo('cst_cofins', codigo)}
            />
          </View>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Alíquota COFINS</Text>
            <TextInput
              style={styles.input}
              value={form.aliq_cofins}
              onChangeText={(v) => setCampo('aliq_cofins', v)}
              keyboardType="numeric"
              placeholder="Ex: 7.6"
              placeholderTextColor="#666"
              maxLength={10}
            />
          </View>
        </View>

        <View style={styles.rowContainer}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>CST CBS</Text>
            <BuscaCstInput
              tributo="cbs"
              value={form.cst_cbs}
              placeholder="Ex: 01"
              onChange={(codigo) => setCampo('cst_cbs', codigo)}
            />
          </View>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Alíquota CBS</Text>
            <TextInput
              style={styles.input}
              value={form.aliq_cbs}
              onChangeText={(v) => setCampo('aliq_cbs', v)}
              keyboardType="numeric"
              placeholder="Ex: 9.25"
              placeholderTextColor="#666"
              maxLength={10}
            />
          </View>
        </View>

        <View style={styles.rowContainer}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>CST IBS</Text>
            <BuscaCstInput
              tributo="ibs"
              value={form.cst_ibs}
              placeholder="Ex: 01"
              onChange={(codigo) => setCampo('cst_ibs', codigo)}
            />
          </View>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Alíquota IBS</Text>
            <TextInput
              style={styles.input}
              value={form.aliq_ibs}
              onChangeText={(v) => setCampo('aliq_ibs', v)}
              keyboardType="numeric"
              placeholder="Ex: 12"
              placeholderTextColor="#666"
              maxLength={10}
            />
          </View>
        </View>

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