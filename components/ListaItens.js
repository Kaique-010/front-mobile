import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native'

export default function ListaItens({
  itensSalvos,
  marcarParaRemocao,
  removidos = [],
  listaId,
  onQuantidadeChange,
}) {
  const isRemovido = (item) =>
    removidos.some(
      (r) =>
        r.item_empr === item.item_empr &&
        r.item_fili === item.item_fili &&
        r.item_list === item.item_list &&
        r.item_item === item.item_item &&
        r.item_quan === item.item_quan
    )

  const idExibido = listaId ?? 'ID não disponível'

  // filtramos o item_pedi que for diferente de 0
  const itensFiltrados = itensSalvos.filter((item) => {
    const removidosMesmoItem = removidos.filter(
      (r) =>
        r.item_empr === item.item_empr &&
        r.item_fili === item.item_fili &&
        r.item_list === item.item_list &&
        r.item_item === item.item_item
    )

    const totalRemovido = removidosMesmoItem.reduce((sum, r) => {
      const quantidade = parseFloat(r.item_quan)
      return sum + (isNaN(quantidade) ? 0 : quantidade)
    }, 0)

    return parseFloat(item.item_quan || 0) > totalRemovido
  })

  console.log(
    '🔍 [DEBUG-FILTRAR] Itens filtrados:',
    JSON.stringify(itensFiltrados, null, 2)
  )

  // Calcular totais
  const totalItens = itensFiltrados.reduce((sum, item) => {
    return sum + (parseFloat(item.item_quan || 0) || 1)
  }, 0)
  console.log('🔍 [DEBUG-TOTAL] Total de itens:', totalItens)
  const totalValor = itensFiltrados.reduce((total, item) => {
    return (
      total +
      (item.item_quan || 1) * (item.prod_preco_vista || item.item_prec || 0)
    )
  }, 0)

  return (
    <>
      {itensFiltrados.length > 0 && (
        <Text style={styles.titulo}>
          Itens já adicionados à lista: {idExibido}
        </Text>
      )}

      {itensFiltrados.map((item, index) => {
        const removido = isRemovido(item)

        return (
          <View
            key={`${item.item_empr}-${item.item_fili}-${item.item_list}-${item.item_item}-${index}`}
            style={[
              styles.itemContainer,
              removido && styles.itemRemovidoContainer,
            ]}>
            <View style={styles.itemInfo}>
              <Text
                style={[styles.itemTexto, removido && styles.itemTextoRemovido]}
                numberOfLines={1}
                ellipsizeMode="tail">
                • {item.produto_nome?.slice(0, 25) ?? 'Sem nome'}
              </Text>

              <View style={styles.precoContainer}>
                <Text style={styles.precoText}>
                  Preço: R${' '}
                  {(item.prod_preco_vista || item.item_prec || 0).toFixed(2)}
                </Text>
              </View>

              <View style={styles.quantidadeContainer}>
                <Text style={styles.quantidadeLabel}>Qtd:</Text>
                <TextInput
                  style={[
                    styles.quantidadeInput,
                    removido && styles.inputDesabilitado,
                  ]}
                  value={String(item.item_quan || 1)}
                  onChangeText={(text) => {
                    const quantidade = parseFloat(text) || 1
                    if (onQuantidadeChange) {
                      onQuantidadeChange(item, quantidade)
                    }
                  }}
                  keyboardType="numeric"
                  editable={!removido}
                  selectTextOnFocus
                />
                <Text style={styles.totalText}>
                  Total: R${' '}
                  {(
                    (item.item_quan || 1) *
                    (item.prod_preco_vista || item.item_prec || 0)
                  ).toFixed(2)}
                </Text>
              </View>
            </View>

            {!removido && (
              <TouchableOpacity
                onPress={() => marcarParaRemocao(item)}
                style={styles.botaoRemover}>
                <Text style={styles.textoBotao}>x</Text>
              </TouchableOpacity>
            )}
          </View>
        )
      })}

      {itensFiltrados.length > 0 && (
        <View style={styles.resumoContainer}>
          <Text style={styles.resumoTitulo}>Resumo da Lista</Text>
          <View style={styles.resumoInfo}>
            <Text style={styles.resumoTexto}>Total de itens: {totalItens}</Text>
            <Text style={styles.resumoValor}>
              Valor total: R$ {totalValor.toFixed(2)}
            </Text>
          </View>
        </View>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  titulo: {
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 8,
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1c1c1c',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  itemRemovidoContainer: {
    backgroundColor: '#333',
    opacity: 0.5,
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemTexto: {
    color: 'white',
  },
  itemTextoRemovido: {
    textDecorationLine: 'line-through',
  },
  botaoRemover: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#ff4d4d',
    borderRadius: 6,
  },
  textoBotao: {
    color: 'white',
    fontWeight: 'bold',
  },
  precoContainer: {
    marginTop: 4,
  },
  precoText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: 'bold',
  },
  quantidadeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  quantidadeLabel: {
    color: 'white',
    fontSize: 12,
  },
  quantidadeInput: {
    backgroundColor: '#333',
    color: 'white',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 50,
    textAlign: 'center',
    fontSize: 12,
  },
  inputDesabilitado: {
    backgroundColor: '#555',
    opacity: 0.6,
  },
  totalText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
  },
  resumoContainer: {
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1.5,
    borderColor: '#444',
  },
  resumoTitulo: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  resumoInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resumoTexto: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: 'bold',
  },
  resumoValor: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
})
