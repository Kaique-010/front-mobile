import React from 'react'
import { View, Text, Button, Linking } from 'react-native'

export default function ResumoPedido({ total, pedido }) {
  const enviarZap = () => {
    const texto = `Novo pedido!\nCliente: ${
      pedido.pedi_forn
    }\nTotal: R$ ${total.toFixed(2)}`
    const url = `https://wa.me/554299752472?text=${encodeURIComponent(texto)}`
    Linking.openURL(url)
  }

  const salvar = async () => {
    const response = await apiPostComContexto(`/api/${slug}/pedidos/`, {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pedido),
    })

    if (response.ok) {
      alert('Pedido salvo!')
    } else {
      alert('Erro ao salvar.')
    }
  }

  return (
    <View>
      <Text>Total: R$ {total.toFixed(2)}</Text>
      <Button title="Salvar Pedido" onPress={salvar} />
      <Button title="Enviar WhatsApp" onPress={enviarZap} />
    </View>
  )
}
