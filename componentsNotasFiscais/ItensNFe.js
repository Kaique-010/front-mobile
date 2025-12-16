import React, { useState } from 'react'
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { Picker } from '@react-native-picker/picker'
import Icon from 'react-native-vector-icons/MaterialIcons'
import styles from './styles/emissaoNFeStyles'

export default function ItensNFe({ itens, onChange }) {
  const [itemEditando, setItemEditando] = useState(null)
  
  const novoItem = () => ({
    sequencia: itens.length + 1,
    codigo: '',
    descricao: '',
    ncm: '',
    cfop: '5102',
    unidade: 'UN',
    quantidade: '1',
    valor_unitario: '0,00',
    valor_total: '0,00',
    origem: '0',
    cst_icms: '00',
    aliquota_icms: '0,00',
    valor_icms: '0,00',
    cst_pis: '01',
    aliquota_pis: '0,00',
    valor_pis: '0,00',
    cst_cofins: '01',
    aliquota_cofins: '0,00',
    valor_cofins: '0,00'
  })

  const adicionarItem = () => {
    const item = novoItem()
    onChange([...itens, item])
    setItemEditando(itens.length)
  }

  const removerItem = (index) => {
    Alert.alert(
      'Remover Item',
      'Deseja realmente remover este item?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            const novosItens = itens.filter((_, i) => i !== index)
            // Resequenciar itens
            const itensResequenciados = novosItens.map((item, i) => ({
              ...item,
              sequencia: i + 1
            }))
            onChange(itensResequenciados)
            setItemEditando(null)
          }
        }
      ]
    )
  }

  const atualizarItem = (index, campo, valor) => {
    const novosItens = [...itens]
    novosItens[index] = {
      ...novosItens[index],
      [campo]: valor
    }

    // Calcular valor total automaticamente
    if (campo === 'quantidade' || campo === 'valor_unitario') {
      const quantidade = parseFloat(novosItens[index].quantidade.replace(',', '.')) || 0
      const valorUnitario = parseFloat(novosItens[index].valor_unitario.replace(',', '.')) || 0
      const valorTotal = (quantidade * valorUnitario).toFixed(2).replace('.', ',')
      novosItens[index].valor_total = valorTotal
    }

    onChange(novosItens)
  }

  const formatarMoeda = (valor) => {
    const apenasNumeros = valor.replace(/\D/g, '')
    const numero = parseFloat(apenasNumeros) / 100
    return numero.toFixed(2).replace('.', ',')
  }

  const formatarQuantidade = (valor) => {
    return valor.replace(/[^0-9,]/g, '')
  }

  const calcularTotalGeral = () => {
    return itens.reduce((total, item) => {
      const valor = parseFloat(item.valor_total.replace(',', '.')) || 0
      return total + valor
    }, 0).toFixed(2).replace('.', ',')
  }

  const renderizarItem = (item, index) => {
    const editando = itemEditando === index

    return (
      <View key={index} style={styles.itemContainer}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemTitulo}>
            Item {item.sequencia} - {item.descricao || 'Novo Item'}
          </Text>
          <View style={styles.itemAcoes}>
            <TouchableOpacity
              style={styles.botaoEditar}
              onPress={() => setItemEditando(editando ? null : index)}
            >
              <Icon 
                name={editando ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} 
                size={24} 
                color="#007AFF" 
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.botaoRemover}
              onPress={() => removerItem(index)}
            >
              <Icon name="delete" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>

        {!editando && (
          <View style={styles.itemResumo}>
            <Text style={styles.itemResumoTexto}>
              {item.quantidade} {item.unidade} x R$ {item.valor_unitario} = R$ {item.valor_total}
            </Text>
          </View>
        )}

        {editando && (
          <View style={styles.itemDetalhes}>
            <View style={styles.linhaHorizontal}>
              <View style={[styles.campo, { flex: 2 }]}>
                <Text style={styles.label}>Código *</Text>
                <TextInput
                  style={styles.input}
                  value={item.codigo}
                  onChangeText={(valor) => atualizarItem(index, 'codigo', valor)}
                  placeholder="Código do produto"
                  maxLength={60}
                />
              </View>

              <View style={[styles.campo, { flex: 3, marginLeft: 10 }]}>
                <Text style={styles.label}>Descrição *</Text>
                <TextInput
                  style={styles.input}
                  value={item.descricao}
                  onChangeText={(valor) => atualizarItem(index, 'descricao', valor)}
                  placeholder="Descrição do produto"
                  maxLength={120}
                />
              </View>
            </View>

            <View style={styles.linhaHorizontal}>
              <View style={[styles.campo, { flex: 2 }]}>
                <Text style={styles.label}>NCM *</Text>
                <TextInput
                  style={styles.input}
                  value={item.ncm}
                  onChangeText={(valor) => atualizarItem(index, 'ncm', valor.replace(/\D/g, ''))}
                  placeholder="00000000"
                  keyboardType="numeric"
                  maxLength={8}
                />
              </View>

              <View style={[styles.campo, { flex: 2, marginLeft: 10 }]}>
                <Text style={styles.label}>CFOP *</Text>
                <TextInput
                  style={styles.input}
                  value={item.cfop}
                  onChangeText={(valor) => atualizarItem(index, 'cfop', valor.replace(/\D/g, ''))}
                  placeholder="5102"
                  keyboardType="numeric"
                  maxLength={4}
                />
              </View>

              <View style={[styles.campo, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.label}>Unidade *</Text>
                <TextInput
                  style={styles.input}
                  value={item.unidade}
                  onChangeText={(valor) => atualizarItem(index, 'unidade', valor.toUpperCase())}
                  placeholder="UN"
                  maxLength={6}
                />
              </View>
            </View>

            <View style={styles.linhaHorizontal}>
              <View style={[styles.campo, { flex: 1 }]}>
                <Text style={styles.label}>Quantidade *</Text>
                <TextInput
                  style={styles.input}
                  value={item.quantidade}
                  onChangeText={(valor) => atualizarItem(index, 'quantidade', formatarQuantidade(valor))}
                  placeholder="1,00"
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.campo, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.label}>Valor Unitário *</Text>
                <TextInput
                  style={styles.input}
                  value={item.valor_unitario}
                  onChangeText={(valor) => atualizarItem(index, 'valor_unitario', formatarMoeda(valor))}
                  placeholder="0,00"
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.campo, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.label}>Valor Total</Text>
                <TextInput
                  style={[styles.input, styles.inputReadonly]}
                  value={item.valor_total}
                  editable={false}
                  placeholder="0,00"
                />
              </View>
            </View>

            <Text style={styles.secaoTitulo}>Tributação</Text>

            <View style={styles.linhaHorizontal}>
              <View style={[styles.campo, { flex: 1 }]}>
                <Text style={styles.label}>Origem *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={item.origem}
                    style={styles.picker}
                    onValueChange={(valor) => atualizarItem(index, 'origem', valor)}
                  >
                    <Picker.Item label="0 - Nacional" value="0" />
                    <Picker.Item label="1 - Estrangeira - Importação direta" value="1" />
                    <Picker.Item label="2 - Estrangeira - Adquirida no mercado interno" value="2" />
                    <Picker.Item label="3 - Nacional - > 40% conteúdo importado" value="3" />
                    <Picker.Item label="4 - Nacional - Processos produtivos básicos" value="4" />
                    <Picker.Item label="5 - Nacional - < 40% conteúdo importado" value="5" />
                    <Picker.Item label="6 - Estrangeira - Importação direta sem similar" value="6" />
                    <Picker.Item label="7 - Estrangeira - Adquirida mercado interno sem similar" value="7" />
                    <Picker.Item label="8 - Nacional - > 70% conteúdo importado" value="8" />
                  </Picker>
                </View>
              </View>

              <View style={[styles.campo, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.label}>CST ICMS *</Text>
                <TextInput
                  style={styles.input}
                  value={item.cst_icms}
                  onChangeText={(valor) => atualizarItem(index, 'cst_icms', valor)}
                  placeholder="00"
                  maxLength={3}
                />
              </View>
            </View>

            <View style={styles.linhaHorizontal}>
              <View style={[styles.campo, { flex: 1 }]}>
                <Text style={styles.label}>Alíquota ICMS (%)</Text>
                <TextInput
                  style={styles.input}
                  value={item.aliquota_icms}
                  onChangeText={(valor) => atualizarItem(index, 'aliquota_icms', formatarMoeda(valor))}
                  placeholder="0,00"
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.campo, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.label}>Valor ICMS</Text>
                <TextInput
                  style={styles.input}
                  value={item.valor_icms}
                  onChangeText={(valor) => atualizarItem(index, 'valor_icms', formatarMoeda(valor))}
                  placeholder="0,00"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.linhaHorizontal}>
              <View style={[styles.campo, { flex: 1 }]}>
                <Text style={styles.label}>CST PIS *</Text>
                <TextInput
                  style={styles.input}
                  value={item.cst_pis}
                  onChangeText={(valor) => atualizarItem(index, 'cst_pis', valor)}
                  placeholder="01"
                  maxLength={2}
                />
              </View>

              <View style={[styles.campo, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.label}>Alíquota PIS (%)</Text>
                <TextInput
                  style={styles.input}
                  value={item.aliquota_pis}
                  onChangeText={(valor) => atualizarItem(index, 'aliquota_pis', formatarMoeda(valor))}
                  placeholder="0,00"
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.campo, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.label}>Valor PIS</Text>
                <TextInput
                  style={styles.input}
                  value={item.valor_pis}
                  onChangeText={(valor) => atualizarItem(index, 'valor_pis', formatarMoeda(valor))}
                  placeholder="0,00"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.linhaHorizontal}>
              <View style={[styles.campo, { flex: 1 }]}>
                <Text style={styles.label}>CST COFINS *</Text>
                <TextInput
                  style={styles.input}
                  value={item.cst_cofins}
                  onChangeText={(valor) => atualizarItem(index, 'cst_cofins', valor)}
                  placeholder="01"
                  maxLength={2}
                />
              </View>

              <View style={[styles.campo, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.label}>Alíquota COFINS (%)</Text>
                <TextInput
                  style={styles.input}
                  value={item.aliquota_cofins}
                  onChangeText={(valor) => atualizarItem(index, 'aliquota_cofins', formatarMoeda(valor))}
                  placeholder="0,00"
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.campo, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.label}>Valor COFINS</Text>
                <TextInput
                  style={styles.input}
                  value={item.valor_cofins}
                  onChangeText={(valor) => atualizarItem(index, 'valor_cofins', formatarMoeda(valor))}
                  placeholder="0,00"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        )}
      </View>
    )
  }

  return (
    <ScrollView style={styles.formulario}>
      <View style={styles.itensHeader}>
        <Text style={styles.secaoTitulo}>Itens da NFe</Text>
        <TouchableOpacity style={styles.botaoAdicionarItem} onPress={adicionarItem}>
          <Icon name="add" size={20} color="#FFF" />
          <Text style={styles.textoBotaoAdicionarItem}>Adicionar Item</Text>
        </TouchableOpacity>
      </View>

      {itens.length === 0 && (
        <View style={styles.semItens}>
          <Text style={styles.textoSemItens}>
            Nenhum item adicionado. Clique em "Adicionar Item" para começar.
          </Text>
        </View>
      )}

      {itens.map((item, index) => renderizarItem(item, index))}

      {itens.length > 0 && (
        <View style={styles.totalGeral}>
          <Text style={styles.textoTotalGeral}>
            Total Geral: R$ {calcularTotalGeral()}
          </Text>
        </View>
      )}
    </ScrollView>
  )
}