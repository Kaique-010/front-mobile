import React from 'react'
import { FlatList, TextInput, View } from 'react-native'
import { Card, Text } from 'react-native-paper'

export default function ProdutosSelecionados({
  produtos,
  onRemover,
  onAlterarQuantidade,
}) {
  if (!produtos.length) return null

  return (
    <>
      <Text variant="titleMedium" style={{ marginTop: 16 }}>
        Selecionados:
      </Text>
      <FlatList
        data={produtos}
        keyExtractor={(item) => item.prod_codi.toString()}
        renderItem={({ item }) => (
          <Card
            onPress={() => onRemover(item.prod_codi)}
            style={{ backgroundColor: '#e0f7fa', marginVertical: 2 }}>
            <Card.Title title={item.prod_nome} subtitle="Toque para remover" />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 10,
              }}>
              <Text style={{ marginRight: 5 }}>Quantidade:</Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#ccc',
                  padding: 5,
                  width: 60,
                  textAlign: 'center',
                  backgroundColor: '#fff',
                }}
                keyboardType="numeric"
                value={item.item_quan?.toString() || ''}
                onChangeText={(value) =>
                  onAlterarQuantidade(item.prod_codi, value === '' ? '' : parseFloat(value))
                }
              />
            </View>
          </Card>
        )}
      />
    </>
  )
}
