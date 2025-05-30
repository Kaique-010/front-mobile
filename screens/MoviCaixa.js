import React, { useState } from 'react'
import { View, Text, TextInput, Button, Alert } from 'react-native'

export default function MoviCaixaScreen({ banco }) {
  const [mov, setMov] = useState({
    movi_empr: '',
    movi_fili: '',
    movi_caix: '',
    movi_data: new Date().toISOString().slice(0, 10),
    movi_entr: 0,
    movi_said: 0,
    movi_obse: '',
  })

  const registrarMovimento = async () => {
    if (!mov.movi_empr || !mov.movi_fili || !mov.movi_caix) {
      Alert.alert('Erro', 'Preencha Empresa, Filial e Caixa.')
      return
    }

    try {
      const res = await fetch(`https://seu-backend/api/movicaixa/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Banco': banco,
        },
        body: JSON.stringify(mov),
      })
      if (res.ok) {
        Alert.alert('Sucesso', 'Movimento registrado!')
      } else {
        const data = await res.json()
        Alert.alert('Erro', JSON.stringify(data))
      }
    } catch (e) {
      Alert.alert('Erro', 'Falha na comunicação')
    }
  }

  return (
    <View style={{ padding: 20 }}>
      <Text>Empresa:</Text>
      <TextInput
        keyboardType="numeric"
        onChangeText={(val) => setMov({ ...mov, movi_empr: Number(val) })}
        value={String(mov.movi_empr)}
      />

      <Text>Filial:</Text>
      <TextInput
        keyboardType="numeric"
        onChangeText={(val) => setMov({ ...mov, movi_fili: Number(val) })}
        value={String(mov.movi_fili)}
      />

      <Text>Caixa:</Text>
      <TextInput
        keyboardType="numeric"
        onChangeText={(val) => setMov({ ...mov, movi_caix: Number(val) })}
        value={String(mov.movi_caix)}
      />

      <Text>Data:</Text>
      <Text>{mov.movi_data}</Text>

      <Text>Entrada:</Text>
      <TextInput
        keyboardType="numeric"
        onChangeText={(val) => setMov({ ...mov, movi_entr: Number(val) })}
        value={String(mov.movi_entr)}
      />

      <Text>Saída:</Text>
      <TextInput
        keyboardType="numeric"
        onChangeText={(val) => setMov({ ...mov, movi_said: Number(val) })}
        value={String(mov.movi_said)}
      />

      <Text>Observação:</Text>
      <TextInput
        onChangeText={(val) => setMov({ ...mov, movi_obse: val })}
        value={mov.movi_obse}
      />

      <Button title="Registrar Movimento" onPress={registrarMovimento} />
    </View>
  )
}
