import React from 'react'
import { View, Text, TextInput } from 'react-native'
import { TextInputMask } from 'react-native-masked-text'
import styles from '../styles/entidadeStyles'

export default function AbaEndereco({
  formData,
  handleChange,
  buscarEnderecoPorCep,
}) {
  return (
    <View style={styles.innerContainer}>
      <Text style={styles.label}>CEP</Text>
      <TextInputMask
        type={'zip-code'}
        value={formData.enti_cep}
        onChangeText={(text) => {
          const cepLimpo = text.replace(/\D/g, '')
          handleChange('enti_cep', text)
          if (cepLimpo.length === 8) buscarEnderecoPorCep(cepLimpo)
        }}
        style={styles.input}
      />

      <Text style={styles.label}>Endereço</Text>
      <TextInput
        style={styles.input}
        value={formData.enti_ende}
        onChangeText={(text) => handleChange('enti_ende', text)}
      />

      <Text style={styles.label}>Número</Text>
      <TextInput
        style={styles.input}
        value={formData.enti_nume}
        onChangeText={(text) => handleChange('enti_nume', text)}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Bairro</Text>
      <TextInput
        style={styles.input}
        value={formData.enti_bair}
        onChangeText={(text) => handleChange('enti_bair', text)}
      />

      <Text style={styles.label}>País</Text>
      <TextInput
        style={styles.input}
        value={formData.enti_pais}
        onChangeText={(text) => handleChange('enti_pais', text)}
      />

      <Text style={styles.label}>Cidade</Text>
      <TextInput
        style={styles.input}
        value={formData.enti_cida}
        onChangeText={(text) => handleChange('enti_cida', text)}
      />

      <Text style={styles.label}>Código da Cidade (IBGE)</Text>
      <TextInput
        style={styles.input}
        value={formData.enti_codi_cida}
        onChangeText={(text) => handleChange('enti_codi_cida', text)}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Estado</Text>
      <TextInput
        style={styles.input}
        value={formData.enti_esta}
        onChangeText={(text) => handleChange('enti_esta', text)}
        maxLength={2}
      />
    </View>
  )
}
