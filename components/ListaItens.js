import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

export default function ListaItens({
  itensSalvos,
  marcarParaRemocao,
  removidos = [],
  listaId,
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

  return (
    <>
      {itensFiltrados.length > 0 && (
        <Text style={styles.titulo}>
          Itens já adicionados à lista: {idExibido}
        </Text>
      )}

      {itensFiltrados.map((item) => {
        const removido = isRemovido(item)

        return (
          <View
            key={`${item.item_empr}-${item.item_fili}-${item.item_list}-${item.item_item}`}
            style={[
              styles.itemContainer,
              removido && styles.itemRemovidoContainer,
            ]}>
            <View style={styles.itemInfo}>
              <View style={styles.itemInfo}>
                <Text
                  style={[
                    styles.itemTexto,
                    removido && styles.itemTextoRemovido,
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  • {item.produto_nome.slice(0, 25) ?? 'Sem nome'} |{' '}
                  {item.item_quan === '' ? '' : item.item_quan}
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
})
