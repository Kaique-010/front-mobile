import React, { useState, useEffect } from 'react'
import {
  Modal,
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import Toast from 'react-native-toast-message'
import BuscaServicoInput from '../components/BuscaServicoInput'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

export default function ServModalOs({
  visivel,
  onFechar,
  onAdicionar,
  itemEditando,
  itensExistentes = [],
}) {
  const [form, setForm] = useState({
    servicoProd: '',
    servicoNome: '',
    quantidade: '',
    preco: '',
    observacao: '',
  })

  useEffect(() => {
    if (itemEditando && typeof itemEditando === 'object') {
      setForm({
        servicoProd: itemEditando?.serv_prod?.toString() || '',
        quantidade: itemEditando?.serv_quan?.toString() || '',
        preco: itemEditando?.serv_unit?.toString() || '',
        observacao: itemEditando?.serv_obse || '',
        servicoNome: itemEditando?.servico_nome || '',
      })
    } else {
      setForm({
        servicoProd: '',
        servicoNome: '',
        quantidade: '',
        preco: '',
        observacao: '',
      })
    }
  }, [itemEditando, visivel])

  const onChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }))
  }

  const adicionar = () => {
    const quantidadeNum = parseFloat(form.quantidade)
    const precoNum = parseFloat(form.preco)

    if (
      !form.servicoProd ||
      isNaN(quantidadeNum) ||
      quantidadeNum <= 0 ||
      isNaN(precoNum) ||
      precoNum <= 0
    ) {
      Toast.show({
        type: 'error',
        text1: 'Preencha todos os campos corretamente',
        text2: 'Quantidade e preço devem ser números maiores que zero',
      })
      return
    }

    // Validação de Duplicidade
    if (!itemEditando) {
      const jaExiste = itensExistentes.some(
        (item) => String(item.serv_prod) === String(form.servicoProd)
      )
      if (jaExiste) {
        return Toast.show({
          type: 'error',
          text1: 'Serviço já adicionado',
          text2: 'Este serviço já consta na lista.',
        })
      }
    }

    const total = quantidadeNum * precoNum

    const novoItem = {
      serv_prod: String(form.servicoProd),
      serv_quan: quantidadeNum,
      serv_unit: precoNum,
      serv_tota: total,
      serv_obse: form.observacao,
      servico_nome: form.servicoNome,
    }

    onAdicionar(novoItem, itemEditando)
    console.log('Serviço enviado:', novoItem)

    if (!itemEditando) {
      setForm({
        servicoProd: '',
        servicoNome: '',
        quantidade: '',
        preco: '',
      })
    }

    onFechar()
  }

  return (
    <Modal visible={visivel} animationType="slide">
      <KeyboardAwareScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid
        extraScrollHeight={100}
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
                  servicoProd: '',
                  servicoNome: '',
                  preco: '',
                  quantidade: '',
                }))
                return
              }

              setForm((f) => ({
                ...f,
                servicoProd: servico?.serv_prod?.toString() || '',
                servicoNome: servico.serv_nome,
                preco: servico.serv_preco?.toString() || '',
                quantidade: '1',
                observacao: servico.serv_nome,
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

        <Text style={styles.total}>
          Total: R${' '}
          {(
            (parseFloat(form.quantidade) || 0) * (parseFloat(form.preco) || 0)
          ).toFixed(2)}
        </Text>

        <TouchableOpacity style={styles.botaoAdicionar} onPress={adicionar}>
          <Text style={styles.textoBotao}>
            {itemEditando ? 'Salvar Alterações' : 'Adicionar Serviço'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botaoCancelar} onPress={onFechar}>
          <Text style={styles.textoBotao}>Cancelar</Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
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
