import React from 'react'
import { View, Text, TextInput } from 'react-native'
import { Picker } from '@react-native-picker/picker'
import { TextInputMask } from 'react-native-masked-text'
import styles from '../styles/entidadeStyles'

export default function AbaDados({ formData, handleChange }) {
  return (
    <View style={styles.innerContainer}>
      <Text style={styles.label}>Nome</Text>
      <TextInput
        style={styles.input}
        value={formData.enti_nome}
        onChangeText={(text) => handleChange('enti_nome', text)}
      />

      <Text style={styles.label}>Tipo</Text>
      <Picker
        selectedValue={formData.enti_tipo_enti}
        onValueChange={(value) => handleChange('enti_tipo_enti', value)}
        style={styles.input}>
        <Picker.Item label="Cliente" value="CL" />
        <Picker.Item label="Fornecedor" value="FO" />
        <Picker.Item label="Ambos" value="AM" />
        <Picker.Item label="Funcionário" value="FU" />
        <Picker.Item label="Vendedor" value="VE" />
        <Picker.Item label="Outros" value="OU" />
      </Picker>

      <Text style={styles.label}>CPF</Text>
      <TextInputMask
        type={'cpf'}
        value={formData.enti_cpf}
        onChangeText={(text) => handleChange('enti_cpf', text)}
        style={styles.input}
        keyboardType="numeric"
      />

      <Text style={styles.label}>CNPJ</Text>
      <TextInputMask
        type={'cnpj'}
        value={formData.enti_cnpj}
        onChangeText={(text) => handleChange('enti_cnpj', text)}
        style={styles.input}
        keyboardType="numeric"
      />
    </View>
  )
}
