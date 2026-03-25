import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native'
import Toast from 'react-native-toast-message'
import { apiPostComContexto, apiPutComContexto } from '../utils/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import BuscaClienteInput from '../components/BuscaClienteInput'
import BuscaProdutosInput from '../components/BuscaProdutosInput'
import DatePickerCrossPlatform from '../components/DatePickerCrossPlatform'
import styles from '../styles/listaStyles'

export default function EntradasForm({ route, navigation }) {
  const entrada = route.params?.entrada
  const [carregando, setCarregando] = useState(false)

  const [form, setForm] = useState({
    entr_data: new Date().toISOString().split('T')[0],
    entr_prod: '',
    entr_prod_nome: '',
    entr_enti: '',
    entr_enti_nome: '',
    entr_enti_cida: '',
    entr_quan: '',
    entr_unit: '',
    entr_tota: '',
    entr_obse: '',
    entr_empr: null,
    entr_fili: null,
    entr_usua: null,
    entr_lote_vend: '',
    auto_lote: false,
    atualizar_preco: true,
    preco_vista: '',
    preco_prazo: '',
    lote_data_fabr: '',
    lote_data_vali: '',
    entr_id: null,
  })

  const carregarContexto = async () => {
    try {
      const [usuarioRaw, empresaId, filialId] = await Promise.all([
        AsyncStorage.getItem('usuario'),
        AsyncStorage.getItem('empresaId'),
        AsyncStorage.getItem('filialId'),
      ])

      const usuarioObj = usuarioRaw ? JSON.parse(usuarioRaw) : null
      const usuarioId = usuarioObj?.usuario_id ?? null

      setForm((prev) => ({
        ...prev,
        entr_usua: usuarioId,
        entr_empr: empresaId,
        entr_fili: filialId,
      }))
    } catch (error) {
      console.error('Erro ao carregar contexto:', error)
    }
  }

  useEffect(() => {
    const init = async () => {
      await carregarContexto()
      if (entrada) {
        setForm((prev) => ({
          ...prev,
          entr_data: entrada.entr_data || prev.entr_data,
          entr_prod: entrada.entr_prod || '',
          entr_prod_nome:
            entrada.produto_nome || entrada.prod_nome || prev.entr_prod_nome,
          entr_enti: entrada.entr_enti || '',
          entr_enti_nome:
            entrada.entr_enti_nome ||
            entrada.entidade_nome ||
            entrada.enti_nome ||
            prev.entr_enti_nome,
          entr_enti_cida:
            entrada.entr_enti_cida ||
            entrada.entidade_cida ||
            entrada.enti_cida ||
            prev.entr_enti_cida,
          entr_quan: entrada.entr_quan?.toString() || '',
          entr_unit: entrada.entr_unit?.toString() || '',
          entr_tota: entrada.entr_tota?.toString() || '',
          entr_obse: entrada.entr_obse || '',
          entr_lote_vend: entrada.entr_lote_vend?.toString() || '',
          preco_vista:
            entrada.preco_vista != null ? String(entrada.preco_vista) : '',
          preco_prazo:
            entrada.preco_prazo != null ? String(entrada.preco_prazo) : '',
          lote_data_fabr: entrada.lote_data_fabr || '',
          lote_data_vali: entrada.lote_data_vali || '',
          entr_id: entrada.entr_sequ ?? entrada.id ?? null,
        }))
      }
    }
    init()
  }, [entrada])

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const toISODate = (d) => {
    if (!d) return ''
    const dateObj = new Date(d)
    if (isNaN(dateObj.getTime())) return ''
    const y = dateObj.getFullYear()
    const m = String(dateObj.getMonth() + 1).padStart(2, '0')
    const day = String(dateObj.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  const recalcularTotal = (novoState) => {
    const q = parseFloat(novoState.entr_quan?.toString().replace(',', '.')) || 0
    const u = parseFloat(novoState.entr_unit?.toString().replace(',', '.')) || 0
    const total = q * u
    return total > 0 ? total.toFixed(2) : ''
  }

  const validarEntrada = () => {
    if (!form.entr_prod) {
      Alert.alert('Erro', 'Selecione um produto.')
      return false
    }
    if (!form.entr_quan || parseFloat(form.entr_quan) <= 0) {
      Alert.alert('Erro', 'A quantidade deve ser maior que zero.')
      return false
    }
    if (!form.entr_unit || parseFloat(form.entr_unit) <= 0) {
      Alert.alert('Erro', 'O valor unitário deve ser maior que zero.')
      return false
    }
    if (!form.entr_data) {
      Alert.alert('Erro', 'Informe a data da entrada.')
      return false
    }
    return true
  }

  const salvarEntrada = async () => {
    if (!validarEntrada()) return

    try {
      setCarregando(true)

      const payload = {
        entr_empr: form.entr_empr ? parseInt(form.entr_empr) : null,
        entr_fili: form.entr_fili ? parseInt(form.entr_fili) : null,
        entr_enti: form.entr_enti,
        entr_prod: form.entr_prod,
        entr_data: form.entr_data,
        entr_quan: parseFloat(form.entr_quan?.toString().replace(',', '.')),
        entr_unit: parseFloat(form.entr_unit?.toString().replace(',', '.')),
        entr_tota:
          form.entr_tota && parseFloat(form.entr_tota) > 0
            ? parseFloat(form.entr_tota?.toString().replace(',', '.'))
            : parseFloat(recalcularTotal(form)),
        entr_obse: form.entr_obse,
        entr_lote_vend: form.entr_lote_vend === '' ? null : form.entr_lote_vend,
        auto_lote: !!form.auto_lote,
        atualizar_preco: !!form.atualizar_preco,
        preco_vista:
          form.preco_vista !== '' && form.preco_vista != null
            ? parseFloat(form.preco_vista?.toString().replace(',', '.'))
            : undefined,
        preco_prazo:
          form.preco_prazo !== '' && form.preco_prazo != null
            ? parseFloat(form.preco_prazo?.toString().replace(',', '.'))
            : undefined,
        lote_data_fabr:
          form.lote_data_fabr && form.lote_data_fabr.length > 0
            ? form.lote_data_fabr
            : undefined,
        lote_data_vali:
          form.lote_data_vali && form.lote_data_vali.length > 0
            ? form.lote_data_vali
            : undefined,
      }

      if (form.entr_id || entrada?.entr_sequ || entrada?.id) {
        await apiPutComContexto(
          'entradas_estoque/entradas-estoque/',
          form.entr_id ?? entrada?.entr_sequ ?? entrada?.id,
          payload,
        )
      } else {
        await apiPostComContexto('entradas_estoque/entradas-estoque/', payload)
      }

      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Entrada salva com sucesso!',
      })

      navigation.goBack()
    } catch (error) {
      console.error('Erro ao salvar entrada:', error)
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Erro ao salvar entrada',
      })
    } finally {
      setCarregando(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          style={styles.inner}
          contentContainerStyle={{ paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled">
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flex: 0.48, marginRight: 8 }}>
              <Text style={styles.label}>Data *</Text>
              <DatePickerCrossPlatform
                style={styles.forminput}
                value={form.entr_data}
                placeholder="YYYY-MM-DD"
                onChange={(date) => handleChange('entr_data', toISODate(date))}
              />
            </View>
            <View style={{ flex: 0.48 }}>
              <Text style={styles.label}>Entidade(Responsável Entrada)</Text>
              <BuscaClienteInput
                value={
                  form.entr_enti
                    ? [
                        String(form.entr_enti),
                        form.entr_enti_nome || '',
                        form.entr_enti_cida || '',
                      ]
                        .filter((p) => String(p).trim().length > 0)
                        .join(' - ')
                    : ''
                }
                onSelect={(item) => {
                  console.log('Fornecedor selecionado:', item)
                  if (!item) {
                    setForm((prev) => ({
                      ...prev,
                      entr_enti: '',
                      entr_enti_nome: '',
                      entr_enti_cida: '',
                    }))
                    return
                  }
                  setForm((prev) => ({
                    ...prev,
                    entr_enti: item.enti_clie,
                    entr_enti_nome: item.enti_nome || '',
                    entr_enti_cida: item.enti_cida || '',
                  }))
                }}
              />
            </View>
          </View>

          <Text style={styles.label}>Produto *</Text>
          <BuscaProdutosInput
            value={
              form.entr_prod_nome
                ? form.entr_prod_nome
                : form.entr_prod
                  ? String(form.entr_prod)
                  : ''
            }
            onSelect={(item) => {
              console.log('Produto selecionado:', item)
              if (!item) {
                setForm((prev) => ({
                  ...prev,
                  entr_prod: '',
                  entr_prod_nome: '',
                }))
                return
              }
              setForm((prev) => ({
                ...prev,
                entr_prod: item.prod_codi,
                entr_prod_nome: item.prod_nome || '',
              }))
            }}
          />

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 8,
            }}>
            <View style={{ flex: 0.3, marginRight: 8 }}>
              <Text style={styles.label}>Quantidade *</Text>
              <TextInput
                style={styles.forminput}
                value={form.entr_quan}
                onChangeText={(text) => {
                  const novo = { ...form, entr_quan: text }
                  const total = recalcularTotal(novo)
                  setForm((prev) => ({
                    ...prev,
                    entr_quan: text,
                    entr_tota: total,
                  }))
                }}
                keyboardType="numeric"
                placeholder="Quantidade"
              />
            </View>
            <View style={{ flex: 0.3, marginRight: 8 }}>
              <Text style={styles.label}>Unitário *</Text>
              <TextInput
                style={styles.forminput}
                value={form.entr_unit}
                onChangeText={(text) => {
                  const novo = { ...form, entr_unit: text }
                  const total = recalcularTotal(novo)
                  setForm((prev) => ({
                    ...prev,
                    entr_unit: text,
                    entr_tota: total,
                  }))
                }}
                keyboardType="numeric"
                placeholder="Preço unitário"
              />
            </View>
            <View style={{ flex: 0.3 }}>
              <Text style={styles.label}>Total</Text>
              <TextInput
                style={styles.forminput}
                value={form.entr_tota}
                keyboardType="numeric"
                placeholder="Total"
                editable={false}
              />
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 8,
            }}>
            <View style={{ flex: 0.3, marginRight: 8 }}>
              <Text style={styles.label}>Lote</Text>
              <TextInput
                style={styles.forminput}
                value={form.entr_lote_vend}
                onChangeText={(text) => handleChange('entr_lote_vend', text)}
                placeholder="Ex.: 123 ou PROMO"
              />
            </View>
            <View style={{ flex: 0.3, marginRight: 8 }}>
              <Text style={styles.label}>Preço à vista</Text>
              <TextInput
                style={styles.forminput}
                value={form.preco_vista}
                onChangeText={(text) => handleChange('preco_vista', text)}
                keyboardType="numeric"
                placeholder="Opcional"
              />
            </View>
            <View style={{ flex: 0.3 }}>
              <Text style={styles.label}>Preço a prazo</Text>
              <TextInput
                style={styles.forminput}
                value={form.preco_prazo}
                onChangeText={(text) => handleChange('preco_prazo', text)}
                keyboardType="numeric"
                placeholder="Opcional"
              />
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 8,
            }}>
            <TouchableOpacity
              style={[
                styles.incluirButton,
                { paddingHorizontal: 12, marginRight: 8 },
              ]}
              onPress={() => handleChange('auto_lote', !form.auto_lote)}>
              <Text style={styles.incluirButtonText}>
                {form.auto_lote ? 'Auto Lote: ON' : 'Auto Lote: OFF'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.incluirButton, { paddingHorizontal: 12 }]}
              onPress={() =>
                handleChange('atualizar_preco', !form.atualizar_preco)
              }>
              <Text style={styles.incluirButtonText}>
                {form.atualizar_preco
                  ? 'Atualizar Preço: ON'
                  : 'Atualizar Preço: OFF'}
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 8,
            }}>
            <View style={{ flex: 0.48, marginRight: 8 }}>
              <Text style={styles.label}>Data Fabricação do Lote</Text>
              <DatePickerCrossPlatform
                style={styles.forminput}
                value={form.lote_data_fabr}
                placeholder="YYYY-MM-DD"
                onChange={(date) =>
                  handleChange('lote_data_fabr', toISODate(date))
                }
              />
            </View>
            <View style={{ flex: 0.48 }}>
              <Text style={styles.label}>Data Validade do Lote</Text>
              <DatePickerCrossPlatform
                style={styles.forminput}
                value={form.lote_data_vali}
                placeholder="YYYY-MM-DD"
                onChange={(date) =>
                  handleChange('lote_data_vali', toISODate(date))
                }
              />
            </View>
          </View>

          <Text style={styles.label}>Observações</Text>
          <TextInput
            style={styles.forminput}
            value={form.entr_obse}
            onChangeText={(text) => handleChange('entr_obse', text)}
            placeholder="Observações"
          />

          <TouchableOpacity
            style={styles.incluirButton}
            onPress={salvarEntrada}
            disabled={carregando}>
            <Text style={styles.incluirButtonText}>
              {carregando
                ? 'Salvando...'
                : entrada
                  ? 'Salvar Alterações'
                  : 'Criar Entrada'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}
