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
import BuscaServicoInput from '../../components/BuscaServicoInput'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

export default function ServModalOs({
  visivel,
  onFechar,
  onAdicionar,
  itemEditando,
}) {
  const [form, setForm] = useState({
    servicoProd: '', 
    servicoNome: '',
    quantidade: '',
    preco: '',
    hectares: '',
    data: '',
    observacao: '',
    desconto: '',
    statusSetor: '',
  })

  useEffect(() => {
    if (itemEditando && typeof itemEditando === 'object') {
      setForm({
        servicoProd: itemEditando?.serv_prod?.toString() || '',
        quantidade: itemEditando?.serv_quan?.toString() || '',
        preco: itemEditando?.serv_unit?.toString() || '',
        hectares: itemEditando?.serv_hect?.toString() || '',
        data: itemEditando?.serv_data || '',
        observacao: itemEditando?.serv_obse || '',
        desconto: itemEditando?.serv_desc?.toString() || '',
        statusSetor: itemEditando?.serv_stat_seto || '',
        servicoNome: itemEditando?.servico_nome || '',
      })
    } else {
      setForm({
        servicoProd: '',
        servicoNome: '',
        quantidade: '',
        preco: '',
        hectares: '',
        data: '',
        observacao: '',
        desconto: '',
        statusSetor: '',
      })
    }
  }, [itemEditando, visivel])

  const onChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }))
  }

  const adicionar = () => {
    const quantidadeNum = parseFloat(form.quantidade)
    const precoNum = parseFloat(form.preco)
    const hectaresNum = parseFloat(form.hectares) || 0
    const descontoNum = parseFloat(form.desconto) || 0

    if (
      !form.servicoProd ||
      isNaN(quantidadeNum) ||
      quantidadeNum <= 0 ||
      isNaN(precoNum) ||
      precoNum <= 0
    ) {
      Toast.show({
        type: 'error',
        text1: 'Preencha todos os campos obrigatórios corretamente',
        text2: 'Quantidade e preço devem ser números maiores que zero',
      })
      return
    }

    const subtotal = quantidadeNum * precoNum
    const valorDesconto = (subtotal * descontoNum) / 100
    const total = subtotal - valorDesconto

    const novoItem = {
      serv_prod: String(form.servicoProd),
      serv_quan: quantidadeNum,
      serv_unit: precoNum,
      serv_tota: total,
      serv_hect: hectaresNum,
      serv_data: form.data,
      serv_obse: form.observacao,
      serv_desc: descontoNum,
      serv_stat_seto: form.statusSetor,
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
        hectares: '',
        data: '',
        observacao: '',
        desconto: '',
        statusSetor: '',
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
                  hectares: '',
                  data: '',
                  observacao: '',
                  desconto: '',
                  statusSetor: '',
                }))
                return
              }

              setForm((f) => ({
                ...f,
                servicoProd: servico?.serv_prod?.toString() || '', 
                servicoNome: servico.serv_nome,
                preco: servico.serv_preco?.toString() || '',
                quantidade: '1',
                hectares: '',
                data: '',
                observacao: '',
                desconto: '',
                statusSetor: '',
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

        <Text style={styles.label}>Hectares:</Text>
        <TextInput
          keyboardType="numeric"
          value={form.hectares}
          onChangeText={(v) => onChange('hectares', v)}
          style={styles.input}
          placeholder="Opcional"
          placeholderTextColor="#666"
        />

        <Text style={styles.label}>Data:</Text>
        <TextInput
          value={form.data}
          onChangeText={(v) => onChange('data', v)}
          style={styles.input}
          placeholder="DD/MM/AAAA (Opcional)"
          placeholderTextColor="#666"
        />

        <Text style={styles.label}>Desconto (%):</Text>
        <TextInput
          keyboardType="numeric"
          value={form.desconto}
          onChangeText={(v) => onChange('desconto', v)}
          style={styles.input}
          placeholder="Opcional"
          placeholderTextColor="#666"
        />

        <Text style={styles.label}>Status do Setor:</Text>
        <TextInput
          value={form.statusSetor}
          onChangeText={(v) => onChange('statusSetor', v)}
          style={styles.input}
          placeholder="Opcional"
          placeholderTextColor="#666"
        />

        <Text style={styles.label}>Observação:</Text>
        <TextInput
          value={form.observacao}
          onChangeText={(v) => onChange('observacao', v)}
          style={[styles.input, { height: 60 }]}
          multiline
          placeholder="Opcional"
          placeholderTextColor="#666"
        />

        <Text style={styles.total}>
          Subtotal: R$ {((parseFloat(form.quantidade) || 0) * (parseFloat(form.preco) || 0)).toFixed(2)}
          {form.desconto ? (
            <>
              {'\n'}Desconto ({form.desconto}%): -R$ {(((parseFloat(form.quantidade) || 0) * (parseFloat(form.preco) || 0) * (parseFloat(form.desconto) || 0)) / 100).toFixed(2)}
              {'\n'}Total: R$ {(((parseFloat(form.quantidade) || 0) * (parseFloat(form.preco) || 0)) - (((parseFloat(form.quantidade) || 0) * (parseFloat(form.preco) || 0) * (parseFloat(form.desconto) || 0)) / 100)).toFixed(2)}
            </>
          ) : (
            <>
              {'\n'}Total: R$ {((parseFloat(form.quantidade) || 0) * (parseFloat(form.preco) || 0)).toFixed(2)}
            </>
          )}
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
