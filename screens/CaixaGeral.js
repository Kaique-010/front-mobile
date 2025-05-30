import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, Button, Alert } from 'react-native'
import styles from '../styles/caixaStyle'

export default function CaixaGeralScreen({ banco }) {
  const [caixa, setCaixa] = useState({
    caix_empr: '',
    caix_fili: '',
    caix_caix: '',
    caix_data: new Date().toISOString().slice(0, 10),
    caix_aber: 'A', // Aberto
    caix_oper: '',
    caix_valo: 0,
  })

  const abrirCaixa = async () => {
    try {
      const res = await apiPostComContexto(`caixadiario/caixageral/`, {})
      if (res.ok) {
        Alert.alert('Sucesso', 'Caixa aberto!')
      } else {
        const data = await res.json()
        Alert.alert('Erro', JSON.stringify(data))
      }
    } catch (e) {
      Alert.alert('Erro', 'Falha na comunicação')
    }
  }

  return (
    <View style={{ padding: 50 }}>
      <Text style={styles.titulo}>Caixa Diário</Text>
      <TextInput
        keyboardType="numeric"
        onChangeText={(val) => setCaixa({ ...caixa, caix_caix: Number(val) })}
        value={String(caixa.caix_caix)}
      />

      <Text style={styles.dataaber}>Data de Abertura:</Text>
      <Text>{caixa.caix_data}</Text>

      <Text>Operador</Text>

      <Text>Valor Inicial:</Text>
      <TextInput
        keyboardType="numeric"
        onChangeText={(val) => setCaixa({ ...caixa, caix_valo: Number(val) })}
        value={String(caixa.caix_valo)}
      />

      <Button title="Abrir Caixa" onPress={abrirCaixa} />
    </View>
  )
}
