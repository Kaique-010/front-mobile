// screens/ProdutoFormScreen.js
import React, { useState } from 'react'
import { View, TextInput, Text, TouchableOpacity } from 'react-native'
import axios from 'axios'

export default function ProdutoFormScreen({ route, navigation }) {
  const produto = route.params?.produto

  const [nome, setNome] = useState(produto?.prod_nome || '')
  const [unidade, setUnidade] = useState(produto?.prod_unme || '')
  const [ncm, setNcm] = useState(produto?.prod_ncm || '')

  const salvar = async () => {
    const data = {
      prod_nome: nome,
      prod_unme: unidade,
      prod_ncm: ncm,
    }

    if (produto?.prod_codi) {
      // Atualizar
      await axios.put(
        `http://192.168.10.35:8000/api/produtos/${produto.prod_codi}/`,
        data
      )
      alert('Produto atualizado com sucesso!')
    } else {
      // Criar
      const response = await axios.post(
        'http://192.168.10.35:8000/api/produtos/',
        data
      )
      const novoCodigo = response.data.prod_codi
      alert(`Produto criado com código: ${novoCodigo}`)
    }
    navigation.goBack()
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <TextInput
        placeholder="Nome do Produto"
        value={nome}
        onChangeText={setNome}
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
      />
      <TextInput
        placeholder="Unidade de Medida"
        value={unidade}
        onChangeText={setUnidade}
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
      />
      <TextInput
        placeholder="NCM"
        value={ncm}
        onChangeText={setNcm}
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
      />
      <TouchableOpacity
        onPress={salvar}
        style={{ backgroundColor: 'blue', padding: 10 }}>
        <Text style={{ color: 'white', textAlign: 'center' }}>Salvar</Text>
      </TouchableOpacity>
    </View>
  )
}
