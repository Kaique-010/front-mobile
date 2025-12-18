import React, { useState, useEffect } from 'react'
import {
  Modal,
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import BuscaServicoInput from '../components/BuscaServicosInput'
import Toast from 'react-native-toast-message'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function ServModalOs({
  visivel,
  onFechar,
  onAdicionar,
  itemEditando,
  itensExistentes = [],
}) {
  const [form, setForm] = useState({
    servicoId: '',
    servicoNome: '',
    quantidade: '',
    preco: '', // editável apenas quando usuário NÃO tem setor
    precoReal: '', // preço real sempre vindo da API / serviço
    complemento: '',
  })

  const [usuarioTemSetor, setUsuarioTemSetor] = useState(false)

  // Verifica se o usuário tem setor para ocultar campos de preço
  useEffect(() => {
    const verificarSetor = async () => {
      try {
        const setor = await AsyncStorage.getItem('setor')
        setUsuarioTemSetor(!!setor && setor !== '0' && setor !== 'null')
      } catch (error) {
        setUsuarioTemSetor(false)
      }
    }
    verificarSetor()
  }, [])

  useEffect(() => {
    if (itemEditando) {
      setForm({
        servicoId: itemEditando.serv_codi?.toString() || '',
        quantidade: itemEditando.serv_quan?.toString() || '',
        preco: itemEditando.serv_unit?.toString() || '',
        precoReal: itemEditando.serv_unit?.toString() || '',
        complemento: itemEditando.serv_comp || '',
        servicoNome: itemEditando.servico_nome || '',
      })
    } else {
      setForm({
        servicoId: '',
        servicoNome: '',
        quantidade: '',
        preco: '',
        precoReal: '',
        complemento: '',
      })
    }
  }, [itemEditando, visivel])

  const onChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }))
  }

  const adicionar = () => {
    const quantidadeNum = parseFloat(form.quantidade)
    const precoNum = parseFloat(form.preco)
    const precoRealNum = parseFloat(form.precoReal)

    // Não exigir preço quando há setor; sem setor, preço > 0
    const precoDigitadoInvalido =
      !usuarioTemSetor && (isNaN(precoNum) || precoNum <= 0)

    if (!form.servicoId || quantidadeNum <= 0 || precoDigitadoInvalido) {
      Toast.show({
        type: 'error',
        text1: 'Preencha todos os campos corretamente',
        text2: 'Quantidade e preço devem ser maiores que zero',
      })
      return
    }

    // Validação de Duplicidade
    if (!itemEditando) {
      const jaExiste = itensExistentes.some(
        (item) => String(item.serv_codi) === String(form.servicoId)
      )
      if (jaExiste) {
        return Toast.show({
          type: 'error',
          text1: 'Serviço já adicionado',
          text2: 'Este serviço já consta na lista.',
        })
      }
    }

    // Se usuário tem setor, enviar o preço real vindo da API
    const precoFinal = usuarioTemSetor
      ? isNaN(precoRealNum)
        ? 0
        : precoRealNum
      : isNaN(precoNum)
      ? 0
      : precoNum
    const total = quantidadeNum * precoFinal

    const novoItem = {
      serv_codi: form.servicoId,
      serv_quan: quantidadeNum,
      serv_unit: precoFinal,
      serv_tota: total,
      serv_comp: form.complemento,
      servico_nome: form.servicoNome,
    }

    onAdicionar(novoItem, itemEditando)
    console.log('Serviço enviado:', novoItem)

    if (!itemEditando) {
      setForm({
        servicoId: '',
        servicoNome: '',
        quantidade: '',
        preco: '',
        precoReal: '',
        complemento: '',
      })
    }

    onFechar()
  }

  return (
    <Modal visible={visivel} animationType="slide">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
        <View style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled">
            <Text style={styles.cabecalho}>Serviços da O.S</Text>

            <Text style={styles.label}>Serviço:</Text>
            <View style={styles.servicoInput}>
              <BuscaServicoInput
                valorAtual={form.servicoNome}
                onSelect={(servico) => {
                  if (!servico) {
                    setForm((f) => ({
                      ...f,
                      servicoId: '',
                      servicoNome: '',
                      preco: '',
                      precoReal: '',
                      quantidade: '',
                      complemento: '',
                    }))
                    return
                  }

                  setForm((f) => ({
                    ...f,
                    servicoId: servico?.serv_codi?.toString() || '',
                    servicoNome: servico.serv_nome,
                    // Usa o preço final calculado pela busca
                    preco: (servico?.preco_final ?? 0).toString(),
                    precoReal: (servico?.preco_final ?? 0).toString(),
                    quantidade: '1',
                  }))
                  Toast.show({
                    type: 'success',
                    text1: 'Serviço selecionado',
                    text2: servico.serv_nome,
                  })
                }}
              />
            </View>

            {form.servicoNome ? (
              <Text style={styles.servicoNome}>{form.servicoNome}</Text>
            ) : null}

            <Text style={styles.label}>Quantidade:</Text>
            <TextInput
              keyboardType="numeric"
              value={form.quantidade}
              onChangeText={(v) => onChange('quantidade', v)}
              style={styles.input}
              placeholder="Digite a quantidade"
              placeholderTextColor="#666"
            />

            {!usuarioTemSetor && (
              <>
                <Text style={styles.label}>Preço Unitário:</Text>
                <TextInput
                  keyboardType="numeric"
                  value={form.preco}
                  onChangeText={(v) => onChange('preco', v)}
                  style={styles.input}
                  placeholder="Digite o preço unitário"
                  placeholderTextColor="#666"
                />

                <Text style={styles.total}>
                  Total: R${' '}
                  {(
                    (parseFloat(form.quantidade) || 0) *
                    (parseFloat(form.preco) || 0)
                  ).toFixed(4)}
                </Text>
              </>
            )}

            <Text style={styles.label}>Complemento:</Text>
            <TextInput
              value={form.complemento}
              onChangeText={(v) => onChange('complemento', v)}
              style={[styles.input, styles.complementoInput]}
              placeholder="Observações ou detalhes adicionais"
              placeholderTextColor="#666"
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity style={styles.botaoAdicionar} onPress={adicionar}>
              <Text style={styles.textoBotao}>
                {itemEditando ? 'Salvar Alterações' : 'Adicionar Serviço'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.botaoCancelar} onPress={onFechar}>
              <Text style={styles.textoBotao}>Cancelar</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
      <Toast />
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a2f3d',
  },
  scrollContent: {
    padding: 20,
    flexGrow: 1,
  },
  cabecalho: {
    color: 'white',
    textAlign: 'center',
    margin: 15,
    fontSize: 22,
    textDecorationLine: 'underline',
  },
  label: {
    color: 'white',
    textAlign: 'left',
    marginTop: 15,
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#232935',
    color: 'white',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  complementoInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  servicoInput: {
    marginTop: 5,
    zIndex: 1,
  },
  servicoNome: {
    color: '#10a2a7',
    textAlign: 'center',
    marginTop: 5,
    fontSize: 14,
  },
  total: {
    color: 'white',
    marginTop: 20,
    marginBottom: 30,
    textAlign: 'right',
    fontSize: 18,
    fontWeight: 'bold',
  },
  botaoAdicionar: {
    backgroundColor: '#10a2a7',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  botaoCancelar: {
    backgroundColor: '#c0392b',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  textoBotao: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
})
