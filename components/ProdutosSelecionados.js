// components/ProdutosSelecionados.js
import React from "react";
import { FlatList } from "react-native";
import { Card, Text } from "react-native-paper";

export default function ProdutosSelecionados({ produtos, onRemover }) {
  if (!produtos.length) return null;

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
            style={{ backgroundColor: "#e0f7fa", marginVertical: 2 }}
          >
            <Card.Title title={item.prod_nome} subtitle="Toque para remover" />
          </Card>
        )}
      />
    </>
  );
}
