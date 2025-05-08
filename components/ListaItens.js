import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'

export default function ListaItens({
  itensSalvos,
  marcarParaRemocao,
  removidos = [],
  listaId,
}) {
  console.log('ListaItens recebido listaId:', listaId) // Verificando se o listaId está correto

  const isRemovido = (item) =>
    removidos.some(
      (r) =>
        r.item_empr === item.item_empr &&
        r.item_fili === item.item_fili &&
        r.item_list === item.item_list &&
        r.item_item === item.item_item
    )

  const idExibido = listaId ?? 'ID não disponível' // fallback caso o listaId seja undefined

  return (
    <>
      {itensSalvos.length > 0 && (
        <Text
          style={{
            fontWeight: 'bold',
            marginTop: 24,
            marginBottom: 8,
            fontSize: 16,
            color: 'white',
            textAlign: 'center',
          }}>
          Itens já adicionados à lista: {idExibido}
        </Text>
      )}

      {itensSalvos.map((item) => {
        const removido = isRemovido(item)

        return (
          <View
            key={`${item.item_empr}-${item.item_fili}-${item.item_list}-${item.item_item}`}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: removido ? '#333' : '#1c1c1c',
              padding: 12,
              borderRadius: 8,
              marginBottom: 8,
              opacity: removido ? 0.5 : 1,
            }}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text
                style={{
                  color: 'white',
                  textDecorationLine: removido ? 'line-through' : 'none',
                }}
                numberOfLines={1}
                ellipsizeMode="tail">
                • {item.produto_nome} (ID: {item.item_prod})
              </Text>
            </View>

            {!removido && (
              <TouchableOpacity
                onPress={() => marcarParaRemocao(item)}
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  backgroundColor: '#ff4d4d',
                  borderRadius: 6,
                }}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>
                  Remover
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )
      })}
    </>
  )
}
