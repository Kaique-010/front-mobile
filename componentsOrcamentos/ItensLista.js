import React, { useState } from 'react'
import {
  FlatList,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'

export default function ItensList({ itens, onEdit, onRemove }) {
  const [itensExpandidos, setItensExpandidos] = useState({})
  const [listaExpandida, setListaExpandida] = useState(true)

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor || 0)
  }

  const toggleItemExpansao = (index) => {
    setItensExpandidos(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const renderItem = ({ item, index }) => {
    const quantidade = Number(item?.iped_quan) || 0
    const precoUnitario = Number(item?.iped_unit) || 0
    const total = quantidade * precoUnitario
    const percentualDesconto = Number(item?.percentual_desconto) || 0
    const descontoItem = item?.desconto_item_disponivel
      ? total * percentualDesconto
      : 0
    const totalComDesconto = total - descontoItem
    const totalPreferencial = Number(item?.iped_tota) || totalComDesconto
    const isExpanded = itensExpandidos[index]

    return (
      <View style={styles.itemContainer}>
        <TouchableOpacity 
          style={styles.itemHeader}
          onPress={() => toggleItemExpansao(index)}
          activeOpacity={0.7}
        >
          <View style={styles.itemNumber}>
            <Text style={styles.itemNumberText}>{index + 1}</Text>
          </View>
          <View style={styles.itemInfo}>
            <Text style={styles.codigoProduto}>
              Cód: {item?.iped_prod || 'N/A'}
            </Text>
            <Text style={styles.nomeProduto} numberOfLines={isExpanded ? undefined : 1}>
              {item?.produto_nome || 'Produto sem nome'}
            </Text>
            <Text style={styles.totalPreview}>
              {formatarMoeda(totalPreferencial)}
            </Text>
          </View>
          <MaterialIcons 
            name={isExpanded ? "expand-less" : "expand-more"} 
            size={24} 
            color="#10a2a7" 
          />
        </TouchableOpacity>

        {isExpanded && (
          <>
            <View style={styles.itemDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Quantidade:</Text>
                <Text style={styles.detailValue}>{quantidade.toFixed(2)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Preço Unit.:</Text>
                <Text style={styles.detailValue}>{formatarMoeda(precoUnitario)}</Text>
              </View>
              {descontoItem > 0 && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Desconto:</Text>
                  <Text style={styles.descontoValue}>
                    -{formatarMoeda(descontoItem)}
                  </Text>
                </View>
              )}
              <View style={[styles.detailRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalValue}>
                  {formatarMoeda(totalPreferencial)}
                </Text>
              </View>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => onEdit(item)}
                activeOpacity={0.7}
              >
                <MaterialIcons name="edit" size={18} color="#fff" />
                <Text style={styles.buttonText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => onRemove(item)}
                activeOpacity={0.7}
              >
                <MaterialIcons name="delete" size={18} color="#fff" />
                <Text style={styles.buttonText}>Remover</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    )
  }

  if (!itens || itens.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="receipt" size={48} color="#666" />
        <Text style={styles.emptyText}>Nenhum item adicionado</Text>
        <Text style={styles.emptySubtext}>
          Toque em "Adicionar Item" para começar
        </Text>
      </View>
    )
  }

  const totalItens = itens.length
  const totalGeral = itens.reduce((acc, item) => {
    const totalPreferencial = Number(item?.iped_tota) || 0
    return acc + totalPreferencial
  }, 0)

  return (
    <View style={styles.container}>
      {/* Cabeçalho da Lista - Clicável para expandir/colapsar */}
      <TouchableOpacity 
        style={styles.listaHeader}
        onPress={() => setListaExpandida(!listaExpandida)}
        activeOpacity={0.7}
      >
        <View style={styles.listaHeaderLeft}>
          <MaterialIcons name="list" size={24} color="#10a2a7" />
          <View style={styles.listaHeaderInfo}>
            <Text style={styles.listaTitle}>
              Itens do Orçamento ({totalItens})
            </Text>
            <Text style={styles.listaTotalPreview}>
              Total: {formatarMoeda(totalGeral)}
            </Text>
          </View>
        </View>
        <MaterialIcons 
          name={listaExpandida ? "expand-less" : "expand-more"} 
          size={24} 
          color="#10a2a7" 
        />
      </TouchableOpacity>

      {/* Lista de Itens - Expansível */}
      {listaExpandida && (
        <FlatList
          data={itens}
          keyExtractor={(item, index) => `${item.iped_prod}-${index}`}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a252f',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#10a2a7',
    elevation: 2,
    shadowColor: '#10a2a7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  listaHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  listaHeaderInfo: {
    marginLeft: 12,
    flex: 1,
  },
  listaTitle: {
    color: '#faebd7',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  listaTotalPreview: {
    color: '#10a2a7',
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    paddingVertical: 8,
  },
  itemContainer: {
    backgroundColor: '#1e2832',
    borderRadius: 12,
    marginVertical: 6,
    marginHorizontal: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#10a2a7',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  itemNumber: {
    backgroundColor: '#10a2a7',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemNumberText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  itemInfo: {
    flex: 1,
  },
  codigoProduto: {
    color: '#10a2a7',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  nomeProduto: {
    color: '#faebd7',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 4,
  },
  totalPreview: {
    color: '#10a2a7',
    fontSize: 14,
    fontWeight: 'bold',
  },
  itemDetails: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailLabel: {
    color: '#a0a0a0',
    fontSize: 14,
    fontWeight: '500',
  },
  detailValue: {
    color: '#faebd7',
    fontSize: 14,
    fontWeight: '600',
  },
  descontoValue: {
    color: '#ff6b6b',
    fontSize: 14,
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 8,
    marginTop: 4,
  },
  totalLabel: {
    color: '#10a2a7',
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    color: '#10a2a7',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#4a90e2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  removeButton: {
    flex: 1,
    backgroundColor: '#e74c3c',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#666',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
})
