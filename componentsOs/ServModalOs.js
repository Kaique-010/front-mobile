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

export default function ServModalOs({
  visivel,
  onFechar,
  onAdicionar,
  itemEditando,
}) {
  const [form, setForm] = useState({
    servicoId: '',
    servicoNome: '',
    quantidade: '',
    preco: '',
    complemento: '',
  })

  useEffect(() => {
    if (itemEditando) {
      setForm({
        servicoId: itemEditando.serv_codi?.toString() || '',
        quantidade: itemEditando.serv_quan?.toString() || '',
        preco: itemEditando.serv_unit?.toString() || '',
        complemento: itemEditando.serv_comp || '',
        servicoNome: itemEditando.servico_nome || '',
      })
    } else {
      setForm({
        servicoId: '',
        servicoNome: '',
        quantidade: '',
        preco: '',
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

    if (!form.servicoId || quantidadeNum <= 0 || precoNum <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Preencha todos os campos corretamente',
        text2: 'Quantidade e preço devem ser maiores que zero',
      })
      return
    }

    const total = quantidadeNum * precoNum

    const novoItem = {
      serv_codi: form.servicoId,
      serv_quan: quantidadeNum,
      serv_unit: precoNum,
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
                      quantidade: '',
                      complemento: '',
                    }))
                    return
                  }

                  setForm((f) => ({
                    ...f,
                    servicoId: servico?.serv_codi?.toString() || '',
                    servicoNome: servico.serv_nome,
                    preco: servico.serv_preco?.toString() || '',
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

            <Text style={styles.label}>Preço Unitário:</Text>
            <TextInput
              keyboardType="numeric"
              value={form.preco}
              onChangeText={(v) => onChange('preco', v)}
              style={styles.input}
              placeholder="Digite o preço unitário"
              placeholderTextColor="#666"
            />

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

            <Text style={styles.total}>
              Total: R${' '}
              {((parseFloat(form.quantidade) || 0) * (parseFloat(form.preco) || 0)).toFixed(4)}
            </Text>

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