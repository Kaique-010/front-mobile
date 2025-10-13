import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'

export default function ResumoOrcamentoPisos({ orcamento = {}, itens = [], onUpdateOrcamento }) {
  const [descontoGeral, setDescontoGeral] = useState(0)
  const [frete, setFrete] = useState(0)
  const [editandoDesconto, setEditandoDesconto] = useState(false)
  const [editandoFrete, setEditandoFrete] = useState(false)

  useEffect(() => {
    setDescontoGeral(Number(orcamento?.orca_desc) || 0)
    setFrete(Number(orcamento?.orca_fret) || 0)
  }, [orcamento])

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor || 0)
  }

  const calcularSubtotal = () => {
    return itens.reduce((total, item) => {
      const quantidade = Number(item?.item_quan) || 0
      const precoUnitario = Number(item?.item_unit) || 0
      return total + quantidade * precoUnitario
    }, 0)
  }

  const calcularDescontoItens = () => {
    return itens.reduce((total, item) => {
      const quantidade = Number(item?.item_quan) || 0
      const precoUnitario = Number(item?.item_unit) || 0
      const subtotal = quantidade * precoUnitario
      const percentualDesconto = Number(item?.percentual_desconto) || 0
      const descontoItem = item?.desconto_item_disponivel
        ? subtotal * percentualDesconto
        : 0
      return total + descontoItem
    }, 0)
  }

  const calcularTotalItens = () => {
    return itens.reduce((total, item) => {
      const totalItem = Number(item?.item_suto) || 0
      return total + totalItem
    }, 0)
  }

  const subtotal = calcularSubtotal()
  const descontoItens = calcularDescontoItens()
  const totalItens = calcularTotalItens()
  const totalFinal = totalItens - descontoGeral + frete
  const totalAreaM2 = itens.reduce((total, item) => {
    return total + (Number(item?.area_m2) || 0)
  }, 0)

  const handleDescontoChange = (valor) => {
    const novoDesconto = Number(valor) || 0
    setDescontoGeral(novoDesconto)
    if (onUpdateOrcamento) {
      onUpdateOrcamento({ ...orcamento, orca_desc: novoDesconto })
    }
  }

  const handleFreteChange = (valor) => {
    const novoFrete = Number(valor) || 0
    setFrete(novoFrete)
    if (onUpdateOrcamento) {
      onUpdateOrcamento({ ...orcamento, orca_fret: novoFrete })
    }
  }

  const renderCampoEditavel = (label, valor, onChangeText, editando, setEditando, cor = '#fff') => {
    return (
      <View style={styles.valueRow}>
        <Text style={styles.valueLabel}>{label}:</Text>
        {editando ? (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={valor.toString()}
              onChangeText={onChangeText}
              keyboardType="numeric"
              placeholder="0,00"
              placeholderTextColor="#666"
              onBlur={() => setEditando(false)}
              autoFocus
            />
          </View>
        ) : (
          <TouchableOpacity
            style={styles.editableValue}
            onPress={() => setEditando(true)}
          >
            <Text style={[styles.valueAmount, { color: cor }]}>
              {valor > 0 ? (label.includes('Desconto') ? '-' : '+') : ''}{formatarMoeda(valor)}
            </Text>
            <MaterialIcons name="edit" size={16} color="#a8e6cf" style={styles.editIcon} />
          </TouchableOpacity>
        )}
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="receipt" size={24} color="#18b7df" />
        <Text style={styles.title}>Resumo do Orçamento</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Quantidade de Itens:</Text>
          <Text style={styles.infoValue}>{itens.length}</Text>
        </View>

        {totalAreaM2 > 0 && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Área Total (m²):</Text>
            <Text style={styles.infoValue}>{totalAreaM2.toFixed(2)}</Text>
          </View>
        )}

        <View style={styles.separator} />

        <View style={styles.valueRow}>
          <Text style={styles.valueLabel}>Subtotal:</Text>
          <Text style={styles.valueAmount}>{formatarMoeda(subtotal)}</Text>
        </View>

        {descontoItens > 0 && (
          <View style={styles.valueRow}>
            <Text style={styles.valueLabel}>Desconto Itens:</Text>
            <Text style={styles.discountAmount}>
              -{formatarMoeda(descontoItens)}
            </Text>
          </View>
        )}

        {renderCampoEditavel(
          'Desconto Geral',
          descontoGeral,
          handleDescontoChange,
          editandoDesconto,
          setEditandoDesconto,
          '#ff6b6b'
        )}

        {renderCampoEditavel(
          'Frete',
          frete,
          handleFreteChange,
          editandoFrete,
          setEditandoFrete,
          '#4CAF50'
        )}

        <View style={styles.separator} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Final:</Text>
          <Text style={styles.totalAmount}>{formatarMoeda(totalFinal)}</Text>
        </View>

        {orcamento?.orca_obse && (
          <>
            <View style={styles.separator} />
            <View style={styles.observacoesContainer}>
              <Text style={styles.observacoesLabel}>Observações:</Text>
              <Text style={styles.observacoesText}>{orcamento.orca_obse}</Text>
            </View>
          </>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a252f',
    borderRadius: 12,
    margin: 16,
    borderWidth: 1,
    borderColor: '#a8e6cf',
    shadowColor: '#a8e6cf',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d1117',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    color: '#a8e6cf',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  content: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  infoLabel: {
    color: '#a0a0a0',
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  valueLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  valueAmount: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  discountAmount: {
    color: '#ff6b6b',
    fontSize: 15,
    fontWeight: '600',
  },
  editableValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editIcon: {
    marginLeft: 8,
  },
  inputContainer: {
    minWidth: 100,
  },
  input: {
    backgroundColor: '#333',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'right',
    borderWidth: 1,
    borderColor: '#a8e6cf',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#0d1117',
    marginHorizontal: -16,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  totalLabel: {
    color: '#a8e6cf',
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalAmount: {
    color: '#a8e6cf',
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 12,
  },
  observacoesContainer: {
    marginTop: 8,
  },
  observacoesLabel: {
    color: '#a8e6cf',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  observacoesText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
})
